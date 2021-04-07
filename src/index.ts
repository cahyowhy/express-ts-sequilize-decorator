import 'reflect-metadata';
import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cookieParser from 'cookie-parser';
import User from './model/User';
import UserBook from './model/UserBook';
import Book from './model/Book';
import UserSession from './model/UserSession';

import { errorHandler } from './api/middleware';
import logger from './config/logger';
import setupApiRouter from './api/router';

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

sequelizeInstance.sync().then(() => {
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  setupApiRouter(app, sequelizeInstance);
  app.use(errorHandler);

  app.listen(3000, () => {
    logger.info('Started express on port 3000');
  });
}).catch((e) => {
  logger.error(e);
  process.exit(1);
});
