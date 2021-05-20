exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        var ticket = false;
        res.tickets.forEach(ticket => {
            if (ticket.includes(message.channel.id)) return ticket = true;
        })
        if ((ticket == false) && (!message.channel.name.includes(`ticket`))) return message.reply(`You can only run this command in a ticket channel!`).then(a => a.delete({ timeout: 5000 })).catch(e => {});
        if (!args[0]) return client.utils.missing(message, "NEW NAME")
        message.channel.setName("ticket-" + args.join(" "), "Updated by " + message.author.tag + " with rename command.");
        message.delete().catch(() => {});
        message.channel.send(`${message.author} renamed the ticket to ${args.join(" ")}`)
    });
}, exports.info = {
    name: "rename",
    aliases: [],
    permission: `@everyone`,
    description: `Rename a ticket.`,
    arguments: '<prefix>rename [new_name]'
}