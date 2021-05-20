const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            appLogs: `${channel.id}`
        }).then(() => {
            message.reply(`App logs was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "applogs",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the administrative application logs.`,
    arguments: '<prefix>applogs [channel]'
}