import mongoose from 'mongoose';

import { User } from '@/models/user.model';

// 模仿 twikoo
export interface Post {
  _id: mongoose.Types.ObjectId;
  uid: User['_id']; // 用户 id
  replies: [mongoose.Types.ObjectId];
  rid?: Post['_id']; // root id
  pid?: Post['_id']; // 直接回复的 id
  valid: boolean;
  content: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}
