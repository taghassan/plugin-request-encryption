/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var useDecodeEncodedQuery_exports = {};
__export(useDecodeEncodedQuery_exports, {
  useDecodeEncodedQuery: () => useDecodeEncodedQuery
});
module.exports = __toCommonJS(useDecodeEncodedQuery_exports);
var import_qs = __toESM(require("qs"));
function safeBase64JsonDecode(b64) {
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}
function shouldSkip(ctx, opts) {
  const methods = ((opts == null ? void 0 : opts.methods) || ["GET", "POST"]).map((m) => m.toUpperCase());
  if (!methods.includes((ctx.method || "GET").toUpperCase())) return true;
  const path = ctx.path || "";
  const excludes = (opts == null ? void 0 : opts.excludes) || [];
  return excludes.some((r) => r instanceof RegExp ? r.test(path) : r(path));
}
function deepDecodeStrings(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        result[key] = deepDecodeStrings(parsed);
      } catch {
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      result[key] = deepDecodeStrings(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
async function useDecodeEncodedQuery(ctx, opts) {
  var _a;
  console.log("step 1 : ");
  if (shouldSkip(ctx, opts)) {
    return { ok: true, decoded: {}, wasEncoded: false };
  }
  const encoded = ((_a = ctx.query) == null ? void 0 : _a.__encoded__) ?? void 0;
  if (!encoded) {
    return { ok: true, decoded: {}, wasEncoded: false };
  }
  if ((opts == null ? void 0 : opts.maxEncodedLength) && encoded.length > opts.maxEncodedLength) {
    return {
      ok: false,
      status: 413,
      error: "EncodedTooLarge",
      message: "The __encoded__ query parameter is too large."
    };
  }
  try {
    let decoded = safeBase64JsonDecode(encoded);
    decoded = deepDecodeStrings(decoded);
    console.log("encoded __encoded__ decoded", decoded);
    console.log("encoded __encoded__", encoded);
    console.log("encoded query", ctx.query);
    if (typeof decoded !== "object" || decoded == null || Array.isArray(decoded)) {
      return {
        ok: false,
        status: 400,
        error: "BadEncodedQuery",
        message: "`__encoded__` must decode to a JSON object"
      };
    }
    ctx.query = { ...decoded };
    ctx.request.query = { ...decoded };
    if ((opts == null ? void 0 : opts.rewriteQueryString) !== false) {
      const qstr = import_qs.default.stringify(decoded, {
        arrayFormat: "repeat",
        encode: true,
        skipNulls: true
      });
      ctx.querystring = qstr;
      ctx.request.search = qstr ? `?${qstr}` : "";
    }
    ctx.state.__decodedQuery = decoded;
    ctx.state.__wasEncoded = true;
    return { ok: true, decoded, wasEncoded: true };
  } catch (e) {
    return {
      ok: false,
      status: 400,
      error: "InvalidEncodedQuery",
      message: "Failed to decode __encoded__ (invalid base64 or JSON)."
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useDecodeEncodedQuery
});
