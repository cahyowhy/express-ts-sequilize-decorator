import { UserProp } from '../src/model/user';
import { BookProp } from '../src/model/book';
import { UserBookProp } from '../src/model/UserBook';

export default (books: BookProp[], users: UserProp[]): Array<UserBookProp> => users
  .reduce((accu: Array<UserBookProp>, user: UserProp) => accu.concat(books.map((book) => ({
    userId: user.id || 0,
    bookId: book.id || 0,
    borrowDate: new Date(2018, 2, 2),
    returnDate: new Date(2018, 3, 2),
  }))), []);
