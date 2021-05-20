const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        if (!message.member.hasPermission(`MANAGE_GUILD`)) {
            var cont = false;
            res.managers.forEach(id => {
                if (message.member.roles.cache.has(id)) cont = true;
            })
            if (cont == false) client.permission(message, `MANAGE_SERVER`);
        };
        if (!args[0]) return client.utils.missing(message, `NAME / QUESTION / LOGS / ACCEPTMESSAGE / STATUSLOGS / ADDROLE / SROLE`);
        const filter = res => res.author.id === message.author.id;
        var adminLogs = await message.guild.channels.cache.find(c => c.id === res.appLogs);
        var adminEmbed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        switch (args[0].toLowerCase()) {
            case `name`:
                if (!res.applications[args.slice(1).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var newName = await client.waitRes(message, `What is the new name of this application?`);
                var oldname = args.slice(1).join(` `)
                if (!newName) return message.reply(`Time error.`);
                res.applications[newName.toLowerCase()] = res.applications[args.slice(1).join(` `).toLowerCase()];
                res.applications[args.slice(1).join(` `).toLowerCase()] = undefined;
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                adminEmbed.setDescription(`Set the application name of **${oldname}** to **${newName}**.`)
                if (adminLogs) adminLogs.send(adminEmbed);
                newName = undefined;
                oldname = undefined;
                break;
            case `question`:
                if (!res.applications[args.slice(2).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var newQuestion = await client.waitRes(message, `What is the new question for question #${args[1]}`);
                if (!newQuestion) return message.reply(`Time error.`);
                res.applications[args.slice(2).join(` `).toLowerCase()].questions[args[1] - 1] = newQuestion;
                var appname = args.slice(2).join(` `);
                adminEmbed.setDescription(`Set the question **#${args[1]}** in **${appname}** to **${newQuestion}**.`);
                if (adminLogs) adminLogs.send(adminEmbed);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`)
                newQuestion = undefined;
                array = undefined;
                lim = undefined;
                appname = undefined;
                break;
            case `logs`:
                if (!res.applications[args.slice(1).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                message.channel.send(`What should the new logging channel be?`).then(async(w) => {
                    message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                        var channel;
                        if (c.first().mentions.channels.first()) {
                            var channel = c.first().mentions.channels.first();
                        } else {
                            var channel = await message.guild.channels.cache.find(chan => chan.id === c.first().content) || await message.guild.channels.cache.find(chan => chan.name === c.first().content)
                        }
                        if (!channel) return client.utils.missing(message, `CHANNEL`);
                        res.applications[args.slice(1).join(` `).toLowerCase()].logs = channel.id;
                        var name = args.slice(1).join(` `);
                        adminEmbed.setDescription(`Set the logs for **${name}** to ${channel}.`)
                        if (adminLogs) adminLogs.send(adminEmbed);
                        client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                    }).catch(e => {
                        return message.reply(`Time error.`);
                    });
                });
                break;
            case `acceptmessage`:
                if (!res.applications[args.slice(1).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var name = args.slice(1).join(` `);
                var aMessage = await client.waitRes(message, `What would you like the accept message to be for **${name}**`, 120000);
                if (!aMessage) return message.reply(`Time error.`);
                res.applications[args.slice(1).join(` `).toLowerCase()].acceptMessage = aMessage;
                var name = args.slice(1).join(` `);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                adminEmbed.setDescription(`Set the accept message for **${name}** to\n> ${aMessage}`)
                if (adminLogs) adminLogs.send(adminEmbed);
                break;
            case `statuslogs`:
                if (!res.applications[args.slice(1).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                message.channel.send(`What should the new status logging channel be?`).then(async(w) => {
                    message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: [`time`] }).then(async(c) => {
                        var channel;
                        if (c.first().mentions.channels.first()) {
                            var channel = c.first().mentions.channels.first();
                        } else {
                            var channel = await message.guild.channels.cache.find(chan => chan.id === c.first().content) || await message.guild.channels.cache.find(chan => chan.name === c.first().content)
                        }
                        if (!channel) return client.utils.missing(message, `CHANNEL`);
                        res.applications[args.slice(1).join(` `).toLowerCase()].statusLogs = channel.id;
                        client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                        var name = args.slice(1).join(` `);
                        adminEmbed.setDescription(`Set the status logging channel for **${name}** to ${channel}.`);
                        if (adminLogs) adminLogs.send(adminEmbed);
                    }).catch(e => {
                        return message.reply(`Time error.`);
                    });
                });
                break;
            case `addrole`:
                if (!res.applications[args.slice(2).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var role;
                if (message.mentions.roles.first()) {
                    role = message.mentions.roles.first();
                } else {
                    role = await message.guild.roles.cache.find(r => r.id === args[0])
                }
                if (!role) return client.utils.missing(mesage, `VALID ROLE METION/ID`);
                var name = args.slice(2).join(` `);
                if (res.applications[args.slice(2).join(` `).toLowerCase()].addRoles) {
                    if (res.applications[args.slice(2).join(` `).toLowerCase()].addRoles.includes(role.id)) {
                        res.applications[args.slice(2).join(` `).toLowerCase()].addRoles = res.applications[args.slice(2).join(` `).toLowerCase()].addRoles.filter(id => id !== role.id);
                        adminEmbed.setDescription(`Remove the role ${role} from **AddRole** in **${name}**`)
                    } else {
                        res.applications[args.slice(2).join(` `).toLowerCase()].addRoles.push(role.id);
                        adminEmbed.setDescription(`Added the role ${role} to **AddRole** in **${name}**`)
                    }
                } else {
                    res.applications[args.slice(2).join(` `).toLowerCase()].addRoles = [`${role.id}`];
                    adminEmbed.setDescription(`Added the role ${role} to **AddRole** in **${name}**`)
                };
                if (adminLogs) adminLogs.send(adminEmbed);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                break;
            case `removerole`:
                if (!res.applications[args.slice(2).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var role;
                if (message.mentions.roles.first()) {
                    role = message.mentions.roles.first();
                } else {
                    role = await message.guild.roles.cache.find(r => r.id === args[0])
                }
                var name = args.slice(2).join(` `);
                if (!role) return client.utils.missing(mesage, `VALID ROLE METION/ID`);
                if (res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles) {
                    if (res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles.includes(role.id)) {
                        res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles = res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles.filter(id => id !== role.id);
                        adminEmbed.setDescription(`Remove the role ${role} from **RemoveRole** in **${name}**`)
                    } else {
                        res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles.push(role.id);
                        adminEmbed.setDescription(`Added the role ${role} to **AddRole** in **${name}**`)
                    }
                } else {
                    res.applications[args.slice(2).join(` `).toLowerCase()].removeRoles = [`${role.id}`];
                    adminEmbed.setDescription(`Added the role ${role} to **AddRole** in **${name}**`)
                };
                if (adminLogs) adminLogs.send(adminEmbed);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                break;
            case `srole`:
                if (!res.applications[args.slice(2).join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                var role;
                if (message.mentions.roles.first()) {
                    role = message.mentions.roles.first();
                } else {
                    role = await message.guild.roles.cache.find(r => r.id === args[0])
                }
                var name = args.slice(2).join(` `);
                if (!role) return client.utils.missing(mesage, `VALID ROLE METION/ID`);
                if (res.applications[args.slice(2).join(` `).toLowerCase()].sRole) {
                    if (res.applications[args.slice(2).join(` `).toLowerCase()].sRole.includes(role.id)) {
                        res.applications[args.slice(2).join(` `).toLowerCase()].sRole = res.applications[args.slice(2).join(` `).toLowerCase()].sRole.filter(id => id !== role.id);
                        adminEmbed.setDescription(`Remove the role ${role} from **sRole** in **${name}**`)
                    } else {
                        res.applications[args.slice(2).join(` `).toLowerCase()].sRole.push(role.id);
                        adminEmbed.setDescription(`Added the role ${role} to **sRole** in **${name}**`)
                    }
                } else {
                    res.applications[args.slice(2).join(` `).toLowerCase()].sRole = [`${role.id}`];
                    adminEmbed.setDescription(`Added the role ${role} to **sRole** in **${name}**`)
                };
                if (adminLogs) adminLogs.send(adminEmbed);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                break;
            case `displayname`:
                args = args.slice(1).join(` `).split(` | `);
                if (!res.applications[args[0]]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
                res.applications[args[0]].displayName = args[1];
                var name = args[0];
                adminEmbed.setDescription(`Set the **DisplayName** for **${args[0]}** to **${args[1]}**`)
                if (adminLogs) adminLogs.send(adminEmbed);
                client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
                break;
            default:
                return client.utils.missing(message, `NAME / QUESTION / LOGS / ACCEPTMESSAGE / STATUSLOGS / ADDROLE / SROLE`)
        }
    });
}, exports.info = {
    name: "edit",
    aliases: [`e`],
    permission: `MANAGE_GUILD`,
    description: `Edit an application.`,
    arguments: `<prefix>edit name [application_name]\n<prefix>edit question [question_number] [application_name]\n<prefix>edit logs [application_name]\n<prefix>edit AcceptMessage [application_name]\n<prefix>edit sRole [role_mention/id] [application_name]\n<prefix>edit AddRole [role_mention/id] [application_name]\n<prefix>edit RemoveRole [role_mention/id] [application_name]\n<prefix>edit StatusLogs [application_name]\n<prefix>edit DisplayName [application name] | [display name]`
}