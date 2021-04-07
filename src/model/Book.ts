import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({ underscored: true })
export default class Book extends Model {
  @Column
  title!: string;

  @Column(DataType.ARRAY(DataType.STRING))
  author!: Array<string>;

  @Column
  sheet!: number;

  @Column(DataType.TEXT)
  introduction!: string;

  @Column
  dateOffIssue!: Date;
}

export type BookProp = {
  id?: number;
  title: string;
  author: Array<string>;
  sheet: number;
  introduction: string;
  dateOffIssue: Date;
};

const properties = {
  title: { type: 'string' },
  author: { type: 'string' },
  sheet: { type: 'number' },
  introduction: { type: 'string' },
  dateOffIssue: { type: 'string', format: 'date-time' },
};

export const jsonPostSchema = {
  type: 'object',
  properties,
  required: [
    'title',
    'author',
    'sheet',
  ],
  additionalProperties: false,
};

export const jsonUpdateSchema = {
  type: 'object',
  properties,
  oneOf: ['title', 'author', 'sheet', 'introduction', 'dateOffIssue']
    .map((key) => ({ required: [key] })),
};
