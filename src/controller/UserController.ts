import { NextFunction, Response } from 'express';
import ajv from '../config/ajv';
import logger from '../config/logger';
import {
  jsonPostSchema,
  jsonUpdateSchema,
  jsonLoginSchema,
  UserProp,
} from '../model/User';
import {
  Controller,
  CRequest,
  Get,
  IController,
  Post,
  Put,
} from './IController';
import UserService from '../service/UserService';
import { authenticateAccessToken, queryParseFilter } from '../middleware';

@Controller('/users')
export default class UserController implements IController {
  constructor(public userService: UserService,
    public postValidator = ajv.compile(jsonPostSchema),
    public updateValidator = ajv.compile(jsonUpdateSchema),
    public loginValidator = ajv.compile(jsonLoginSchema)) {
  }

  @Get('/', [authenticateAccessToken, queryParseFilter])
  public async find(req: CRequest, res: Response, next: NextFunction) {
    try {
      const results = await this.userService.find(req.query);

      return res.send({ data: results });
    } catch (e) {
      return next(e);
    }
  }

  @Get('/:id', [authenticateAccessToken])
  public async findById(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.findById(req.params.id);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }

  @Post('/')
  public async post(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.postValidator(req.body)) {
        const result = await this.userService.create(req.body as UserProp);

        return res.send({ data: result });
      }

      return res.status(400).send(this.postValidator.errors);
    } catch (e) {
      return next(e);
    }
  }

  @Put('/:id', [authenticateAccessToken])
  public async put(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.updateValidator(req.body)) {
        const result = await this.userService.update(req.params.id, req.body as UserProp);

        return res.send({ data: result });
      }

      return res.status(400).send(this.updateValidator.errors);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/count', [authenticateAccessToken, queryParseFilter])
  public async count(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.count(req.query.filter);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }

  @Post('/auth/login')
  public async login(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (this.loginValidator(req.body)) {
        const result = await this.userService.login(req.body as UserProp);

        if (result) {
          await this.setRefreshToken(res, result.username);

          return res.send({ data: result });
        }

        return res.status(401).send({ message: 'Cannot find username or email' });
      }

      return res.status(400).send(this.loginValidator.errors);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/auth/session')
  public async session(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.findUserSession(req.cookies.refresh_token);

      if (result) return res.send({ data: result });

      return res.status(401).send({ message: 'Unauthorize' });
    } catch (e) {
      return next(e);
    }
  }

  @Get('/auth/logout', [authenticateAccessToken])
  public async logout(req: CRequest, res: Response, next: NextFunction) {
    try {
      res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: true,
        expires: new Date(),
      });

      await this.userService.removeUserSession(req.cookies.refresh_token);

      return res.send({ message: 'logged out' });
    } catch (e) {
      return next(e);
    }
  }

  private async setRefreshToken(res: Response, username: string) {
    try {
      const result = await (await this.userService.saveUserSession(username)).get({ plain: true });
      const cookieOption = {
        httpOnly: true,
        expires: result.expired,
        secure: true,
      };

      res.cookie('refresh_token', result.refreshToken, cookieOption);
    } catch (e) {
      logger.error(e);
    }
  }

  @Get('/user-books/:id', [authenticateAccessToken])
  public async findUserBorowedBook(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.findUserBorrowedBook(req.params.id);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }
}
