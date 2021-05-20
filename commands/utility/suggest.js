const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        let channel = message.guild.channels.cache.get(res.suggestionChannel);
        if (!channel) return message.reply(`This system has yet to be setup!`).then(a => a.delete({ timeout: 5000 }));;
        let embed = new MessageEmbed()
            .setColor(client.config.color)
            .setFooter(message.guild.name, message.guild.iconURL())
            .setDescription(`To vote for this suggestion react with ☑️ or ❌.`)
            .setAuthor(`New Suggestion from ` + message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        if (args[0]) {
            if (args.join(` `).includes(` | `)) {
                args = args.join(` `).split(` | `);
            }
            embed.addField(`Suggestion`, args.join(` `))
        }
        var image;
        try { image = new MessageAttachment(message.attachments.array()[0].proxyURL) } catch (e) {};
        try { embed.setImage(image.attachment) } catch (e) {}
        console.log(image)
        channel.send(embed).then(sugEmbed => {
            [`❌`, `☑️`].forEach(emoji => { sugEmbed.react(emoji) });
            res.suggestions[sugEmbed.id] = {
                author: message.author.id,
                content: {
                    text: embed.description,
                    image: embed.image
                }
            };
            client.docUpdate(message, `suggestions`, res.suggestions);
        });
    });
}, exports.info = {
    name: "suggest",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Post a suggestion to the suggestion channel.`,
    arguments: '<prefix>suggestion [content] | [image]'
}