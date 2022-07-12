import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';

import { verifyJwt } from '@/utils/jwt.utils';
import { refreshAccessToken } from '@/service/session.service';
import logger from '@/utils/logger';

// 从 token 中解码出用户信息
export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken: string = get(req.signedCookies, 'accessToken');
  const refreshToken: string = get(req.signedCookies, 'refreshToken');

  // 用户没有携带 token, 直接执行下一个中间件. 如果下一个需要用到 token 解码出的 user 才返回报错
  if (!accessToken) {
    return next();
  }

  const { valid, expired, decoded } = verifyJwt(accessToken);
  if (valid) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken: string | undefined = await refreshAccessToken(
      refreshToken
    );
    if (newAccessToken) {
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        signed: true,
      });
      const result = verifyJwt(newAccessToken);
      res.locals.user = result.decoded;
      logger.info(res.locals.user);
    }
    return next();
  }
  return next();
};
