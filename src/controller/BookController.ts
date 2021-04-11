import { Inject } from 'typescript-ioc';
import { NextFunction, Response } from 'express';
import ajv from '../config/ajv';
import {
  jsonPostSchema,
  BookProp,
  jsonUpdateSchema,
} from '../model/Book';
import {
  Controller,
  CRequest,
  Get,
  IController,
  Post,
  Put,
} from './IController';
import BookService from '../service/BookService';
import { authenticateAccessToken, queryParseFilter, validateParamsProp } from '../api/middleware';

@Controller('/books')
export default class BookController implements IController {
  @Inject
  public bookService!: BookService;

  constructor(public postValidator = ajv.compile(jsonPostSchema),
    public updateValidator = ajv.compile(jsonUpdateSchema)) {
  }

  @Get('/', [authenticateAccessToken, queryParseFilter])
  public async find(req: CRequest, res: Response, next: NextFunction) {
    try {
      const results = await this.bookService.find(req.query);

      return res.send({ data: results });
    } catch (e) {
      return next(e);
    }
  }

  @Get('/:id', [authenticateAccessToken, validateParamsProp('id', 'number')])
  public async findById(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.bookService.findById(req.params.id);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }

  @Post('/', [authenticateAccessToken])
  public async post(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.postValidator(req.body)) {
        const result = await this.bookService.create(req.body as BookProp);

        return res.send({ data: result });
      }

      return res.status(400).send({ data: this.postValidator.errors, message: 'validation error' });
    } catch (e) {
      return next(e);
    }
  }

  @Put('/:id', [authenticateAccessToken, validateParamsProp('id', 'number')])
  public async put(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.updateValidator(req.body)) {
        await this.bookService.update(req.params.id, req.body as BookProp);

        return res.send({ message: 'update succeed' });
      }

      return res.status(400).send({ data: this.updateValidator.errors, message: 'validation error' });
    } catch (e) {
      return next(e);
    }
  }

  @Get('/paging/count', [authenticateAccessToken, queryParseFilter])
  public async count(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.bookService.count(req.query);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }
}
