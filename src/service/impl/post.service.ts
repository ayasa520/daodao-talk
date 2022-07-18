import { FilterQuery } from 'mongoose';
import { omit } from 'lodash';
import { marked } from 'marked';
import { inject, injectable } from 'inversify';

import TYPES from '@/constants/TYPES';
import { PostRepository } from '@/dao/repositories';
import { Post } from '@/models/post.model';
import { PostService as PostServiceInterface } from '@/service/PostService';

@injectable()
export class PostService implements PostServiceInterface {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.PostRepository) public postRepository: PostRepository
  ) {}

  public async createPost(
    input: Omit<Post, 'valid' | 'replies' | 'createdAt' | 'updatedAt'>
  ) {
    const newPost = await this.postRepository.save({
      ...omit(input, 'content'),
      content: marked.parse(input.content),
    });
    if (newPost) {
      await this.postRepository.updateOne(
        { _id: input.rid },
        // eslint-disable-next-line no-underscore-dangle
        { $addToSet: { replies: newPost._id } }
      );
    }
    return newPost;
  }

  public async findPost(postId: string) {
    return this.postRepository.findById(postId);
  }

  public async findAll() {
    return this.postRepository.findAll('replies');
  }

  public async deletePost(query: FilterQuery<Post>) {
    // eslint-disable-next-line no-underscore-dangle
    await this.postRepository.updateOne(query, { valid: false });
    return this.postRepository.updateOne(
      { _id: query.rid },
      // eslint-disable-next-line no-underscore-dangle
      { $pull: { replies: query._id } }
    );
  }
}
