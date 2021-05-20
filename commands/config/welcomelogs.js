const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            welcomeLogs: `${channel.id}`
        }).then(() => {
            message.reply(`The welcome logs channel was set to ${channel}.`)
        });
    })
}, exports.info = {
    name: "welcomelogs",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the channel to logs join/leaves.`,
    arguments: '<prefix>welcomelogs [channel]'
}