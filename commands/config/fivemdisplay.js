const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            fiveMDisplay: `${channel.id}`
        }).then(() => {
            message.reply(`FiveM display was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "fivemdisplay",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the channel to display the server`,
    arguments: '<prefix>fivemdisplay [channel]'
}