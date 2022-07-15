import { Request, Response, Router } from 'express';

import { createUserHandler } from '@/controller/user.controller';
import validateResource from '@/middleware/validate';
import auth from '@/middleware/auth';
import { createUserSchema } from '@/schema/user.schema';
import { createSessionHandler, deleteSessionHandler, getSessionHandler } from '@/controller/session.controller';
import { createSessionSchema } from '@/schema/session.schema';
import { deserializeUser } from '@/middleware/deserializeUser';
import {
  createPostsHandler,
  deletePostsHandler,
  getPostsHandler
} from '@/controller/post.controller';
import { createPostSchema, deletePostSchema } from '@/schema/post.schema';
import { getConfigHandler, createConfigController } from '@/controller/config.controller';
import { Config } from '@/config/config';
import { createConfigSchema } from '@/schema/config.shema';

const config = Config.getConfig();

const routes = Router();

routes.use(deserializeUser);

routes.get('/', (req: Request, res: Response) => {
  if (config.check()) {
    return res.send('配置已完成');
  }

  return res.status(500).send('尚有配置未完成');
});

routes.get('/api/config', auth('all'), getConfigHandler);
routes.post('/api/config', validateResource(createConfigSchema), createConfigController);
routes.post('/api/users', validateResource(createUserSchema), createUserHandler);
routes.post('/api/sessions', validateResource(createSessionSchema), createSessionHandler);
routes.get('/api/sessions', auth(), getSessionHandler);
routes.delete('/api/sessions', auth(), deleteSessionHandler);
// 发送说说
routes.post('/api/posts', [validateResource(createPostSchema), auth({ posterConfig: 'POST_POSTER_ALLOW', commentConfig: 'POST_COMMENT_ALLOW' })], createPostsHandler);
routes.get('/api/posts', auth('GET_COMMENT_ALLOW'), getPostsHandler);
routes.delete('/api/posts/:postId', [validateResource(deletePostSchema), deserializeUser, auth('DELETE_COMMENT_ALLOW')], deletePostsHandler);
export default routes;
