import jwt from 'jsonwebtoken';
import randToken from 'rand-token';
import { UserProp } from '../model/User';

export function generateAccessToken(user: UserProp) {
  return jwt.sign(user, (process.env.JWT_SECRET as string), { expiresIn: '30m' });
}

export function generateRefreshToken() {
  return randToken.uid(256);
}
