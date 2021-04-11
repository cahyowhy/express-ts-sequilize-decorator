import { Repository } from 'sequelize-typescript';
import { Op, Sequelize, Transaction } from 'sequelize';
import { InjectValue } from 'typescript-ioc';
import Constant from '../constant';
import UserBook, { UserBookProp } from '../model/UserBook';
import { IService, ParamGet } from './IService';
import logger from '../config/logger';
import UserFineHistory from '../model/UserFineHistory';
import { countTotalFine } from '../util';

export enum BorrowType {
  exceed = 'Your borrowed book are exceeded',
  already_borrowed = 'You already borrow this book',
}

export default class UserBookService implements IService<UserBookProp> {
  @InjectValue('userBookRepository')
  public userBookRepository!: Repository<UserBook>;

  @InjectValue('userFineHistoryRepository')
  public userFineHistoryRepository!: Repository<UserFineHistory>;

  @InjectValue('sequilizeInstance')
  public sequelize!: Sequelize;

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = { offset, limit, where: filter };

    return this.userBookRepository.findAll(option);
  }

  public async borrowBooks(userId: number | string, params: Array<UserBookProp>)
    : Promise<Array<UserBook> | BorrowType> {
    const books = params.map(({ bookId }) => bookId);
    const paramCount = { where: { returnDate: { [Op.is]: null } } };
    const paramAlreadyBorrow = { where: { bookId: books, returnDate: { [Op.is]: null } } };
    const [total, totalAlreadyBorrow] = await Promise.all([paramCount, paramAlreadyBorrow]
      .map((param) => this.userBookRepository.count(param)));

    if (totalAlreadyBorrow > 0) {
      return BorrowType.already_borrowed;
    }

    if (total >= Constant.MAX_BORROW_BOOK) {
      return BorrowType.exceed;
    }

    const savedBooks = params.map(({ bookId }) => ({
      userId,
      bookId,
      borrowDate: new Date(),
    }));

    return this.userBookRepository.bulkCreate(savedBooks);
  }

  public async returnBooks(userId: number | string, params: Array<UserBookProp>) {
    const books = params.map(({ bookId }) => bookId);

    try {
      return this.sequelize.transaction(async (t: Transaction) => {
        const param = { where: { userId, bookId: books, returnDate: null } };
        const userBooks = await this.userBookRepository.findAll(param);
        const promises: Array<Promise<UserBook>> = [];
        let fine = 0;
        const userBookIds: Array<number> = [];

        userBooks.forEach((userBook: UserBook) => {
          const returnDate = new Date();
          fine += countTotalFine(userBook.borrowDate);

          if (userBook.id) userBookIds.push(userBook.id);

          promises.push(userBook.update({ returnDate }, { transaction: t }));
        });

        await Promise.all(promises);

        if (fine) {
          await this.userFineHistoryRepository.create({
            userId, userBookIds, fine,
          });
        }

        return {
          message: 'Return book succeed',
          data: { fine },
        };
      });
    } catch (e) {
      logger.error(e);

      return null;
    }
  }

  public count({ filter }: ParamGet) {
    return this.userBookRepository.count({ where: filter });
  }
}
