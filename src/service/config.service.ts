import path from 'path';
import * as fs from 'fs';

import { Config as ConfigType } from '@/models/config.model';
import { Config } from '@/config/config';
import { Vercel } from '@/utils/vercel';

const config = Config.getConfig();

// 所有字段变成可选, 但是之前中间件已经检查过必要的, 所以不用担心
export async function createConfig(input: ConfigType) {
  if (!process.env.DAO_TOKEN) {
    // 服务器或者本地
    const envPath = path.resolve(process.cwd(), '.env');
    let configString = '';
    Object.keys(input).forEach((key) => {
      const inputElement = input[key as keyof ConfigType].trim();
      configString += `${key}=${inputElement}\n`;
    });
    fs.writeFileSync(envPath, configString);
    // 重新读取配置项
    await config.load();
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

    await new Vercel().setEnvironments(configs);
  }
}
