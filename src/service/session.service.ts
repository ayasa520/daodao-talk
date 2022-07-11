/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { get } from 'lodash';

import SessionModel, { Session } from '@/models/session.model';
import { signJwt, verifyJwt } from '@/utils/jwt.utils';
import { findUser } from '@/service/user.service';
import { User } from '@/models/user.model';
import logger from '@/utils/logger';

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent });
  return session.toJSON();
}

export async function findSessions(query: FilterQuery<Session>) {
  // 返回 json 格式的数据, 不包含 Document 各种函数
  const query1 = await SessionModel.find(query).populate('user');
  logger.info(query1);
  return SessionModel.find(query).lean();
}
export async function updateSession(
  query: FilterQuery<Session>,
  update: UpdateQuery<Session>
) {
  const query1: UpdateWriteOpResult = await SessionModel.updateOne(
    query,
    update
  );
  return query1;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string | undefined> {
  logger.info('refresh');
  const { valid, decoded } = verifyJwt(refreshToken);
  const sessionId = get(decoded, 'sid');
  // refreshToken 无效(包括过期) 或者没有包含对应的 session id
  if (!valid || !sessionId) {
    logger.info('undefined');
    return undefined;
  }

  const session: Session | null = await SessionModel.findById(sessionId);
  logger.info(`session ${session}`);
  // session 可能不存在, 或者被标记为无效
  if (!session || !session.valid) {
    logger.info('undefined1');
    return undefined;
  }

  // 感觉好像没必要
  const user: User | null = await findUser({ _id: session.user });
  if (!user) {
    logger.info('user undefined');
    return undefined;
  }

  return signJwt(
    {
      uid: user._id,
      sid: session._id,
      admin: user.admin
    },
    { expiresIn: process.env.ACCESS_TOKEN_TTL }
  );
}
