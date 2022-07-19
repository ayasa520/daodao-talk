import { injectable, unmanaged } from 'inversify';
import mongoose, {
  PopulatedDoc,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

import { Query, Repository, UpdateResult } from '@/dao/Repositories';
import { get } from 'lodash';

/**
 * 包装 mongoose 的目的只有一个: 将 service 与数据库操作解耦, 之后换其他的驱动或者腾讯云开发数据库都能容易地扩展
 */
@injectable()
export class GenericRepository<TEntity> implements Repository<TEntity> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(@unmanaged() protected Model: mongoose.Model<TEntity>) {}

  public async findOne(query: Query<TEntity>) {
    return this.Model.findOne(query);
  }

  // We wrap the mongoose API here, so we can use async / await
  public async findAll(): Promise<TEntity[] | PopulatedDoc<TEntity>> {
    return this.Model.find({});
  }

  public async findById(id: string) {
    return this.Model.findById(id);
  }

  public async save(doc: TEntity): Promise<TEntity> {
    const newEntity = await this.Model.create(doc);
    return get(newEntity, '_doc');
  }

  public async findManyById(ids: string[]) {
    const query = { _id: { $in: ids } };
    return this.Model.find(query);
  }

  public async findManyByQuery(query: Query<TEntity>) {
    return this.Model.find(query);
  }

  public async updateOne(
    filter?: Query<TEntity>,
    update?: UpdateQuery<TEntity> | UpdateWithAggregationPipeline
  ): Promise<UpdateResult> {
    return this.Model.updateOne(filter, update);
  }
}
