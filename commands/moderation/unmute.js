const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_MESSAGES`).then(bool => {
        if (bool == false) return;
        client.db.findById(message.guild.id, function(err, res) {
            let member;
            if (message.mentions.members.first()) {
                member = message.mentions.members.first();
            } else {
                member = message.guild.members.cache.find(m => m.id === args[0]);
            };
            if (!member) return client.utils.missing(message, `MEMBER`);
            let reason = args.slice(1).join(` `);
            if (!reason) return client.utils.missing(message, `REASON`);
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(`Unmute | Case #${res.caseNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                .setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Moderator**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}`)
            let modsLogs = message.guild.channels.cache.find(c => c.id === res.modLogs);
            let muteRole = message.guild.roles.cache.find(r => r.id === res.muteRole);
            if (muteRole) {
                if (member.roles.cache.has(muteRole.id)) {
                    member.roles.remove(muteRole);
                } else {
                    return message.reply(`That member is not muted.`);
                }
            };
            message.delete()
            if (modsLogs) {
                message.channel.send(`Member unmuted.`);
                modsLogs.send(embed).then(msg => {
                    res.cases[res.caseNumber] = {
                        message: msg.id,
                        channel: msg.channel.id,
                        victim: member.id,
                        moderator: message.author.id,
                        reason: reason,
                        time: new Date().getTime(),
                        type: `unmute`
                    };
                    res.muteCases[member.id] = undefined;
                    client.db.findByIdAndUpdate(message.guild.id, {
                        caseNumber: res.caseNumber + 1,
                        cases: res.cases,
                        muteCases: res.muteCases
                    }).then(() => {});
                })
            }
        });
    });
}, exports.info = {
    name: "unmute",
    aliases: [],
    permission: `MANAGE_MESSAGES`,
    description: `Unmute a user.`,
    arguments: '<prefix>Unmute [member] [reason]'
}