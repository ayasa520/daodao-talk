const CONFIGS = {
  admin: Symbol.for('admin'),
  all: Symbol.for('all'),
  user: Symbol.for('user'),
  DB_CONN_STRING: Symbol.for('DB_CONN_STRING'),
  ALLOW_DOMAIN: Symbol.for('ALLOW_DOMAIN'),
  PORT: Symbol.for('PORT'),
  SECRET: Symbol.for('SECRET'),
  COOKIE_SECRET: Symbol.for('COOKIE_SECRET'),
  ACCESS_TOKEN_TTL: Symbol.for('ACCESS_TOKEN_TTL'),
  REFRESH_TOKEN_TTL: Symbol.for('REFRESH_TOKEN_TTL'),
  POST_POSTER_ALLOW: Symbol.for('POST_POSTER_ALLOW'),
  POST_COMMENT_ALLOW: Symbol.for('POST_COMMENT_ALLOW'),
  GET_COMMENT_ALLOW: Symbol.for('GET_COMMENT_ALLOW'),
  DELETE_COMMENT_ALLOW: Symbol.for('DELETE_COMMENT_ALLOW '),
  POST_POSTER_ALLOW_POST_COMMENT_ALLOW: Symbol.for(
    'POST_POSTER_ALLOW_POST_COMMENT_ALLOW'
  ),
};

export default CONFIGS;
