import {
  name,
  date,
  datatype,
  lorem,
} from 'faker';
import { BookProp } from '../src/model/Book';

export default (total = 10): Array<BookProp> => new Array(total).fill(null).map(() => ({
  title: lorem.sentence(datatype.number({ min: 2, max: 4 })),
  author: new Array(2).fill('').map(() => name.findName()),
  sheet: datatype.number({ min: 120, max: 400 }),
  introduction: lorem.paragraphs(8),
  dateOffIssue: date.between(new Date(1945, 1), new Date(2018, 11)),
}));
