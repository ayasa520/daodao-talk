import 'reflect-metadata';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';

import { CookieParserMiddleware } from '@/middleware/cookieParser';
import CONFIGS from '@/constants/CONFIGS';
import { CorsMiddleware } from '@/middleware/cors';
import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { DeserializeUser } from '@/middleware/deserializeUser';
import { container } from '@/inversify.config';
import { VercelMiddleware } from '@/middleware/vercelLoadConfig';

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
app.listen(5000, () => {
  logger.info('服务器启动');
});

export default app;
