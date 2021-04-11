import { Inject } from 'typescript-ioc';
import { NextFunction, Response } from 'express';
import ajv from '../config/ajv';
import {
  jsonBorrowReturnSchema,
  jsonPostSchema,
} from '../model/UserBook';
import {
  Controller,
  CRequest,
  Get,
  IController,
  Post,
  Put,
} from './IController';
import UserBookService from '../service/UserBookService';
import {
  authenticateAccessToken,
  authenticateAdmin,
  queryParseFilter,
  validateParamsProp,
} from '../api/middleware';

@Controller('/user-books')
export default class UserBookController implements IController {
  @Inject
  public userBookService!: UserBookService;

  constructor(public postValidator = ajv.compile(jsonPostSchema),
    public borrowReturnValidator = ajv.compile(jsonBorrowReturnSchema)) {
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

  @Post('/borrows/:userId', [authenticateAccessToken, authenticateAdmin, validateParamsProp('userId', 'number')])
  public async borrowBook(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.borrowReturnValidator(req.body)) {
        const results = await this.userBookService.borrowBooks(req.params.userId, req.body.books);

        if (Array.isArray(results) && results.length) {
          return res.send({ data: results.map((result) => result.get({ plain: true })) });
        }

        return res.status(400).send({ message: results });
      }

      return res.status(400).send({ data: this.borrowReturnValidator.errors, message: 'Payload are invalid or its empty' });
    } catch (e) {
      return next(e);
    }
  }

  @Put('/returns/:userId', [authenticateAccessToken, authenticateAdmin, validateParamsProp('userId', 'number')])
  public async returnBook(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.borrowReturnValidator(req.body)) {
        const result = await this.userBookService.returnBooks(req.params.userId, req.body.books);

        if (result) {
          return res.send(result);
        }

        return res.status(500).send({ message: 'Error happen ! contact Administrator' });
      }

      return res.status(400).send({ data: this.borrowReturnValidator.errors, message: 'Payload should not empty' });
    } catch (e) {
      return next(e);
    }
  }

  @Get('/paging/count', [authenticateAccessToken, queryParseFilter])
  public async count(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userBookService.count(req.query);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }
}
