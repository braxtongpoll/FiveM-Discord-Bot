const chalk = require('chalk');
const moment = require('moment');
const eHan = require(`./Error`);
class Logger {
    static log(content, type = "log") {
        const time = `[${moment().format("MM-DD-YYYY HH:mm")}]`;
        var action = content.toString().split('\n')[0];
        if (content.toString().includes("Missing Permissions")) {
            return console.log(`${time} ${chalk.bgMagenta("PERMISSIONS")} ${action}\nMissing permissions to execute.`)
        }
        if (content.toString().includes("Cannot send messages to this user")) return Logger.log(`${action}\nI cannot DM the user.`, "perms");
        switch (type) {
            case "log":
                {
                    return console.log(`${time} ${chalk.bgBlue(type.toUpperCase())} ${content}`)
                }
            case "warn":
                {
                    return console.log(`${time} ${chalk.bgYellow(type.toUpperCase())} ${content}`)
                }
            case "error":
                {
                    new eHan.handleE(content)
                    return console.log(`${time} ${chalk.bgRed(type.toUpperCase())} ${content}`)
                }
            case "debug":
                {
                    return console.log(`${time} ${chalk.green(type.toUpperCase())} ${content}`)
                }
            case "ready":
                {
                    return console.log(`${time} ${chalk.bgGreen(type.toUpperCase())} ${content}`)
                }
            case "sucess":
                {
                    return console.log(`${time} ${chalk.bgGreen(type.toUpperCase())} ${content}`)
                }
            case "perms":
                {
                    return console.log(`${time} ${chalk.bgMagenta(type.toUpperCase())} ${content}`)
                }
            default:
                throw new TypeError(`Logger type must be specified [log, warn, error, debug, ready, success]`)
        }
    }
    static error(content) {
        return this.log(content, "error")
    }
    static warn(content) {
        return this.log(content, "warn")
    }
    static debug(content) {
        return this.log(content, "debug")
    }
}

module.exports = Logger;