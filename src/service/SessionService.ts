import { FilterQuery, UpdateQuery } from 'mongoose';

import { Session } from '@/models/session.model';
import { UpdateResult } from '@/dao/repositories';

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
