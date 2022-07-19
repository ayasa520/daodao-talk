import { FilterQuery, PopulatedDoc } from 'mongoose';

import { NewPost, Post } from '@/models/Post';
import { UpdateResult } from '@/dao/Repositories';

export interface PostService {
  createPost(
    input: NewPost
  ): Promise<Post | undefined>;

  findPost(postId: string): Promise<Post | null>;

  findAll(): Promise<Post[] | PopulatedDoc<Post>>;

  deletePost(query: FilterQuery<Post>): Promise<UpdateResult>;
}
