import type { Context, Next } from '@nocobase/actions';
export declare function decodeEncodedQueryMiddleware(options: Context, next: Next): (ctx: Context, next: Next) => Promise<void>;
