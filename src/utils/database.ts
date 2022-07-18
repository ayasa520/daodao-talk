import mongoose, { Connection } from 'mongoose';
import { injectable } from 'inversify';

import logger from '@/utils/logger';

export interface DataBaseConnection {
  connect(dbUri: string): Promise<void>;
  getConnection(): Connection;
}

@injectable()
export class MongoDBConnection implements DataBaseConnection {
  private connection: Connection;

  public getConnection() {
    return this.connection;
  }

  public async connect(dbUri: string): Promise<void> {
    try {
      await mongoose.connect(dbUri);
      this.connection = mongoose.connection;
      logger.info(`连接至数据库${dbUri}`);
    } catch (e) {
      logger.info(`无法连接至数据库${dbUri}`);
    }
  }
}
