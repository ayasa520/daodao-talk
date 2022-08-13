import 'reflect-metadata';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';

import { CookieParserMiddleware } from '@/middleware/CookieParserMiddleware';
import CONFIGS from '@/constants/CONFIGS';
import { CorsMiddleware } from '@/middleware/CorsMiddleware';
import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { DeserializeUser } from '@/middleware/DeserializeUser';
import { container } from '@/inversify.config';
import { VercelMiddleware } from '@/middleware/VercelMiddleware';
import { DataBaseConnection } from '@/utils/DataBaseConnection';
import { Config } from '@/config/Config';

const server = new InversifyExpressServer(container);

server.setConfig(
  // 用闭包比 inversifyJs 的工厂少写很多代码, 虽然不知道是否"优雅", 管他呢
  (app) => {
    const vercelMiddleware = container.get<VercelMiddleware>(
      TYPES.ReloadEveryReq
    );
    app.use(vercelMiddleware.handler.bind(vercelMiddleware));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    const cookieParserMiddleware = container.get<CookieParserMiddleware>(
      CONFIGS.COOKIE_SECRET
    );
    const corsMiddleware = container.get<CorsMiddleware>(CONFIGS.ALLOW_DOMAIN);
    const deserializeUser = container.get<DeserializeUser>(
      TYPES.DeserializeUser
    );
    app.use(cookieParserMiddleware.handler.bind(cookieParserMiddleware));
    app.use(corsMiddleware.handler.bind(corsMiddleware));
    app.use(deserializeUser.handler.bind(deserializeUser));
  }
);

const app = server.build();
const dbClient = container.get<DataBaseConnection>(TYPES.DBClient);
const configurer = container.get<Config>(TYPES.Configurer);

app.listen(5000, () => {
  logger.info('服务器启动');
});

(async () => {
  try {
    await configurer.load();
    logger.info('配置已经读取');
    await dbClient.connect();
    logger.info('数据库连接');
  } catch (e) {
    logger.error(e);
  }
})();

export default app;
