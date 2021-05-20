const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_MESSAGES`).then(bool => {
        if (bool == false) return;
        client.db.findById(message.guild.id, function(err, res) {
            let caseNumber = res.caseNumber;
            let muteRole = message.guild.roles.cache.find(r => r.id === res.muteRole);
            if (!muteRole) return message.reply(`This system is not setup yet!`).then(a => a.delete({ timeout: 5000 }));
            let member;
            if (message.mentions.members.first()) {
                member = message.mentions.members.first();
            } else {
                member = message.guild.members.cache.find(m => m.id === args[0]);
            };
            if (!member) return client.utils.missing(message, `MEMBER`);
            if (member.roles.highest.position > message.member.roles.highest.position) return message.reply(`You cannot mute a member with a higher ranking role than you.`).then(a => a.delete({ timeout: 15000 }));
            let reason = args.slice(1).join(` `);
            if (!reason) return client.utils.missing(message, `REASON`);
            message.delete();
            let time;
            let duration;
            if (reason.includes(`|`)) {
                reason = args.slice(1).join(` `).split(`|`)[0];
                let arr = args.slice(1).join(` `).split(`|`)[1].split(``);
                if (arr.length == 3) arr = [`${arr[0]}${arr[1]}`, arr[2]];
                if (arr.length == 4) arr = [`${arr[0]}${arr[1]}${arr[2]}`, arr[3]];
                if (isNaN(arr[0])) return invalid(message, `TIME`);
                switch (arr[1]) {
                    case `d`:
                        time = Number(arr[0]) * 86400000;
                        duration = `${arr[0]} Day(s)`;
                        break;
                    case `h`:
                        time = Number(arr[0]) * 3600000;
                        duration = `${arr[0]} Hour(s)`;
                        break;
                    case `m`:
                        time = Number(arr[0]) * 60000;
                        duration = `${arr[0]} Minute(s)`;
                        break;
                    case `s`:
                        time = Number(arr[0]) * 1000;
                        duration = `${arr[0]} Seconds`;
                        break;
                    default:
                        time = Number(arr[0]) * 1000;
                        duration = `${arr[0]} Second(s)`;
                };
            }
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(`Mute | Case #${caseNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                .setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Moderator**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}`)
            if (time) embed.setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Moderator**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}\n**• Duration**: ${duration}`)
            let logs = message.guild.channels.cache.find(c => c.id === res.modLogs);
            member.roles.add(muteRole).catch(e => {});
            member.send(embed).catch(e => {});
            if (logs) logs.send(embed).then(msg => {
                message.channel.send(`Member muted.`);
                if (time) {
                    res.muteCases[member.id] = time;
                };
                res.cases[caseNumber] = {
                    message: msg.id,
                    channel: msg.channel.id,
                    victim: member.id,
                    moderator: message.author.id,
                    reason: reason,
                    time: new Date().getTime(),
                    type: `mute`
                };
                client.db.findByIdAndUpdate(message.guild.id, {
                    cases: res.cases,
                    muteCases: res.muteCases,
                    caseNumber: res.caseNumber + 1
                }).then(() => {});
            })
        });
    })
}, exports.info = {
    name: "mute",
    aliases: [`stfu`],
    permission: `MANAGE_MESSAGES`,
    description: `Mute a user.`,
    arguments: '<prefix>mute [member] [reason] | [duration]'
}