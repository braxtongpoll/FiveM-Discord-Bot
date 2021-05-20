const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            dmSupportCategory: `${channel.id}`
        }).then(() => {
            message.reply(`Dm Support category was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "dmsupportcat",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the DM Support Category of the server.`,
    arguments: '<prefix>dmsupportcat [channel]'
}