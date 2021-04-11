const request = require('supertest');

export type ApiUtil = {
  get: (path: string, expects: Array<Array<any>>,
    query?: string | object | null, headers?: Array<Array<string>>,
    sets?: Array<Array<any>>) => Promise<any>,
  post: (path: string, expects: Array<Array<any>>, body?: any,
    headers?: Array<Array<string>>, sets?: Array<Array<any>>) => Promise<any>,
  put: (path: string, expects: Array<Array<any>>, body?: any,
    headers?: Array<Array<string>>, sets?: Array<Array<any>>) => Promise<any>,
};

const applyHeaders = (reqSuperTest: any, headers: Array<Array<string>>) => {
  headers.forEach((header) => {
    // eslint-disable-next-line no-param-reassign
    reqSuperTest = reqSuperTest.set(...header);
  });

  return reqSuperTest;
};

const applySets = (reqSuperTest: any, sets: Array<Array<any>>) => {
  sets.forEach((set) => {
    // eslint-disable-next-line no-param-reassign
    reqSuperTest = reqSuperTest.set(...set);
  });

  return reqSuperTest;
};

export default (app: any): ApiUtil => ({
  get: async (path: string, expects: Array<Array<any>>, query?: string | object | null,
    headers?: Array<Array<string>>, sets?: Array<Array<any>>) => {
    let reqSuperTest = request(app).get(path);

    if (headers && headers.length) reqSuperTest = applyHeaders(reqSuperTest, headers);
    if (sets && sets.length) reqSuperTest = applySets(reqSuperTest, sets);
    if (query) reqSuperTest = reqSuperTest.query(query);

    expects.forEach((expect) => reqSuperTest.expect(...expect));

    return reqSuperTest;
  },
  post: async (path: string, expects: Array<Array<any>>, body?: any,
    headers?: Array<Array<string>>, sets?: Array<Array<any>>) => {
    let reqSuperTest = request(app).post(path);

    if (headers && headers.length) reqSuperTest = applyHeaders(reqSuperTest, headers);
    if (sets && sets.length) reqSuperTest = applySets(reqSuperTest, sets);
    if (body) reqSuperTest = reqSuperTest.send(body);

    expects.forEach((expect) => reqSuperTest.expect(...expect));

    return reqSuperTest;
  },
  put: async (path: string, expects: Array<Array<any>>, body?: any,
    headers?: Array<Array<string>>, sets?: Array<Array<any>>) => {
    let reqSuperTest = request(app).put(path);

    if (headers && headers.length) reqSuperTest = applyHeaders(reqSuperTest, headers);
    if (sets && sets.length) reqSuperTest = applySets(reqSuperTest, sets);
    if (body) reqSuperTest = reqSuperTest.send(body);

    expects.forEach((expect) => reqSuperTest.expect(...expect));

    return reqSuperTest;
  },
});
