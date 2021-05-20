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
        var adminLogs = await message.guild.channels.cache.find(c => c.id === res.appLogs);
        var adminEmbed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        if (res.managers.includes(role.id)) {
            res.managers = res.managers.filter(id => id !== role.id);
            adminEmbed.setDescription(`Removed ${role} from the managers list.`);
        } else {
            res.managers.push(role.id);
            adminEmbed.setDescription(`Added ${role} to the managers list.`);
        };
        if (adminLogs) adminLogs.send(adminEmbed);
        client.docUpdate(message, `managers`, res.managers, `The manager role(s) was updated.`);
    });
}, exports.info = {
    name: "managers",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Roles allowed to edit, create, accept, and deny applications server wide.`,
    arguments: '<prefix>managers [role_mention/id]'
}