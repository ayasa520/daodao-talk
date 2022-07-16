import express from 'express';

// @ 为 src
import logger from '@/utils/logger';
import routes from '@/routes';
import { Config } from '@/config/config';
import { getCookieParser } from '@/middleware/cookieParser';
import { getCors } from '@/middleware/cors';
import { vercelLoadMiddleware } from '@/middleware/vercelLoadConfig';

logger.info('app');
const config = Config.getConfig();

class App {
  public express: express.Application = express();

  public constructor() {
    // eslint-disable-next-line max-len
    // 我不太了解 serverless, 它必须每次都要手动加载配置(调用 config.load() )才行, 我原以为用到 config 的地方意味着 config 必然会经过实例化, 那么 load 一定已经调用过了, 事实并非如此
    this.express.use(vercelLoadMiddleware);
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(express.json());
    // app.use(cors({ origin: process.env.ALLOW_DOMAIN as string }));

    // 必须在 route 之上
    this.express.use(getCors('ALLOW_DOMAIN'));
    this.express.use(getCookieParser('COOKIE_SECRET'));

    this.express.use(routes);

    // const { PORT = 5000 } = process.env;
    const PORT = config.get('PORT') || 5000;

    // cookieParser 中间件读取的 secret 随着配置变化而变化
    // this.express.use(getCookieParser('COOKIE_SECRET'));

    // PORT 读取新配置只能重启了
    this.express.listen(PORT, async () => {
      logger.info(`Server started at http://localhost:${PORT}`);
    });
  }

  // eslint-disable-next-line class-methods-use-this
}

export default new App().express;
