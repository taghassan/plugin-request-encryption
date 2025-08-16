export type EncodeOptions = {
  excludes?: (RegExp | ((url: string) => boolean))[];
  methods?: string[]; // افتراضي: ['*']
};

export function toBase64Utf8(obj: any) {
  const json = JSON.stringify(obj);
  const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(Number('0x' + p1))
  );
  // btoa متوقع ASCII
  return btoa(utf8);
}

export function shouldExclude(url: string, excludes?: EncodeOptions['excludes']) {
  if (!excludes || excludes.length === 0) return false;
  return excludes.some((rule) =>
    rule instanceof RegExp ? rule.test(url) : rule(url)
  );
}

export function shouldEncode(config: any, opts?: EncodeOptions) {
  const method = (config.method || 'get').toString().toUpperCase();
  const url = config.url || '';
  const methods = (opts?.methods || ['*']).map((m) => m.toUpperCase());

  if(methods.includes('*')) return true;

  if (!methods.includes(method)) return false;
  if (!config.params) return false;
  if (config.params.__encoded__) return false; // محترم لو موجود مسبقًا
  if (shouldExclude(url, opts?.excludes)) return false;


  return true;
}

export function encodeParams(params: any) {
  return { __encoded__: toBase64Utf8(params) };
}
