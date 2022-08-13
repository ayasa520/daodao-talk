import { inject, injectable } from 'inversify';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';

import logger from '@/utils/logger';
import { Config as ConfigType } from '@/models/Config';
import { Config } from '@/config/Config';

@injectable()
export class ServerConfigurer extends Config {
  public constructor() {
    super();
    // logger.info('构造');
    // this.load().then(() => {
    //   logger.info('启动');
    // });
  }

  // eslint-disable-next-line class-methods-use-this
  public async fetchSettings(): Promise<ConfigType | undefined> {
    const confPath = path.resolve(process.cwd(), 'config.yml');
    try {
      const buffer = fs.readFileSync(confPath, 'utf8');
      return YAML.parse(buffer);
    } catch (err) {
      logger.info(err);
    }
    return undefined;
  }

  public async save(): Promise<void> {
    const confPath = path.resolve(process.cwd(), 'config.yml');
    try {
      fs.writeFileSync(confPath, YAML.stringify(this));
    } catch (err) {
      logger.info(err);
    }
  }
}
