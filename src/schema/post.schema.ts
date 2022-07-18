import { object, string, TypeOf } from 'zod';
import { isValidObjectId } from 'mongoose';

// 给 validate 用的
export const createPostSchema = object({
  body: object({
    content: string({
      required_error: 'content is required',
    }),
    rid: string().optional(),
    pid: string().optional(),
  }),
}).describe('createPostSchema');

export const deletePostSchema = object({
  params: object({
    postId: string({
      required_error: 'postId is required',
    }),
  }).refine((data) =>
    isValidObjectId(data.postId), {
    message: 'postId is not a valid ObjectId',
    path: ['postId'],
  }),
}).describe('deletePostSchema');
export type CreatePostInput = TypeOf<typeof createPostSchema>;
export type DeletePostInput = TypeOf<typeof deletePostSchema>;
