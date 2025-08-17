export type EncodeOptions = {
    excludes?: (RegExp | ((url: string) => boolean))[];
    methods?: string[];
};
export declare function toBase64Utf8(obj: any): string;
export declare function shouldExclude(url: string, excludes?: EncodeOptions['excludes']): boolean;
export declare function shouldEncode(config: any, opts?: EncodeOptions): boolean;
export declare function encodeParams(params: any): {
    __encoded__: string;
};
