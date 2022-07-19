import { injectable } from 'inversify';
import mongoose, { PopulatedDoc } from 'mongoose';

import { GenericRepository } from '@/dao/impl/mongoose/GenericRepository';
import { Post } from '@/models/Post';
import { PostRepository as PostRepositoryInterface } from '@/dao/Repositories';

@injectable()
export class PostRepository
  extends GenericRepository<Post>
  implements PostRepositoryInterface {
  public constructor() {
    const PostSchema = new mongoose.Schema<Post>(
      {
        uid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
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
    super(PostModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async findAll(refPath?: string): Promise<PopulatedDoc<Post> | Post[]> {
    if (refPath) {
      return this.Model.find({
        rid: { $exists: false },
        valid: true,
      })
        .populate({
          path: refPath,
          populate: [
            { path: refPath },
            { path: 'user', select: ['_id', 'name', 'email', 'admin'] },
          ],
        })
        .populate('user', ['_id', 'name', 'email', 'admin'])
        .lean();
    }
    return this.Model.find({
      rid: { $exists: false },
      valid: true,
    });
  }
}
