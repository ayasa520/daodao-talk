import dotenv from 'dotenv';
import logger from '@/utils/logger';

/**
 * 单例配置类
 */
export class Config {
  private static instance: Config;

  // 这个存储着实际的配置项, 但是是在内存里, 对它的修改不是稳妥的. 采用修改 .env 然后让这个重新读取
  // 如果是部署在 severless 上, 由于无状态, 环境变量始终读的是最新的, 所以只更改环境变量就能改变 auth
  // 中间件, 也不需要 override. 而如果部署在服务器, 好像只能重启
  private configMap: Map<string, string | undefined> = new Map<
    string,
    string | undefined
  >();

  private constructor() {
    dotenv.config({ override: true });
  }

  public static getConfig() {
    if (!this.instance) {
      this.instance = new Config();
    }
    return this.instance;
  }

  public load() {
    // 如果存在 .env, 会读入 process.env. 否则应手动设置环境变量
    const dotenvConfigOutput = dotenv.config({ override: true });

    Object.keys(dotenvConfigOutput.parsed || process.env).forEach((key) => {
      this.configMap.set(key, process.env[key]);
    });
  }

  public get(key: string) {
    this.load();
    return this.configMap.get(key);
  }
}
