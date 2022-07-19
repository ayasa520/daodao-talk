import { injectable } from 'inversify';
import mongoose from 'mongoose';

import { GenericRepository } from '@/dao/impl/mongoose/GenericRepository';
import { Session } from '@/models/Session';
import { SessionRepository as SessionRepositoryInterface } from '@/dao/Repositories';

@injectable()
export class SessionRepository
  extends GenericRepository<Session>
  implements SessionRepositoryInterface {
  public constructor() {
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
    super(SessionModel);
  }
}
