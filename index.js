const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Telegram Bot Token
const botToken = 'YOUR_BOT_TOKEN'; // Replace with your bot token
const bot = new TelegramBot(botToken, { polling: true });

// News API Key and URL
const newsApiKey = 'YOUR_NEWS_API_KEY'; // Replace with your News API key
const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`;

// Object to store users who have started the bot
const users = {};

// Function to fetch news and send them to users one by one
const sendNewsToUsers = async () => {
    try {
        const response = await axios.get(newsApiUrl);
        const articles = response.data.articles.slice(0, 5); // Get the first 5 articles

        // Sending news to each user who started the bot
        Object.keys(users).forEach(async (userId) => {
            for (const article of articles) {
                const newsText = `${article.title}\n${article.url}`;
                await new Promise((resolve) => {
                    setTimeout(() => {
                        bot.sendMessage(userId, newsText);
                        resolve();
                    }, 1000); // Adjust the delay time (in milliseconds) between each article here
                });
            }
        });
    } catch (error) {
        console.error('Error fetching/sending news:', error);
    }
};

// Sending news every minute
setInterval(sendNewsToUsers, 60000);

// Handling '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Save the user who started the bot
    users[chatId] = true;

    const startMsg = `
Welcome to the News Bot!

I'll keep you updated with the latest news every minute.

For any queries or feedback, feel free to contact the developer.
`;

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: 'Contact Developer',
                    callback_data: 'contact_developer'
                }
            ]
        ]
    };

    bot.sendMessage(chatId, startMsg, { reply_markup: JSON.stringify(keyboard) });
});

// Handling button callback
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'contact_developer') {
        bot.sendMessage(chatId, 'You can contact the developer here: https://t.me/harshitethic');
    }
});
