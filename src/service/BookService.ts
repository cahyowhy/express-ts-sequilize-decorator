import { Repository } from 'sequelize-typescript';
import Book, { BookProp } from '../model/Book';
import { IService, ParamGet } from './IService';

export default class BookService implements IService<BookProp> {
  constructor(public repository: Repository<Book>) {
  }

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = { offset, limit, where: filter };

    return this.repository.findAll(option);
  }

  public findById(id: number | string) {
    return this.repository.findByPk(id);
  }

  public create(param: BookProp) {
    return this.repository.create(param);
  }

  public async update(id: number | string, param: BookProp) {
    const results = await this.repository.update(param, { where: { id } });

    return results[1] && results[1][0];
  }

  public count({ filter }: ParamGet) {
    return this.repository.count({ where: filter });
  }
}
