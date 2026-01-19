export type BotStep = 'IDLE' | 'ASK_NAME' | 'ASK_PHONE' | 'READY';

export interface BotSession {
  step: BotStep;
  firstName?: string;
  phoneNumber?: string;
  token?: string;
  studentId?: string;
}

export class InMemorySessionStore {
  private store = new Map<number, BotSession>();

  get(chatId: number): BotSession {
    if (!this.store.has(chatId)) {
      this.store.set(chatId, { step: 'IDLE' });
    }
    return this.store.get(chatId)!;
  }

  set(chatId: number, session: BotSession) {
    this.store.set(chatId, session);
  }

  clear(chatId: number) {
    this.store.delete(chatId);
  }
}
