const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            strikeLogs: `${channel.id}`
        }).then(() => {
            message.reply(`Strike logs was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "strikelogs",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the strike logs of the server.`,
    arguments: '<prefix>strike [channel]'
}