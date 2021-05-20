const { MessageEmbed } = require(`discord.js`)
exports.run = async(client, message, args) => {
    var cd = message.guild.createdAt;
    var cd = cd.getMonth() + 1 + `/` + cd.getDate() + `/` + cd.getFullYear() + ` ` + cd.getHours() + `:` + cd.getMinutes() + `:` + cd.getSeconds() + `:` + cd.getMilliseconds();
    var jd = message.member.joinedAt;
    var jd = jd.getMonth() + 1 + `/` + jd.getDate() + `/` + jd.getFullYear() + ` ` + jd.getHours() + `:` + jd.getMinutes() + `:` + jd.getSeconds() + `:` + jd.getMilliseconds();
    var uptime = parseDuration(client.uptime);
    var uptime = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes, and ${uptime.seconds} seconds.`;
    let check = await message.channel.send(`Ping check`).then(async(m) => {
        m.delete()
        var ping = Date.now() - m.createdTimestamp + "MS"
        var ping = ping.slice(0, 2);
        var emojis = `|`;
        var ecount = 0;
        await message.guild.emojis.cache.forEach(emoji => {
            emojis += `${emoji}|`;
            ++ecount;
        });
        var roles = `|`;
        var rcount = 0;
        var totalroles = 0;
        await message.guild.roles.cache.forEach(role => {
            if (role.id == message.guild.id) return;
            ++totalroles;
            if (roles.length < 950) {
                ++rcount
                roles += `${role}|`
            }
        })
        var dnd = 0;
        var idle = 0;
        var online = 0;
        var offline = 0;
        var users = 0;
        var bots = 0;
        var administrators = ``;
        //mem.presence.status.toUpperCase()
        await message.guild.members.cache.forEach(member => {
            var status = member.presence.status.toUpperCase();
            if (member.user.bot) {
                bots++;
            } else {
                users++;
            }
            if ((member.hasPermission(`ADMINISTRATOR`)) && (!member.user.bot)) {
                administrators += `${member}|`;
            }
            switch (status) {
                case `DND`:
                    ++dnd;
                    break;
                case `IDLE`:
                    ++idle;
                    break;
                case `ONLINE`:
                    ++online;
                    break;
                default:
                    ++offline;
            }
        })
        var embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setThumbnail(message.guild.iconURL())
            .addFields({
                name: `Server Info`,
                value: `**ID**: ${message.guild.id}\n**Region**: ${message.guild.region}\n**Nitro Boosts**: ${message.guild.premiumSubscriptionCount}\n**Nitro Tier**: ${message.guild.premiumTier}\n**Owner**: ${message.guild.owner}\n**Administrators**: ${administrators}\n**User Count**: ${users}\n**Bot Count**: ${bots}\n**Members Online**: ${online}\n**Members Idle**: ${idle}\n**Members DnD**: ${dnd}\n**Members Offline**: ${offline}`
            }, {
                name: `Emojis (${ecount}/${ecount})`,
                value: emojis
            }, {
                name: `Roles (${rcount}/${totalroles})`,
                value: roles
            })
        message.channel.send(embed)
    });
}, exports.info = {
    name: "serverinfo",
    aliases: [],
    permission: `@everyone`,
    description: `Get information about a guild.`,
    arguments: '<prefix>userinfo'
};

function parseDuration(duration) {
    let remain = duration

    let days = Math.floor(remain / (1000 * 60 * 60 * 24))
    remain = remain % (1000 * 60 * 60 * 24)

    let hours = Math.floor(remain / (1000 * 60 * 60))
    remain = remain % (1000 * 60 * 60)

    let minutes = Math.floor(remain / (1000 * 60))
    remain = remain % (1000 * 60)

    let seconds = Math.floor(remain / (1000))
    remain = remain % (1000)

    let milliseconds = remain

    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds
    };
}