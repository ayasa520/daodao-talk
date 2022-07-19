import path from 'path';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';

import { Config as ConfigType } from '@/models/Config';
import { Config } from '@/config/Config';
import { VercelAPI } from '@/utils/VercelAPI';
import TYPES from '@/constants/TYPES';
import { ConfigService as ConfigServiceInterface } from '@/service/ConfigService';

@injectable()
export class ConfigService implements ConfigServiceInterface {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.Configurer) private configurer: Config,
    @inject(TYPES.Vercel) private vercel: VercelAPI
  ) {}

  public async createConfig(input: ConfigType) {
    if (!process.env.DAO_TOKEN) {
      // 服务器或者本地
      const envPath = path.resolve(process.cwd(), '.env');
      let configString = '';
      Object.keys(input).forEach((key) => {
        const inputElement = input[key as keyof ConfigType].trim();
        configString += `${key}=${inputElement}\n`;
      });
      fs.writeFileSync(envPath, configString);
    } else {
      // 调用 vercel api 创建环境变量
      const configs: {
        key: string;
        value: string;
        target: ('production' | 'preview' | 'development')[];
        type: 'encrypted';
      }[] = [];
      Object.keys(input).forEach((key) => {
        const inputElement = input[key as keyof ConfigType].trim();
        configs.push({
          key,
          value: inputElement,
          target: ['production', 'preview', 'development'],
          type: 'encrypted',
        });
      });

      await this.vercel.setEnvironments(configs);
    }
    // 重新读取配置项
    await this.configurer.load();
  }
}
