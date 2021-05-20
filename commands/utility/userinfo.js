const { MessageEmbed } = require(`discord.js`)
exports.run = async(client, message, args) => {
    let user;
    if (message.mentions.members.first()) {
        user = message.mentions.members.first();
    } else {
        user = message.guild.members.cache.find(m => m.id === args[0]) || message.member;
    }
    var mem = await message.guild.member(user)
    var stat = await mem.presence.status.toUpperCase()
    var roles = ``
    await message.guild.roles.cache.sort((a, b) => b - a).forEach(r => {
        if (mem.roles.cache.has(r.id)) {
            if (r.name == `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`) return;
            if (r.id == message.guild.id) return;
            roles += `${r}\n`;
        }
    })
    var tag = await `**Name:** ${mem.user.username}\n**Tag:** ${mem.user.tag.replace(mem.user.username+"#", "")}\n**ID:** ${mem.id}`
    var joinDiscord = await mem.user.createdAt
    var joinServer = await mem.joinedAt
    var d = joinDiscord,
        dformat = [d.getMonth() + 1,
            d.getDate(),
            d.getFullYear()
        ].join('/') + ' ' + [d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        ].join(':');
    var f = joinServer,
        fformat = [f.getMonth() + 1,
            f.getDate(),
            f.getFullYear()
        ].join('/') + ' ' + [f.getHours(),
            f.getMinutes(),
            f.getSeconds()
        ].join(':');
    let image = await mem.user.displayAvatarURL({ format: `png`, dynamic: true, size: 2048 })
    const arr = message.guild.members.cache.array();
    arr.sort((a, b) => a.joinedAt - b.joinedAt);
    var tt
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === mem.id) tt = i + 1;
    };
    var joinTime = mem.user.createdTimestamp
    var today = new Date().getTime();
    var days = ((today - joinTime) / 86400000).toString().split(`.`)[0];
    let embed = new MessageEmbed()
        .setFooter(`Requested by: ${message.author.tag} | ${message.guild.name}`, message.guild.iconURL())
        .setTimestamp()
        .setAuthor(`User Info`)
        .setThumbnail(image)
        .setColor(client.config.color)
        .addFields({
            name: `Dates`,
            value: `**Created Date**: ${dformat} (${days} days ago)\n**Joined Date**: ${fformat}`,
            inline: true
        }, {
            name: `User Info`,
            value: tag,
            inline: true
        }, {
            name: `Status`,
            value: stat,
            inline: true
        }, {
            name: `Roles`,
            value: roles,
            inline: true
        }, {
            name: `Other`,
            value: `**Direct Tag**: ${mem.user}\n**Guild Join Position**: **${tt}**`,
            inline: true
        })

    message.channel.send(embed)
}, exports.info = {
    name: "userinfo",
    aliases: [],
    permission: `@everyone`,
    description: `Get information about a user.`,
    arguments: '<prefix>userinfo [user]'
};