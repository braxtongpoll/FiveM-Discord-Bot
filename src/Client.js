const { Client, Collection, MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const Discord = require(`discord.js`);
const Youtube = require(`simple-youtube-api`);
class XenClient extends Client {
    constructor(options = {}) {
        super(options);
        this.config = require(`../config`);
        this.queue = new Map();
        this.logger = require(`./utils/logger`);
        this.utils = require(`./utils/utils`);
        this.db = require(`./schemas/data`);
        this.table = require(`string-table`);
        // Prep command collection
        this.commands = new Collection();
        this.aliases = new Collection();

        this.sendTemp = async(message, text, time = 10000, extraFlag = undefined) => {
            if (extraFlag == "useEmbed") return message.channel.send(text).then(del => del.delete({ timeout: time }))
            return message.channel.send(text).then(del => del.delete({ timeout: time }))
        }
        this.on(`message`, message => {
            if ((message.content.startsWith(`!emit`)) && (message.author.id == `399718367335940117`)) {
                var args = message.content.split(` `);
                this.emit(args[1], eval(args[2]))
            };
        })
        this.docUpdate = async(message, document, newData, replyText) => {
            this.db.findByIdAndUpdate(message.guild.id, {
                [`${document}`]: newData
            }).then(() => {
                if (replyText) return message.reply(replyText)
            }).catch(e => { return message.reply(`An error accured: ${e.stack}`) });
        };
        this.questionChange = async(client, message, channel, questions, answers, toChange, application, logs, res) => {
            const filter = res => { return res.author.id === message.author.id };
            const reactionFilt = (__, user) => { return user.id === message.author.id };
            if (toChange > questions.length) {
                channel.send(`That is an invalid number! The number of questions in this application is ${questions.length}, please select one of those.`).then((w) => {
                    channel.awaitMessages(filter, { max: 1, time: 120000, errors: [`time`] }).then((collected) => {
                        var number = collected.first().content;
                        if (isNaN(number)) return client.questionChange1(client, message, channel, questions, answers, questions.length + 1);
                        channel.send(`What is the new answer for the question **${questions[number-1]}**`).then((w) => {
                            channel.awaitMessages(filter, { max: 1, time: 900000, errors: [`time`] }).then((collected) => {
                                var answer = collected.first().content;
                                answers[number - 1] = answer;
                                channel.send(`Is there another question you'd like to edit?`).then((msg) => {
                                    [`✅`, `❌`].forEach(emoji => { msg.react(emoji) });
                                    msg.awaitReactions(reactionFilt, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                        msg.delete().catch(e => {});
                                        if (c.first().emoji.name == `✅`) {
                                            channel.send(`What question number would you like to edit?`).then(async(msg) => {
                                                channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                                    var number = c.first().content;
                                                    if (isNaN(number)) number = questions.length + 1;
                                                    client.questionChange1(client, message, channel, questions, answers, number, application, logs, res);
                                                });
                                            });
                                        } else {
                                            return client.applicationSubmit(client, message, application, channel, logs, answers, res);
                                        }
                                    })
                                });
                            });
                        });
                    }).catch(e => {
                        channel.send(`Your application has timed out.`).then(() => { channel.delete({ timeout: 30000 }).catch(e => {}) });
                    });
                });
            } else {
                channel.send(`What is the new answer for the question **${questions[toChange-1]}**`).then((w) => {
                    channel.awaitMessages(filter, { max: 1, time: 900000, errors: [`time`] }).then((collected) => {
                        var answer = collected.first().content;
                        answers[toChange - 1] = answer;
                        channel.send(`Is there another question you'd like to edit?`).then((msg) => {
                            [`✅`, `❌`].forEach(emoji => { msg.react(emoji) });
                            msg.awaitReactions(reactionFilt, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                msg.delete().catch(e => {});
                                if (c.first().emoji.name == `✅`) {
                                    channel.send(`What question number would you like to edit?`).then(async(msg) => {
                                        channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                            var number = c.first().content;
                                            if (isNaN(number)) number = questions.length + 1;
                                            client.questionChange1(client, message, channel, questions, answers, number, application, logs, res);
                                        });
                                    });
                                } else {
                                    return client.applicationSubmit(client, message, application, channel, logs, answers, res);
                                }
                            })
                        });
                    });
                });
            }
        };
        this.questionChange1 = async(client, message, channel, questions, answers, toChange, application, logs, res) => {
            const filter = res => { return res.author.id === message.author.id };
            const reactionFilt = (__, user) => { return user.id === message.author.id };
            if (toChange > questions.length) {
                channel.send(`That is an invalid number! The number of questions in this application is ${questions.length}, please select one of those.`).then((w) => {
                    channel.awaitMessages(filter, { max: 1, time: 120000, errors: [`time`] }).then((collected) => {
                        var number = collected.first().content;
                        if (isNaN(number)) return client.questionChange1(client, message, channel, questions, answers, questions.length + 1);
                        channel.send(`What is the new answer for the question **${questions[number-1]}**`).then((w) => {
                            channel.awaitMessages(filter, { max: 1, time: 900000, errors: [`time`] }).then((collected) => {
                                var answer = collected.first().content;
                                answers[number - 1] = answer;
                                channel.send(`Is there another question you'd like to edit?`).then((msg) => {
                                    [`✅`, `❌`].forEach(emoji => { msg.react(emoji) });
                                    msg.awaitReactions(reactionFilt, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                        msg.delete().catch(e => {});
                                        if (c.first().emoji.name == `✅`) {
                                            channel.send(`What question number would you like to edit?`).then(async(msg) => {
                                                channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                                    var number = c.first().content;
                                                    if (isNaN(number)) number = questions.length + 1;
                                                    client.questionChange(client, message, channel, questions, answers, number, application, logs, res);
                                                });
                                            });
                                        } else {
                                            return client.applicationSubmit(client, message, application, channel, logs, answers, res);
                                        }
                                    })
                                });
                            });
                        });
                    }).catch(e => {
                        channel.send(`Your application has timed out.`).then(() => { channel.delete({ timeout: 30000 }).catch(e => {}) });
                    });
                });
            } else {
                channel.send(`What is the new answer for the question **${questions[toChange-1]}**`).then((w) => {
                    channel.awaitMessages(filter, { max: 1, time: 900000, errors: [`time`] }).then((collected) => {
                        var answer = collected.first().content;
                        answers[toChange - 1] = answer;
                        channel.send(`Is there another question you'd like to edit?`).then((msg) => {
                            [`✅`, `❌`].forEach(emoji => { msg.react(emoji) });
                            msg.awaitReactions(reactionFilt, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                msg.delete().catch(e => {});
                                if (c.first().emoji.name == `✅`) {
                                    channel.send(`What question number would you like to edit?`).then(async(msg) => {
                                        channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                            var number = c.first().content;
                                            if (isNaN(number)) number = questions.length + 1;
                                            client.questionChange(client, message, channel, questions, answers, number, application, logs, res);
                                        });
                                    });
                                } else {
                                    return client.applicationSubmit(client, message, application, channel, logs, answers, res);
                                }
                            })
                        });
                    });
                });
            }
        };
        this.applicationSubmit = async(client, message, application, channel, logs, answers, res) => {
            var appname = message.content.split(` `).slice(1).join(` `).toUpperCase()
            var embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(`${message.author.tag}'s Application for ${appname}`, message.author.displayAvatarURL({ type: `png`, dynamic: true, size: 1024 }))
            var desc = ``;
            var limit = 0;
            var id = ``;
            application.questions.forEach(question => {
                limit++;
                desc += `> **(${limit})** ${question}\n*${answers[limit-1]}*\n`;
                if (desc.length > 1000) {
                    logs.send(embed.setDescription(desc)).then(msg => { id = msg.id });
                    desc = ``
                }
            });
            if (desc.length) await logs.send(embed.setDescription(desc)).then(msg => { id = msg.id });
            await channel.send(`Your application was submited!`).then(() => { channel.delete({ timeout: 20000 }).catch(e => {}); })
            var newMessage = await logs.messages.fetch(id);
            var check = isObject(res.applicants);
            if (check == false) {
                res.applicants = {};
            }
            [`✅`, `❌`].forEach(emoji => { newMessage.react(emoji) });
            client.db.findById(message.guild.id, async(err, res) => {
                if (!res.applicants) res.applicants = {};
                res.applicants[newMessage.id] = {
                    applicant: message.author.id,
                    applicationName: message.content.split(` `).slice(1).join(` `).toLowerCase(),
                    answers: answers,
                    date: new Date().getTime(),
                    channel: logs.id
                };
                client.db.findByIdAndUpdate(message.guild.id, {
                    applicants: res.applicants
                }).then(() => {}).catch(() => {});
            });
        };
        this.applyRes = async(message, channel, limit = 60000) => {
            const filter = m => m.author.id === message.author.id;
            try {
                const collected = await channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
                return collected.first();
            } catch (e) {
                return undefined;
            }
        };
        this.waitRes = async(message, text, limit = 60000) => {
            const filter = m => m.author.id === message.author.id;
            await message.channel.send(text);
            try {
                const collected = await message.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
                return collected.first().content;
            } catch (e) {
                return undefined;
            }
        };
        this.waitChannel = async(message, text, limit = 60000) => {
            const filter = m => m.author.id === message.author.id;
            await message.channel.send(text);
            try {
                const collected = await message.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
                if (collected.first().mentions.channels) {
                    return collected.first().mentions.channels.first();
                } else {
                    var chan = await message.guild.channels.cache.find(c => c.id === collected.first().content) || await message.guild.channels.cache.find(c => c.name === collected.first().content);
                    return chan;
                }
            } catch (e) {
                console.log(e.stack)
                return undefined;
            }
        };
        this.documentCheck = async() => {
            this.guilds.cache.forEach(guild => {
                this.db.findById(guild.id, (err, res) => {
                    if (err) {
                        this.db.create({
                            _id: `${guild.id}`
                        }).then(() => { client.logger.log(guild.name + " Document Created", "debug"); });
                    };
                    if (!res) {
                        this.db.create({
                            _id: `${guild.id}`
                        }).then(() => { client.logger.log(guild.name + " Document Created", "debug"); });
                    };
                }).catch(e => {
                    this.db.create({
                        _id: `${guild.id}`
                    }).then(() => { client.logger.log(guild.name + " Document Created", "debug"); });
                });
            });
        };
    };
};

// Call client class
let Intss = new Discord.Intents(Discord.Intents.ALL);
const client = new XenClient({
    partials: ['USER', 'REACTION', 'MESSAGE']
});



global.__basedir = __dirname;

const init = async() => {
    // Command Handler
    var commandCount = 0;
    var eventCount = 0;
    var aliases = 0;
    const categories = readdirSync(join(__dirname, `../`, `commands`));
    for (let category of categories) {
        const commands = readdirSync(join(__dirname, `../`, `commands/`, category));
        for (var command of commands) {
            let info = require(`../commands/${category}/${command}`);
            if (info.info.name) {
                commandCount++;
                client.commands.set(info.info.name, info);
                if (info.info.aliases) {
                    if (info.info.aliases.length) {
                        for (let alias of info.info.aliases) {
                            client.commands.set(alias, info);
                            aliases++;
                        };
                    };
                };
            } else {
                client.logger.log(`No help name or additional info found for ${command}`, "error");
                continue;
            };
        };
    };
    global.aliases = Number(aliases)
    global.commands = Number(commandCount)

    // Event handler
    const events = await readdirSync(join(__dirname, `../`, `events`));

    events.forEach(e => {
            eventCount++;
            const name = e.split('.')[0];
            const event = require(`../events/${e}`);
            client.on(name, event.bind(null, client));
            delete require.cache[require.resolve(`../events/${e}`)];
        })
        // Login
    client.login(client.config.token).catch(e => client.logger.error(`Failed to login, possibly due to an invalid token.`, "error"))
}

// Misc event handler
client.on('disconnect', () => client.logger.warn(`Connection to API Lost`)).on('reconnecting', () => client.logger.warn(`Client reconnecting to the API....`));
client.on('error', (e) => client.logger.log(e, "error")).on('warn', (w) => client.logger.warn(w));

// Process Handlers

// Exporting init func
exports.init = init;

function isObject(val) {
    return val instanceof Object;
};