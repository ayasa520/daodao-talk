// 存入数据库以及文件的字段是不能少的
export interface Config {
  DB_CONN_STRING: string;
  ALLOW_DOMAIN: string;
  PORT: string;
  SECRET: string;
  COOKIE_SECRET: string;
  ACCESS_TOKEN_TTL: string;
  REFRESH_TOKEN_TTL: string;
  POST_POSTER_ALLOW: string;
  POST_COMMENT_ALLOW: string;
  GET_COMMENT_ALLOW: string;
  DELETE_COMMENT_ALLOW: string;
  // 起始时已经配置
  // DAO_TOKEN: string;
  // DAO_PROJECT_NAME: string;
}
