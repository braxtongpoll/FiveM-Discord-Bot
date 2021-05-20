const { MessageEmbed } = require("discord.js");
module.exports = async(client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return client.utils.dmGlobalLogging(client, message);
    client.utils.globalLogging(client, message);
    client.db.findById(message.guild.id, async function(err, res) {
        if (message.mentions.members.first()) {
            if ((message.mentions.members.first().id == client.user.id) && (!message.content.includes(` `))) return message.reply(`This servers prefix is ` + '`' + res.prefix + '`');
        };
        if ((res.stickies[message.channel.id]) && (!message.content.startsWith(`${res.prefix}sticky delete`))) client.utils.stickyControl(message, res.stickies[message.channel.id]);
        if (message.content.startsWith(res.prefix)) client.utils.commandControl(client, message, res.prefix);
        if (!message.content.startsWith(res.prefix)) client.utils.levelControl(client, message, res.levels)
    });
};