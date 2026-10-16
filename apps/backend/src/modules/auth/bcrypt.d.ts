declare module 'bcrypt' {
  export function hash(password: string | Buffer, saltOrRounds: number | string): Promise<string>;
  export function compare(password: string | Buffer, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
}
