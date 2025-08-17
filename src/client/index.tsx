import { Plugin } from '@nocobase/client';
import { encodeParams, shouldEncode } from './encode';

export class PluginRequestEncryptionClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.app.apiClient.axios.interceptors.request.use((config)=>{
      try {
        if (shouldEncode(config, { methods:['*'], excludes: [] })) {
          config.params = encodeParams(config.params);
          if (config.paramsSerializer) delete config.paramsSerializer;
        }
      } catch (e) {
        // لو صار خطأ، نمرّر الطلب كما هو
        console.error('[encode-queries] encoding failed:', e);
      }
      return config;
    })


  }
}

export default PluginRequestEncryptionClient;
