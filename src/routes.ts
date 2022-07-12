import { Router, Request, Response} from 'express';

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

const routes = Router();

routes.use(deserializeUser);

routes.get('/healthcheck', (req: Request, res: Response) => {
  res.sendStatus(200);
});

routes.post('/api/users', validateResource(createUserSchema), createUserHandler);
routes.post('/api/sessions', validateResource(createSessionSchema), createSessionHandler);
routes.get('/api/sessions', auth(), getSessionHandler);
routes.delete('/api/sessions', auth(), deleteSessionHandler);
// 发送说说
routes.post('/api/posts', [validateResource(createPostSchema), auth({ posterConfig: 'POST_POSTER_ALLOW', commentConfig: 'POST_COMMENT_ALLOW' })], createPostsHandler);
routes.get('/api/posts', auth('GET_COMMENT_ALLOW'), getPostsHandler);
routes.delete('/api/posts/:postId', [validateResource(deletePostSchema), deserializeUser, auth('DELETE_COMMENT_ALLOW')], deletePostsHandler);
export default routes;
