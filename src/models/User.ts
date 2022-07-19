import mongoose from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface User {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  admin: boolean;
}

export type UserLean = Pick<
  User,
  '_id' | 'name' | 'createdAt' | 'updatedAt' | 'email' | 'admin'
>;

export type Login = Pick<User, 'email' | 'password'>;

export type NewUser = Omit<User, 'createdAt' | 'updatedAt' | '_id'>;
