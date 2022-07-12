import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
import { Config } from '@/config/config';

const config = Config.getConfig();

// dotenv.config();

// const privateKey = (process.env.PRIVATE_KEY as string).replaceAll('\\n', '\n');
// const publicKey = (process.env.PUBLIC_KEY as string).replaceAll('\\n', '\n');

// const secret = process.env.SECRET as string;
const secret = config.get('SECRET') as string;
export function signJwt(object: any, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, secret, {
    ...(options && options), // ... 的作用是将一个数组变成一个逗号分割的参数数列
  });
}

export function verifyJwt(token: string) {
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
