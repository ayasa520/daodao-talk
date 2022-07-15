import { NextFunction, Request, Response } from 'express';

import { Config } from '@/config/config';
import { Post } from '@/models/post.model';

const config = Config.getConfig();

/**
 * 对接口进行权限检查
 * @param allowConfig 为空就是所有登录用户
 */
export default function auth(
  allowConfig?: string | { commentConfig: string; posterConfig: string }
) {
  return async function requireUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const post = req.body as Post;
    const { rid } = post;

    // eslint-disable-next-line no-nested-ternary
    const allowRole = allowConfig && typeof allowConfig !== 'string'
      ? rid
        ? (config.get(allowConfig.commentConfig) as string | undefined)
        : (config.get(allowConfig.posterConfig) as string | undefined)
      // eslint-disable-next-line no-nested-ternary
      : allowConfig
        ? allowConfig === 'all' || allowConfig === 'admin'
          ? allowConfig
          : (config.get(allowConfig) as string | undefined)
        : undefined;
    // 相当于不设置, 但是为了根据配置项动态管理, 所以统一起来
    if (allowRole === 'all') {
      return next();
    }
    // 下面的是必须要求登录的情况
    const { user } = res.locals;
    if (!user) {
      return res.sendStatus(401); // Forbidden
    }
    // 仅限管理员
    if (allowRole === 'admin') {
      return user.admin === true ? next() : res.sendStatus(403);
    }
    // 登录就可以
    return next();
  };
}
