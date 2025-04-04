const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7000850548:AAHm8y3bG6LGm0l1agzXfhpyR4gDGceB5NI';
const bot = new TelegramBot(token, { polling: true });

// مرحله 1: دریافت اسم ارز
bot.on('inline_query', async (query) => {
  const input = query.query.toUpperCase().replace(/\s/g, '');
  if (!input || input.length < 3) return;

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const results = [{
    type: 'article',
    id: 'select_timeframe',
    title: `انتخاب تایم‌فریم برای ${input}`,
    input_message_content: {
      message_text: `لطفاً یکی از تایم‌فریم‌ها را برای ${input} انتخاب کنید:`
    },
    reply_markup: {
      inline_keyboard: [
        timeframes.map(tf => ({
          text: tf,
          callback_data: `chart|${input}|${tf}`
        }))
      ]
    }
  }];

  bot.answerInlineQuery(query.id, results);
});

// مرحله 2: کاربر یکی از تایم‌فریم‌ها رو انتخاب می‌کنه
bot.on('callback_query', async (cbQuery) => {
  const data = cbQuery.data;
  if (!data.startsWith('chart|')) return;

  const [, symbol, timeframe] = data.split('|');
  const chartUrl = `https://chart-ehsan.onrender.com/chart?symbol=${symbol}&timeframe=${timeframe}`;

  // ارسال چارت به صورت عکس
  bot.sendPhoto(cbQuery.message.chat.id, chartUrl, {
    caption: `چارت ${symbol} - تایم‌فریم ${timeframe}`
  });

  // حذف دکمه‌ها بعد از انتخاب
  bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
    chat_id: cbQuery.message.chat.id,
    message_id: cbQuery.message.message_id
  });

  bot.answerCallbackQuery(cbQuery.id);
});
