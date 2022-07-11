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

// 2. Create a Schema corresponding to the document interface.
const sessionSchema = new mongoose.Schema<Session>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

// 3. Create a Model.
const SessionModel = mongoose.model<Session>('Session', sessionSchema);

export default SessionModel;
