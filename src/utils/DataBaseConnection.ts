import mongoose, { Connection } from 'mongoose';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';

import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { Config } from '@/config/Config';

export interface DataBaseConnection {
  connect(): Promise<void>;
  getConnection(): Connection;
  update(): Promise<void>;
}

@injectable()
export class MongoDBConnection implements DataBaseConnection {
  private connection: Connection;

  private config: Config;

  public constructor(
    @inject(new LazyServiceIdentifer(() => TYPES.Configurer)) config: Config
  ) {
    this.config = config;
  }

  public getConnection() {
    return this.connection;
  }

  public async connect(): Promise<void> {
    const dbUri = this.config.database.uri;
    await mongoose.connect(dbUri);
    this.connection = mongoose.connection;
  }

  public async update() {
    await this.connect();
  }
}
