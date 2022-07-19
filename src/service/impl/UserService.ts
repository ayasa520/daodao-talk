import { FilterQuery } from 'mongoose';
import bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { inject, injectable } from 'inversify';

import { User, UserLean } from '@/models/User';
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

  public async createUser(
    input: Omit<User, 'createdAt' | 'updatedAt' | '_id'>
  ): Promise<UserLean> {
    const user = await this.userRepository.save(input);
    return omit(user, 'password');
  }

  public async validatePassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserLean | null> {
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
