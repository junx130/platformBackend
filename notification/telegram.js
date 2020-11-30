const TelegramBot = require('node-telegram-bot-api');

const token = process.env.telegramToken;
// const token = '1246298645:AAFbT7OcI3oduoNqgof_xHSlFwMod5toBD4';

console.log(token);
// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, {polling: true});

function prgTelegram(){    
    // bot.on('message', (msg) => {
    //     const chatId = msg.chat.id;
    //     console.log("Chat ID",chatId);
    //     // send a message to the chat acknowledging receipt of their message
    //     bot.sendMessage(chatId, 'Received your message');
    // });
}


sendTelegramMsg=(teleID, msg)=>{
    // bot.sendMessage(teleID, msg);
}

exports.sendNotifyMsg = sendTelegramMsg;
exports.prgTelegram = prgTelegram;