import { FilterQuery } from 'mongoose';

import { User, UserLean } from '@/models/user.model';

export interface UserService {
  createUser(
    input: Omit<User, 'createdAt' | 'updatedAt' | '_id'>
  ): Promise<UserLean>;

  validatePassword({
    email,
    password
  }: {
    email: string;
    password: string;
  }): Promise<UserLean | null>;

  findUser(query: FilterQuery<User>): Promise<UserLean | null>;
}
