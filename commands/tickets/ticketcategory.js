exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        let channel = await client.utils.findChannel(message, args);
        if (!channel) return client.utils.missing(message, `CHANNEL`);
        if (channel.type !== "category") return client.utils.missing(message, "CATEGORY CHANNEL");
        client.db.findByIdAndUpdate(message.guild.id, {
            ticketCategory: `${channel.id}`
        }).then(() => {
            message.reply(`Ticket logs was set to ${channel}.`);
        });
    })
}, exports.info = {
    name: "ticketcategory",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Set the tickets category of the server.`,
    arguments: '<prefix>ticketcategory [channel]'
};