const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        client.db.findById(message.guild.id, async function(err, res) {
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setDescription(`To receive private support react below to open a ticket.`)
            message.channel.send(embed).then(msg => {
                msg.react(`🎟️`);
                res.ticketPanels[msg.id] = `${message.channel.id}`;
                client.db.findByIdAndUpdate(message.guild.id, {
                    ticketPanels: res.ticketPanels
                }).then(() => {});
            });
        });
    });
}, exports.info = {
    name: "ticketpanel",
    aliases: [],
    permission: `@everyone`,
    description: `Create a ticket panel.`,
    arguments: '<prefix>ticketpanel'
}