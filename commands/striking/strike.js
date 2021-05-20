const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        if (!message.member.hasPermission(`MANAGE_ROLES`)) {
            let perms = false;
            if (res.strikePermissions.length) {
                for (let id of res.strikePermissions) {
                    if (message.member.roles.cache.has(id)) perms = true;
                    if (message.author.id == id) perms = true;
                };
            };
            if (perms == false) {
                var falseembed = new MessageEmbed()
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setDescription(`You're missing the permission ` + '`' + `ADMINISTRATOR` + '`' + ` to run this command.`)
                return message.reply(falseembed);
            };
        };
        let member;
        if (message.mentions.members.first()) {
            member = message.mentions.members.first();
        } else {
            member = message.guild.members.cache.find(m => m.id === args[0]);
        };
        if (!member) return client.utils.missing(message, `MEMBER`);
        let reason = args.slice(1).join(` `);
        if (!reason) return client.utils.missing(message, `REASON FOR STRIKE`);
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
        let logs = message.guild.channels.cache.find(c => c.id === res.strikeLogs);
        message.delete().catch(e => {});
        let date = new Date();
        let tt = await `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        let embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`Strike | Case #${res.strikeNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Supervisor**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}`)
        if (duration) {
            embed.setAuthor(`Temporary Strike | Case #${res.strikeNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }));
            embed.setDescription(`**• Victim**: ${member.user.username} (${member.id})\n**• Supervisor**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}\n**• Duration**: ${duration}`);
        };

        member.send(embed).catch(e => {});
        logs.send(embed).then((embedMsg) => {
            if (res.strikes[member.id]) {
                res.strikes[member.id][res.strikeNumber] = {
                    super: message.author.id,
                    reason: reason,
                    date: tt,
                    active: true,
                    msg: embedMsg.id,
                    channel: embedMsg.channel.id
                };
            } else {
                res.strikes[member.id] = {
                    [res.strikeNumber]: {
                        super: message.author.id,
                        reason: reason,
                        date: tt,
                        active: true,
                        msg: embedMsg,
                        channel: embedMsg.channel.id
                    }
                };
            };
            if (time > 1) res.strikes[member.id][res.strikeNumber].duration = time;
            var strikes = 0;
            Object.keys(res.strikes[member.id]).forEach(c => {
                if (res.strikes[member.id][c].active == true) strikes++;
            });
            client.db.findByIdAndUpdate(message.guild.id, {
                strikes: res.strikes,
                strikeNumber: res.strikeNumber + 1
            }).then(() => {
                message.channel.send(`Member was striked. They have ${strikes} strike(s).`);
            }).catch((e) => {
                message.channel.send(`There was an error striking that member.\n${e.stack}`);
            });
        });
    });
}, exports.info = {
    name: "strike",
    aliases: [],
    permission: `ADMINISTRATOR / ROLE`,
    description: `Strike a user.`,
    arguments: '<prefix>strikes [user] [reason] | [time]'
}