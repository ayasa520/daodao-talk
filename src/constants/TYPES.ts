// Java 中可不要自己再给抽象做标签... 真麻烦, 手动绑定也就算了
const TYPES = {
  // 配置器的抽象类型
  Configurer: Symbol.for('Configurer'),
  Vercel: Symbol.for('Vercel'),
  DbClient: Symbol.for('DbClient'),
  PostRepository: Symbol.for('PostRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  ConfigService: Symbol.for('ConfigService'),
  SessionService: Symbol.for('SessionService'),
  UserService: Symbol.for('UserService'),
  PostService: Symbol.for('PostService'),
  DeserializeUser: Symbol.for('DeserializeUser'),
  JwtUtils: Symbol.for('JwtUtils'),
  ConfigController: Symbol.for('ConfigController'),
  SessionController: Symbol.for('SessionController'),
  HealthCheckController: Symbol.for('HealthCheckController'),
  PostController: Symbol.for('PostController'),
  UserController: Symbol.for('UserController'),
  Controller: Symbol.for('Controller'),
  ReloadEveryReq: Symbol.for('ReloadEveryReq')
};
export default TYPES;
