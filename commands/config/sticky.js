const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_GUILD`).then(async(bool) => {
        if (bool == false) return;
        client.db.findById(message.guild.id, async function(err, res) {
            if (args[0].toLowerCase() == `delete`) {
                let channel = await client.utils.findChannel(message, args)
                if (!channel) return client.utils.missing(message, `CHANNEL`);
                res.stickies[channel.id] = undefined;
                client.docUpdate(message, `stickies`, res.stickies, `Sticky deleted.`);
            } else {
                let msg = args.join(` `);
                res.stickies[message.channel.id] = msg;
                message.channel.send('`📌`' + `__***Sticky Message, Read Before Typing***__` + '`📌`\n' + msg);
                client.docUpdate(message, `stickies`, res.stickies);
            }
        })
    });
}, exports.info = {
    name: "sticky",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Set the request role logs of the server.`,
    arguments: '<prefix>sticky [channel] [message]'
}