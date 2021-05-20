const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        message.delete();
        message.channel.send(args.join(` `));
    });
}, exports.info = {
    name: "say",
    aliases: [],
    permission: `ADMINISTRATOR`,
    description: `Have the bot say something.`,
    arguments: '<prefix>say [message]'
}