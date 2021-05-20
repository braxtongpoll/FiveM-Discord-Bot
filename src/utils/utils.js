const chalk = require('chalk');
const { MessageEmbed, MessageAttachment } = require('discord.js');
let embed = new MessageEmbed();
const config = require(`../../config`);
const { query } = require('gamedig');
const { level } = require('chalk');
const { get } = require('mongoose');
let current = {};

function colorize(color, content) {
    switch (color, content) {
        case "red":
            return chalk.red(content)
        case "green":
            return chalk.green(content)
        case "yellow":
            return chalk.yellow(content)
        case "blue":
            return chalk.blue(content)
        case "cyan":
            return chalk.cyan(content)
        default:
            return chalk.green(content);
    };
};

function permissionCheck(message, permission) {
    var bool = false;
    if (message.member.hasPermission(permission)) bool = true;
    if (bool == false) {
        var embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setDescription(`You're missing the permission ` + '`' + permission + '`' + ` to run this command.`)
        message.reply(embed);
    }
    return new Promise(async(resolve, reject) => {
        try {
            resolve(bool);
        } catch (e) {
            reject(new Error(e));
        };
    });
};

async function awaitReply(client, message, text, limit = 60000, mention = false, useDM = false) {
    const filter = m => m.author.id === message.author.id;
    embed.setColor(client.config.embed_color);
    embed.setDescription(text);

    if (useDM == true) {
        await message.author.send(embed);
    }
    await message.channel.send(embed);
    try {
        const collected = await message.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
        if (mention == true) {
            return collected.first().mentions;
        }
        return collected.first().content;
    } catch (e) {
        return null;
    }
};

var statusVar = 0;

async function status(client) {
    if (statusVar == 0) {
        let array = [];
        await client.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(member => {
                if (!array.includes(member.id)) array.push(member.id);
            });
        });
        client.user.setPresence({
            activity: {
                type: `WATCHING`,
                name: `${array.length} Members`
            },
            status: `DND`
        });
        statusVar = 1;
    } else {
        client.user.setPresence({
            activity: {
                type: `WATCHING`,
                name: `${client.guilds.cache.size} Servers`
            },
            status: `DND`
        });
        statusVar = 0;
    }
};

function findChannel(message, args) {
    let channel;
    if (message.mentions.channels.first()) return message.mentions.channels.first();
    channel = message.guild.channels.cache.find(c => c.id === args[0]);
    if (channel) return channel;
    return undefined;
};

function findRole(message, args) {
    let role;
    if (message.mentions.roles.first()) return message.mentions.roles.first();
    role = message.guild.roles.cache.find(c => c.id === args[0]);
    if (role) return role;
    return undefined;
};

function missing(message, args) {
    let embed = new MessageEmbed()
        .setFooter(message.guild.name, message.guild.iconURL())
        .setColor(config.color)
        .setDescription(`Your arguments are missing ` + '`' + args + '`' + ` to execute.`)
    message.reply(embed);
};

async function fivemcount(guild, id, ip, port) {
    let chan = await guild.channels.cache.find(c => c.id === id);
    if (!chan) return;
    if (!ip) return;
    if (!port) return;
    query({
        type: 'fivem',
        host: ip,
        port: port,
        maxAttempts: '4'
    }).then((s) => {
        let online = s.players.length;
        let max = s.maxplayers;
        let name = `Players Online: ` + online + `/${max}`;
        if (chan.name !== name) chan.edit({ name: name });
    }).catch((e) => {
        name = `Server Offline`;
        if (chan.name !== name) chan.edit({ name: name });
    });
};

function stickyControl(message, sticky) {
    message.channel.messages.fetch({ limit: 3 }).then(collected => {
        collected.forEach(msg => {
            if (msg.content.includes(sticky)) msg.delete();
        })
        message.channel.send('`📌`' + `__***Sticky Message, Read Before Typing***__` + '`📌`\n' + sticky);
    });
};

async function commandControl(client, message, prefix) {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase()
    const cmd = client.commands.get(command);
    if (cmd) {
        try {
            cmd.run(client, message, args)
        } catch (e) {
            return console.log(error, `[NON-FATAL]: ${e}`)
        };
    };
};

function levelControl(client, message, levels) {
    if (current[message.guild.id]) {
        current[message.guild.id][message.author.id] = true;
    } else {
        current[message.guild.id] = {
            [message.author.id]: true
        };
    };
    if (levels[message.author.id]) {
        levels[message.author.id].xp += client.config.levels.xpPerMessage;
        if (levels[message.author.id].xp >= (levels[message.author.id].lvl + 1) * client.config.levels.xpNeededPerLevel) {
            levels[message.author.id].lvl += 1;
            levels[message.author.id].xp = 0;
        }
        levels[message.author.id].messages += 1;
    } else {
        levels[message.author.id] = {
            xp: client.config.levels.xpPerMessage,
            lvl: 0,
            messages: 1
        };
    };
    client.docUpdate(message, `levels`, levels);
};

async function globalLogging(client, message) {
    let date = new Date();
    let tt = await `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    let embed = new MessageEmbed()
        .setFooter(`Global Logging System | ${tt}`, client.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        .setColor(client.config.color)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        .setDescription(message.content)
        .addFields({
            name: `Guild`,
            value: message.guild.name,
            inline: true
        }, {
            name: `Channel`,
            value: message.channel,
            inline: true
        }, {
            name: `Direct Link`,
            value: `[Click here](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`,
            inline: true
        })
    var image;
    try { var image = new MessageAttachment(message.attachments.array()[0].proxyURL) } catch (e) {};
    try { embed.setImage(image.attachment) } catch (e) {}
    let id;
    switch (message.guild.id) {
        case `815314177446510592`:
            id = `819046471311687743`; // State Police
            break;
        case `815314124174131200`:
            id = `819046493163880448`; // Sheriff
            break;
        case `815355940446142524`:
            id = `819046511584477215`; // Fire & Rescue
            break;
        case `814333257440165918`:
            id = `819046525312696320`; // RP Main
            break;
        case "814978419137577041":
            id = "822374091171299368"; // Staff Server
            break;
        case "822372215554441256":
            id = "822373900000165898"; // DOJ
            break;
        case "821633884185165834":
            id = "822373833066676284"; // Police
            break;
        case "822719154414157824":
            id = "822730604445564958"; // Main Network
            break;
        case "825442825629990923":
            id = "827671757859192843"; // Comms
            break
        case "822732801245577268":
            id = "827671802188529674"; // Minecraft
        case "823917759515328583":
            id = "827671813387583489"; // Rust
        default:
            id = `819047441974034432`
    };
    let logs = await client.channels.cache.find(c => c.id === id);
    if (!logs) return console.log(`Global Logging Failed.`);
    logs.send(embed);
};

async function dmGlobalLogging(client, message) {
    let date = new Date();
    let tt = await `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    let embed = new MessageEmbed()
        .setFooter(`Global Logging System | ${tt}`, client.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        .setColor(client.config.color)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        .setTimestamp()
        .setDescription(message.content)
        .addFields({
            name: `Channel`,
            value: `DM's with BackwoodRP Bot`,
            inline: true
        })
    var image;
    try { var image = new MessageAttachment(message.attachments.array()[0].proxyURL) } catch (e) {};
    try { embed.setImage(image.attachment) } catch (e) {}
    let logs = await client.channels.cache.find(c => c.id === `819048750122532864`);
    if (!logs) return console.log(`Global Logging Failed.`);
    logs.send(embed);
};

async function getDate() {
    let date = new Date();
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

function fetchUser(client, id) {
    client.users.fetch(id).then(user => {
        if (user) return user;
        return id;
    }).catch(e => {
        return id;
    });
};

function checkStreamers(guild, res) {
    if (!res) return;
    if (!res.twitchRole) return;
    if (!res.twitchKeyWords.length) return;
    guild.members.cache.forEach(async(member) => {
        member.user.presence.activities.forEach(activity => {
            if (activity.name == "Twitch") {
                let array = res.twitchKeyWords;
                let yes = false;
                array.forEach(thing => {
                    if (activity.details.toLowerCase().includes(thing)) {
                        yes = true;
                        if (!member.roles.cache.has(res.twitchRole)) member.roles.add(res.twitchRole).catch(() => {});
                    };
                });
                if (yes == false) {
                    if (member.roles.cache.has(res.twitchRole)) member.roles.remove(res.twitchRole).catch(() => {});
                }
            } else {
                if (member.roles.cache.has(res.twitchRole)) member.roles.remove(res.twitchRole).catch(() => {});
            }
        });
    });
};
exports.checkStreamers = checkStreamers;
exports.fetchUser = fetchUser;
exports.getDate = getDate;
exports.levelControl = levelControl;
exports.dmGlobalLogging = dmGlobalLogging;
exports.globalLogging = globalLogging;
exports.commandControl = commandControl;
exports.stickyControl = stickyControl;
exports.fivemcount = fivemcount
exports.findRole = findRole;
exports.status = status;
exports.missing = missing;
exports.findChannel = findChannel;
exports.awaitReply = awaitReply;
exports.permissionCheck = permissionCheck;
exports.colorize = colorize;