import { Response } from 'express';
import {
  Controller,
  controller,
  httpPost,
  requestBody,
  response,
} from 'inversify-express-utils';
import { inject } from 'inversify';

import logger from '@/utils/logger';
import { validateSchemaSym as validateSchema } from '@/middleware/validate';
import SCHEMAS from '@/constants/SCHEMAS';
import TYPES from '@/constants/TYPES';
import { UserService } from '@/service/UserService';
import { NewUser } from '@/models/User';

@controller('/api/users')
export class UserController implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  @httpPost('/', validateSchema(SCHEMAS.createUserSchema))
  public async createUserHandler(
    @requestBody() newUser: NewUser,
    @response() res: Response
  ) {
    try {
      const user = await this.userService.createUser(newUser);
      logger.info(user);
      return res.send(user);
    } catch (error: any) {
      logger.error(error);
      return res.status(409).send(error.message);
    }
  }
}
