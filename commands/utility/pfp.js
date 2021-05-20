const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    let member = message.mentions.members.first() || message.guild.members.cache.find(m => m.id === args[0]);
    if (!member) return client.utils.missing(message, "USER");
    message.channel.send(member.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
}, exports.info = {
    name: "pfp",
    aliases: [],
    permission: `@everyone`,
    description: `Get the profile picture of a user.`,
    arguments: '<prefix>pfp [user]'
}