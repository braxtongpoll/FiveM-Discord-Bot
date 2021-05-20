const { MessageEmbed } = require("discord.js");

module.exports = async(client, message) => {
    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    client.db.findById(message.guild.id, async function(err, res) {
        if (message.content.startsWith(res.prefix)) return;
        let embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`Message Delete`, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .setDescription(`**• Author**: ${message.author.username} (${message.author.id})\n**• Channel**: ${message.channel} (${message.channel.name})\n**• Content**: ${message.content}`)
        var image;
        try { var image = new MessageAttachment(message.attachments.array()[0].proxyURL) } catch (e) {};
        try { embed.setImage(image.attachment) } catch (e) {}
        let discordLogs = message.guild.channels.cache.find(c => c.id === res.discordLogs);
        if (discordLogs) discordLogs.send(embed);
    })
};