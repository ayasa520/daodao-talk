import { Request, Response } from 'express';
import {
  Controller,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  request,
  requestBody,
  requestHeaders,
  requestParam,
  response,
} from 'inversify-express-utils';
import { inject } from 'inversify';

import { InputPost } from '@/models/Post';
import { validateSchemaSym as validateSchema } from '@/middleware/validate';
import SCHEMAS from '@/constants/SCHEMAS';
import { authMiddleware } from '@/middleware/AuthMiddleware';
import CONFIGS from '@/constants/CONFIGS';
import TYPES from '@/constants/TYPES';
import { PostService } from '@/service/PostService';
import logger from '@/utils/logger';

@controller('/api/posts')
export class PostController implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.PostService) private postService: PostService
  ) {}

  @httpPost(
    '/',
    validateSchema(SCHEMAS.createPostSchema),
    authMiddleware({
      posterConfig: CONFIGS.POST_POSTER_ALLOW,
      commentConfig: CONFIGS.POST_COMMENT_ALLOW,
    })
  )
  public async createPostsHandler(
    @requestBody() post: InputPost,
    @requestHeaders('user-agent') ua: string,
    @response() res: Response
  ) {
    const { uid } = res.locals.user;
    // const ua = req.get('user-agent') as string;

    const result = await this.postService.createPost({
      ...post,
      uid,
      userAgent: ua,
    });

    logger.info('404');
    return res.send(result);
  }

  @httpGet('/', authMiddleware(CONFIGS.GET_COMMENT_ALLOW))
  public async getPostsHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    const result = await this.postService.findAll();
    res.send(result);
  }

  @httpDelete(
    '/:postId',
    validateSchema(SCHEMAS.deletePostSchema),
    authMiddleware(CONFIGS.DELETE_COMMENT_ALLOW)
  )
  public async deletePostsHandler(
    @requestParam('postId') postId: string,
    @response() res: Response
  ) {
    const userId = res.locals.user.uid;

    const isAdmin = res.locals.user.admin;

    const query = await this.postService.findPost(postId);

    if (!query || !query.valid) {
      return res.status(404).send(`Post with id ${postId} does not exist`);
    }
    if (isAdmin || query.uid.toString() === userId) {
      const result = await this.postService.deletePost(query);
      return res.send(result);
    }

    return res.status(403).send('Forbidden');
  }
}
