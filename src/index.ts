import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import logger from './config/logger';

import User from './model/User';
import UserBook from './model/UserBook';
import Book from './model/Book';
import UserSession from './model/UserSession';
import UserFineHistory from './model/UserFineHistory';
import setupApp from './app';

require('dotenv').config();

const sequelizeInstance = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB as string,
  port: (parseInt(process.env.DB_PORT as string, 10) || 5432) as number,
  models: [User, Book, UserBook, UserSession, UserFineHistory],
  repositoryMode: true,
  logging: process.env.NODE_ENV === 'development',
});

sequelizeInstance.sync().then(() => {
  const app = setupApp(sequelizeInstance);

  app.listen(3000, () => {
    logger.info('Started express on port 3000');
  });
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.log(e);
  process.exit(1);
});
