import { Request } from 'express';

export interface RawRequest extends Request {
  rawBody: Buffer;
}
