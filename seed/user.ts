import {
  internet,
  name,
  phone,
  lorem,
} from 'faker';
import bcrypt from 'bcrypt';
import { UserProp, UserRole } from '../src/model/User';

// eslint-disable-next-line max-len
export const generateUserNoPassword = (total = 10): Array<UserProp> => new Array(total).fill(null).map(() => {
  const firstName = name.firstName();
  const lastName = name.lastName();
  const email = internet.email(firstName, lastName).toLowerCase();
  const username = internet.userName(firstName, lastName).toLowerCase();

  return {
    email,
    firstName,
    lastName,
    username,
    phoneNumber: phone.phoneNumber(),
    birthDate: new Date(),
    bio: lorem.paragraph(5),
    role: UserRole.USER,
  };
});

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

  return passwords.map((password, index) => {
    const user = generateUserNoPassword(1)[0];
    if (index === 1) user.role = UserRole.ADMIN;

    return {
      password: (password as string),
      ...user,
    };
  });
};
