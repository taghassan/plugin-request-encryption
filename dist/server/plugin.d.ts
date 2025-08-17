import { Plugin } from '@nocobase/server';
import { Context, Next } from '@nocobase/actions';
export declare function userPreCheckMiddleware(): (ctx: Context, next: Next) => Promise<void>;
export declare class PluginRequestEncryptionServer extends Plugin {
    afterAdd(): Promise<void>;
    beforeLoad(): Promise<void>;
    load(): Promise<void>;
    install(): Promise<void>;
    afterEnable(): Promise<void>;
    afterDisable(): Promise<void>;
    remove(): Promise<void>;
}
export default PluginRequestEncryptionServer;
