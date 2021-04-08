import { Express } from 'express-serve-static-core';
import assert from 'assert';
import { InjectValue } from 'typescript-ioc';
import { Repository } from 'sequelize-typescript';
import util, { ApiUtil } from './util.test';
import { generateUserNoPassword } from '../../seed/user';
import User from '../../src/model/User';

const user: any = () => ({ ...generateUserNoPassword(1)[0], password: '12345678' });

export default class UserTest {
  @InjectValue('app')
  private app!: Express;

  @InjectValue('userRepository')
  private userRepository!: Repository<User>;

  private apiUtil: ApiUtil;

  private path: string = '/api/users';

  constructor() {
    this.apiUtil = util(this.app);
  }

  public async loginFirst(): Promise<Pick<ApiUtil, 'post'> | null> {
    const userResult = await this.userRepository.findOne({ attributes: ['username'], plain: true });

    if (userResult) {
      const expects = [['Content-Type', /json/], [200]];
      const paramLogin = { username: userResult.username, password: '12345678' };

      return this.apiUtil.post(`${this.path}/auth/login`, expects, paramLogin);
    }

    return null;
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
        const { username, email, firstName } = paramUser.body.data;
        const query = { filter: JSON.stringify({ username, email, firstName }) };
        const result = await this.apiUtil.get(this.path, expects, query, headers);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(Array.isArray(resultData) && resultData.length), 'data was not found');
        assert(Boolean(resultData[0].username === username), 'username was different');
        assert(Boolean(resultData[0].email === email), 'email was different');
        assert(Boolean(resultData[0].firstName === firstName), 'firstName was different');
      });

      it(`Find ${this.path}: should return 401`, async () => {
        const expects = [['Content-Type', /json/], [401]];
        const result = await this.apiUtil.get(this.path, expects);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'data was not found');
      });
    });
  }

  public count() {
    describe(`GET ${this.path}/paging/count`, () => {
      it(`Find ${this.path}: should return 200`, async () => {
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

  public login() {
    describe(`POST ${this.path}/auth/login`, () => {
      it('should success', async () => {
        const userResult = await this.userRepository.findOne({ attributes: ['username'], plain: true });

        if (userResult) {
          const result: any = await this.loginFirst();
          const resultData = result && result.body && result.body.data;

          assert(Boolean(resultData), 'data was not found');
          assert(resultData.token, 'token not present');
        } else {
          assert(false, 'user not found from repository');
        }
      });

      it(`Login ${this.path}/auth/login : should return 401`, async () => {
        const expects = [['Content-Type', /json/], [401]];
        const result = await this.apiUtil.post(`${this.path}/auth/login`, expects, { username: 'nodata', password: 'nodata' });
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });

      it(`Login ${this.path}/auth/login : should return 400`, async () => {
        const expects = [['Content-Type', /json/], [400]];
        const result = await this.apiUtil.post(`${this.path}/auth/login`, expects, { password: 'nodata' });
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }

  public create() {
    describe(`POST ${this.path}`, () => {
      const userParam = user();

      it(`Create ${this.path} : should success`, async () => {
        const expects = [['Content-Type', /json/], [200]];
        const result = await this.apiUtil.post(this.path, expects, userParam);
        const resultData = result && result.body && result.body.data;

        assert(Boolean(resultData), 'data was not found');
        assert(!resultData.password, 'password are present');
        assert(resultData.role, 'role was not User or not present');
        assert(resultData.username === userParam.username, 'username was different from payload');
        assert(resultData.email === userParam.email, 'email was different from payload');
      });

      it(`Create ${this.path} : should return 500`, async () => {
        const expects = [['Content-Type', /json/], [500]];
        const result = await this.apiUtil.post(this.path, expects, userParam);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });

      it(`Create ${this.path} : should return 400`, async () => {
        const expects = [['Content-Type', /json/], [400]];
        const newBody = { ...user() };

        delete newBody.username;
        delete newBody.email;
        newBody.phoneNumber = '+62-12121134644';

        const result = await this.apiUtil.post(this.path, expects, newBody);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }

  public update() {
    describe(`PUT ${this.path}`, () => {
      const userParam = user();

      it(`Update ${this.path} : should success`, async () => {
        const paramUser: any = await this.loginFirst();
        const token = paramUser && paramUser.body
          && paramUser.body.data && paramUser.body.data.token;

        assert(token, 'token are not present');

        const expects = [['Content-Type', /json/], [200]];
        const headers = [['Authorization', `Bearer ${token}`]];
        const paramUpdate = { firstName: 'Eka', lastName: 'Megawati' };

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

        const result = await this.apiUtil.put(`${this.path}/1`, expects, userParam, headers);
        const resultMessage = result && result.body && result.body.message;

        assert(Boolean(resultMessage), 'message was not found');
      });
    });
  }
}
