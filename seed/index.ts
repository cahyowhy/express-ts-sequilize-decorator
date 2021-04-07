import { Sequelize } from 'sequelize-typescript';
import User from '../src/model/User';
import Book from '../src/model/Book';
import UserBook from '../src/model/UserBook';

import fakeUser from './user';
import fakeBook from './book';
import fakeUserBook from './user-book';
import UserSession from '../src/model/UserSession';

require('dotenv').config();

const sequelizeInstance = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB as string,
  port: (parseInt(process.env.DB_PORT as string, 10) || 5432) as number,
  models: [User, Book, UserBook, UserSession],
  // logging: false,
});

async function startSeeding(total: number) {
  try {
    await sequelizeInstance.sync({ force: true });

    const users = await fakeUser(total);
    const books = fakeBook(total);

    let [userDatas, bookDatas] = await Promise.all([
      User.bulkCreate(users),
      Book.bulkCreate(books),
    ]);

    userDatas = userDatas.map((item) => item.get({ plain: true }));
    bookDatas = bookDatas.map((item) => item.get({ plain: true }));

    const userBooks = fakeUserBook(bookDatas, userDatas);
    await UserBook.bulkCreate(userBooks);

    process.exit();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    process.exit(1);
  }
}

startSeeding(parseInt(process.argv[2], 10));
