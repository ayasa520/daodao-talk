import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from '@/utils/logger';
import { Vercel } from '@/utils/vercel';

/**
 * 单例配置类
 */
export class Config {
  private static instance: Config;

  // 这个存储着实际的配置项, 但是是在内存里, 对它的修改不是稳妥的. 采用修改 .enva 然后让这个重新读取
  // 如果是部署在 severless 上, 由于无状态, 环境变量始终读的是最新的, 所以只更改环境变量就能改变 auth
  // 中间件, 也不需要 override. 而如果部署在服务器, 好像只能重启
  private configMap: Map<string, string | undefined> = new Map<
    string,
    string | undefined
  >();

  private constructor() {
    this.load().then(() => {
      logger.info('启动');
    });
  }

  public static getConfig() {
    if (!this.instance) {
      this.instance = new Config();
    }
    return this.instance;
  }

  public getConfigCount(): number {
    return this.configMap.size;
  }

  public toJSON(): string {
    const obj = Object.create(null);
    this.configMap.forEach((v, k) => {
      obj[k] = v;
    });
    return JSON.stringify(obj);
  }

  public async load() {
    let parsed: dotenv.DotenvParseOutput = {};
    logger.info(process.env.VERCEL_PROJECT_ID);
    logger.info(process.env.VERCEL_TOKEN);
    logger.info(process.env.VERCEL);
    if (
      process.env.VERCEL_PROJECT_ID
      && process.env.VERCEL_TOKEN
      && process.env.VERCEL
    ) {
      // 在 vercel 部署. 通过 vercel api 读取环境变量. 主要是因为直接 process.env 不会更新
      // 更改配置是变快了, 但是如果很少更改的话, 可能比直接读 process.env 的体验要差
      // 不过我看其他几个项目有用外置数据库存储配置的, 那样可能更慢
      logger.info('vercel 环境');
      const configs = await new Vercel({
        // 这里从 process.env 读取是因为 config 是依赖 vercel api 的, 不能由 vercel api 依赖 config
        // 也就是说项目至少需要重新部署一次, load 才能正确运行(读到 token 和 projectId)
        vercelToken: process.env.VERCEL_TOKEN,
        vercelProjectId: process.env.VERCEL_PROJECT_ID,
      }).getEnvironments();

      if (configs) {
        parsed = dotenv.parse(configs);
      }
    } else {
      // 在服务器部署
      // 存在 .env 文件
      logger.info('服务器环境');
      const dotenvConfigOutput = dotenv.config({ override: true });
      if (dotenvConfigOutput.parsed) {
        parsed = dotenvConfigOutput.parsed;
      }
    }
    if (parsed) {
      Object.keys(parsed).forEach((key) => {
        this.configMap.set(key, parsed[key]);
      });
    }

    this.connect()
      .then(() => {
        logger.info(`Connected to DB ${this.configMap.get('DB_CONN_STRING')}`);
      })
      .catch(() => {
        logger.error(
          `Cannot connected to DB ${this.configMap.get('DB_CONN_STRING')}`
        );
      });
  }

  public async connect() {
    try {
      await mongoose.disconnect();
    } catch (e) {
      logger.error(e);
    }
    const dbUri = this.configMap.get('DB_CONN_STRING') as string;
    // 或者
    // return mongoose
    //   .connect(dbUri)
    //   .then(() => {
    //     console.log(`Connected to DB ${dbUri}`);
    //   })
    //   .catch((error) => {
    //     console.log(`Could not connect to DB ${dbUri} ${error}`);
    //     process.exit(1);
    //   });

    await mongoose.connect(dbUri);
  }

  public get(key: string) {
    return this.configMap.get(key);
  }
}
