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
        if (!args[0]) return client.utils.missing(message, `STRIKE CASE NUMBER`);
        if (isNaN(args[0])) return client.utils.missing(message, `STRIKE CASE NUMBER`);
        let reason = args.slice(1).join(` `);
        if (!reason) return client.utils.missing(message, `REASON`);
        let id;
        let link;
        await Object.keys(res.strikes).forEach(user => {
            Object.keys(res.strikes[user]).forEach(caseNumber => {
                if (caseNumber == args[0]) {
                    if (res.strikes[user][caseNumber].active == false) return message.channel.send(`${message.member}, that strike is inactive.`);
                    id = user;
                    link = `https://discord.com/channels/${message.guild.id}/${res.strikes[user][caseNumber].channel}/${res.strikes[user][caseNumber].msg}`;
                    res.strikes[user][caseNumber].active = false;
                };
            });
        });
        let user = await client.users.cache.get(id);
        let embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`Strike Removal | Case #${res.strikeNumber}`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .setDescription(`[Strike Found Here](${link})\n**• Victim**: ${user.username} (${user.id})\n**• Supervisor**: ${message.author.username} (${message.author.id})\n**• Reason**: ${reason}`)
        let logs = message.guild.channels.cache.find(c => c.id === res.strikeLogs);
        client.db.findByIdAndUpdate(message.guild.id, {
            strikes: res.strikes
        }).then(() => {
            if (logs) logs.send(embed);
        }).catch(e => {
            console.log(e.stack);
        });
    });
}, exports.info = {
    name: "remove-strike",
    aliases: [`rs`, `rstrike`],
    permission: `ADMINISTRATOR / ROLE`,
    description: `Remove a strike`,
    arguments: '<prefix>remove-strike [strike case number] [reason]'
}