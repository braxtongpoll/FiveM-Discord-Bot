const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    if (!message.member.hasPermission(`MANAGE_GUILD`)) return message.reply(`NO permission.`);
    message.delete();
    let embed = new MessageEmbed()
        .setFooter(message.guild.name, message.guild.iconURL())
        .setColor(client.config.color)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        .setDescription(args.join(` `))
    message.channel.send(`@everyone`, { embed: embed })
}, exports.info = {
    name: "announce",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Make an annoucement.`,
    arguments: '<prefix>announce [announcement]'
}