import { Repository } from 'sequelize-typescript';
import { InjectValue } from 'typescript-ioc';
import Book, { BookProp } from '../model/Book';
import { IService, ParamGet } from './IService';

export default class BookService implements IService<BookProp> {
  @InjectValue('bookRepository')
  public bookRepository!: Repository<Book>;

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = { offset, limit, where: filter };

    return this.bookRepository.findAll(option);
  }

  public findById(id: number | string) {
    return this.bookRepository.findByPk(id);
  }

  public create(param: BookProp) {
    return this.bookRepository.create(param);
  }

  public async update(id: number | string, param: BookProp) {
    const results = await this.bookRepository.update(param, { where: { id } });

    return results[1] && results[1][0];
  }

  public count({ filter }: ParamGet) {
    return this.bookRepository.count({ where: filter });
  }
}
