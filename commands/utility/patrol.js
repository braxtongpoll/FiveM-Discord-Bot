const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `MANAGE_ROLES`).then(bool => {
        if (bool == false) return;
        message.delete().catch(e => {});
        var time = args.join(` `).split(` | `)[0] || `4:00 PM PST`;
        var event = args.join(` `).split(` | `)[1] || `No event scheduled for today.`;
        client.db.findById(message.guild.id, async function(err, res) {
            var embed = new MessageEmbed()
                .setFooter(`• Thank you for playing with us! Make sure to react if you are going to attend! •`, message.guild.iconURL())
                .setColor(client.config.color)
                .setTitle(`• ${message.guild.name} Patrol Announement`)
                .setDescription(`There will be a scheduled patrol at ${time} and we invite all to come and join in the fun.\n`)
                .addFields({
                    name: `Event`,
                    value: event,
                    inline: true
                }, {
                    name: `How to Play`,
                    value: 'F8 > `' + res.ip + '`',
                    inline: true
                })
            message.channel.send(`@everyone `, { embed: embed }).then(m => {
                [`❌`, `✅`, `❓`].forEach(emoji => { m.react(emoji); });
            });
        });
    });
}, exports.info = {
    name: "patrol",
    aliases: [],
    permission: `MANAGE_ROLES `,
    description: `Post a patrol announcement.`,
    arguments: '<prefix>patrol [time] | [event]'
}