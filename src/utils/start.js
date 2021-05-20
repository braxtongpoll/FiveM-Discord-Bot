const carden = require(`carden`);
const chalk = require('chalk');
const figlet = require(`figlet`);
const { readdir } = require('fs');
const { join } = require('path');
module.exports = {
    async prompt(client) {
        var djsVer = require(`discord.js`).version;
        var operating;
        if (process.platform == "aix") operating = "IBM AIX";
        if (process.platform == "darwin") operating = "Apple Darwin";
        if (process.platform == "freebsd") operating = "FreeBSD";
        if (process.platform == "linux") operating = "Linux/Linux Distro";
        if (process.platform == "openbsd") operating = "OpenBSD";
        if (process.platform == "sunos") operating = "SunOS";
        if (process.platform == "win32") operating = "Windows";
        else operating = "Unknown";
        var db_name = await client.config.database.split(`.net/`)[1];
        var totalEvents;
        readdir(join(__dirname, "../", "../", "events/"), (err, files) => {
            totalEvents = files.length;
        });
        figlet.text(`Xen    Development`, { width: '500', }, async function(err, art) {
            if (err) return;
            var box = carden(art, chalk.black(`Logged in as ${client.user.tag} (${chalk.green(client.user.id)})\n\nCommands: ${chalk.black(global.commands)}\nAliases: ${chalk.black(global.aliases)}\nEvents: ${chalk.black(totalEvents)}\nCreated By: ${chalk.black("Xen Development")}\nFor support ${chalk.black("https://discord.xendev.us")}\n\nOperating System: ${operating}\nProcess PID: ${process.pid}\nDiscord.js Version: ${djsVer}\nNode Version: ${process.version.replace("v","")}\nDatabase: ${chalk.green(db_name)}`), { borderColor: "blue", borderStyle: "bold", padding: 1, backgroundColor: "blue", header: { backgroundColor: "black" }, content: { backgroundColor: "blue" } });
            return console.log(box);
        });
    }
};