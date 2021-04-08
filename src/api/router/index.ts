import { Express } from 'express-serve-static-core';
import { Container } from 'typescript-ioc';
import { Sequelize } from 'sequelize-typescript';
import UserController from '../../controller/UserController';
import BookController from '../../controller/BookController';
import UserBookController from '../../controller/UserBookController';
import { applyRouter } from '../../util';
import User from '../../model/User';
import UserBook from '../../model/UserBook';
import Book from '../../model/Book';
import UserSession from '../../model/UserSession';
import UserFineHistory from '../../model/UserFineHistory';
import UserFineHistoryController from '../../controller/UserFineHistoryController';

export default (app: Express, sequilize: Sequelize) => {
  const userRepository = sequilize.getRepository(User);
  const bookRepository = sequilize.getRepository(Book);
  const userBookRepository = sequilize.getRepository(UserBook);
  const userSessionRepository = sequilize.getRepository(UserSession);
  const userFineHistoryRepository = sequilize.getRepository(UserFineHistory);

  Container.bindName('userRepository').to(userRepository);
  Container.bindName('bookRepository').to(bookRepository);
  Container.bindName('userBookRepository').to(userBookRepository);
  Container.bindName('userSessionRepository').to(userSessionRepository);
  Container.bindName('userFineHistoryRepository').to(userFineHistoryRepository);
  Container.bindName('sequilizeInstance').to(sequilize);

  app.use('/api', [
    applyRouter(UserController, new UserController()),
    applyRouter(BookController, new BookController()),
    applyRouter(UserBookController, new UserBookController()),
    applyRouter(UserFineHistoryController, new UserFineHistoryController()),
  ]);
};
