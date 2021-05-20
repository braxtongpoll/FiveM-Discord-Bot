const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        if (!message.member.hasPermission(`ADMINISTRATOR`)) {
            let perms = false;
            if (strikePermissions.length) {
                for (let id of strikePermissions) {
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
        if (!res.strikes[member.id]) return message.reply(`This member has no strikes against them!`);
        let strikes = [];
        await Object.keys(res.strikes[member.id]).forEach(async(num) => {
            if (res.strikes[member.id][num].active == false) return;
            let staff = await client.users.cache.get(res.strikes[member.id][num].super)
            let string = `**• Supervisor**: ${staff}\n**• Time**: ${res.strikes[member.id][num].date}\n**• Reason**: ${res.strikes[member.id][num].reason}`
            if (res.strikes[member.id][num].duration) {
                string = `**• Supervisor**: ${staff}\n**• Time**: ${res.strikes[member.id][num].date}\n**• Reason**: ${res.strikes[member.id][num].reason}\n**• Time Remaing(ms)**: ${res.strikes[member.id][num].duration}`;
            }
            strikes.push(string);
        });
        if (!strikes.length) return message.reply(`This member has no active strikes against them!`);
        let page = 1;
        let embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`${page}/${strikes.length}`)
            .setDescription(strikes[page - 1])
        message.channel.send(embed).then(async(m) => {
            m.react(`⬅️`).then(async(r) => {
                await m.react(`❌`);
                await m.react(`➡️`);
                const removeReaction = async(m, msg, emoji) => { try { m.reactions.cache.find(r => r.emoji.name == emoji).users.remove(message.author.id); } catch (err) {} };
                const back = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id;
                const forward = (reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id;
                const close = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;
                const backwards = m.createReactionCollector(back, { time: 60000 });
                const forwards = m.createReactionCollector(forward, { time: 60000 });
                const closer = m.createReactionCollector(close, { time: 60000 });
                backwards.on('collect', async(r) => {
                    await removeReaction(m, message, '⬅️')
                    if (page === 1) return;
                    page--;
                    embed.setAuthor(`${page}/${strikes.length}`)
                    embed.setDescription(strikes[page - 1])
                    m.edit(embed)
                });
                forwards.on(`collect`, async(r) => {
                    await removeReaction(m, message, '➡️')
                    if (page === strikes.length) return;
                    page++;
                    embed.setAuthor(`${page}/${strikes.length}`)
                    embed.setDescription(strikes[page - 1])
                    m.edit(embed)
                });
                closer.on('collect', r => {
                    m.delete()
                });
            });
        });
    });
}, exports.info = {
    name: "view-strikes",
    aliases: [`vs`, `viewstrikes`, `vstrikes`],
    permission: `ADMINISTRATOR / ROLE`,
    description: `View all active strikes on a user.`,
    arguments: '<prefix>view-strikes [member]'
};