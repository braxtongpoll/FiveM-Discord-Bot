const Logger = require(`./Logger`);
const config = require(`../../config`);
const moment = require('moment');
const { appendFile } = require('fs');
const path = require('path');
class handleE {
    constructor(content) {
        if (config.logErrors !== true) return console.lo(content)

        try {
            const head = `[${moment().format("MM-DD-YYYY HH:mm")}]`;
            return appendFile(path.join(__dirname, "../", "local/", "errors.txt"), head + `\n${content}` + "\n", (err) => {
                if (err) return console.lo(`Failed to add error to the log.\n${err.stack}`, "error");
                return console.log(`Error wrote to the local log, located @ local/errors.txt`, "success")
            })
        } catch (e) {
            return console.log(`Failed to add error to the log.\n${e.stack}`, "error");
        }
    }
}

exports.handleE = handleE