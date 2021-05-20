const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            discordCount: `${channel.id}`
        }).then(() => {
            message.reply(`Member count was set to ${channel}.`)
        });
    })
}, exports.info = {
    name: "membercount",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the member count of the server.`,
    arguments: '<prefix>membercount [channel]'
}