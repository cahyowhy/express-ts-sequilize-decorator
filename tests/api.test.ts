import { Sequelize } from 'sequelize-typescript';
import { Container } from 'typescript-ioc';

import User from '../src/model/User';
import UserBook from '../src/model/UserBook';
import Book from '../src/model/Book';
import UserSession from '../src/model/UserSession';
import UserFineHistory from '../src/model/UserFineHistory';

import seeder from '../seed/seeder';

import setupApp from '../src/app';
import UserTest from './api/user.test';
import BookTest from './api/book.test';
import UserBookTest from './api/userbook.test';

require('dotenv').config({ path: '.env.test' });

const sequelizeInstance = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB as string,
  port: (parseInt(process.env.DB_PORT as string, 10) || 5432) as number,
  models: [User, Book, UserBook, UserSession, UserFineHistory],
  repositoryMode: true,
  logging: false,
});

const app = setupApp(sequelizeInstance);
Container.bindName('app').to(app);

const userTest = new UserTest();
const bookTest = new BookTest();
const userBookTest = new UserBookTest();
Container.bindName('userTest').to(userTest);

describe('API tests', () => {
  before((done) => {
    seeder(2, '.env.test', true).then(() => {
      sequelizeInstance.sync().then(() => done());
    });
  });

  userTest.create();
  userTest.login();
  userTest.find();
  userTest.findById();
  userTest.update();
  userTest.count();
  userTest.checkUserSession();
  userTest.findUserBorowedBook();
  userTest.logout();

  bookTest.find();
  bookTest.findById();
  bookTest.update();
  bookTest.create();
  bookTest.count();

  userBookTest.find();
  userBookTest.count();
  userBookTest.borrowBook();
  userBookTest.returnBook();
});
