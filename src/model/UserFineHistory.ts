import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import User from './User';

@Table({ underscored: true })
export default class UserFineHistory extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.INTEGER))
  userBookIds!: Array<number>;

  @AllowNull(false)
  @Column
  fine!: Number;

  @Default(false)
  @Column
  hasPaid!: boolean;
}

export const jsonPayFineSchema = {
  type: 'object',
  properties: {
    fines: { type: 'array' },
    items: {
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
  },
  required: ['fines'],
  additionalProperties: false,
};

export type UserPayFineProps = {
  fines: Array<{ id: number }>
};
