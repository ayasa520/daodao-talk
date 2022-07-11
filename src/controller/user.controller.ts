import { Request, Response } from 'express';

import logger from '@/utils/logger';
import createUser from '@/service/user.service';
import { CreateUserInput } from '@/schema/user.schema';
import { User } from '@/models/user.model';

// 即 不分模块写的时候 router.get/post 参数中的回调函数
export async function createUserHandler(
  req: Request<unknown, unknown, CreateUserInput['body']>,
  res: Response
) {
  try {
    const user = await createUser(req.body as User);
    return res.send(user);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}
