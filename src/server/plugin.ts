import { Plugin } from '@nocobase/server';

import {decodeEncodedQueryMiddleware }from './middleware/decodeEncodedQuery'
import { Context, Next } from '@nocobase/actions';
import { DecodeResult, useDecodeEncodedQuery } from './hooks/useDecodeEncodedQuery';

export class PluginRequestEncryptionServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {

    this.app.dataSourceManager.use(async (ctx:Context,next:Next)=>{

      const res:DecodeResult = await useDecodeEncodedQuery(ctx, {
        methods:['GET','POST'],
        excludes:[],
        rewriteQueryString: true,
        maxEncodedLength: 100_000
      });
      console.log("decoded  params --------------",res );

      if(res.ok){
        ctx.action.params={
          ...ctx.action.params,
          ...(res.decoded??{})
        };
      }

      await next()
    }, { tag: 'decode-queries-group', before: ['validate-filter-params'] });

    /*
       this.app.use(decodeEncodedQueryMiddleware,{
        tag:'decode-queries',
        before:'core'
      });

     */

  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginRequestEncryptionServer;
