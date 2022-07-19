import { inject, injectable } from 'inversify';
import dotenv from 'dotenv';

import { VercelAPI } from '@/utils/VercelAPI';
import TYPES from '@/constants/TYPES';
import logger from '@/utils/logger';
import { Config } from '@/config/Config';
import { DataBaseConnection } from '@/utils/DataBaseConnection';

@injectable()
export class VercelConfigurer extends Config {
  public constructor(
    @inject(TYPES.Vercel) private vercel: VercelAPI,
    @inject(TYPES.DbClient) protected dBClient: DataBaseConnection
  ) {
    super();
    logger.info('构造');
    this.load().then(() => {
      logger.info('启动');
    });
  }

  public async load() {
    logger.info('vercel');
    const configs = await this.vercel.getEnvironments();

    logger.info(configs);
    let parsed: dotenv.DotenvParseOutput = {};
    if (configs) {
      parsed = dotenv.parse(configs);
    }
    if (parsed) {
      Object.keys(parsed).forEach((key) => {
        this.configMap.set(key, parsed[key]);
      });
    }

    await this.dBClient.connect(this.configMap.get('DB_CONN_STRING') as string);
  }
}
