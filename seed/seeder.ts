import { Sequelize } from 'sequelize-typescript';
import User from '../src/model/User';
import Book from '../src/model/Book';
import UserBook from '../src/model/UserBook';

import fakeUser from './user';
import fakeBook from './book';
import fakeUserBook from './user-book';
import UserSession from '../src/model/UserSession';

const dotenv = require('dotenv');

async function startSeeding(total: number, envPath: string = '.env',
  skipExit: boolean = false, type: 'user' | 'book' | 'all' = 'all', logging: boolean = false) {
  dotenv.config({ path: envPath });

  const sequelizeInstance = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST as string,
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB as string,
    port: (parseInt(process.env.DB_PORT as string, 10) || 5432) as number,
    models: [User, Book, UserBook, UserSession],
    logging,
  });

  try {
    await sequelizeInstance.sync({ force: true });

    const users = await fakeUser(total);
    const books = fakeBook(total);
    const promises: Array<Promise<any>> = [];

    if (['user', 'all'].includes(type)) {
      promises.push(User.bulkCreate(users));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (['book', 'all'].includes(type)) {
      promises.push(Book.bulkCreate(books));
    } else {
      promises.push(Promise.resolve([]));
    }

    let [userDatas, bookDatas] = await Promise.all(promises);

    userDatas = userDatas.map((item: any) => item.get({ plain: true }));
    bookDatas = bookDatas.map((item: any) => item.get({ plain: true }));

    if (userDatas.length && bookDatas.length) {
      const userBooks = fakeUserBook(bookDatas, userDatas);
      await UserBook.bulkCreate(userBooks);
    }

    await sequelizeInstance.close();
    if (!skipExit) process.exit();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    if (!skipExit) process.exit(1);
  }
}

export default startSeeding;
