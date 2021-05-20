exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            supportVoiceChannel: `${channel.id}`
        }).then(() => {
            message.reply(`Support Voice Channel was set to ${channel}.`)
        });
    });
}, exports.info = {
    name: "supportvc",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the support channel for the server.`,
    arguments: '<prefix>supportvc [channel]'
};