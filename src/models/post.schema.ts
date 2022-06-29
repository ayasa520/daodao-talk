import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  // 开发环境, 为了部署在 vercel 方便, 所以生产环境的配置不在文件里做
  dotenv.config();
}

console.log(process.env.DB_CONN_STRING);

mongoose.connect(process.env.DB_CONN_STRING as string);

const PostSchema = new mongoose.Schema(
  {
    text: { type: String, unique: false, required: true },
    createTime: {
      type: Date,
      default: Date.now,
    },
    updateTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
  },
);

const Post = mongoose.model('Post', PostSchema);

export default Post;
