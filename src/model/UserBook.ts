import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import Book from './Book';

// eslint-disable-next-line import/no-cycle
import User from './User';

@Table({ underscored: true })
export default class UserBook extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId!: number;

  @ForeignKey(() => Book)
  @AllowNull(false)
  @Column
  bookId!: number;

  @AllowNull(false)
  @Column({ unique: true })
  reffKey!: string;

  @AllowNull(false)
  @Column
  borrowDate!: Date;

  @Column
  returnDate!: Date;
}

export type UserBookProp = {
  userId?: number;
  bookId?: number;
  reffKey: string;
  borrowDate: Date;
  returnDate?: Date;
};

const properties = {
  userId: { type: 'number' },
  bookId: { type: 'number' },
};

export const jsonPostSchema = {
  type: 'object',
  properties,
  required: [
    'userId',
    'bookId',
  ],
  additionalProperties: false,
};
