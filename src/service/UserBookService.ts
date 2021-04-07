import { Repository } from 'sequelize-typescript';
import UserBook, { UserBookProp } from '../model/UserBook';
import { IService, ParamGet } from './IService';

export default class UserBookService implements IService<UserBookProp> {
  constructor(public repository: Repository<UserBook>) {
  }

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = { offset, limit, where: filter };

    return this.repository.findAll(option);
  }

  public findById(id: number | string) {
    return this.repository.findByPk(id);
  }

  public create(param: UserBookProp) {
    const newParam = { ...param };
    newParam.borrowDate = new Date();

    return this.repository.create(newParam);
  }

  public async update(id: number | string, param: UserBookProp) {
    const results = await this.repository.update(param, { where: { id } });

    return results[1] && results[1][0];
  }

  public count({ filter }: ParamGet) {
    return this.repository.count({ where: filter });
  }
}
