// 存入数据库以及文件的字段是不能少的
export interface DBConfig {
  uri: string;
}

export interface JWTConfig {
  secret: string;
  accessTokenTTL: string;
  refreshTokenTTL: string;
}

export interface PermissionConfig {
  post: string;
  comment: string;
  get: string;
  delete: string;
}

export interface Config {
  database: DBConfig;
  origin: string[];
  cookieSecret: string;
  jwt: JWTConfig;
  permission: PermissionConfig;
}
