import { FilterQuery } from 'mongoose';
import bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { inject, injectable } from 'inversify';

import {
  Login, NewUser, User, UserLean
} from '@/models/User';
import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { UserRepository } from '@/dao/Repositories';
import { UserService as UserServiceInterface } from '@/service/UserService';

@injectable()
export class UserService implements UserServiceInterface {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  public async createUser(input: NewUser): Promise<UserLean> {
    const user = await this.userRepository.save(input);
    // 一个坑点, 这里实际上的对象不会发生字段的改变!!! 相当于 as 不会使转换前的对象字段发生改变
    // 举例: interface A { a: string }
    // const aaa:A = {a:'213', b:'123123'} as A
    // aaa 实际上的值是 {a:'213', b:'123123'}
    return omit(user, 'password');
  }

  public async validatePassword({
    email,
    password,
  }: Login): Promise<UserLean | null> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      return null;
    }

    const isValid = await bcrypt
      .compare(password, user.password)
      .catch((error) =>
        logger.error(error));

    return isValid ? omit(user, 'password') : null;
  }

  public async findUser(query: FilterQuery<User>): Promise<UserLean | null> {
    return this.userRepository.findOne(query);
  }
}
