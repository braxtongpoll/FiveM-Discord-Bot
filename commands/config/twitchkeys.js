const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    if (!message.member.hasPermission(`MANAGE_GUILD`)) return client.permission(message, `MANAGE_GUILD`);
    if (!args[0]) return client.utils.missing(message, "WORD");
    let words = args.join(" ").toLowerCase()
    client.db.findById(message.guild.id, async(err, res) => {
        if (res.twitchKeyWords.includes(words)) {
            res.twitchKeyWords = res.twitchKeyWords.filter(id => id !== words);
        } else {
            res.twitchKeyWords.push(words);
        };
        client.docUpdate(message, `twitchKeyWords`, res.twitchKeyWords, `The Twitch Word Keys were updated.`);
    });
}, exports.info = {
    name: "twitchkeys",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Key words in twitch stream title to give the streamer role.`,
    arguments: '<prefix>twitchkey [word]'
}