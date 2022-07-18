import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

import SCHEMAS from '@/constants/SCHEMAS';

export function validateSchemaSym(schema: AnyZodObject | symbol): symbol {
  if (typeof schema === 'symbol') {
    return schema;
  }
  return SCHEMAS[schema.description as keyof typeof SCHEMAS];
}

// 柯里化, 提供一个 schema 返回一个中间件函数
const validateResource = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: unknown) {
      return res.status(400).json(error);
    }
  };

export default validateResource;
