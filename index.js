const axios = require('axios');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('7000850548:AAHm8y3bG6LGm0l1agzXfhpyR4gDGceB5NI');

bot.start((ctx) => {
  ctx.reply('به ربات چارت خوش اومدی!', Markup.inlineKeyboard([
    [Markup.button.url('ارتباط با نویسنده', 'https://t.me/username_you')]
  ]));
});

// راهنما
bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(`
📈 *راهنما:*

- فقط نماد ارز رو ارسال کن:
\`BTCUSDT\`

- برای تایم‌فریم دلخواه:
\`BTCUSDT 15m\`
\`ETHUSDT 1h\`

پیش‌فرض تایم‌فریم: \`1h\`
`);
});

// دریافت پیام و پاسخ با چارت
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const [symbolRaw, timeframeRaw] = text.split(' ');
  const symbol = symbolRaw.toUpperCase();
  const timeframe = timeframeRaw || '1h';

  const chartUrl = `https://chart-ehsan.onrender.com/chart?symbol=${symbol}&timeframe=${timeframe}`;

  try {
    await ctx.replyWithPhoto({ url: chartUrl }, {
      caption: `چارت ${symbol} - تایم‌فریم ${timeframe}`,
      reply_to_message_id: ctx.message.message_id
    });
  } catch (err) {
    ctx.reply('خطا در دریافت چارت! لطفاً ورودی رو بررسی کن.');
  }
});

bot.launch();
