import { Express } from 'express-serve-static-core';
import { Repository } from 'sequelize-typescript';
import assert from 'assert';
import { InjectValue } from 'typescript-ioc';
import util, { ApiUtil } from './util.test';
import UserTest from './user.test';
import { BorrowType } from '../../src/service/UserBookService';
import UserBook from '../../src/model/UserBook';
import { countTotalFine } from '../../src/util';

export default class UserBookTest {
  @InjectValue('app')
  private app!: Express;

  @InjectValue('userTest')
  private userTest!: UserTest;

  @InjectValue('userBookRepository')
  public userBookRepository!: Repository<UserBook>;

  private apiUtil: ApiUtil;

  private path: string = '/api/user-books';

  constructor() {
    this.apiUtil = util(this.app);
  }

  loginFirst(isAdmin: boolean = true) {
    return this.userTest.loginFirst(isAdmin);
  }

  public borrowBook() {
    describe(`Borrow book POST ${this.path}/borrows/1`, () => {
      it(`Borrow book ${this.path}/borrows/1 : should success`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [{ bookId: 1 }] };

        const result = await this.apiUtil.post(`${this.path}/borrows/1`, expects, param, headers);
        const resultData = result && result.body && result.body.data;

        assert(Array.isArray(resultData) && resultData.length, 'data was not found');
        assert(resultData[0].userId, 'userId was not present');
        assert(resultData[0].bookId, 'bookId was not present');
        assert(resultData[0].borrowDate, 'borrowDate was not present');
        assert(!resultData[0].returnDate, 'returnDate are present');
      });

      it(`Borrow book ${this.path}/borrows/1 : should return 401 invalid role access`, async () => {
        const paramUser: any = await this.loginFirst(false);
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [401]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [{ bookId: 1 }] };

        const result = await this.apiUtil.post(`${this.path}/borrows/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'Message was not found');
      });

      it(`Borrow book ${this.path}/borrows/1 : should return 400 invalid param`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [] };

        const result = await this.apiUtil.post(`${this.path}/borrows/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage));
      });

      it(`Borrow book ${this.path}/borrows/1 : should return 400 BorrowType.already_borrowed`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [{ bookId: 1 }] };

        const result = await this.apiUtil.post(`${this.path}/borrows/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(resultMessage === BorrowType.already_borrowed, 'message was not same with BorrowType.already_borrowed');
      });

      it(`Borrow book ${this.path}/borrows/1 : should return 400 BorrowType.exceed`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const headers = [['Authorization', `Bearer ${token}`]];

        await Promise.all([2, 3, 4].map((bookId) => {
          const paramFirst = { books: [{ bookId }] };

          return this.apiUtil.post(`${this.path}/borrows/1`, [], paramFirst, headers);
        }));

        const expects = [['Content-Type', /json/], [400]];
        const param = { books: [{ bookId: 5 }] };

        const result = await this.apiUtil.post(`${this.path}/borrows/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(resultMessage === BorrowType.exceed, 'message was not same with BorrowType.exceed');
      });
    });
  }

  public returnBook() {
    describe(`Return book put ${this.path}/returns/1`, () => {
      it(`Return book ${this.path}/returns/1 : should success`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [1, 2, 3, 4].map((bookId) => ({ bookId })) };

        const result = await this.apiUtil.put(`${this.path}/returns/1`, expects, param, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
        assert(Object.prototype.hasOwnProperty.call(resultData, 'fine'), 'fine was not present');
      });

      it(`Return book ${this.path}/returns/1 : should return 401 invalid role access`, async () => {
        const paramUser: any = await this.loginFirst(false);
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [401]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [{ bookId: 1 }] };

        const result = await this.apiUtil.put(`${this.path}/returns/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'Message was not found');
      });

      it(`Return book ${this.path}/returns/1 : should success with fine > 0`, async () => {
        const borrowDate = new Date(2018, 10, 1);

        await this.userBookRepository.create({ userId: 1, bookId: 3, borrowDate });

        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [{ bookId: 3 }] };

        const result = await this.apiUtil.put(`${this.path}/returns/1`, expects, param, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
        assert(Object.prototype.hasOwnProperty.call(resultData, 'fine'), 'fine was not present');
        assert(resultData.fine === countTotalFine(borrowDate));
      });

      it(`Return book ${this.path}/returns/1 : should return 400 invalid param`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { books: [] };

        const result = await this.apiUtil.put(`${this.path}/returns/1`, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage));
      });
    });
  }

  public find() {
    describe(`GET ${this.path}`, () => {
      it(`Find ${this.path}: should return 200`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const result = await this.apiUtil.get(this.path, expects, {}, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
      });

      it(`Find ${this.path}?filter: should return 200 & and give valid result`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];

        const resultFirstBook = await this.apiUtil.get(this.path, [],
          { offset: 0, limit: 1 }, headers);
        const resultFirstBookData = resultFirstBook && resultFirstBook.body
          && resultFirstBook.body.data;

        assert(Boolean(Array.isArray(resultFirstBookData) && resultFirstBookData.length), 'data was not found');
        assert(resultFirstBookData.length === 1, 'data length should same with limit');

        const { userId, bookId } = resultFirstBookData[0];
        const query = { filter: JSON.stringify({ userId, bookId }) };
        const result = await this.apiUtil.get(this.path, expects, query, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(Array.isArray(resultData)), 'data was not found');
        assert(Boolean(resultData[0].userId === userId), 'userId was different');
        assert(Boolean(resultData[0].bookId === bookId), 'bookId was different');
      });

      it(`Find ${this.path}: should return 401`, async () => {
        const expects = [['Content-Type', /json/], [401]];
        const result = await this.apiUtil.get(this.path, expects);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'data was not found');
      });

      it(`Find ${this.path}?filter: should return 500`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [500]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const query = { filter: JSON.stringify({ borrowDate: '21212121' }) };
        const result = await this.apiUtil.get(this.path, expects, query, headers);
        const resultMesage = result && result.body && result.body.message;

        assert(Boolean(resultMesage), 'message was not found');
      });
    });
  }

  public count() {
    describe(`GET ${this.path}/paging/count`, () => {
      it(`Find ${this.path}/paging/count: should return 200`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const result = await this.apiUtil.get(`${this.path}/paging/count`, expects, {}, headers);
        const resultData = result && result.body && result.body.data;

        assert(typeof resultData === 'number', 'data was not a number');
      });

      it(`Find ${this.path}/paging/count?filter: should return 500`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [500]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const query = { filter: JSON.stringify({ borrowDate: '13321312' }) };
        const result = await this.apiUtil.get(`${this.path}/paging/count`, expects, query, headers);
        const resultMesage = result && result.body && result.body.message;

        assert(Boolean(resultMesage), 'message was not found');
      });
    });
  }
}
