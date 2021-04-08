import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cookieParser from 'cookie-parser';
import { errorHandler } from './api/middleware';
import setupApiRouter from './api/router';

export default (sequelizeInstance: Sequelize) => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  setupApiRouter(app, sequelizeInstance);
  app.use(errorHandler);

  return app;
};
