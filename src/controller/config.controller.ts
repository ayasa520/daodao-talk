import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  Controller,
  controller,
  httpGet,
  httpPost,
  request, response
} from 'inversify-express-utils';

import { Config } from '@/config/config';
import { CreateConfigInput } from '@/schema/config.shema';
import { auth } from '@/middleware/auth';
import CONFIGS from '@/constants/CONFIGS';
import { validateSchemaSym as validateSchema } from '@/middleware/validate';
import SCHEMAS from '@/constants/SCHEMAS';
import TYPES from '@/constants/TYPES';
import { ConfigService } from '@/service/ConfigService';

@controller('/api/config')
export class ConfigController implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.Configurer) private configurer: Config,
    @inject(TYPES.ConfigService) private configService: ConfigService
  ) {}

  @httpGet('/', auth(CONFIGS.admin))
  public async getConfigHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    if (!this.configurer.check()) {
      // 没有配置好
      return res.status(500).send('配置未完成');
      // 前端跳配置页
    }
    return res.send(this.configurer.toJSON());
  }

  @httpPost('/', validateSchema(SCHEMAS.createConfigSchema))
  public async createConfigController(
    @request() req: Request<unknown, unknown, CreateConfigInput['body']>,
    @response() res: Response
  ) {
    if (this.configurer.check()) {
      return res.send('已经配置完毕, 无需重新配置');
    }
    try {
      await this.configService.createConfig(req.body);
      return res.send('已经配置完毕');
    } catch (e) {
      return res.status(500).send(e);
    }
  }
}
