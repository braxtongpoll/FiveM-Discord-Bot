const { MessageEmbed, MessageAttachment } = require(`discord.js`);
const fs = require(`fs`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        var ticket = false;
        res.tickets.forEach(ticket => {
            if (ticket.includes(message.channel.id)) return ticket = true;
        })
        if ((ticket == false) && (!message.channel.name.includes(`ticket`))) return message.reply(`You can only run this command in a ticket channel!`).then(a => a.delete({ timeout: 5000 })).catch(e => {});
        let thing;
        if (message.mentions.members.first()) {
            thing = message.mentions.members.first();
        } else if (message.mentions.roles.first()) {
            thing = message.mentions.roles.first();
        } else {
            thing = message.guild.roles.cache.find(r => r.id === args[0]) || message.guild.members.cache.find(m => m.id === args[0]);
        };
        if (!thing) return client.utils.missing(message, `MEMBER / ROLE`);
        message.delete();
        message.channel.updateOverwrite(thing.id, { VIEW_CHANNEL: false });
        message.channel.send(`${thing} was removed from the ticket.`);
    });
}, exports.info = {
    name: "remove",
    aliases: [],
    permission: `@everyone`,
    description: `Remove a member or role from a ticket.`,
    arguments: '<prefix>remove [member/role]'
}