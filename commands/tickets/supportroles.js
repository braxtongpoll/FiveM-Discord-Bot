const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    if (!message.member.hasPermission(`MANAGE_GUILD`)) return client.permission(message, `MANAGE_GUILD`);
    var role;
    if (message.mentions.roles.first()) {
        role = message.mentions.roles.first();
    } else {
        role = await message.guild.roles.cache.find(r => r.id === args[0]);
    };
    if (!role) return client.utils.missing(message, `ROLE_MENTION/id`);
    client.db.findById(message.guild.id, async(err, res) => {
        var adminEmbed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        if (res.supportRoles.includes(role.id)) {
            res.supportRoles = res.supportRoles.filter(id => id !== role.id);
        } else {
            res.supportRoles.push(role.id);
        };
        client.docUpdate(message, `supportRoles`, res.supportRoles, `The ticket support role(s) was updated.`);
    });
}, exports.info = {
    name: "supportroles",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Roles allowed into tickets.`,
    arguments: '<prefix>supportroles [role_mention/id]'
}