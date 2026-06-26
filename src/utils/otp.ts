import bcrypt from 'bcryptjs';

export const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = (code: string): Promise<string> => bcrypt.hash(code, 8);
export const verifyOtp = (code: string, hash: string): Promise<boolean> =>
  bcrypt.compare(code, hash);
