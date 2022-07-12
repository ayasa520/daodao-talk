import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// @ 为 src
import connect from '@/utils/connect';
import logger from '@/utils/logger';
import routes from '@/routes';
import { Config } from '@/config/config';

logger.info('app');
const config = Config.getConfig({ override: true });
const app: Express = express();

// 连接数据库
connect()
  .then(() => {
    logger.info(`Connect to ${config.get('DB_CONN_STRING')}`);
  })
  .catch((err) => logger.error(err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET as string));
// app.use(cors({ origin: process.env.ALLOW_DOMAIN as string }));
app.use(cors({ origin: config.get('ALLOW_DOMAIN') as string }));

app.use(routes);

// const { PORT = 5000 } = process.env;
const PORT = config.get('PORT');

app.listen(PORT, async () => {
  logger.info(`Server started at http://localhost:${PORT}`);
});

export default app;
