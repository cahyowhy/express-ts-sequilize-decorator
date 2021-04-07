import { Repository } from 'sequelize-typescript';
import { InjectValue } from 'typescript-ioc';
import UserBook, { UserBookProp } from '../model/UserBook';
import { IService, ParamGet } from './IService';

export default class UserBookService implements IService<UserBookProp> {
  @InjectValue('userBookRepository')
  public userBookRepository!: Repository<UserBook>;

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = { offset, limit, where: filter };

    return this.userBookRepository.findAll(option);
  }

  public findById(id: number | string) {
    return this.userBookRepository.findByPk(id);
  }

  public create(param: UserBookProp) {
    const newParam = { ...param };
    newParam.borrowDate = new Date();

    return this.userBookRepository.create(newParam);
  }

  public async update(id: number | string, param: UserBookProp) {
    const results = await this.userBookRepository.update(param, { where: { id } });

    return results[1] && results[1][0];
  }

  public count({ filter }: ParamGet) {
    return this.userBookRepository.count({ where: filter });
  }
}
