import { injectable } from 'inversify';

import {
  Config as ConfigType,
  DBConfig,
  JWTConfig,
  PermissionConfig,
} from '@/models/Config';

@injectable()
export abstract class Config implements ConfigType {
  public cookieSecret: string;

  public database: DBConfig;

  public jwt: JWTConfig;

  public origin: string[];

  public permission: PermissionConfig;

  public configList: { [key: string]: string };

  public check() {
    return (
      this.cookieSecret
      && this.database
      && this.jwt
      && this.origin
      && this.permission
    );
  }

  // TODO 如何让中间件直接从对象里读取?
  // 注入中间件是通过 Symbol 做的, Symbol 相当于配置项的 key, 然后中间件内部通过这个 key Config.get 拿配置(这在inversify bind 时建立联系)
  // 积重难返, 因为动态配置的中间件的缘故, 还是无法完全放弃 key-value 的配置
  public get(key: string) {
    return this.configList[key];
  }

  public async setAndSave(input: ConfigType) {
    // 内存更新
    await this.set(input);
    // 持久化
    await this.save();
  }

  public async load(): Promise<void> {
    const configPromise = await this.fetchSettings();
    if (configPromise) {
      await this.set(configPromise);
    }
  }

  protected async set(input: ConfigType) {
    this.cookieSecret = input.cookieSecret;
    this.database = input.database;
    this.jwt = input.jwt;
    this.origin = input.origin;
    this.permission = input.permission;
    this.configList = {
      DB_CONN_STRING: this.database.uri,
      ALLOW_DOMAIN: this.origin.toString(),
      COOKIE_SECRET: this.cookieSecret,
      SECRET: this.jwt.secret,
      ACCESS_TOKEN_TTL: this.jwt.accessTokenTTL,
      REFRESH_TOKEN_TTL: this.jwt.refreshTokenTTL,
      POST_POSTER_ALLOW: this.permission.post,
      POST_COMMENT_ALLOW: this.permission.comment,
      GET_COMMENT_ALLOW: this.permission.get,
      DELETE_COMMENT_ALLOW: this.permission.delete,
    };
  }

  // 从文件或者vercel环境变量读取
  public abstract fetchSettings(): Promise<ConfigType | undefined>;

  public abstract save(): Promise<void>;
}
