import { injectable } from 'inversify';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { GenericRepository } from '@/dao/impl/mongoose/GenericRepository';
import { User } from '@/models/User';
import { UserRepository as UserRepositoryInterface } from '@/dao/Repositories';

@injectable()
export class UserRepository
  extends GenericRepository<User>
  implements UserRepositoryInterface {
  public constructor() {
    // 2. Create a Schema corresponding to the document interface.
    const userSchema = new mongoose.Schema<User>(
      {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        admin: { type: Boolean, required: true, default: false },
      },
      {
        timestamps: true,
      }
    );

    userSchema.pre('save', async function preSave() {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    });

    userSchema.pre('updateOne', async function preUpdateOne() {
      const data = this.getChanges();
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    });

    // 3. Create a Model.
    const UserModel = mongoose.model<User>('User', userSchema);

    super(UserModel);
  }
}
