const { MessageEmbed } = require(`discord.js`);
const fs = require(`fs`)
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_MESSAGES`).then(bool => {
        if (bool == false);
        client.db.findById(message.guild.id, async function(err, res) {
            const messages = {};
            const modlogs = await message.guild.channels.cache.find(c => c.name === res.modLogs) || await message.guild.channels.cache.find(c => c.id == res.discordLogs);
            if (message.mentions.members.first() && args[1] < 101) {
                if (!args[1]) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                if (isNaN(args[1])) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                message.delete().catch(e => {});
                message.channel.messages.fetch({ limit: args[1] }).then(collected => {
                    collected.forEach(msg => {
                        if (msg.author.id == message.mentions.members.first().id) msg.delete().catch(e => {});
                        messages[msg.id] = {
                            author: { tag: msg.author.tag, id: msg.author.id },
                            content: msg.content || `Unknown`
                        }
                    });
                });
                var logger = ``;
                await Object.keys(messages).forEach(msg => {
                    logger += `[${messages[msg].author.tag} (${messages[msg].author.id})]\n• Content: ${messages[msg].content}\n\n`;
                })
                await fs.writeFileSync(`./src/prune.txt`, logger);
                message.channel.send(`Channel was pruned.`);
                if (modlogs) {
                    var embed = new MessageEmbed()
                        .setFooter(message.guild.name, message.guild.iconURL())
                        .setColor(client.config.color)
                        .setAuthor(`Member Prune Log`, message.mentions.members.first().user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                        .setDescription(`**• Victim**: ${message.mentions.members.first().user.tag} in ${message.channel}\n**• Moderator**: ${message.author.tag}\n**• Amount of Messages**: ${args[1]}`)
                        .attachFiles(`./src/prune.txt`)
                    modlogs.send(embed);
                }
            } else if (args[0] > 100) {
                if (!args[1]) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                if (isNaN(args[1])) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                const member = await message.guild.members.cache.find(c => c.id === args[0]);
                message.delete().catch(e => {});
                message.channel.messages.fetch({ limit: args[1] }).then(collected => {
                    collected.forEach(msg => {
                        if (msg.author.id == args[0]) msg.delete().catch(e => {});
                        messages[msg.id] = {
                            author: { tag: msg.author.tag, id: msg.author.id },
                            content: msg.content || `Unknown`
                        }
                    });
                });
                var logger = ``;
                client.users.fetch(args[0]).then(async(user) => {
                    await Object.keys(messages).forEach(msg => {
                        logger += `[${messages[msg].author.tag} (${messages[msg].author.id})]\n• Content: ${messages[msg].content}\n\n`;
                    })
                    await fs.writeFileSync(`./src/prune.txt`, logger);
                    message.channel.send(`Channel was pruned.`);
                    if (modlogs) {
                        var embed = new MessageEmbed()
                            .setFooter(message.guild.name, message.guild.iconURL())
                            .setColor(client.config.color)
                            .setAuthor(`Member Prune Log`, user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                            .setDescription(`**• Victim**: ${user.tag} in ${message.channel}\n**• Moderator**: ${message.author.tag}\n**• Amount of Messages**: ${args[1]}`)
                            .attachFiles(`./src/prune.txt`)
                        modlogs.send(embed);
                    }
                })
            } else {
                if (!args[0]) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                if (isNaN(args[0])) return client.utils.missing(message, `NUMBER_OF_MESSAGES`);
                if (!args[0] > 100) args[0] = 100;
                var victims = {};
                message.delete().catch(e => {});
                await message.channel.messages.fetch({ limit: args[0] }).then(async(collected) => {
                    await collected.forEach(msg => {
                        messages[msg.id] = {
                            author: { tag: msg.author.tag, id: msg.author.id },
                            content: msg.content || `Unknown`
                        }
                        if (victims[msg.author.tag]) {
                            victims[msg.author.tag] = victims[msg.author.tag] + 1;
                        } else {
                            victims[msg.author.tag] = 1;
                        }
                    });
                });
                message.channel.bulkDelete(args[0])
                var logger = ``;
                await Object.keys(messages).reverse().forEach(msg => {
                    logger += `[${messages[msg].author.tag} (${messages[msg].author.id})]\n• Content: ${messages[msg].content}\n\n`;
                })
                await fs.writeFileSync(`./src/prune.txt`, logger);
                message.channel.send(`Channel was pruned.`);
                var desc = ``;
                await Object.keys(victims).forEach(prune => {
                    desc += `**${prune}** with **${victims[prune]}** message(s).\n`
                })
                if (modlogs) {
                    var embed = new MessageEmbed()
                        .setFooter(message.guild.name, message.guild.iconURL())
                        .setColor(client.config.color)
                        .setAuthor(`Prune Log`, message.guild.iconURL())
                        .setDescription(`**• Victim(s)**: ${desc}**• Location**: ${message.channel}\n**• Moderator**: ${message.author.tag}\n**• Amount of Messages**: ${args[0]}`)
                        .attachFiles(`./src/prune.txt`)
                    modlogs.send(embed);
                }
            }
        });
    });
}, exports.info = {
    name: "prune",
    aliases: [`purge`, `clear`],
    permission: `MANAGE_MESSAGES`,
    description: `Prune a channel.`,
    arguments: '<prefix>prune [number of messages]\n<prefix>prune [member] [number]'
}