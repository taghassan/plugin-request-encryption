/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var plugin_exports = {};
__export(plugin_exports, {
  PluginRequestEncryptionServer: () => PluginRequestEncryptionServer,
  default: () => plugin_default,
  userPreCheckMiddleware: () => userPreCheckMiddleware
});
module.exports = __toCommonJS(plugin_exports);
var import_server = require("@nocobase/server");
var import_useDecodeEncodedQuery = require("./hooks/useDecodeEncodedQuery");
function userPreCheckMiddleware() {
  return async (ctx, next) => {
    if (ctx.path === "/api/auth:signIn" && ctx.method === "POST") {
      const { account, password } = ctx.action.params.values || {};
      console.log("username, email ", account, password);
      const blockedAccounts = [];
      if (blockedAccounts.includes(account)) {
        ctx.status = 423;
        ctx.body = {
          error: "AccessDenied",
          message: "\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0644\u0647 \u0628\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
          errors: [
            {
              "message": ctx.i18n.t("The user is locked, please try again later."),
              "code": "USER_LOCKED"
            }
          ]
        };
        return;
      }
      if (account && !account.endsWith("@nocobase.com")) {
        ctx.status = 423;
        ctx.body = {
          error: "UnauthorizedDomain",
          message: "\u064A\u064F\u0633\u0645\u062D \u0641\u0642\u0637 \u0628\u0645\u0633\u062A\u062E\u062F\u0645\u064A nocobase.com"
        };
        return;
      }
      await next();
    }
    await next();
  };
}
class PluginRequestEncryptionServer extends import_server.Plugin {
  async afterAdd() {
  }
  async beforeLoad() {
  }
  async load() {
    this.app.dataSourceManager.use(async (ctx, next) => {
      const res = await (0, import_useDecodeEncodedQuery.useDecodeEncodedQuery)(ctx, {
        methods: ["GET", "POST"],
        excludes: [],
        rewriteQueryString: true,
        maxEncodedLength: 1e5
      });
      console.log("decoded  params --------------", res);
      if (res.ok) {
        ctx.action.params = {
          ...ctx.action.params,
          ...res.decoded ?? {}
        };
      }
      await next();
    }, { tag: "decode-queries-group", before: ["validate-filter-params"] });
    this.app.use(userPreCheckMiddleware(), {
      before: ["auth"]
    });
  }
  async install() {
  }
  async afterEnable() {
  }
  async afterDisable() {
  }
  async remove() {
  }
}
var plugin_default = PluginRequestEncryptionServer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PluginRequestEncryptionServer,
  userPreCheckMiddleware
});
