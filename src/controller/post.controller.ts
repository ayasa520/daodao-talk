import { Request, Response } from 'express';

import { CreatePostInput } from '@/schema/post.schema';
import {
  createPost,
  deletePost,
  findAll,
  findPost,
} from '@/service/post.service';
import { Post } from '@/models/post.model';

export async function createPostsHandler(
  req: Request<unknown, unknown, CreatePostInput['body']>,
  res: Response
) {
  const { uid } = res.locals.user;
  const ua = req.get('user-agent') as string;
  const post = req.body as Post;

  const result = await createPost({ ...post, uid, userAgent: ua });

  res.send(result);
}

export async function getPostsHandler(req: Request, res: Response) {
  const result = await findAll();
  res.send(result);
}

export async function deletePostsHandler(req: Request, res: Response) {
  const userId = res.locals.user.uid;
  const postId = req.params.postId as string;

  const query = await findPost(postId);

  if (!query || !query.valid) {
    return res.status(404).send(`Post with id ${postId} does not exist`);
  }
  if (query.uid.toString() !== userId) {
    return res.status(403);
  }

  const result = await deletePost(query as Post);

  return res.send(result);
}
