import {
  Column,
  HasMany,
  Model,
  Table,
  DataType,
  Unique,
  Default,
} from 'sequelize-typescript';

// eslint-disable-next-line import/no-cycle
import UserBook from './UserBook';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Table({ underscored: true })
export default class User extends Model {
  @Column
  firstName!: string;

  @Column
  lastName!: string;

  @Column
  password!: string;

  @Unique
  @Column
  username!: string;

  @Unique
  @Column
  email!: string;

  @Column
  phoneNumber!: string;

  @Column
  birthDate!: Date;

  @Default(UserRole.USER)
  @Column(DataType.ENUM('USER', 'ADMIN'))
  role!: UserRole;

  @HasMany(() => UserBook)
  userBooks!: Array<UserBook>;

  @Column(DataType.TEXT)
  bio!: string;
}

export type UserProp = {
  id?: number;
  token?: string;
  firstName: string;
  lastName: string;
  password?: string;
  username: string;
  email: string;
  phoneNumber: string;
  birthDate?: Date;
  bio: string;
  role: string;
};

const properties = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  password: { type: 'string' },
  username: { type: 'string' },
  email: { type: 'string' },
  phoneNumber: { type: 'string' },
  birthDate: { type: 'string', format: 'date-time' },
  bio: { type: 'string' },
  role: { type: 'string' },
};

export const jsonPostSchema = {
  type: 'object',
  properties,
  required: [
    'email',
    'firstName',
    'lastName',
    'password',
    'username',
    'phoneNumber',
    'birthDate',
  ],
  additionalProperties: false,
};

export const jsonUpdateSchema = {
  type: 'object',
  properties,
  oneOf: ['firstName', 'lastName', 'phoneNumber', 'birthDate']
    .map((key) => ({ required: [key] })),
  additionalProperties: false,
};

export const jsonLoginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
  },
  additionalProperties: false,
  oneOf: ['username', 'email'].map((key) => ({ required: [key, 'password'] })),
};
