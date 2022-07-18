import { Container, ContainerModule } from 'inversify';
import express from 'express';
import { BaseMiddleware } from 'inversify-express-utils';

import {
  UserRepository as UserRepositoryInterface,
  PostRepository as PostRepositoryInterface,
  SessionRepository as SessionRepositoryInterface,
} from '@/dao/repositories';
import { auth, AuthMiddleware } from '@/middleware/auth';
import validate, { validateSchemaSym } from '@/middleware/validate';
import { createConfigSchema } from '@/schema/config.shema';
import { createPostSchema, deletePostSchema } from '@/schema/post.schema';
import { createSessionSchema } from '@/schema/session.schema';
import { createUserSchema } from '@/schema/user.schema';
import CONFIGS from '@/constants/CONFIGS';
import { Config } from '@/config/config';
import TYPES from '@/constants/TYPES';
import { VercelConfigurer } from '@/config/VercelConfigurer';
import { ServerConfigurer } from '@/config/SeverConfigurer';
import { Vercel } from '@/utils/vercel';
import { CookieParserMiddleware } from '@/middleware/cookieParser';
import { CorsMiddleware } from '@/middleware/cors';
import { DataBaseConnection, MongoDBConnection } from '@/utils/database';
import { UserRepository } from '@/dao/impl/mongoose/impl/UserRepository';
import { SessionRepository } from '@/dao/impl/mongoose/impl/SessionRepository';
import { PostRepository } from '@/dao/impl/mongoose/impl/PostRepository';
import { ConfigService as ConfigServiceInterface } from '@/service/ConfigService';
import { SessionService as SessionServiceInterface } from '@/service/SessionService';
import { UserService as UserServiceInterface } from '@/service/UserService';
import { PostService as PostServiceInterface } from '@/service/PostService';
import { ConfigService } from '@/service/impl/config.service';
import { SessionService } from '@/service/impl/session.service';
import { UserService } from '@/service/impl/user.service';
import { DeserializeUser } from '@/middleware/deserializeUser';
import { JwtUtils } from '@/utils/jwt.utils';
import { ConfigController } from '@/controller/config.controller';
import { UserController } from '@/controller/user.controller';
import { PostController } from '@/controller/post.controller';
import { SessionController } from '@/controller/session.controller';
import { PostService } from '@/service/impl/post.service';
import { registerController } from '@/utils/registerController';
import { VercelMiddleware } from '@/middleware/vercelLoadConfig';

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

  bind<Vercel>(TYPES.Vercel).to(Vercel).inSingletonScope();
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
      .toDynamicValue((context) => {
        // logger.info(context.container.get<Config>(TYPES.Configurer).check());
        return new AuthMiddleware(
          context.container.get<Config>(TYPES.Configurer),
          conf
        );
      })
      .inRequestScope();
  });

  bind<BaseMiddleware>(TYPES.ReloadEveryReq).toDynamicValue(
    (context) =>
      new VercelMiddleware(context.container.get<Config>(TYPES.Configurer))
  );
  bind<BaseMiddleware>(
    auth({
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
      validate(schema)
    );
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
});

const container = new Container();
container.load(bindings);

export { container };
