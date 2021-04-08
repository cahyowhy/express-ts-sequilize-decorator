import { Repository } from 'sequelize-typescript';
import { InjectValue } from 'typescript-ioc';
import { IService, ParamGet } from './IService';
import UserFineHistory, { UserPayFineProps } from '../model/UserFineHistory';
import User from '../model/User';

export enum BorrowType {
  exceed = 'Your borrowed book are exceeded',
  already_borrowed = 'You already borrow this book',
}

export default class UserFineHistoryService implements IService<UserFineHistory> {
  @InjectValue('userFineHistoryRepository')
  public userFineHistoryRepository!: Repository<UserFineHistory>;

  @InjectValue('userRepository')
  public userRepository!: Repository<User>;

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = {
      offset,
      limit,
      where: filter,
      include: [this.userRepository],
    };

    return this.userFineHistoryRepository.findAll(option);
  }

  public payBookFine(userId: number, param: UserPayFineProps) {
    const ids = param.fines.map(({ id }) => id);

    return this.userFineHistoryRepository.update({ hasPaid: true }, {
      where: {
        id: ids,
        userId,
      },
    });
  }
}
