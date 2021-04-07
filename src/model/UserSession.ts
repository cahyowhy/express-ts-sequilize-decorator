import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({ underscored: true })
export default class UserSession extends Model {
  @Column
  expired!: Date;

  @Column(DataType.TEXT)
  refreshToken!: string;

  @Column
  username!: string;
}
