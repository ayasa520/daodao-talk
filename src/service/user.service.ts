import { FilterQuery } from 'mongoose';
import bcrypt from 'bcrypt';
import { omit } from 'lodash';

import UserModel, { User } from '@/models/user.model';
import logger from '@/utils/logger';

export default async function createUser(
  input: Omit<User, 'createdAt' | 'updatedAt' | '_id'>
) {
  const user = await UserModel.create(input);
  return omit(user.toJSON(), 'password');
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email }).lean();
  if (!user) {
    return null;
  }

  const isValid = await bcrypt
    .compare(password, user.password)
    .catch((error) =>
      logger.error(error));

  return isValid ? omit(user, 'password') : null;
}

export async function findUser(query: FilterQuery<User>) {
  return UserModel.findOne(query).lean();
}
