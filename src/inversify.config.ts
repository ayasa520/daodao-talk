import { Container, ContainerModule } from 'inversify';
import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';

import {
  UserRepository as UserRepositoryInterface,
  PostRepository as PostRepositoryInterface,
  SessionRepository as SessionRepositoryInterface,
} from '@/dao/Repositories';
import { authMiddleware, AuthMiddleware } from '@/middleware/AuthMiddleware';
import validate, { validateSchemaSym } from '@/middleware/validate';
import { createConfigSchema } from '@/schema/ConfigShema';
import { createPostSchema, deletePostSchema } from '@/schema/PostSchema';
import { createSessionSchema } from '@/schema/SessionSchema';
import { createUserSchema } from '@/schema/UserSchema';
import CONFIGS from '@/constants/CONFIGS';
import { Config } from '@/config/Config';
import TYPES from '@/constants/TYPES';
import { VercelConfigurer } from '@/config/VercelConfigurer';
import { ServerConfigurer } from '@/config/SeverConfigurer';
import { VercelAPI } from '@/utils/VercelAPI';
import { CookieParserMiddleware } from '@/middleware/CookieParserMiddleware';
import { CorsMiddleware } from '@/middleware/CorsMiddleware';
import {
  DataBaseConnection,
  MongoDBConnection,
} from '@/utils/DataBaseConnection';
import { UserRepository } from '@/dao/impl/mongoose/impl/UserRepository';
import { SessionRepository } from '@/dao/impl/mongoose/impl/SessionRepository';
import { PostRepository } from '@/dao/impl/mongoose/impl/PostRepository';
import { ConfigService as ConfigServiceInterface } from '@/service/ConfigService';
import { SessionService as SessionServiceInterface } from '@/service/SessionService';
import { UserService as UserServiceInterface } from '@/service/UserService';
import { PostService as PostServiceInterface } from '@/service/PostService';
import { ConfigService } from '@/service/impl/ConfigService';
import { SessionService } from '@/service/impl/SessionService';
import { UserService } from '@/service/impl/UserService';
import { DeserializeUser } from '@/middleware/DeserializeUser';
import { JwtUtils } from '@/utils/JwtUtils';
import { ConfigController } from '@/controller/ConfigController';
import { UserController } from '@/controller/UserController';
import { PostController } from '@/controller/PostController';
import { SessionController } from '@/controller/SessionController';
import { PostService } from '@/service/impl/PostService';
import { registerController } from '@/utils/registerController';
import { VercelMiddleware } from '@/middleware/VercelMiddleware';
import { HealthCheck } from '@/controller/HealthCheck';

// 这真的值得吗? 我不知道. 我只是想在 controller 里面注入中间件, 但是不想用 container 传入 controller

// 这可比 spring 的注入难用多了
export const bindings = new ContainerModule((bind) => {
  // 抽象类型, 标签名, 具体类
  // 这里就不通过 name 来区分了, 因为环境不可能同时存在两个

  if (process.env.DAO_PROJECT_NAME && process.env.DAO_TOKEN) {
    bind<Config>(TYPES.Configurer).to(VercelConfigurer).inSingletonScope();
  } else {
    bind<Config>(TYPES.Configurer).to(ServerConfigurer).inSingletonScope();
  }

  bind<VercelAPI>(TYPES.Vercel).to(VercelAPI).inSingletonScope();
  bind<DataBaseConnection>(TYPES.DbClient)
    .to(MongoDBConnection)
    .inSingletonScope();

  [
    CONFIGS.DELETE_COMMENT_ALLOW,
    CONFIGS.GET_COMMENT_ALLOW,
    CONFIGS.admin,
    CONFIGS.all,
    CONFIGS.user,
  ].forEach((conf) => {
    bind<BaseMiddleware>(conf)
      .toDynamicValue(
        (context) =>
          // logger.info(context.container.get<Config>(TYPES.Configurer).check());
          new AuthMiddleware(
            context.container.get<Config>(TYPES.Configurer),
            conf
          )
      )
      .inRequestScope();
  });

  bind<BaseMiddleware>(TYPES.ReloadEveryReq).toDynamicValue(
    (context) =>
      new VercelMiddleware(context.container.get<Config>(TYPES.Configurer))
  );
  bind<BaseMiddleware>(
    authMiddleware({
      commentConfig: CONFIGS.POST_COMMENT_ALLOW,
      posterConfig: CONFIGS.POST_POSTER_ALLOW,
    })
  ).toDynamicValue(
    (context) =>
      new AuthMiddleware(context.container.get<Config>(TYPES.Configurer), {
        commentConfig: CONFIGS.POST_COMMENT_ALLOW,
        posterConfig: CONFIGS.POST_POSTER_ALLOW,
      })
  );
  bind<CookieParserMiddleware>(CONFIGS.COOKIE_SECRET)
    .toDynamicValue(
      (context) =>
        new CookieParserMiddleware(
          context.container.get<Config>(TYPES.Configurer),
          CONFIGS.COOKIE_SECRET
        )
    )
    .inRequestScope();
  bind<CorsMiddleware>(CONFIGS.ALLOW_DOMAIN)
    .toDynamicValue(
      (context) =>
        new CorsMiddleware(
          context.container.get<Config>(TYPES.Configurer),
          CONFIGS.ALLOW_DOMAIN
        )
    )
    .inRequestScope();
  bind<DeserializeUser>(TYPES.DeserializeUser)
    .to(DeserializeUser)
    .inRequestScope();
  [
    createConfigSchema,
    createPostSchema,
    deletePostSchema,
    createSessionSchema,
    createUserSchema,
  ].forEach((schema) => {
    bind<express.RequestHandler>(validateSchemaSym(schema)).toDynamicValue(() =>
      validate(schema));
  });

  bind<UserRepositoryInterface>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();
  bind<SessionRepositoryInterface>(TYPES.SessionRepository)
    .to(SessionRepository)
    .inSingletonScope();
  bind<PostRepositoryInterface>(TYPES.PostRepository)
    .to(PostRepository)
    .inSingletonScope();
  bind<PostServiceInterface>(TYPES.PostService)
    .to(PostService)
    .inSingletonScope();
  bind<ConfigServiceInterface>(TYPES.ConfigService)
    .to(ConfigService)
    .inSingletonScope();
  bind<SessionServiceInterface>(TYPES.SessionService)
    .to(SessionService)
    .inSingletonScope();
  bind<UserServiceInterface>(TYPES.UserService)
    .to(UserService)
    .inSingletonScope();
  bind<JwtUtils>(TYPES.JwtUtils).to(JwtUtils).inSingletonScope();
  registerController(bind, ConfigController, TYPES.ConfigController);
  registerController(bind, UserController, TYPES.UserController);
  registerController(bind, PostController, TYPES.PostController);
  registerController(bind, SessionController, TYPES.SessionController);
  registerController(bind, HealthCheck, TYPES.HealthCheckController);
});

const container = new Container();
container.load(bindings);

export { container };
