const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let role = await client.utils.findRole(message, args);
        if (!role) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            autoRole: `${role.id}`
        }).then(() => {
            message.reply(`Auto role was set to ${role}.`)
        });
    })
}, exports.info = {
    name: "autorole",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the autorole for the server.`,
    arguments: '<prefix>requestrolelogs [role]'
}