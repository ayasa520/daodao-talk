import { inject, injectable } from 'inversify';

import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { DataBaseConnection } from '@/utils/database';

@injectable()
export abstract class Config {
  protected configMap: Map<string, string | undefined> = new Map<
    string,
    string | undefined
  >();


  public check(): boolean {
    // 检查运行必须的配置. 后两项是vercel初始化之前就确定的
    logger.info('check');
    return (
      this.configMap.has('DB_CONN_STRING') &&
      this.configMap.has('ALLOW_DOMAIN') &&
      this.configMap.has('SECRET') &&
      this.configMap.has('COOKIE_SECRET') &&
      (process.env.DAO_TOKEN
        ? this.configMap.has('DAO_PROJECT_NAME') &&
          this.configMap.has('DAO_TOKEN')
        : true)
    );
  }

  public get(key: string): string | undefined {
    logger.info('取配置');
    return this.configMap.get(key);
  }

  public getConfigCount(): number {
    return this.configMap.size;
  }

  public toJSON(): string {
    const obj = Object.create(null);
    this.configMap.forEach((v, k) => {
      obj[k] = v;
    });
    return JSON.stringify(obj);
  }

  public abstract load(): Promise<void>;
}
