import { Inject } from 'typescript-ioc';
import { NextFunction, Response } from 'express';
import ajv from '../config/ajv';
import {
  jsonPostSchema,
  UserBookProp,
} from '../model/UserBook';
import {
  Controller,
  CRequest,
  Get,
  IController,
  Post,
} from './IController';
import UserBookService from '../service/UserBookService';
import { authenticateAccessToken, queryParseFilter } from '../api/middleware';

@Controller('/user-books')
export default class UserBookController implements IController {
  @Inject
  public userBookService!: UserBookService;

  constructor(public postValidator = ajv.compile(jsonPostSchema)) {
  }

  @Get('/', [authenticateAccessToken, queryParseFilter])
  public async find(req: CRequest, res: Response, next: NextFunction) {
    try {
      const results = await this.userBookService.find(req.query);

      return res.send({ data: results });
    } catch (e) {
      return next(e);
    }
  }

  @Post('/', [authenticateAccessToken])
  public async post(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.postValidator(req.body)) {
        const result = await this.userBookService.create(req.body as UserBookProp);

        return res.send({ data: result });
      }

      return res.status(400).send(this.postValidator.errors);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/count', [authenticateAccessToken, queryParseFilter])
  public async count(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userBookService.count(req.query.filter);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }
}
