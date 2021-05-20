const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        if (!args[0]) return client.utils.missing(message, `PREFIX`);
        client.db.findByIdAndUpdate(message.guild.id, {
            ip: args[0]
        }).then(() => {
            message.reply(`The IP was set to ${args[0]}`);
        });
    })
}, exports.info = {
    name: "updateip",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the ip of the server.`,
    arguments: '<prefix>updateip [channel]'
}