import { inject, injectable } from 'inversify';

import { Config as ConfigType } from '@/models/Config';
import { Config } from '@/config/Config';
import { VercelAPI } from '@/utils/VercelAPI';
import TYPES from '@/constants/TYPES';
import { ConfigService as ConfigServiceInterface } from '@/service/ConfigService';
import logger from '@/utils/logger';
import { DataBaseConnection } from '@/utils/DataBaseConnection';

@injectable()
export class ConfigService implements ConfigServiceInterface {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.Configurer) private configurer: Config,
    @inject(TYPES.Vercel) private vercel: VercelAPI,
    @inject(TYPES.DBClient) private dbClint: DataBaseConnection
  ) {}

  public async createConfig(input: ConfigType) {
    await this.configurer.setAndSave(input);
    await this.dbClint.update();
    logger.info('重连数据库');
  }
}
