import { NextFunction, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import randToken from 'rand-token';
import { CRequest, RouteDefinition } from '../controller/IController';
import { UserProp } from '../model/User';

export function generateAccessToken(user: UserProp) {
  return jwt.sign(user, (process.env.JWT_SECRET as string), { expiresIn: '30m' });
}

export function generateRefreshToken() {
  return randToken.uid(256);
}

export function applyRouter(Controller: any, instance: { [key: string]: any }): Router {
  const router = Router();

  // prefix from decorated controller class
  const prefix = Reflect.getMetadata('prefix', Controller);

  // our `routes` from this controller
  const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', Controller);

  routes.forEach((route) => {
    const routeName = prefix + route.path;

    router[route.requestMethod](routeName, ...route.middlewares || [],
      (req: CRequest, res: Response, next: NextFunction) => {
        const { methodName } = route;

        if (typeof instance[methodName as string] === 'function') {
          instance[methodName as string](req, res, next);
        }
      });
  });

  return router;
}
