import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Bot, Keyboard, Context } from 'grammy';
import * as cron from 'node-cron';
import { ApiClient } from './bot.api';
import { InMemorySessionStore } from './bot.session';

function normalizePhone(raw: string) {
  let p = raw.trim();
  if (!p.startsWith('+')) p = '+' + p;
  return p.replace(/\s+/g, '');
}

function fmtDate(d: any) {
  const dt = new Date(d);
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mo} ${hh}:${mm}`;
}

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);

  private bot: Bot<Context>;
  private sessions = new InMemorySessionStore();
  private api: ApiClient;

  private readonly mainKb = new Keyboard()
    .text('📅 Bugungi darslar')
    .text('🗓 Haftalik jadval')
    .row()
    .text("💳 To'lov holati")
    .text('🚪 Chiqish')
    .resized();

  private readonly contactKb = new Keyboard()
    .requestContact('📞 Telefon raqamni yuborish')
    .resized()
    .oneTime();

  constructor() {
    const botToken = process.env.BOT_TOKEN!;
    const baseURL = process.env.API_BASE_URL!;
    if (!botToken) throw new Error("BOT_TOKEN env yo'q");
    if (!baseURL) throw new Error("API_BASE_URL env yo'q");

    this.bot = new Bot(botToken);
    this.api = new ApiClient(baseURL);
  }

  onModuleInit() {
    this.registerHandlers();
    this.startCron();
    this.bot.start();
    this.logger.log('Telegram bot started');
  }

  private registerHandlers() {
    this.bot.command('start', async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const s = this.sessions.get(chatId);
      s.step = 'ASK_NAME';
      s.firstName = undefined;
      s.phoneNumber = undefined;
      s.token = undefined;
      s.studentId = undefined;
      this.sessions.set(chatId, s);

      await ctx.reply('Assalomu alaykum! Ismingizni kiriting 🙂');
    });

    this.bot.on('message:text', async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const text = (ctx.message.text || '').trim();
      const s = this.sessions.get(chatId);

      if (s.step === 'READY') {
        if (text === '📅 Bugungi darslar') return this.handleToday(ctx, s);
        if (text === '🗓 Haftalik jadval') return this.handleWeekly(ctx, s);
        if (text === "💳 To'lov holati") return this.handlePayments(ctx, s);
        if (text === '🚪 Chiqish') return this.handleLogout(ctx, s);

        return ctx.reply('Menyudan tanlang 👇', { reply_markup: this.mainKb });
      }

      if (s.step === 'ASK_NAME') {
        s.firstName = text;
        s.step = 'ASK_PHONE';
        this.sessions.set(chatId, s);

        return ctx.reply('Endi telefon raqamingizni yuboring 👇', {
          reply_markup: this.contactKb,
        });
      }

      if (s.step === 'ASK_PHONE') {
        return ctx.reply('Iltimos telefonni kontakt orqali yuboring 👇', {
          reply_markup: this.contactKb,
        });
      }

      return ctx.reply('Boshlash uchun /start bosing');
    });

    this.bot.on('message:contact', async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const contact = ctx.message.contact;
      const s = this.sessions.get(chatId);

      if (s.step !== 'ASK_PHONE') {
        return ctx.reply('Boshlash uchun /start bosing');
      }

      const phoneNumber = normalizePhone(contact.phone_number);
      s.phoneNumber = phoneNumber;

      const tgid = String(ctx.from?.id || '');
      const tgUsername = ctx.from?.username;

      try {
        await this.api.registerStudent(s.firstName || 'Student', phoneNumber);

        const loginRes = await this.api.loginStudent(phoneNumber);
        const token = loginRes.data?.data?.token || loginRes.data?.token;
        if (!token) throw new Error('Login token topilmadi');
        s.token = token;

        const profile = await this.api.getProfile(token);
        const studentId =
          profile.data?.data?.id || profile.data?.data?.user?.id;
        if (studentId) s.studentId = studentId;

        if (s.studentId) {
          await this.api.updateStudentTg(s.studentId, token, tgid, tgUsername);
        }

        s.step = 'READY';
        this.sessions.set(chatId, s);

        await ctx.reply('✅ Muvaffaqiyatli ulandingiz! Menyu 👇', {
          reply_markup: this.mainKb,
        });
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Xatolik';
        const status = e?.response?.status;

        if (status === 409) {
          try {
            const loginRes = await this.api.loginStudent(phoneNumber);
            const token = loginRes.data?.data?.token || loginRes.data?.token;
            if (!token) throw new Error('Login token topilmadi');
            s.token = token;

            const profile = await this.api.getProfile(token);
            const studentId =
              profile.data?.data?.id || profile.data?.data?.user?.id;
            if (studentId) s.studentId = studentId;

            if (s.studentId) {
              await this.api.updateStudentTg(
                s.studentId,
                token,
                tgid,
                tgUsername,
              );
            }

            s.step = 'READY';
            this.sessions.set(chatId, s);

            return ctx.reply('✅ Qayta ulandingiz! Menyu 👇', {
              reply_markup: this.mainKb,
            });
          } catch (e2: any) {
            this.logger.error(e2?.message || e2);
            return ctx.reply(
              "❌ Login bo'lmadi. /start dan qayta urinib ko'ring.",
            );
          }
        }

        this.logger.error(msg);
        return ctx.reply(
          `❌ Xatolik: ${msg}\n/start dan qayta urinib ko'ring.`,
        );
      }
    });
  }

  private async handleToday(ctx: Context, s: any) {
    if (!s.token || !s.phoneNumber)
      return ctx.reply('Iltimos /start orqali kiring.');

    try {
      const res = await this.api.todaySchedule(s.token, s.phoneNumber);
      const lessons = res.data?.data?.lessons || [];

      if (!lessons.length)
        return ctx.reply("Bugun dars yo'q ✅", { reply_markup: this.mainKb });

      const lines = lessons.map((l: any) => {
        const time = `${fmtDate(l.startTime)} - ${fmtDate(l.endTime)}`;
        const teacher = l.teacherName || "O'qituvchi";
        const name = l.name || l.subject || 'Dars';
        const meet = l.googleMeetLink ? `\n🔗 ${l.googleMeetLink}` : '';
        return `🕒 ${time}\n👨‍🏫 ${teacher}\n📘 ${name}${meet}`;
      });

      return ctx.reply(lines.join('\n\n'), { reply_markup: this.mainKb });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        return ctx.reply('Sessiya tugagan. /start orqali qayta kiring.');
      }
      return ctx.reply(
        "Serverdan jadvalni olib bo'lmadi. Keyinroq urinib ko'ring.",
      );
    }
  }

  private async handleWeekly(ctx: Context, s: any) {
    if (!s.token || !s.phoneNumber)
      return ctx.reply('Iltimos /start orqali kiring.');

    try {
      const res = await this.api.weeklySchedule(s.token, s.phoneNumber);
      const lessons = res.data?.data?.lessons || [];

      if (!lessons.length)
        return ctx.reply("Kelgusi 7 kunda dars yo'q ✅", {
          reply_markup: this.mainKb,
        });

      const lines = lessons.map((l: any) => {
        const time = `${fmtDate(l.startTime)} - ${fmtDate(l.endTime)}`;
        const teacher = l.teacherName || "O'qituvchi";
        const name = l.name || l.subject || 'Dars';
        return `🕒 ${time} | 👨‍🏫 ${teacher} | 📘 ${name}`;
      });

      return ctx.reply(lines.join('\n'), { reply_markup: this.mainKb });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401)
        return ctx.reply('Sessiya tugagan. /start orqali qayta kiring.');
      return ctx.reply(
        "Serverdan jadvalni olib bo'lmadi. Keyinroq urinib ko'ring.",
      );
    }
  }

  private async handlePayments(ctx: Context, s: any) {
    if (!s.token || !s.phoneNumber)
      return ctx.reply('Iltimos /start orqali kiring.');

    try {
      const res = await this.api.payments(s.token, s.phoneNumber);
      const d = res.data?.data;

      const text =
        `💳 To'lov holati:\n` +
        `🔻 Qarz: ${d?.totalDebt ?? 0} so'm\n` +
        `✅ To'langan darslar: ${d?.paidLessons ?? 0}\n` +
        `❌ To'lanmagan darslar: ${d?.unpaidLessons ?? 0}\n` +
        `📌 Jami: ${d?.totalLessonCost ?? 0} so'm\n` +
        `💰 To'langan: ${d?.totalPaid ?? 0} so'm`;

      return ctx.reply(text, { reply_markup: this.mainKb });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401)
        return ctx.reply('Sessiya tugagan. /start orqali qayta kiring.');
      return ctx.reply(
        "To'lov holatini olib bo'lmadi. Keyinroq urinib ko'ring.",
      );
    }
  }

  private async handleLogout(ctx: Context, s: any) {
    if (!s.token || !s.phoneNumber) {
      this.sessions.clear(ctx.chat!.id);
      return ctx.reply('Siz allaqachon chiqqansiz. /start bosing.');
    }

    try {
      await this.api.logout(s.token, s.phoneNumber);
    } catch {}

    this.sessions.clear(ctx.chat!.id);
    return ctx.reply('🚪 Chiqdingiz. Qayta kirish uchun /start bosing.', {
      reply_markup: { remove_keyboard: true },
    });
  }

  private startCron() {
    const botSecret = process.env.BOT_SECRET;

    if (!botSecret) {
      this.logger.warn("BOT_SECRET env yo'q. Reminder cron ishlamaydi.");
      return;
    }

    const sent = new Set<string>();

    cron.schedule('* * * * *', async () => {
      try {
        const res = await this.api.upcomingLessons(botSecret, 30);
        const lessons = res.data?.data || [];

        for (const l of lessons) {
          const tgid = l?.student?.tgid || l?.student?.tgId;
          if (!tgid) continue;

          const key = `${l.id}:${tgid}:30`;
          if (sent.has(key)) continue;

          const text =
            `⏰ Eslatma: 30 daqiqadan keyin dars!\n` +
            `🕒 ${fmtDate(l.startTime)}\n` +
            `👨‍🏫 ${l.teacher?.fullName || "O'qituvchi"}\n` +
            `📘 ${l.name || 'Dars'}\n` +
            (l.googleMeetLink ? `🔗 ${l.googleMeetLink}` : '');

          await this.bot.api.sendMessage(String(tgid), text);
          sent.add(key);
        }

        if (sent.size > 5000) sent.clear();
      } catch (e: any) {
        this.logger.error(`Reminder cron error: ${e?.message || e}`);
      }
    });

    this.logger.log('Reminder cron started: every minute');
  }
}
