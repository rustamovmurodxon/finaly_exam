import { Context, SessionFlavor } from 'grammy';

export interface MySession {
  step:
    | 'waiting_first_name'
    | 'waiting_last_name'
    | 'waiting_phone'
    | 'registered'
    | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  telegramId: string | null;
}

export type MyContext = Context & SessionFlavor<MySession>;
