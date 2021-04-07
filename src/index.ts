import 'reflect-metadata';
import express,
{
  NextFunction,
  Response,
  Router,
} from 'express';
import { Sequelize } from 'sequelize-typescript';
import cookieParser from 'cookie-parser';
import { CRequest, RouteDefinition } from './controller/IController';
import UserController from './controller/UserController';
import User from './model/User';
import UserBook from './model/UserBook';
import Book from './model/Book';
import BookController from './controller/BookController';
import UserBookController from './controller/UserBookController';
import { errorHandler } from './middleware';
import logger from './config/logger';
import UserSession from './model/UserSession';
import UserService from './service/UserService';
import BookService from './service/BookService';
import UserBookService from './service/UserBookService';

require('dotenv').config();

const app = express();
const sequelizeInstance = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB as string,
  port: (parseInt(process.env.DB_PORT as string, 10) || 5432) as number,
  models: [User, Book, UserBook, UserSession],
  repositoryMode: true,
  logging: process.env.NODE_ENV === 'development',
});

function applyRouter(Controller: any, instance: { [key: string]: any }): Router {
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

sequelizeInstance.sync().then(() => {
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  const userRepository = sequelizeInstance.getRepository(User);
  const bookRepository = sequelizeInstance.getRepository(Book);
  const userBookRepository = sequelizeInstance.getRepository(UserBook);
  const userSessionRepository = sequelizeInstance.getRepository(UserSession);

  const userService = new UserService(userRepository, userBookRepository, userSessionRepository);
  const bookService = new BookService(bookRepository);
  const userBookService = new UserBookService(userBookRepository);

  app.use('/api', [
    applyRouter(UserController, new UserController(userService)),
    applyRouter(BookController, new BookController(bookService)),
    applyRouter(UserBookController, new UserBookController(userBookService)),
  ]);

  app.use(errorHandler);

  app.listen(3000, () => {
    logger.info('Started express on port 3000');
  });
}).catch((e) => {
  logger.error(e);
  process.exit(e);
});
