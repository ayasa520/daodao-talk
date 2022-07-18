import {
  boolean, object, string, TypeOf
} from 'zod';

// 对 body 做格式上的检验, 检查字段是否齐全 看起来像 @Validated和@Valid 之类的
export const createUserSchema = object({
  body: object({
    name: string({
      required_error: 'Name is required',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(6, 'Password too short - should be 6 chars minimum'),
    passwordConfirmation: string({
      required_error: 'PasswordConfirmation is required',
    }),
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
    admin: boolean({
      required_error: 'Admin is required',
    }),
  }).refine((data) =>
    data.password === data.passwordConfirmation, {
    message: 'Password do not match',
    path: ['passwordConfirmation'],
  }),
}).describe('createUserSchema');

// Omit 无法直接处理嵌套的类型
type ChangeFields<T, R> = Omit<T, keyof R> & R;

export type CreateUserInput = ChangeFields<
  TypeOf<typeof createUserSchema>,
  {
    body: Omit<TypeOf<typeof createUserSchema>['body'], 'passwordConfirmation'>;
  }
>;
