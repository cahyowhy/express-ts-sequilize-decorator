import jwt from 'jsonwebtoken';
import { Response } from 'express';
// eslint-disable-next-line import/no-cycle
import {
  CRequest,
  TReqHandler,
} from '../../controller/IController';
import logger from '../../config/logger';
import Constant from '../../constant';

export const errorHandler = (err: any, _req: any, res: any, next: Function) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error((err && err.name) || err.toString());
  return res.status(500).send({ success: false, data: err && err.stack });
};

export const queryParseFilter: TReqHandler = (req: CRequest, res: Response, next) => {
  const hasFilter = req.query && req.query.filter && typeof req.query.filter === 'string';

  if (hasFilter) {
    try {
      const val = JSON.parse(req.query.filter);
      req.query.filter = val;
    } catch (e) {
      logger.log({ level: 'error', message: e.toString() });

      return res.status(500).send({
        message: 'Parse filter failed',
      });
    }
  } else {
    req.query.filter = {};
  }

  req.query.limit = parseInt(req.query.limit as any, 10) || Constant.DEFAULT_LIMIT;
  req.query.offset = parseInt(req.query.offset as any, 10) || 0;

  return next();
};

export const authenticateAccessToken: TReqHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const promiseJwt = new Promise((resolve, reject) => {
      jwt.verify(token, (process.env.JWT_SECRET as string), (err, user) => {
        if (err) reject(err);

        resolve(user);
      });
    });

    try {
      (req as any).user = await promiseJwt;

      return next();
    } catch (e) {
      logger.log({ level: 'error', message: e.toString() });
      return res.status(403).send({ success: false, message: 'Failed verify access token' });
    }
  }

  return res.status(401).send({ success: false, message: 'Unauthorize' });
};
