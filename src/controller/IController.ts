import { RequestHandler } from 'express-serve-static-core';
import { Request } from 'express';
import 'reflect-metadata';

export const Controller = (prefix: string = ''): ClassDecorator => (target: Function) => {
  Reflect.defineMetadata('prefix', prefix, target);
};

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

export interface RouteDefinition {
  path: string;
  requestMethod: RequestMethod;
  methodName: string | symbol;
  middlewares?: Array<TReqHandler>;
}

type ParamApplyRouteDecorator = {
  method: RequestMethod, path: string, target: Object,
  propertyKey: string | symbol, middlewares: Array<TReqHandler>,
};

// target equal our class, propertyKey was our method name
function applyRouteDecorator(param: ParamApplyRouteDecorator) {
  // In case this is the first route to be registered
  // the `routes` metadata is likely to be undefined at this point.
  // To prevent any further validation simply set it to an empty array here.
  if (!Reflect.hasMetadata('routes', param.target.constructor)) {
    Reflect.defineMetadata('routes', [], param.target.constructor);
  }

  // Get the routes stored so far, extend it by the new route and re-set the metadata.
  const routes = Reflect.getMetadata('routes', param.target.constructor) as Array<RouteDefinition>;

  routes.push({
    requestMethod: param.method,
    path: param.path,
    methodName: param.propertyKey,
    middlewares: param.middlewares,
  });

  Reflect.defineMetadata('routes', routes, param.target.constructor);
}

export const Get = (path: string = '', middlewares: Array<TReqHandler> = []): MethodDecorator => (target, propertyKey: string | symbol): void => applyRouteDecorator({
  method: 'get',
  path,
  target,
  propertyKey,
  middlewares,
});

export const Post = (path: string = '', middlewares: Array<TReqHandler> = []): MethodDecorator => (target, propertyKey: string | symbol): void => applyRouteDecorator({
  method: 'post',
  path,
  target,
  propertyKey,
  middlewares,
});

export const Put = (path: string = '', middlewares: Array<TReqHandler> = []): MethodDecorator => (target, propertyKey: string | symbol): void => applyRouteDecorator({
  method: 'put',
  path,
  target,
  propertyKey,
  middlewares,
});

export type ReqBody = {
  [key: string]: any
};

export type ReqQuery = {
  offset?: number,
  limit?: number,
  filter?: any,
  sort?: any,
};

export interface CParamsDictionary {
  [key: string]: string | number;
}

export type CRequest = Request<CParamsDictionary, any, ReqBody, ReqQuery, any>;

export type TReqHandler = RequestHandler<CParamsDictionary, any, ReqBody, ReqQuery, any>;

export interface IController {
  find?: TReqHandler;
  findById?: TReqHandler;
  post?: TReqHandler;
  put?: TReqHandler;
  delete?: TReqHandler;
  count?: TReqHandler;
}
