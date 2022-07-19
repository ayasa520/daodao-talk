import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';

import { Post } from '@/models/Post';
import CONFIGS from '@/constants/CONFIGS';
import { Config } from '@/config/Config';
import logger from '@/utils/logger';

// const config = Config.getConfig();

/**
 * 对接口进行权限检查
 * @param allowConfig 为空就是所有登录用户
 */

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  public constructor(
    private configurer: Config,
    private allowConfig?:
      | symbol
      | { commentConfig: symbol; posterConfig: symbol }
  ) {
    super();
    logger.info(`测试 ${this.configurer.check()}`);
  }

  public handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    const post = req.body as Post;
    const { rid } = post;

    // eslint-disable-next-line no-nested-ternary
    const allowRole = this.allowConfig && typeof this.allowConfig !== 'symbol'
      ? rid
        ? (this.configurer.get(
              this.allowConfig.commentConfig.description as string
        ) as string | undefined)
        : (this.configurer.get(
              this.allowConfig.posterConfig.description as string
        ) as string | undefined)
      // eslint-disable-next-line no-nested-ternary
      : this.allowConfig
        ? this.allowConfig.description === 'all'
          || this.allowConfig.description === 'admin'
          ? this.allowConfig.description
          : (this.configurer.get(this.allowConfig.description as string) as
              | string
              | undefined)
        : undefined;
    // 相当于不设置, 但是为了根据配置项动态管理, 所以统一起来
    logger.info(`允许角色${allowRole} `);
    if (allowRole === 'all') {
      return next();
    }
    // 下面的是必须要求登录的情况
    const { user } = res.locals;
    if (!user) {
      res.sendStatus(401); // Forbidden
      // eslint-disable-next-line consistent-return
      return;
    }
    // 仅限管理员
    if (allowRole === 'admin') {
      if (user.admin) {
        return next();
      }
      res.sendStatus(403);
      // eslint-disable-next-line consistent-return
      return;
    }
    // 登录就可以
    return next();
  }
}

/**
 * 不直接返回中间件, 二十返回一个 symbol, 实际上没有也可以, 只是为了中间件更加醒目
 * @param allowConfig
 */
export function authMiddleware(
  allowConfig?: symbol | { commentConfig: symbol; posterConfig: symbol }
) {
  if (allowConfig) {
    if (typeof allowConfig === 'symbol') {
      return allowConfig;
    }
    return CONFIGS[
      `${allowConfig.posterConfig.description}_${allowConfig.commentConfig.description}` as keyof typeof CONFIGS
    ];
  }
  return CONFIGS.user;
}
