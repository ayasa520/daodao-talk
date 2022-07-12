import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

import logger from '../utils/logger';

/**
 * 单例配置类
 */
export class Config {
  private static instance: Config;

  // 这个存储着实际的配置项, 但是是在内存里, 对它的修改不是稳妥的. 采用修改 .env 然后让这个重新读取
  // 如果是部署在 severless 上, 由于无状态, 环境变量始终读的是最新的, 所以只更改环境变量就能改变 auth
  // 中间件, 也不需要 override. 而如果部署在服务器, 好像只能重启
  private configMap: Map<string, string | boolean | number> = new Map<
    string,
    string | boolean | number
  >();

  private options: {
    debug: boolean;
    override: boolean;
    dotenvPath: string;
    encoding: string;
  } = {
    debug: false,
    override: false,
    dotenvPath: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
  };

  private constructor(options?: {
    dotenvPath?: string;
    debug?: boolean;
    override?: boolean;
    encoding?: string;
  }) {
    logger.info(options);

    // const debug = Boolean(options && options.debug);
    // const override = Boolean(options && options.override);

    this.load();
  }

  public static getConfig(options?: {
    dotenvPath?: string;
    debug?: boolean;
    override?: boolean;
    encoding?: string;
  }) {
    if (!this.instance) {
      this.instance = new Config(options);
    }
    const options1 = this.instance.options;
    if (options) {
      if (options.debug !== undefined) {
        options1.debug = options.debug;
      }

      if (options.override !== undefined) {
        options1.override = options.override;
      }

      if (options.dotenvPath !== undefined) {
        options1.dotenvPath = Config.resolveHome(options.dotenvPath);
      }

      if (options.encoding !== undefined) {
        options1.encoding = options.encoding;
      }
    }
    return this.instance;
  }

  private static resolveHome(envPath: string) {
    return envPath[0] === '~'
      ? path.join(os.homedir(), envPath.slice(1))
      : envPath;
  }

  public load() {
    try {
      const parsed = dotenv.parse(
        fs.readFileSync(this.options.dotenvPath, {
          encoding: this.options.encoding as BufferEncoding,
        })
      );

      Object.keys(parsed).forEach((key) => {
        if (!this.configMap.has(key)) {
          this.configMap.set(key, parsed[key]);
        } else {
          if (this.options.override) {
            this.configMap.set(key, parsed[key]);
          }

          if (this.options.debug) {
            if (this.options.override) {
              logger.info(
                `"${key}" is already defined in \`process.env\` and WAS overwritten`
              );
            } else {
              logger.info(
                `"${key}" is already defined in \`process.env\` and was NOT overwritten`
              );
            }
          }
        }
      });
    } catch (e: any) {
      if (this.options.debug) {
        logger.info(`Failed to load ${this.options.dotenvPath} ${e.message}`);
      }
    }
  }

  public get(key: string) {
    logger.info(this.options);
    this.load();
    return this.configMap.get(key);
  }
}
