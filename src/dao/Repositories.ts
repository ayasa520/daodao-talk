import { ObjectId } from 'bson';
import {
  PopulatedDoc,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

import { Post } from '@/models/Post';
import { Session } from '@/models/Session';
import { User } from '@/models/User';

export type Query<T> = {
  [P in keyof T]?: T[P] | { $regex: RegExp };
};

type AnyKeys<T> = { [P in keyof T]?: T[P] | any };

export declare interface UpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId: ObjectId;
}

export interface Repository<T> {
  save(doc: AnyKeys<T> | T): Promise<T>;
  findAll(refPath?: string): Promise<T[] | PopulatedDoc<T>>;
  findById(id: string, refPath?: string): Promise<T | null>;
  findOne(query: Query<T>, refPath?: string): Promise<T | null>;
  findManyById(ids: string[], refPath?: string): Promise<T[]>;
  findManyByQuery(query?: Query<T>, refPath?: string): Promise<T[]>;
  // 确实没有办法, 总得依赖这个. 不过具体实现还是不受影响的
  updateOne(
    filter?: Query<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline
  ): Promise<UpdateResult>;
}

export type PostRepository = Repository<Post>;
export type SessionRepository = Repository<Session>;
export type UserRepository = Repository<User>;
