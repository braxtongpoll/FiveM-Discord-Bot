const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(bool => {
        if (bool == false) return;
        if (args[0].toLowerCase() == `edit`) {
            message.channel.messages.fetch(args[1]).then(msg => {
                args = args.slice(2).join(` `).split(` | `);
                message.delete();
                let embed = msg.embeds[0].setDescription(args[1]).setTitle(args[0]);
                try { embed.setImage(args[2]) } catch (e) {};
                msg.edit(embed);
            }).catch(e => {
                return message.reply(`Invalid message ID`);
            })
        } else {
            args = args.join(` `).split(` | `);
            if (!args[1]) return client.utils.missing(message, `TITLE DESCRIPTION`);
            message.delete();
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setTitle(args[0])
                .setDescription(args[1])
            try { embed.setImage(args[2]) } catch (e) {}
            message.channel.send(embed);
        };
    });
}, exports.info = {
    name: "embed",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Create an embed.`,
    arguments: '<prefix>embed [title] | [description] | [image]\n<prefix>embed edit [message ID] [new title] | [new description] | [new image]'
}