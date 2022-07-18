import { FilterQuery } from 'mongoose';

import { Post } from '@/models/post.model';
import { UpdateResult } from '@/dao/repositories';

export interface PostService {
  createPost(
    input: Omit<Post, 'valid' | 'replies' | 'createdAt' | 'updatedAt'>
  ): Promise<Post | undefined>;

  findPost(postId: string): Promise<Post | null>;

  findAll(): Promise<any>;

  deletePost(query: FilterQuery<Post>): Promise<UpdateResult>;
}
