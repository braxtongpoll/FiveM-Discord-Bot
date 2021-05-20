const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            suggestionChannel: `${channel.id}`
        }).then(() => {
            message.reply(`Suggestion Channel was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "suggestionchannel",
    aliases: [`sc`, `suggestionchan`],
    permission: `ADMINISTRATOR`,
    description: `Set the suggestionchannel of the server.`,
    arguments: '<prefix>suggestionchannel [channel]'
}