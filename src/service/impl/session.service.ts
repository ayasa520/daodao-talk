/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { FilterQuery, UpdateQuery } from 'mongoose';
import { get } from 'lodash';
import { inject, injectable } from 'inversify';

import { User } from '@/models/user.model';
import logger from '@/utils/logger';
import TYPES from '@/constants/TYPES';
import { SessionRepository, UserRepository } from '@/dao/repositories';
import { SessionService as SessionServiceInterface } from '@/service/SessionService';
import { Session } from '@/models/session.model';
import { Config } from '@/config/config';
import { JwtUtils } from '@/utils/jwt.utils';

@injectable()
export class SessionService implements SessionServiceInterface {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @inject(TYPES.SessionRepository)
    private sessionRepository: SessionRepository,
    @inject(TYPES.UserRepository)
    private userRepository: UserRepository,
    @inject(TYPES.Configurer)
    private configurer: Config,

    @inject(TYPES.JwtUtils) private jwtUtils: JwtUtils
  ) {}

  public async createSession(userId: string, userAgent: string) {
    return this.sessionRepository.save({
      user: userId,
      userAgent,
    });
  }

  public async findSessions(query: FilterQuery<Session>) {
    return this.sessionRepository.findManyByQuery(query);
  }

  public async updateSession(
    query: FilterQuery<Session>,
    update: UpdateQuery<Session>
  ) {
    return this.sessionRepository.updateOne(query, update);
  }

  public async refreshAccessToken(
    refreshToken: string
  ): Promise<string | undefined> {
    const { valid, decoded } = this.jwtUtils.verifyJwt(refreshToken);
    const sessionId = get(decoded, 'sid');
    // refreshToken 无效(包括过期) 或者没有包含对应的 session id
    if (!valid || !sessionId) {
      logger.info('undefined');
      return undefined;
    }

    const session: Session | null = await this.sessionRepository.findById(
      sessionId
    );
    logger.info(`session ${session}`);
    // session 可能不存在, 或者被标记为无效
    if (!session || !session.valid) {
      logger.info('undefined1');
      return undefined;
    }

    // 感觉好像没必要
    const user: User | null = await this.userRepository.findById(
      session.user.toString()
    );
    if (!user) {
      logger.info('user undefined');
      return undefined;
    }

    return this.jwtUtils.signJwt(
      {
        uid: user._id,
        sid: session._id,
        admin: user.admin,
      },
      // { expiresIn: process.env.ACCESS_TOKEN_TTL }
      { expiresIn: this.configurer.get('ACCESS_TOKEN_TTL') as string }
    );
  }
}
