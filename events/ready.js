const mongoose = require(`mongoose`);
const { MessageEmbed } = require(`discord.js`);
const { prompt } = require(`../src/utils/start.js`)
module.exports = client => {
    initDB(client);
    if (client.config.useVerificationChecker == true) {
        client.guilds.cache.forEach(guild => {
            if (!client.config.Verified_Guilds.includes(guild.id)) {
                guild.leave();
                client.logger.log(`Invalid guild found ${guild.name}(${guild.id})`, `warn`);
            };
        });
    };
    setInterval(() => {
        client.utils.status(client);
        client.guilds.cache.forEach(async function(guild) {
            client.db.findById(guild.id, function(err, res) {
                client.utils.checkStreamers(guild, res)
                if (!res) return client.logger.log("Weird Guild, " + guild.name, "warn")
                client.utils.fivemcount(guild, res.fiveMDisplay, res.ip, res.port);
                let muteRole = guild.roles.cache.find(r => r.id === res.muteRole);
                let modLogs = guild.channels.cache.find(c => c.id === res.modLogs);
                let strikeLogs = guild.channels.cache.find(c => c.id === res.strikeLogs);
                if (res.muteCases) {
                    Object.keys(res.muteCases).forEach(user => {
                        if (res.muteCases[user] == null) return;
                        let member = guild.members.cache.find(m => m.id === user);
                        if (!member) {
                            res.muteCases[user] = undefined;
                        } else {
                            res.muteCases[user] = res.muteCases[user] - 10000;
                        };
                        if (res.muteCases[user] <= 10000) {
                            res.muteCases[user] = undefined;
                            if (muteRole) member.roles.remove(muteRole);
                            let embed = new MessageEmbed()
                                .setFooter(guild.name, guild.iconURL())
                                .setColor(client.config.color)
                                .setAuthor(`Unmute | Case #${res.caseNumber}`, client.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                                .setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Moderator**: ${client.user.username} (${client.user.id})\n**• Reason**: Duration complete.`)
                            if (modLogs) modLogs.send(embed)
                            client.db.findByIdAndUpdate(guild.id, {
                                muteCases: res.muteCases,
                                caseNumber: res.caseNumber + 1
                            }).then(() => {});
                        };
                    });
                };
                if (res.strikes) {
                    Object.keys(res.strikes).forEach(async(user) => {
                        let member = guild.members.cache.find(m => m.id === user);
                        if (!member) {
                            res.strikes[user] = {};
                            client.docUpdate(message, `strikes`, res.strikes);
                        } else {
                            await Object.keys(res.strikes[user]).forEach(cNum => {
                                if ((res.strikes[user][cNum].active == true) && (res.strikes[user][cNum].duration !== undefined)) {
                                    res.strikes[user][cNum].duration = res.strikes[user][cNum].duration - 10000;
                                    if (res.strikes[user][cNum].duration <= 10000) {
                                        let link = `https://discord.com/channels/${guild.id}/${res.strikes[user][cNum].channel}/${res.strikes[user][cNum].msg}`;
                                        let sEmbed = new MessageEmbed()
                                            .setFooter(guild.name, guild.iconURL())
                                            .setColor(client.config.color)
                                            .setAuthor(`Strike Removal | Case #${cNum}`, client.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                                            .setDescription(`[Strike Found Here](${link})\n**• Victim**: ${member.user.username} (${member.id})\n**• Supervisor**: ${client.user.username} (${client.user.id})\n**• Reason**: Duration complete.`)
                                        res.strikes[user][cNum].active = false;
                                        if (strikeLogs) strikeLogs.send(sEmbed);
                                    };
                                };
                            });
                            client.db.findByIdAndUpdate(guild.id, {
                                strikes: res.strikes
                            }).then(() => {});
                        };
                    });
                };
            });
        });
    }, 10000);
    prompt(client);
    client.documentCheck();
};

function initDB(client) {
    mongoose.connect(client.config.database, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    }, err => {
        if (err) return client.logger.log("Database error.\n" + err.stack, "error");
    });
}
err => {
    if (err) console.log(`Failed to init mongoDB ${err.stack}`)
}