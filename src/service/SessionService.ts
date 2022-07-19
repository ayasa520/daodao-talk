import { FilterQuery, UpdateQuery } from 'mongoose';

import { Session } from '@/models/Session';
import { UpdateResult } from '@/dao/Repositories';

export interface SessionService {
  createSession(
    userId: string,
    userAgent: string
  ): Promise<Session>;

  findSessions(query: FilterQuery<Session>): Promise<Session[]>;

  updateSession(
    query: FilterQuery<Session>,
    update: UpdateQuery<Session>
  ): Promise<UpdateResult>;

  refreshAccessToken(refreshToken: string): Promise<string | undefined>;
}
