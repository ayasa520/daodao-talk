import { Router, Request, Response } from 'express';

import { createUserHandler } from '@/controller/user.controller';
import validateResource from '@/middleware/validate';
import { createUserSchema } from '@/schema/user.schema';
import { createSessionHandler, deleteSessionHandler, getSessionHandler } from '@/controller/session.controller';
import { createSessionSchema } from '@/schema/session.schema';
import { deserializeUser } from '@/middleware/deserializeUser';
import { requireUser } from '@/middleware/requireUser';
import {
  createPostsHandler,
  deletePostsHandler,
  getPostsHandler
} from '@/controller/post.controller';
import { createPostSchema, deletePostSchema } from '@/schema/post.schema';

const routes = Router();

routes.get('/healthcheck', (req: Request, res: Response) => {
  res.sendStatus(200);
});

routes.post('/api/users', validateResource(createUserSchema), createUserHandler);
routes.post('/api/sessions', validateResource(createSessionSchema), createSessionHandler);
routes.get('/api/sessions', [deserializeUser, requireUser], getSessionHandler);
routes.delete('/api/sessions', [deserializeUser, requireUser], deleteSessionHandler);
routes.post('/api/posts', [validateResource(createPostSchema), deserializeUser, requireUser], createPostsHandler);
routes.get('/api/posts', getPostsHandler);
routes.delete('/api/posts/:postId', [validateResource(deletePostSchema), deserializeUser, requireUser], deletePostsHandler);
export default routes;
