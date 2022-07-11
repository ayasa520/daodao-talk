import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User } from '@/models/user.model';

dotenv.config();

// 模仿 twikoo
export interface Post {
  _id: mongoose.Types.ObjectId;
  uid: User['_id']; // 用户 id
  replies: [mongoose.Types.ObjectId];
  rid?: Post['_id']; // 该层评论的 id
  pid?: Post['_id']; // 直接回复的 id
  valid: boolean;
  content: string;
  userAgent: string;
  createdAt: Date;
  updateAt: Date;
}

const PostSchema = new mongoose.Schema<Post>(
  {
    uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    userAgent: { type: String, required: true },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: 'Post',
    },
    rid: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    pid: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    valid: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    // 会多一个 id 字段
    toJSON: { virtuals: true },
  }
);
PostSchema.virtual('user', {
  ref: 'User',
  localField: 'uid',
  foreignField: '_id',
  justOne: true,
});

const PostModel = mongoose.model<Post>('Post', PostSchema);

export default PostModel;
