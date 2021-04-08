import { Inject } from 'typescript-ioc';
import { NextFunction, Response } from 'express';
import ajv from '../config/ajv';
import { jsonPayFineSchema, UserPayFineProps } from '../model/UserFineHistory';
import {
  Controller,
  CRequest,
  Get,
  IController,
  Put,
} from './IController';
import UserFineHistoryService from '../service/UserFineHistoryService';
import {
  authenticateAccessToken,
  authenticateAdmin,
  queryParseFilter,
  validateParamsProp,
} from '../api/middleware';

@Controller('/user-fine-histories')
export default class UserFineHistoryController implements IController {
  @Inject
  public userBookService!: UserFineHistoryService;

  constructor(public payFineSchema = ajv.compile(jsonPayFineSchema)) {
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

  @Put('/pay/:userId', [authenticateAccessToken, authenticateAdmin, validateParamsProp('userId', 'number')])
  public async payBookFine(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.payFineSchema(req.body)) {
        const userId = req.params.userId as number;
        const body = req.body as UserPayFineProps;

        await this.userBookService.payBookFine(userId as number, body);

        return res.send({ message: 'The fine has already been paid' });
      }

      return res.status(400).send({ message: 'Payload are invalid or its empty' });
    } catch (e) {
      return next(e);
    }
  }
}
