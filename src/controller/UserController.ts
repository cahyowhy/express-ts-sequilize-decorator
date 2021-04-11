import { Inject } from 'typescript-ioc';
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
import { authenticateAccessToken, queryParseFilter, validateParamsProp } from '../api/middleware';

@Controller('/users')
export default class UserController implements IController {
  @Inject
  public userService!: UserService;

  constructor(public postValidator = ajv.compile(jsonPostSchema),
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

  @Get('/:id', [authenticateAccessToken, validateParamsProp('id', 'number')])
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
        const resultFormated = result.get({ plain: true });

        delete resultFormated.password;

        return res.send({ data: resultFormated });
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
        await this.userService.update(req.params.id, req.body as UserProp);

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
      const result = await this.userService.count(req.query);

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
          await this.setRefreshToken(req, res, result.username);

          return res.send({ data: result });
        }

        return res.status(401).send({ message: 'Cannot find username or email' });
      }

      return res.status(400).send({ data: this.loginValidator.errors, message: 'validation error' });
    } catch (e) {
      return next(e);
    }
  }

  // cannot set cookie if the domain or port was different. its ok thou if subdomain
  @Get('/auth/session')
  public async session(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (req.cookies.refresh_token) {
        const result = await this.userService.findUserSession(req.cookies.refresh_token);

        if (result) return res.send({ data: result });
      }

      return res.status(401).send({ message: 'Unauthorize' });
    } catch (e) {
      return next(e);
    }
  }

  // cannot set cookie if the domain or port was different. its ok thou if subdomain
  @Get('/auth/logout', [authenticateAccessToken])
  public async logout(req: CRequest, res: Response, next: NextFunction) {
    try {
      if (!req.cookies.refresh_token) {
        return res.status(401).send({ message: 'Unauthorize' });
      }

      res.cookie('refresh_token', '', {
        httpOnly: true,
        expires: new Date(),
        secure: true,
        sameSite: false,
      });

      await this.userService.removeUserSession(req.cookies.refresh_token);

      return res.send({ message: 'logged out' });
    } catch (e) {
      return next(e);
    }
  }

  private async setRefreshToken(req: CRequest, res: Response, username: string) {
    try {
      const result = await (await this.userService.saveUserSession(username)).get({ plain: true });
      const cookieOption: any = {
        httpOnly: true,
        expires: result.expired,
        secure: true,
        sameSite: false,
      };

      res.cookie('refresh_token', result.refreshToken, cookieOption);
    } catch (e) {
      logger.error(e);
    }
  }

  @Get('/user-books/:id', [authenticateAccessToken, validateParamsProp('id', 'number')])
  public async findUserBorowedBook(req: CRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.findUserBorrowedBook(req.params.id);

      return res.send({ data: result });
    } catch (e) {
      return next(e);
    }
  }
}
