import { Plugin } from '@nocobase/server';

import {decodeEncodedQueryMiddleware }from './middleware/decodeEncodedQuery'
import { Context, Next } from '@nocobase/actions';
import { DecodeResult, useDecodeEncodedQuery } from './hooks/useDecodeEncodedQuery';


export function userPreCheckMiddleware() {
  return async (ctx: Context, next: Next) => {
    // نستهدف فقط تسجيل الدخول
    if (ctx.path === '/api/auth:signIn' && ctx.method === 'POST') {
      const { account, password } = ctx.action.params.values || {};

      console.log("username, email ",account, password);
      const blockedAccounts = [];


      // 👇 تحقق مخصص (مثلاً تمنع مستخدم باسم معيّن)
      if (blockedAccounts.includes(account)) {
        ctx.status = 423;
        ctx.body = {
          error: 'AccessDenied',
          message: 'هذا المستخدم غير مسموح له بتسجيل الدخول',
          errors:[
            {
              "message": ctx.i18n.t("The user is locked, please try again later.") ,
              "code": "USER_LOCKED"
            }
          ]
        };


        return; // وقف هنا
      }

      // مثال: تحقق من نطاق الإيميل
      if (account && !account.endsWith('@nocobase.com')) {
        ctx.status = 423;
        ctx.body = {
          error: 'UnauthorizedDomain',
          message: 'يُسمح فقط بمستخدمي nocobase.com',
        };
        return;
      }



      await next();
    }


    // مرر للخطوة التالية (تسجيل الدخول العادي)
    await next();
  };
}

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

      //console.log("decoded  params --------------",res );

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

    // إدراج الميدل وير قبل جميع الـ routes
    this.app.use(userPreCheckMiddleware(),{
      before: ['auth']
    });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginRequestEncryptionServer;
