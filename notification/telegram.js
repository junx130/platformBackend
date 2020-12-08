const TelegramBot = require('node-telegram-bot-api');

const token = process.env.telegramToken;

// console.log(token);
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

function prgTelegram(){        
    // const bot = new TelegramBot(token, {polling: true});

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        // console.log(msg);
        console.log("Chat ID",chatId);
        if(msg.text.toUpperCase() ==="CHAT ID"){
            bot.sendMessage(chatId, chatId);
            return
        }
        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(chatId, 'Received your message');
    });
}

sendTelegramMsg=(teleID, msg)=>{
    bot.sendMessage(teleID, msg);
}

exports.sendNotifyMsg = sendTelegramMsg;
exports.prgTelegram = prgTelegram;