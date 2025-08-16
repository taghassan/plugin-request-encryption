import type { Context, Next } from '@nocobase/actions';
import { useDecodeEncodedQuery, type DecodeOptions, DecodeResult } from '../hooks/useDecodeEncodedQuery';

//options?: DecodeOptions
export function decodeEncodedQueryMiddleware(
  options:Context, next:Next) {
  console.log("step -1 : ");
  return async (ctx: Context, next: Next) => {
    console.log("step 0 : ");
    const res:DecodeResult = await useDecodeEncodedQuery(ctx, {
      methods:['GET','POST'],
      excludes:[],
      rewriteQueryString: true,
      maxEncodedLength: 100_000
    });
    console.log("res : ",res);
    if (!res.ok) {
      ctx.status = res.status;
      ctx.body = {
        error: res.error,
        message: res.message
      };
      return;
    }else{
      console.error("step error : ");
    }
    await next();
  };
}
