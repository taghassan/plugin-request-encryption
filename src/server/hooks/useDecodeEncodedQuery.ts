import type { Context } from 'koa';
import qs from 'qs';

export type DecodeOptions = {
  /** استثناء مسارات معيّنة من الفكّ */
  excludes?: (RegExp | ((path: string) => boolean))[];
  /** تقييد الطرق (افتراضي GET فقط) */
  methods?: string[];
  /** لو true يحوّل الكائن المفكوك إلى querystring ويكتبها في ctx.querystring */
  rewriteQueryString?: boolean;
  /** حد أقصى لطول قيمة __encoded__ لحماية السيرفر */
  maxEncodedLength?: number; // مثل 100_000
};

export type DecodeResult =
  | { ok: true; decoded: Record<string, any>; wasEncoded: boolean,status?:number,error?:any,message?:any }
  | { ok: false; status: number; error: string; message: string, };

function safeBase64JsonDecode(b64: string) {
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json);
}

function shouldSkip(ctx: Context, opts?: DecodeOptions) {
  const methods = (opts?.methods || ['GET', 'POST']).map((m) => m.toUpperCase());
  if (!methods.includes((ctx.method || 'GET').toUpperCase())) return true;

  const path = ctx.path || '';
  const excludes = opts?.excludes || [];
  return excludes.some((r) => (r instanceof RegExp ? r.test(path) : r(path)));

}

function deepDecodeStrings(obj: any) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      try {
        // جرّب تفكيك النص كـ JSON
        const parsed = JSON.parse(value);
        result[key] = deepDecodeStrings(parsed); // دعم التداخل
      } catch {
        result[key] = value; // لو فشل، خليه نص عادي
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deepDecodeStrings(value); // نزول أعمق
    } else {
      result[key] = value;
    }
  }
  return result;
}


/**
 * الهوك: يفك __encoded__ (لو موجود) ويعدّل ctx بحيث ترجع الباراميترات لحالتها الأصلية.
 * لا يرمي استثناء؛ يرجع نتيجة توضح النجاح/الفشل.
 */
export async function useDecodeEncodedQuery(
  ctx: Context,
  opts?: DecodeOptions
): Promise<DecodeResult> {
  console.log("step 1 : ");
  if (shouldSkip(ctx, opts)) {
    return { ok: true, decoded: {}, wasEncoded: false };
  }

  const encoded = (ctx.query?.__encoded__ as string | undefined) ?? undefined;

  if (!encoded) {
    return { ok: true, decoded: {}, wasEncoded: false };
  }

  if (opts?.maxEncodedLength && encoded.length > opts.maxEncodedLength) {
    return {
      ok: false,
      status: 413,
      error: 'EncodedTooLarge',
      message: 'The __encoded__ query parameter is too large.'
    };
  }

  try {
    let decoded = safeBase64JsonDecode(encoded);

    decoded = deepDecodeStrings(decoded);

    console.log("encoded __encoded__ decoded",decoded);
    console.log("encoded __encoded__",encoded);
    console.log("encoded query",ctx.query);

    if (typeof decoded !== 'object' || decoded == null || Array.isArray(decoded)) {
      return {
        ok: false,
        status: 400,
        error: 'BadEncodedQuery',
        message: '`__encoded__` must decode to a JSON object'
      };
    }

    // اكتب القيم المفكوكة في ctx.query / request.query
    ctx.query = { ...(decoded as any) };
    (ctx.request as any).query = { ...(decoded as any) };

    if (opts?.rewriteQueryString !== false) {
      // حدّث الـ raw querystring لضمان التماسك مع أي ميدل وير يعتمد عليها
      const qstr = qs.stringify(decoded, {
        arrayFormat: 'repeat',
        encode: true,
        skipNulls: true
      });
      ctx.querystring = qstr;
      (ctx.request as any).search = qstr ? `?${qstr}` : '';
    }

    // وسّم الحالة لمن يحتاجها لاحقًا
    ctx.state.__decodedQuery = decoded;
    ctx.state.__wasEncoded = true;

    return { ok: true, decoded, wasEncoded: true };
  } catch (e: any) {
    return {
      ok: false,
      status: 400,
      error: 'InvalidEncodedQuery',
      message: 'Failed to decode __encoded__ (invalid base64 or JSON).'
    };
  }
}
