const { MessageEmbed } = require('discord.js');
const fs = require(`fs`);
module.exports = async(client, reaction, user) => {
    if (reaction.partial) try { await reaction.fetch().catch(e => { console.log(e) }) } catch (e) { return client.logger.log(`Failed to fetch partial reactions | [${e}]`, "error") };
    if (user.bot) return
    if (!reaction.message.guild) return;
    client.db.findById(reaction.message.guild.id, async function(err, res) {
        if (res.ticketPanels[reaction.message.id]) {
            if (reaction.emoji.name !== `🎟️`) return reaction.users.remove(user.id);
            reaction.users.remove(user.id);
            client.docUpdate(reaction.message, "ticketNumber", res.ticketNumber + 1);
            reaction.message.guild.channels.create(`ticket-${res.ticketNumber}`, {
                type: `text`,
                parent: res.ticketCategory,
                permissionOverwrites: [{
                    id: reaction.message.guild.id,
                    deny: [`VIEW_CHANNEL`]
                }, {
                    id: user.id,
                    allow: [`VIEW_CHANNEL`, `ADD_REACTIONS`, `SEND_MESSAGES`],
                }]
            }).then(async(channel) => {
                res.tickets.push(`${channel.id};${user.id}`);
                client.docUpdate(reaction.message, "tickets", res.tickets);
                let embed = new MessageEmbed()
                    .setFooter(reaction.message.guild.name, reaction.message.guild.iconURL())
                    .setAuthor(`New Ticket`)
                    .setColor(client.config.color)
                let filter = response => { return response.author.id === user.id };
                if (res.supportRoles.length) res.supportRoles.forEach(id => { channel.updateOverwrite(id, { VIEW_CHANNEL: true, SEND_MESSAGES: true }) })
                channel.send(`${user}, how may we assist you today?`).then(() => {
                    channel.awaitMessages(filter, { max: 1, time: 600000, errors: [`time`] }).then(c => {
                        embed.setDescription(`**Member**: ${user}\n**Reason for Ticket**: ${c.first().content}`)
                        channel.bulkDelete(3);
                        channel.send(`@here`, { embed: embed });
                    }).catch(e => {
                        embed.setDescription(`**Member**: ${user}\n**Reason for Ticket**: Unknown`)
                        channel.bulkDelete(3);
                        channel.send(`@here`, { embed: embed });
                    })
                })
            }).catch(e => {
                return console.log(e);
            })
        } else if (res.requestRoles[reaction.message.id]) {
            reaction.users.remove(user.id);
            if (res.requestRoles[reaction.message.id][reaction.emoji.name]) {
                let embed = new MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(user.tag, user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                let role = reaction.message.guild.roles.cache.find(r => r.id === res.requestRoles[reaction.message.id][reaction.emoji.name]);
                if (!role) return;
                embed.setDescription(`${user} has requested the role ${role}. Please react below to verify or deny.`)
                reaction.message.channel.send(embed).then(msg => {
                    [`✅`, `❌`].forEach(emoji => { msg.react(emoji); });
                    res.requestedRoles[msg.id] = {
                        user: user.id,
                        role: role.id
                    };
                    client.db.findByIdAndUpdate(reaction.message.guild.id, {
                        requestedRoles: res.requestedRoles
                    }).then(() => {})
                });
            };
        } else if (res.requestedRoles[reaction.message.id]) {
            let staff = reaction.message.guild.members.cache.find(m => m.id === user.id);
            if (!staff.hasPermission(`MANAGE_ROLES`)) {
                console.log(1)
                return reaction.users.remove(user.id);
            }
            let logs = reaction.message.guild.channels.cache.find(c => c.id === res.requestRolelogs);
            let member = reaction.message.guild.members.cache.find(m => m.id === res.requestedRoles[reaction.message.id].user);
            let embed = new MessageEmbed()
                .setFooter(reaction.message.guild.name, reaction.message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(user.username, user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            if (!member) return reaction.message.delete().catch(e => { console.log(e) });
            let role = reaction.message.guild.roles.cache.find(r => r.id === res.requestedRoles[reaction.message.id].role);
            if ((staff.roles.highest.position < role.position) && (user.id !== reaction.message.guild.owner.id)) return reaction.users.remove(user.id);
            if (!role) return reaction.message.delete().catch(e => { console.log(e) });
            if (reaction.emoji.name == `✅`) {
                member.roles.add(res.requestedRoles[reaction.message.id].role);
                reaction.message.delete();
                embed.setDescription(`The request for the role ${role} for ${member} has been verified.`);
                logs.send(embed);
            } else if (reaction.emoji.name == `❌`) {
                reaction.message.delete();
                embed.setDescription(`The request for the role ${role} for ${member} has been denied.`);
                logs.send(embed);
            }
        } else if (res.applicants[reaction.message.id]) {
            var adminEmbed = new MessageEmbed()
                .setColor(client.config.color)
                .setAuthor(user.username, user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }));
            var adminLogs = await client.channels.cache.find(c => c.id === res.applications[res.applicants[reaction.message.id].applicationName].appLogs);
            client.users.fetch(res.applicants[reaction.message.id].applicant).then(async(appUser) => {
                let toSend = await client.users.cache.find(m => m.id === appUser.id);
                if (reaction.emoji.name == `✅`) {
                    reaction.message.channel.messages.fetch(reaction.message.id).then(msg => {
                        msg.edit(msg.embeds[0].setFooter(`Accepted By: ${user.tag} | ${reaction.message.guild.name}`, reaction.message.guild.iconURL()));
                    });
                    var embed = new MessageEmbed()
                        .setFooter(`Accepted By: ${user.tag} | ${reaction.message.guild.name}`, reaction.message.guild.iconURL())
                        .setAuthor(`Application for ${res.applicants[reaction.message.id].applicationName}`)
                        .setColor(client.config.color)
                        .setDescription(res.applications[res.applicants[reaction.message.id].applicationName].acceptMessage)
                    toSend.send(`Application Notification`, { embed: embed });
                    adminEmbed.setDescription(`Accepted an application. [Application Here](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`)
                    if (adminLogs) adminLogs.send(adminEmbed);
                    await reaction.message.reactions.removeAll();
                    res.applicants[reaction.message.id].status = {
                        stat: `Approved`,
                        staff: user.tag
                    };
                    if (res.applications[res.applicants[reaction.message.id].applicationName].addRoles) {
                        var member = await reaction.message.guild.members.cache.find(m => m.id === res.applicants[reaction.message.id].applicant);
                        if (member) {
                            res.applications[res.applicants[reaction.message.id].applicationName].addRoles.forEach(async(id) => {
                                var role = await reaction.message.guild.roles.cache.find(r => r.id === id);
                                member.roles.add(role).catch(e => {});
                            });
                        }
                    };
                    if (res.applications[res.applicants[reaction.message.id].applicationName].removeRoles) {
                        var member = await reaction.message.guild.members.cache.find(m => m.id === res.applicants[reaction.message.id].applicant);
                        if (member) {
                            res.applications[res.applicants[reaction.message.id].applicationName].removeRoles.forEach(async(id) => {
                                var role = await reaction.message.guild.roles.cache.find(r => r.id === id);
                                member.roles.remove(role).catch(e => {});
                            });
                        }
                    };
                    client.db.findByIdAndUpdate(reaction.message.guild.id, {
                        applicants: res.applicants
                    }).then(() => {}).catch(e => {});
                } else if (reaction.emoji.name == `❌`) {
                    const filter = res => { return res.author.id === user.id };
                    reaction.message.channel.send(`${user}, what is the reason for denying this applicaiton?`).then(async(w) => {
                        reaction.message.channel.awaitMessages(filter, { max: 1, time: 180000, errors: [`time`] }).then(async(collected) => {
                            const DenialReason = collected.first().content;
                            w.delete().catch(e => {});
                            collected.first().delete().catch(e => {});
                            reaction.message.channel.send(``)
                            reaction.message.channel.messages.fetch(reaction.message.id).then(msg => {
                                msg.edit(msg.embeds[0].setFooter(`Denied By: ${user.tag} | ${reaction.message.guild.name}`, reaction.message.guild.iconURL()));
                            });
                            var embed = new MessageEmbed()
                                .setFooter(`Denied By: ${user.tag} | ${reaction.message.guild.name}`, reaction.message.guild.iconURL())
                                .setAuthor(`Application for ${res.applicants[reaction.message.id].applicationName}`)
                                .setColor(client.config.color)
                                .setDescription(`Your application has been denied.\n**> Reason**: ${DenialReason}`)
                            toSend.send(`Application Notification`, { embed: embed });
                            adminEmbed.setDescription(`Denied an application. [Application Here](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id.id}/${reaction.message.id}) Reason: **${DenialReason}**`)
                            if (adminLogs) adminLogs.send(adminEmbed);
                            await reaction.message.reactions.removeAll();
                            res.applicants[reaction.message.id].status = {
                                stat: `Denied`,
                                staff: user.tag,
                                reason: DenialReason
                            };
                            client.db.findByIdAndUpdate(reaction.message.guild.id, {
                                applicants: res.applicants
                            }).then(() => {}).catch(e => {});
                        });
                    });
                };
            }).catch(e => {
                return console.log(e.stack)
            })
        } else if (res.reactionRoles[reaction.message.id]) {
            if (res.reactionRoles[reaction.message.id][reaction.emoji.name]) {
                let role = await reaction.message.guild.roles.cache.find(r => r.id === res.reactionRoles[reaction.message.id][reaction.emoji.name]);
                let member = await reaction.message.guild.members.cache.find(m => m.id === user.id);
                if (!member) return;
                if (!member.roles.cache.has(role)) member.roles.add(role);
            };
        };
    });
};