import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from '@/utils/logger';

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
    this.load();
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

  public load() {
    // 如果存在 .enva, 会读入 process.env. 否则应手动设置环境变量

    if (process.env.VERCEL_TOKEN) {
      // 在 vercel 部署. 通过 vercel api 读取环境变量. 主要是因为直接 process.env 不会更新
    } else {
      const dotenvConfigOutput = dotenv.config({ override: true });
      // 在服务器部署
      if (dotenvConfigOutput.parsed) {
        // 存在 .enva 文件
        Object.keys(dotenvConfigOutput.parsed).forEach((key) => {
          // logger.info(`${key} ${process.env[key]}`);
          this.configMap.set(key, process.env[key]);
        });
      }

      this.connect()
        .then(() => {
          logger.info(
            `Connected to DB ${this.configMap.get('DB_CONN_STRING')}`
          );
        })
        .catch(() => {
          logger.info(
            `Cannot connected to DB ${this.configMap.get('DB_CONN_STRING')}`
          );
        });
    }
  }

  public async connect() {
    try {
      await mongoose.disconnect();
    } catch (e) {
      logger.info(e);
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
