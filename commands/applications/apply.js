const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    if (!args[0]) return client.utils.missing(message, `APPLICATION_NAME`);
    client.db.findById(message.guild.id, async(err, res) => {
        const app = args.join(` `).toLowerCase();
        if (!res.applications[app]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        if (res.applications[app] == null) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        const application = res.applications[app];
        if (application.active == false) return message.reply(`This application is closed.`);
        const logs = await client.channels.cache.find(c => c.id === application.logs);
        if (!logs) return message.reply(`This application is missing an application channel. Contact your servers administration if you believe this is a mistake.`);
        message.author.send(`${message.author} This is your application channel! React with ✅ to begin. React with ❌ to cancel.`).then(async(msg) => {
            const channel = msg.channel;
            message.reply(`Your application has been started in your DM's!`).then(a => a.delete({ timeout: 10000 }));
            message.delete();
            const reactionFilter = (__, user) => { return user.id === message.author.id; }
            const wordFilter = res => { return res.author.id === message.author.id; };
            [`✅`, `❌`].forEach(emoji => { msg.react(emoji) });
            msg.awaitReactions(reactionFilter, { max: 1, time: 120000, errors: [`time`] }).then(async(collected) => {
                if (collected.first().emoji.name !== `✅`) return channel.delete().catch(e => {});
                msg.delete().catch(e => {});
                var embed = new MessageEmbed()
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setColor(client.config.color)
                    .setAuthor(`${message.author.tag}'s Application`, message.author.displayAvatarURL({ type: `png`, dynamic: true, size: 1024 }))
                channel.send(embed).then(async(msg) => {
                    var limit = 0;
                    var answers = [];
                    while (limit !== application.questions.length) {
                        embed.setDescription(`**Question ${limit + 1}**\n> ${application.questions[limit]}`);
                        await msg.edit(embed)
                        await channel.awaitMessages(wordFilter, { max: 1, time: 900000, errors: [`time`] }).then(c => {
                            c.first().delete().catch(e => {})
                            answers.push(c.first().content);
                            limit = limit + 1;
                        }).catch(e => {
                            limit = application.questions.length
                            return channel.send(`This application session has timed out. Deleting this channel in 15 seconds.`).then(() => {
                                return channel.delete({ timeout: 15000 }).catch(e => {});
                            });
                        });
                    }
                    msg.delete().catch(e => {});
                    var desc = ``;
                    var limit = 0;
                    application.questions.forEach(question => {
                        limit++;
                        desc += `> **(${limit})**: ${question}\n*${answers[limit-1]}*\n`;
                        if (desc.length > 1000) {
                            channel.send(embed.setDescription(desc));
                            desc = ``
                        }
                    });
                    if (desc.length) channel.send(embed.setDescription(desc));
                    channel.send({ embed: { color: client.config.color, description: `Here is your application. To submit it react with ✅, to change one of your answers react with 📝, to cancel react with ❌` } }).then(async(msg) => {
                        await [`✅`, `📝`, `❌`].forEach(emoji => { msg.react(emoji) });
                        msg.awaitReactions(reactionFilter, { max: 1, time: 60000, errors: [`time`] }).then(async(reactions) => {
                            const rName = reactions.first().emoji.name;
                            switch (rName) {
                                case `✅`:
                                    client.applicationSubmit(client, message, application, channel, logs, answers, res);
                                    break;
                                case `📝`:
                                    msg.delete().catch(e => {});
                                    channel.send(`What question number would you like to change?`).then(async(msg) => {
                                        channel.awaitMessages(wordFilter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                                            var number = c.first().content;
                                            c.first().delete().catch(e => {});
                                            if (isNaN(number)) number = application.questions.length + 1;
                                            client.questionChange(client, message, channel, application.questions, answers, number, application, logs, res);
                                        });
                                    });
                                    break;
                                case `❌`:
                                    await channel.send(`Application cancelled.`).then(() => {
                                        channel.delete({ timeout: 20000 }).catch(e => {});
                                    });
                                    break;
                                default:
                                    await channel.send(`Application cancelled.`).then(() => {
                                        channel.delete({ timeout: 20000 }).catch(e => {});
                                    });
                                    break;
                            }
                        }).catch((e) => {
                            channel.send(`A time error accured.`);
                            if (channel.guild) channel.delete({ timeout: 20000 }).catch(() => {});
                            console.log(e.stack);
                        })
                    });
                });
            });
        }).catch((e) => {
            channel.send(`A time error accured.`);
            if (channel.guild) channel.delete({ timeout: 20000 }).catch(() => {});
            console.log(e.stack);
        }).catch(e => {
            message.reply(`Your DM's must be open for me to start this application.`)
        });
    });
}, exports.info = {
    name: "apply",
    aliases: [`a`],
    permission: `@everyone`,
    description: `Apply for an application.`,
    arguments: '<prefix>apply [application_name]'
}