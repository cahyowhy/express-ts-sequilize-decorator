import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cookieParser from 'cookie-parser';
import { errorHandler } from './api/middleware';
import setupApiRouter from './api/router';

const cors = require('cors');

export default (sequelizeInstance: Sequelize) => {
  const app = express();

  // const whitelist = ['http://localhost:8887', 'http://localhost:3000'];
  const corsOptions = {
    // credentials: true,
    // origin: (origin: string, callback: Function) => {
    //   if (whitelist.indexOf(origin) !== -1 || !origin) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error('Not allowed by CORS'));
    //   }
    // },
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  setupApiRouter(app, sequelizeInstance);
  app.use(errorHandler);

  return app;
};
