const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            welcomes: `${channel.id}`
        }).then(() => {
            message.reply(`The welcome channel was set to ${channel}.`)
        });
    })
}, exports.info = {
    name: "welcomes",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the channel to welcome people`,
    arguments: '<prefix>welcomes [channel]'
}