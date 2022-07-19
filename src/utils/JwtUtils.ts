import jwt from 'jsonwebtoken';
import { inject, injectable } from 'inversify';

import TYPES from '@/constants/TYPES';
import { Config } from '@/config/Config';

// import dotenv from 'dotenv';

// dotenv.config();

// const privateKey = (process.env.PRIVATE_KEY as string).replaceAll('\\n', '\n');
// const publicKey = (process.env.PUBLIC_KEY as string).replaceAll('\\n', '\n');

// const secret = process.env.SECRET as string;

@injectable()
export class JwtUtils {
  // eslint-disable-next-line no-useless-constructor
  public constructor(@inject(TYPES.Configurer) private configurer: Config) {}

  public signJwt(object: any, options?: jwt.SignOptions | undefined) {
    const secret = this.configurer.get('SECRET') as string;
    return jwt.sign(object, secret, {
      ...(options && options), // ... 的作用是将一个数组变成一个逗号分割的参数数列
    });
  }

  public verifyJwt(token: string) {
    const secret = this.configurer.get('SECRET') as string;
    try {
      const decoded = jwt.verify(token, secret);
      return { valid: true, expired: false, decoded };
    } catch (e: any) {
      return {
        valid: false,
        expired: e.message === 'jwt expired',
        decoded: null,
      };
    }
  }
}
