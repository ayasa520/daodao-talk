import mongoose from 'mongoose';

import { User } from '@/models/user.model';

// Session 存储起来的作用是使用 refreshToken 获取新的 accessToken 时确保有效
// 1. Create an interface representing a document in MongoDB.
export interface Session {
  _id: mongoose.Types.ObjectId;
  user: User['_id']; // 用户 id
  valid: boolean;
  userAgent: string;
  createdAt: Date;
  updateAt: Date;
}
