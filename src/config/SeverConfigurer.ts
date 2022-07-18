import { inject, injectable } from 'inversify';
import dotenv from 'dotenv';

import logger from '@/utils/logger';
import { Config } from '@/config/config';
import TYPES from '@/constants/TYPES';
import { DataBaseConnection } from '@/utils/database';

@injectable()
export class ServerConfigurer extends Config {
  public constructor(
    @inject(TYPES.DbClient) protected dBClient: DataBaseConnection
  ) {
    super();
    logger.info('构造');
    this.load().then(() => {
      logger.info('启动');
    });
  }

  public async load() {
    let parsed: dotenv.DotenvParseOutput = {};
    // 在服务器部署
    // 存在 .env 文件
    logger.info('服务器环境');
    const dotenvConfigOutput = dotenv.config({ override: true });
    if (dotenvConfigOutput.parsed) {
      parsed = dotenvConfigOutput.parsed;
    }
    if (parsed) {
      Object.keys(parsed).forEach((key) => {
        this.configMap.set(key, parsed[key]);
      });
    }
    await this.dBClient.connect(this.configMap.get('DB_CONN_STRING') as string);
  }
}
