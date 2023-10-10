// process.env.NTBA_FIX_319 = 1;

// const TelegramBot = require('node-telegram-bot-api');

// const token = process.env.telegramToken;

// const bot = new TelegramBot(token, {polling: true});

// function prgTelegram(){        
//     try {
//         bot.on('message', (msg) => {
//             const chatId = msg.chat.id;
//             if(msg.text.toUpperCase() ==="CHAT ID"){
//                 bot.sendMessage(chatId, chatId);
//                 return
//             }
//         });        
//     } catch (error) {
//         console.log("prgTelegram Error");
//         console.log(error.message);
//     }
// }

// sendTelegramMsg=async (teleID, msg)=>{
//     try {
//         await bot.sendMessage(teleID, msg);        
//     } catch (error) {
//         console.log("Err: sendTelegramMsg");
//         console.log(error.message);
//     }
// }

// exports.sendNotifyMsg = sendTelegramMsg;
// exports.prgTelegram = prgTelegram;