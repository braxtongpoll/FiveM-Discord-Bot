const { MessageEmbed, Message } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async function(err, res) {
        message.delete()
        if (!res.levels) return;
        let array = [];
        await Object.keys(res.levels).forEach(user => {
            client.users.fetch(user).then(us => {
                array.push({
                    user: us,
                    xp: res.levels[user].xp,
                    lvl: res.levels[user].lvl,
                    messages: res.levels[user].messages
                });
            }).catch(e => {
                return;
            })
        });
        array = array.sort((a, b) => b.messages - a.messages);
        let medalArray = [`🥇`, `🥈`, `🥉`, `#4`, `#5`, `#6`, `#7`, `#8`, `#9`, `#10`, `#11`, `#12`, `#13`, `#14`, `#15`, `#16`, `#17`, `#18`, `#19`, `#20`, `#21`, `#22`, `#23`, `#24`, `#25`];
        let desc = ``;
        var limit = 0;
        array.forEach(p => {
            if (limit == medalArray.length) return;
            desc += `**${medalArray[limit]}** ${p.user} [${p.lvl} **(${p.xp}/${(p.lvl + 1) * 100})**]\n`;
            limit++;
        });
        let embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`Messages Leaderboard`)
            .setDescription(desc)
        message.reply(embed);

    });
}, exports.info = {
    name: "leaderboard",
    aliases: [`lb`],
    permission: `@everyone`,
    description: `Message leaderboard.`,
    arguments: '<prefix>leaderboard'
}