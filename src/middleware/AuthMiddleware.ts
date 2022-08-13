import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';

import { Post } from '@/models/Post';
import CONFIGS from '@/constants/CONFIGS';
import { Config } from '@/config/Config';
import logger from '@/utils/logger';

// const config = Config.getConfig();
// 说实话, 这些中间件动态配置写得非常烂!g.getConfig();

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
    // TODO
    // logger.info(`测试 ${this.configurer.check()}`);
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
 * 这几个中间件因为需要读取配置来进行动态配置, 所以必须将 Config 传入( 受限于 TS 无法直接注入, 在绑定时通过构造传入), 这就不能像之前那样写成一个闭包的形式.
 * 下面这个函数返回的实际上是中间件的 Tag (Symbol), 在绑定时, 将各个 Tag 与需要读取各种配置的中间件绑定, 所以在 controller
 * 直接写 Tag 就能注入了, 但是那样不太直观, 所以用这种方式, 保持形式上和之前一致
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
