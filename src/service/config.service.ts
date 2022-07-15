import path from 'path';
import * as fs from 'fs';

import { Config as ConfigType } from '@/models/config.model';
import { Config } from '@/config/config';

const config = Config.getConfig();

// 所有字段变成可选, 但是之前中间件已经检查过必要的, 所以不用担心
export async function createConfig(input: ConfigType) {
  if (!input.VERCEL_TOKEN) {
    // 服务器或者本地
    const envPath = path.resolve(process.cwd(), '.env');
    let configString = '';
    Object.keys(input).forEach((key) => {
      const inputElement = input[key as keyof ConfigType].trim();
      configString += `${key}=${inputElement}\n`;
    });
    fs.writeFileSync(envPath, configString);
    // 重新读取配置项
    config.load();
  } else {
    // 调用 vercel api 创建环境变量
  }
}
