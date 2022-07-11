/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { pick } from 'lodash';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

import { validatePassword } from '@/service/user.service';
import logger from '@/utils/logger';
import {
  createSession,
  findSessions,
  updateSession,
} from '@/service/session.service';
import { signJwt } from '@/utils/jwt.utils';

dotenv.config();

export async function createSessionHandler(req: Request, res: Response) {
  // Validate the user's password
  const user = await validatePassword(req.body);
  if (!user) {
    return res.status(401).send('Invalid email or password');
  }
  // create a session
  const { _id } = user;
  const session = await createSession(
    _id.toString(),
    req.get('user-agent') || ''
  );
  // create access token

  /** accessToken 有效期短, refreshToken 有效期长, session 记录该用户会话是否有效
   * 若 accessToken 过期, 检查 refreshToken 以及该用户 session 是否有效, 若有效, 返回新的 accessToken
   */
  const accessToken = signJwt(
    {
      uid: user._id,
      sid: session._id,
      admin: user.admin,
    },
    { expiresIn: process.env.ACCESS_TOKEN_TTL }
  );
  // create a refresh token

  const refreshToken = signJwt(
    {
      uid: user._id,
      sid: session._id,
      admin: user.admin,
    },
    { expiresIn: process.env.REFRESH_TOKEN_TTL }
  );

  // return access & refresh token
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    signed: true,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    signed: true,
  });

  return res.sendStatus(200);
}
export async function getSessionHandler(req: Request, res: Response) {
  logger.info(`a ${res.locals.user}`);
  const userId = res.locals.user.uid;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}
export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.sid;
  const updateResult = await updateSession(
    { _id: sessionId },
    { valid: false }
  );
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.send(updateResult);
}
