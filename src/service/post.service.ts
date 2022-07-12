import { DocumentDefinition } from 'mongoose';
import { omit } from 'lodash';
import { marked } from 'marked';

import PostModel, { Post } from '@/models/post.model';
import logger from '@/utils/logger';

export async function createPost(
  input: DocumentDefinition<
    Omit<Post, 'valid' | 'replies' | 'createdAt' | 'updatedAt'>
  >
) {
  const newPost = await PostModel.create({
    ...omit(input, 'content'),
    content: marked.parse(input.content),
  });
  await PostModel.updateOne(
    { _id: input.rid },
    // eslint-disable-next-line no-underscore-dangle
    { $addToSet: { replies: newPost._id } }
  );
  return newPost;
}
export async function findPost(postId: string) {
  return PostModel.findOne({ _id: postId }).lean();
}
export async function findAll() {
  const query = await PostModel.find({});
  logger.info(query);
  return PostModel.find({ rid: { $exists: false }, valid: true })
    .populate({
      path: 'replies',
      populate: [
        { path: 'replies' },
        { path: 'user', select: ['_id', 'name', 'email', 'admin'] },
      ],
    })
    .populate('user', ['_id', 'name', 'email', 'admin']);
}

export async function deletePost(query: Post) {
  // eslint-disable-next-line no-underscore-dangle
  await PostModel.updateOne({ _id: query._id }, { valid: false });
  return PostModel.updateOne(
    { _id: query.rid },
    // eslint-disable-next-line no-underscore-dangle
    { $pull: { replies: query._id } }
  );
}
