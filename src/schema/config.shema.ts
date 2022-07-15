import { object, string, TypeOf } from 'zod';

export const createConfigSchema = object({
  body: object({
    DB_CONN_STRING: string({ required_error: 'DB_CONN_STRING is required' }),
    ALLOW_DOMAIN: string({ required_error: 'ALLOW_DOMAIN is required' }),
    PORT: string(),
    SECRET: string({ required_error: 'SECRET is required' }),
    COOKIE_SECRET: string({ required_error: 'COOKIE_SECRET is required' }),
    ACCESS_TOKEN_TTL: string(),
    REFRESH_TOKEN_TTL: string(),
    POST_POSTER_ALLOW: string(),
    POST_COMMENT_ALLOW: string(),
    GET_COMMENT_ALLOW: string(),
    DELETE_COMMENT_ALLOW: string(),
    DAO_TOKEN: string(),
    DAO_PROJECT_NAME: string(),
  }).refine((data) => {
    const s = data.DAO_PROJECT_NAME.trim();
    const s1 = data.DAO_TOKEN.trim();
    return (s === '' && s1 === '') || (s !== '' && s1 !== '');
  }),
});
export type CreateConfigInput = TypeOf<typeof createConfigSchema>;
