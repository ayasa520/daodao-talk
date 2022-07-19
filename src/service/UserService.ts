import { FilterQuery } from 'mongoose';

import {
  Login, NewUser, User, UserLean
} from '@/models/User';

export interface UserService {
  createUser(input: NewUser): Promise<UserLean>;

  validatePassword({ email, password }: Login): Promise<UserLean | null>;

  findUser(query: FilterQuery<User>): Promise<UserLean | null>;
}
