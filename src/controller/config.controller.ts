import { Request, Response } from 'express';

import { Config } from '@/config/config';
import { CreateConfigInput } from '@/schema/config.shema';
import { createConfig } from '@/service/config.service';
import logger from '@/utils/logger';

const config = Config.getConfig();

export async function getConfigHandler(req: Request, res: Response) {
  if (config.getConfigCount() === 0) {
    // 没有配置好
    return res.status(500).send('配置未完成');
    // 前端跳配置页
  }
  return res.send(config.toJSON());
}

export async function createConfigController(
  req: Request<unknown, unknown, CreateConfigInput['body']>,
  res: Response
) {
  if (config.getConfigCount() !== 0) {
    return res.send('已经配置完毕, 无需重新配置');
  }
  try {
    logger.info(req.body);
    await createConfig(req.body);
    return res.send('已经配置完毕');
  } catch (e) {
    return res.status(500).send(e);
  }
}
