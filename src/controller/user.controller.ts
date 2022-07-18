import { Request, Response } from 'express';
import {
  Controller,
  controller,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { inject } from 'inversify';

import logger from '@/utils/logger';
import { CreateUserInput } from '@/schema/user.schema';
import { validateSchemaSym as validateSchema } from '@/middleware/validate';
import SCHEMAS from '@/constants/SCHEMAS';
import TYPES from '@/constants/TYPES';
import { UserService } from '@/service/UserService';

@controller('/api/users')
export class UserController implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  @httpPost('/', validateSchema(SCHEMAS.createUserSchema))
  public async createUserHandler(
    @request() req: Request<unknown, unknown, CreateUserInput['body']>,
    @response() res: Response
  ) {
    try {
      const user = await this.userService.createUser(req.body);
      return res.send(user);
    } catch (error) {
      logger.error(error);
      return res.status(409).send(error);
    }
  }
}
