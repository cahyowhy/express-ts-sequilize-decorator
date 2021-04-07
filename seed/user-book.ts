import { UserProp } from '../src/model/user';
import { BookProp } from '../src/model/book';
import { UserBookProp } from '../src/model/UserBook';

export default (books: BookProp[], users: UserProp[]): Array<UserBookProp> => users
  .reduce((accu: Array<UserBookProp>, user: UserProp) => accu.concat(books.map((book) => {
    const reffKey = `${user.id}-${book.id}`;

    return {
      reffKey,
      userId: user.id,
      bookId: book.id,
      borrowDate: new Date(2018, 2, 2),
      returnDate: new Date(2018, 3, 2),
    };
  })), []);
