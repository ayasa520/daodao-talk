import { DocumentDefinition, FilterQuery } from 'mongoose';
import bcrypt from 'bcrypt';
import { omit } from 'lodash';

import UserModel, { User } from '@/models/user.model';
import logger from '@/utils/logger';

export default async function createUser(
  input: DocumentDefinition<Omit<User, 'createdAt' | 'updatedAt'>>
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
  const user = await UserModel.findOne({ email });
  if (!user) {
    return null;
  }

  const isValid = await bcrypt
    .compare(password, user.password)
    .catch((error: any) =>
      logger.error(error));

  return isValid ? omit(user.toJSON(), 'password') : null;
}

export async function findUser(query: FilterQuery<User>) {
  return UserModel.findOne(query).lean();
}
