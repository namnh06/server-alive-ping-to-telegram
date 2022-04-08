import fs from 'fs';
import path from 'path';
import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import os from 'os-utils';

interface MyContext extends Context {
    myProp?: string
    myOtherProp?: number
}

const paramsFileName: string = process.env.PARAMS || 'default.json';
const params = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, `../params/${paramsFileName}`),
        'utf-8',
    ),
);

const control = { isRunning: true, interval: params.interval };
const telegramBotToken: string = process.env.BOT_TOKEN || '';

async function pingAlive() {
    const bot = new Telegraf<MyContext>(telegramBotToken);
    let message: string = '';
    await axios.get('https://api64.ipify.org/').then(function (response) {
        // handle success
        switch (response.data) {
            case process.env.AWS_IP:
                message += `Service: ${process.env.AWS_SERVICE} - ${process.env.AWS_MESSAGE} - `;
                break;
            case process.env.ORACLE_IP_1:
                message += `Service: ${process.env.ORACLE_SERVICE} - ${process.env.ORACLE_MESSAGE_1} - `;
                break;
            case process.env.ORACLE_IP_2:
                message += `Service: ${process.env.ORACLE_SERVICE} - ${process.env.ORACLE_MESSAGE_2} - `;
                break;
            case process.env.ORACLE_IP_3:
                message += `Service: ${process.env.ORACLE_SERVICE} - ${process.env.ORACLE_MESSAGE_3} - `;
                break;
            case process.env.ORACLE_IP_4:
                message += `Service: ${process.env.ORACLE_SERVICE} - ${process.env.ORACLE_MESSAGE_4} - `;
                break;
            case process.env.ORACLE_IP_5:
                message += `Service: ${process.env.ORACLE_SERVICE} - ${process.env.ORACLE_MESSAGE_5} - `;
                break;
            default:
                message += `Service: Unknow - `;
        }
        message += `IP: ${response.data}`;
    });

    os.cpuUsage(function (v) {
        // console.log('CPU Usage (%): ' + v);
        message += "\n" + `CPU Usage (%): ${v.toFixed(2)}% - `;
    });

    os.cpuFree(function (v) {
        // console.log('CPU Free:' + v);
        message += `CPU Free: ${v.toFixed(2)}% - 15m Load Average: ${os.loadavg(15)}`;
        message += "\n" + `Free memory/Total memory: ${os.freemem().toFixed(2)}/${os.totalmem().toFixed(2)} - `
            + `Free memory percentage: ${os.freememPercentage().toFixed(2)}%`;
        message += "\n" + `Uptime: ${(os.sysUptime() / 3600).toFixed(2)} hours`;
        message += "\n" + `I'm alive`;
        console.log(message);
        bot.telegram.sendMessage(process.env.CHANNEL_ID || '', message);
    });


    process.on('SIGINT', function () {
        console.log('Caught keyboard interrupt. End');
        control.isRunning = false;
        onExit(bot);
    });

    await new Promise(resolve => setTimeout(resolve, control.interval * 1000 * 60));
}

function startProcess() {
    if (control.isRunning) {
        pingAlive().finally(startProcess);
    }
}

async function onExit(bot: any) {
    console.log('Exiting ...');
    await new Promise(resolve => setTimeout(resolve, control.interval));
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
    process.exit();
}

process.on('unhandledRejection', function (err, promise) {
    console.error(
        'Unhandled rejection (promise: ',
        promise,
        ', reason: ',
        err,
        ').',
    );
});

startProcess();