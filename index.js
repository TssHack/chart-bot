const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7000850548:AAHm8y3bG6LGm0l1agzXfhpyR4gDGceB5NI';
const bot = new TelegramBot(token, { polling: true });

// ======= START =======
bot.onText(/\/start/, (msg) => {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'لیست ارزها', callback_data: 'show_symbols' },
          { text: 'ارتباط با نویسنده', url: 'https://t.me/abj0o' }
        ]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, 'به ربات چارت خوش آمدید!', opts);
});

// ======= دکمه لیست ارزها =======
bot.on('callback_query', async (cb) => {
  const chatId = cb.message.chat.id;

  if (cb.data === 'show_symbols') {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
      const symbols = response.data.symbols
        .filter(s => s.status === 'TRADING')
        .map(s => s.symbol)
        .slice(0, 200); // فقط 200 تا اول

      const chunks = symbols.reduce((acc, symbol, index) => {
        const chunkIndex = Math.floor(index / 50);
        if (!acc[chunkIndex]) acc[chunkIndex] = [];
        acc[chunkIndex].push(symbol);
        return acc;
      }, []);

      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk.join(' | '), { parse_mode: 'Markdown' });
      }

      bot.sendMessage(chatId, 'میتونی نماد رو کپی و ارسال کنی تا چارتش برات بیاد.');
    } catch (err) {
      bot.sendMessage(chatId, 'خطا در دریافت لیست ارزها!');
    }
  }
});

// ======= پیام‌های کاربران =======
bot.on('message', async (msg) => {
  const text = msg.text.trim();
  const chatId = msg.chat.id;

  if (text === '/start') return;

  if (text === '/help' || text === 'راهنما') {
    return bot.sendMessage(chatId, `
نحوه استفاده از ربات:

- برای دریافت چارت یک ارز، فقط نماد اون رو بفرست:
مثال:
\`NOTUSDT\`

- برای چارت با تایم‌فریم دلخواه:
\`NOTUSDT 15m\`
\`BTCUSDT 1h\`

- برای دیدن لیست ارزها، از دکمه "لیست ارزها" استفاده کن.

- ارتباط با من: @abj0o
`, { parse_mode: 'Markdown' });
  }

  // بررسی ورودی کاربر
  const [symbolRaw, timeframeRaw] = text.split(' ');
  const symbol = symbolRaw.toUpperCase();
  const timeframe = timeframeRaw || '1h';

  const chartUrl = `https://chart-ehsan.onrender.com/chart?symbol=${symbol}&timeframe=${timeframe}`;

  bot.sendPhoto(chatId, chartUrl, {
    caption: `چارت ${symbol} - تایم‌فریم ${timeframe}`
  });
});
