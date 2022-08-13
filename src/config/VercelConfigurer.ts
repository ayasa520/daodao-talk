import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import dotenv from 'dotenv';

import { VercelAPI } from '@/utils/VercelAPI';
import TYPES from '@/constants/TYPES';
import logger from '@/utils/logger';
import { Config } from '@/config/Config';
import { Config as ConfigType } from '@/models/Config';

@injectable()
export class VercelConfigurer extends Config {
  public constructor(@inject(TYPES.Vercel) private vercel: VercelAPI) {
    super();
    // logger.info('构造');
    // this.load().then(() => {
    //   logger.info('启动');
    // });
  }

  // eslint-disable-next-line class-methods-use-this
  public async fetchSettings(): Promise<ConfigType | undefined> {
    const configs = await this.vercel.getEnvironments();
    let parsed: dotenv.DotenvParseOutput = {};
    if (configs) {
      parsed = dotenv.parse(configs);
    }

    if (parsed) {
      return {
        database: { uri: parsed.DB_CONN_STRING },
        origin: parsed.ALLOW_DOMAIN.split(','),
        cookieSecret: parsed.COOKIE_SECRET,
        jwt: {
          secret: parsed.SECRET,
          accessTokenTTL: parsed.ACCESS_TOKEN_TTL,
          refreshTokenTTL: parsed.REFRESH_TOKEN_TTL,
        },
        permission: {
          post: parsed.POST_POSTER_ALLOW,
          comment: parsed.POST_COMMENT_ALLOW,
          get: parsed.GET_COMMENT_ALLOW,
          delete: parsed.DELETE_COMMENT_ALLOW,
        },
      };
    }

    // if (parsed) {
    //   Object.keys(parsed).forEach((key) => {
    //     this.configMap.set(key, parsed[key]);
    //   });
    return undefined;
  }

  public async save(): Promise<void> {
    const configs: {
      key: string;
      value: string;
      target: ('production' | 'preview' | 'development')[];
      type: 'encrypted';
    }[] = [];

    Object.keys(this.configList).forEach((key) => {
      const inputElement =
        this.configList[key as keyof { [key: string]: string }].trim();
      configs.push({
        key,
        value: inputElement,
        target: ['production', 'preview', 'development'],
        type: 'encrypted',
      });
    });

    await this.vercel.setEnvironments(configs);
  }
}
