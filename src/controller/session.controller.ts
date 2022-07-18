/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { Request, Response } from 'express';
import {
  Controller,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { inject } from 'inversify';

import logger from '@/utils/logger';
import { Config } from '@/config/config';
import { SessionService } from '@/service/SessionService';
import TYPES from '@/constants/TYPES';
import { validateSchemaSym as validateSchema } from '@/middleware/validate';
import SCHEMAS from '@/constants/SCHEMAS';
import { UserService } from '@/service/UserService';
import { auth } from '@/middleware/auth';
import { JwtUtils } from '@/utils/jwt.utils';

@controller('/api/sessions')
export class SessionController implements Controller {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.SessionService) private sessionService: SessionService,
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.Configurer) private configurer: Config,
    @inject(TYPES.JwtUtils) private jwtUtils: JwtUtils
  ) {}

  @httpPost('/', validateSchema(SCHEMAS.createSessionSchema))
  public async createSessionHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    // Validate the user's password
    const user = await this.userService.validatePassword(req.body);
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    // create a session
    const { _id } = user;
    const session = await this.sessionService.createSession(
      _id.toString(),
      req.get('user-agent') || ''
    );
    // create access token

    /** accessToken 有效期短, refreshToken 有效期长, session 记录该用户会话是否有效
     * 若 accessToken 过期, 检查 refreshToken 以及该用户 session 是否有效, 若有效, 返回新的 accessToken
     */
    const accessToken = this.jwtUtils.signJwt(
      {
        uid: user._id,
        sid: session._id,
        admin: user.admin,
      },
      // { expiresIn: process.env.ACCESS_TOKEN_TTL }
      { expiresIn: this.configurer.get('ACCESS_TOKEN_TTL') as string }
    );
    // create a refresh token

    const refreshToken = this.jwtUtils.signJwt(
      {
        uid: user._id,
        sid: session._id,
        admin: user.admin,
      },
      // { expiresIn: process.env.REFRESH_TOKEN_TTL }
      { expiresIn: this.configurer.get('REFRESH_TOKEN_TTL') as string }
    );

    // return access & refresh token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      signed: true,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      signed: true,
    });

    return res.sendStatus(200);
  }

  @httpGet('/', auth())
  public async getSessionHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    logger.info(`a ${res.locals.user}`);
    const userId = res.locals.user.uid;

    const sessions = await this.sessionService.findSessions({
      user: userId,
      valid: true,
    });

    return res.send(sessions);
  }

  @httpDelete('/', auth())
  public async deleteSessionHandler(
    @request() req: Request,
    @response() res: Response
  ) {
    const sessionId = res.locals.user.sid;
    const updateResult = await this.sessionService.updateSession(
      { _id: sessionId },
      { valid: false }
    );
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.send(updateResult);
  }
}
