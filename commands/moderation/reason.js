const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_MESSAGES`).then(bool => {
        if (bool == false) return;
        message.delete();
        client.db.findById(message.guild.id, function(err, res) {
            if (!args[0]) return client.utils.missing(message, `CASE# REASON`);
            if (!res.cases[args[0]]) return client.utils.missing(message, `VALID CASE NUMBER`);
            if ((res.cases[args[0]].moderator !== message.author.id) && (!message.member.hasPermission(`ADMINISTRATOR`))) return message.reply(`You are not allowed to edit cases not of yours.`).then(a => a.delete({ timeout: 10000 }));
            let reason = args.slice(1).join(` `)
            res.cases[args[0]].reason = reason
            let channel = message.guild.channels.cache.find(c => c.id === res.cases[args[0]].channel);
            message.channel.send(`The reason for case **#${args[0]}** was set to: **${reason}**`)
            if (!channel) {
                return client.db.findByIdAndUpdate(message.guild.id, {
                    cases: res.cases
                }).then(() => {});
            } else {
                channel.messages.fetch(res.cases[args[0]].message).then(msg => {
                    if (!msg) return;
                    let array = msg.embeds[0].description.split(`\n`);
                    array[2] = `**• Reason**: ${reason}`;
                    let description = array.join(`\n`);
                    let embed = msg.embeds[0].setDescription(description);
                    msg.edit(embed);
                });
            };
        });
    });
}, exports.info = {
    name: "reason",
    aliases: [],
    permission: `MANAGE_MESSAGES`,
    description: `Edit the reason for one of your cases.`,
    arguments: '<prefix>reason [case number] [new reason]'
}