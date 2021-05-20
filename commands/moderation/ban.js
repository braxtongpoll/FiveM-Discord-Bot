const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `KICK_MEMBERS`).then(bool => {
        if (bool == false) return;
        let member;
        let id;
        if (message.mentions.members.first()) {
            member = message.mentions.members.first()
        } else {
            member = message.guild.members.cache.find(m => m.id === args[0]);
        };
        if (member) {
            id = member.id;
        } else {
            if (isNaN(args[0])) return message.reply(`Invalid member`)
            id = args[0];
        }
        if (id == `399718367335940117`) return message.reply(`Lets not ban Pluto again...`);
        if (id == message.author.id) return message.reply(`Why are you trying to ban yourself?`);
        client.db.findById(message.guild.id, async(err, res) => {
            client.users.fetch(id).then(user => {
                if (member) {
                    if (message.author.id !== message.guild.owner.id) {
                        if (member.roles.highest.position > message.member.roles.highest.position) return message.reply(`You cannot kick a member with a higher ranking role than you.`).then(a => a.delete({ timeout: 15000 }));
                    };
                };
                if (id == `399718367335940117`) return message.reply(`Lets not ban Pluto again...`);
                if (id == message.author.id) return message.reply(`Why are you trying to ban yourself?`);
                message.delete();
                let reason = args.slice(1).join(` `) || `No reason supplied.`;
                let embed = new MessageEmbed()
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setColor(client.config.color)
                    .setAuthor(`Ban | Case #${res.caseNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                    .setDescription(`**• Victim**: ${user.username} (${user.id})\n**• Moderator**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}`)
                let modLogs = message.guild.channels.cache.find(c => c.id === res.modLogs);
                if (member) member.send(embed).catch(e => {});
                message.guild.members.ban(id, { reason: reason });
                message.channel.send(`Member banned.`);
                if (modLogs) {
                    modLogs.send(embed).then(msg => {
                        res.cases[res.caseNumber] = {
                            message: msg.id,
                            channel: msg.channel.id,
                            victim: user.id,
                            moderator: message.author.id,
                            reason: reason,
                            time: new Date().getTime(),
                            type: `ban`
                        };
                        client.db.findByIdAndUpdate(message.guild.id, {
                            caseNumber: res.caseNumber + 1,
                            cases: res.cases
                        }).then(() => {});
                    })
                }
            }).catch(e => {
                return message.reply(`I was unable to find that user.\n ${e.stack}`);
            })
        });
    })
}, exports.info = {
    name: "ban",
    aliases: [`bean`],
    permission: `BAN_MEMBERS`,
    description: `Ban a user from the server.`,
    arguments: '<prefix>ban [member/id] [reason]'
}