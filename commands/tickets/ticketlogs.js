exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        client.db.findByIdAndUpdate(message.guild.id, {
            ticketLogs: `${channel.id}`
        }).then(() => {
            message.reply(`Ticket logs was set to ${channel}.`)
        });
    })
}, exports.info = {
    name: "ticketlogs",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the tickets logs of the server.`,
    arguments: '<prefix>ticketlogs [channel]'
}