import {
  internet,
  name,
  phone,
  lorem,
} from 'faker';
import bcrypt from 'bcrypt';
import { UserProp, UserRole } from '../src/model/User';

export default async (total = 10): Promise<Array<UserProp>> => {
  const promisePassword = new Array(total).fill(null).map(() => new Promise((resolve, reject) => {
    bcrypt.genSalt(10)
      .then((salt) => {
        bcrypt.hash('12345678', salt)
          .then((password) => resolve(password))
          .catch(reject);
      })
      .catch(reject);
  }));

  const passwords = await Promise.all(promisePassword);

  return passwords.map((password) => {
    const firstName = name.firstName();
    const lastName = name.lastName();
    const email = internet.email(firstName, lastName).toLowerCase();
    const username = internet.userName(firstName, lastName).toLowerCase();

    return {
      email,
      firstName,
      lastName,
      username,
      password: (password as string),
      phoneNumber: phone.phoneNumber(),
      // birthDate: new Date(),
      bio: lorem.paragraph(5),
      role: UserRole.USER,
    };
  });
};
