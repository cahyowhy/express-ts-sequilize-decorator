import { Express } from 'express-serve-static-core';
import assert from 'assert';
import { InjectValue } from 'typescript-ioc';
import util, { ApiUtil } from './util.test';
import UserTest from './user.test';
import generateBook from '../../seed/book';

const book: any = () => ({ ...generateBook(1)[0] });

export default class BookTest {
  @InjectValue('app')
  private app!: Express;

  @InjectValue('userTest')
  private userTest!: UserTest;

  private apiUtil: ApiUtil;

  private path: string = '/api/books';

  constructor() {
    this.apiUtil = util(this.app);
  }

  loginFirst() {
    return this.userTest.loginFirst();
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

        const { title, sheet } = resultFirstBookData[0];
        const query = { filter: JSON.stringify({ title, sheet }) };
        const result = await this.apiUtil.get(this.path, expects, query, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(Array.isArray(resultData)), 'data was not found');
        assert(Boolean(resultData[0].title === title), 'title was different');
        assert(Boolean(resultData[0].sheet === sheet), 'sheet was different');
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
        const query = { filter: JSON.stringify({ dateOffIssue: '21212121' }) };
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
        const query = { filter: JSON.stringify({ dateOfIssue: '13321312' }) };
        const result = await this.apiUtil.get(`${this.path}/paging/count`, expects, query, headers);
        const resultMesage = result && result.body && result.body.message;

        assert(Boolean(resultMesage), 'message was not found');
      });
    });
  }

  public findById() {
    describe(`GET by id ${this.path}`, () => {
      it(`Find by id ${this.path}/1: should return 200`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const result = await this.apiUtil.get(`${this.path}/1`, expects, {}, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
      });

      it(`Find by id ${this.path}/invalid: should return 400`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const result = await this.apiUtil.get(`${this.path}/invalidpath`, expects, {}, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }

  public create() {
    describe(`POST ${this.path}`, () => {
      const bookParam = book();

      it(`Create ${this.path} : should success`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const result = await this.apiUtil.post(this.path, expects, bookParam, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
        assert(resultData.title === bookParam.title, 'title was different from payload');
        assert(resultData.sheet === bookParam.sheet, 'sheet was different from payload');
        assert(resultData.introduction === bookParam.introduction, 'introduction was different from payload');
      });

      it(`Create ${this.path} : should return 500`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [500]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const param = { ...bookParam, title: new Array(256).fill('a').join('') };
        const result = await this.apiUtil.post(this.path, expects, param, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });

      it(`Create ${this.path} : should return 400`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const newBody = { ...book() };

        newBody.dateOffIssue = 'invalid-date';

        const result = await this.apiUtil.post(this.path, expects, newBody, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }

  public update() {
    describe(`PUT ${this.path}`, () => {
      it(`Update ${this.path} : should success`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const paramUpdate = { title: 'Adipisicing aliquip nisi voluptate irure in it.', author: ['Mark morales'] };

        const result = await this.apiUtil.put(`${this.path}/1`, expects, paramUpdate, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'data was not found');
      });

      it(`Update ${this.path} : should return 400`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [400]];
        const headers = [['Authorization', `Bearer ${token}`]];

        const result = await this.apiUtil.put(`${this.path}/1`, expects, { dateOffIssue: 'invalid-date' }, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });

      it(`Update ${this.path} : should return 500`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [500]];
        const headers = [['Authorization', `Bearer ${token}`]];

        const result = await this.apiUtil.put(`${this.path}/1`, expects, { title: new Array(256).fill('n').join('') }, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }
}
