const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    message.channel.send(message.guild.iconURL({ format: "png" }))
}, exports.info = {
    name: "icon",
    aliases: [],
    permission: `@everyone`,
    description: `Get the icon for the guild.`,
    arguments: '<prefix>icon'
}