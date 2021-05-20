const { MessageEmbed, MessageAttachment } = require(`discord.js`);
const fs = require(`fs`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        var ticket = false;
        res.tickets.forEach(ticket => {
            if (ticket.includes(message.channel.id)) return ticket = true;
        })
        if ((ticket == false) && (!message.channel.name.includes(`ticket`))) return message.reply(`You can only run this command in a ticket channel!`).then(a => a.delete({ timeout: 5000 })).catch(e => {});
        var messages = {};
        var members = ``;
        message.channel.messages.fetch({ limit: 100, before: message.id }).then(async(collected) => {
            message.channel.delete(`Ticket closed`).catch(e => {});
            collected.forEach(async(msg) => {
                if (msg.author.bot) return;
                messages[msg.id] = {
                    author: { tag: msg.author.tag, id: msg.author.id },
                    content: msg.content || `Unknown`
                }
                try {
                    messages[msg.id].image = msg.attachments.array()[0].url;
                } catch (e) {}
                if (!members.includes(msg.author.tag)) members += msg.author.tag + `\n`;
            });
            if (members == ``) members = `Unknown`;
            var name = ``;
            res.tickets.forEach(thing => {
                if (thing.includes(message.channel.id)) {
                    var arr = thing.split(`;`);
                    name = arr[2];
                }
            })
            var embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(`Ticket Closed`)
                .addFields({
                    name: `Ticket ID`,
                    value: message.channel.name.replace(`ticket-`, ``),
                    inline: true
                }, {
                    name: `Closing Member`,
                    value: `${message.author}`,
                    inline: true
                }, {
                    name: `Members in Ticket`,
                    value: members,
                    inline: true
                });
            res.tickets = res.tickets.filter(ticket => !ticket.includes(message.channel.id));
            var logs = message.guild.channels.cache.find(c => c.id === res.ticketLogs);
            var logger = ``;
            await Object.keys(messages).reverse().forEach(msg => {
                if (messages[msg].image == undefined) {
                    logger += `[${messages[msg].author.tag} (${messages[msg].author.id})]\n• Content: ${messages[msg].content}\n\n`;

                } else {
                    logger += `[${messages[msg].author.tag} (${messages[msg].author.id})]\n• Content: ${messages[msg].content}\n• Image: ${messages[msg].image}\n\n`;
                }
            })
            await fs.writeFileSync(`./src/ticket.txt`, logger);
            const attach = new MessageAttachment(`./src/ticket.txt`, `${message.channel.name}.txt`);
            embed.attachFiles(attach);
            logs.send(embed);
            client.db.findByIdAndUpdate(message.guild.id, {
                tickets: res.tickets
            }).then(() => {})
        })
    });
}, exports.info = {
    name: "close",
    aliases: [],
    permission: `@everyone`,
    description: `Close a ticket`,
    arguments: '<prefix>close'
}