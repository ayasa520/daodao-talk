import express from 'express';

// @ 为 src
import logger from '@/utils/logger';
import routes from '@/routes';
import { Config } from '@/config/config';
import { getCookieParser } from '@/middleware/cookieParser';
import { getCors } from '@/middleware/cors';

logger.info('app');
const config = Config.getConfig();

class App {
  public express: express.Application = express();

  public constructor() {
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
