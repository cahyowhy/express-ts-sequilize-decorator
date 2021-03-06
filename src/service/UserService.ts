import { Repository } from 'sequelize-typescript';
import { InjectValue } from 'typescript-ioc';
import bcrypt from 'bcrypt';
import User, {
  UserRole,
  UserProp,
} from '../model/User';
import UserBook from '../model/UserBook';
import { IService, ParamGet } from './IService';
import { generateAccessToken, generateRefreshToken } from '../util';
import UserSession from '../model/UserSession';

export default class UserService implements IService<UserProp> {
  @InjectValue('userRepository')
  public userRepository!: Repository<User>;

  @InjectValue('userBookRepository')
  public userBookRepository!: Repository<UserBook>;

  @InjectValue('userSessionRepository')
  public userSessionRepository!: Repository<UserSession>;

  public find(param: ParamGet) {
    const { offset, limit, filter } = param;
    const option = {
      offset,
      limit,
      attributes: { exclude: ['password'] },
      where: filter,
    };

    return this.userRepository.findAll(option);
  }

  public findById(id: number | string) {
    return this.userRepository.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  public async create(param: UserProp) {
    const newParam = param || {};
    newParam.password = await bcrypt.hash(newParam.password, await bcrypt.genSalt(10));
    newParam.role = UserRole.USER;

    const result = await this.userRepository.create(newParam);

    return result;
  }

  public update(id: number | string, param: UserProp) {
    return this.userRepository.update(param, { where: { id } });
  }

  public count({ filter }: ParamGet) {
    return this.userRepository.count({ where: filter });
  }

  public async login(param: UserProp): Promise<UserProp | null> {
    const filter: any = {};
    if (param && param.email) filter.email = param.email;
    if (param && param.username) filter.username = param.username;

    const user = await this.userRepository.findOne({ where: filter });

    if (user) {
      const userPlain = user.get({ plain: true });
      const { password, ...restUser } = userPlain;

      const valid = await bcrypt.compare(param.password, user.password);

      if (valid) {
        const token = generateAccessToken(restUser);

        return { token, ...restUser };
      }

      return null;
    }

    return null;
  }

  public async findUserSession(refreshToken: string): Promise<UserProp | null> {
    const param = { where: { refreshToken }, plain: true };
    const userSession = await this.userSessionRepository.findOne(param);
    if (userSession && userSession.expired.getTime() > new Date().getTime()) {
      const user = await this.userRepository.findOne({ where: { username: userSession.username } });

      if (user) {
        const userPlain = user.get({ plain: true });
        const { password, ...restUser } = userPlain;
        const token = generateAccessToken(restUser);

        return { token, ...restUser };
      }
    }

    return null;
  }

  public async removeUserSession(refreshToken: string) {
    const param = { where: { refreshToken }, plain: true };

    return this.userSessionRepository.destroy(param);
  }

  public async saveUserSession(username: string): Promise<UserSession> {
    const threeDay = 3 * 24 * 60 * 60 * 100;
    const expired = new Date(Date.now() + threeDay);
    const refreshToken = generateRefreshToken();

    const user = await this.userSessionRepository.findOne({ where: { username } });

    if (user) {
      return user.update({ expired, refreshToken });
    }

    return this.userSessionRepository.create({
      username, refreshToken, expired,
    });
  }

  public async findUserBorrowedBook(id: number | string): Promise<Array<User>> {
    return this.userRepository.findAll({
      include: [this.userBookRepository],
      where: { id },
      attributes: { exclude: ['password'] },
    });
  }
}
