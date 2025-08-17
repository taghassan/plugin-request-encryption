import type { Context } from 'koa';
export type DecodeOptions = {
    /** استثناء مسارات معيّنة من الفكّ */
    excludes?: (RegExp | ((path: string) => boolean))[];
    /** تقييد الطرق (افتراضي GET فقط) */
    methods?: string[];
    /** لو true يحوّل الكائن المفكوك إلى querystring ويكتبها في ctx.querystring */
    rewriteQueryString?: boolean;
    /** حد أقصى لطول قيمة __encoded__ لحماية السيرفر */
    maxEncodedLength?: number;
};
export type DecodeResult = {
    ok: true;
    decoded: Record<string, any>;
    wasEncoded: boolean;
    status?: number;
    error?: any;
    message?: any;
} | {
    ok: false;
    status: number;
    error: string;
    message: string;
};
/**
 * الهوك: يفك __encoded__ (لو موجود) ويعدّل ctx بحيث ترجع الباراميترات لحالتها الأصلية.
 * لا يرمي استثناء؛ يرجع نتيجة توضح النجاح/الفشل.
 */
export declare function useDecodeEncodedQuery(ctx: Context, opts?: DecodeOptions): Promise<DecodeResult>;
