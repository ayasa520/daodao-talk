import { interfaces } from 'inversify';

export function registerController<T>(
  bind: interfaces.Bind,
  constructor: interfaces.Newable<T>,
  tag: symbol
) {
  bind<T>(tag).to(constructor);
}
