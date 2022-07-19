import {
  Controller,
  controller,
  httpGet,
  request,
  response,
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';

import TYPES from '@/constants/TYPES';
import { Config } from '@/config/Config';

@controller('/healthcheck')
export class HealthCheck implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(@inject(TYPES.Configurer) private configurer: Config) {}

  @httpGet('/')
  public async getConfigHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    if (!this.configurer.check()) {
      // 没有配置好
      return res.status(500).send('配置未完成');
      // 前端跳配置页
    }
    return res.send('配置已完成');
  }
}
