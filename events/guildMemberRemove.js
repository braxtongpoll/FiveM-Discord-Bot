const { MessageEmbed, MessageAttachment } = require("discord.js");
module.exports = async(client, member) => {
    if (member.user.id == client.user.id) return;
    client.utils.status(client);
    client.db.findById(member.guild.id, async(err, res) => {
        let date = await member.user.createdAt;
        let joinTime = member.user.createdTimestamp
        let memCountChannl = await member.guild.channels.cache.get(res.discordCount);
        if (memCountChannl) memCountChannl.setName(`Discord Members: ${member.guild.memberCount}`, "Updated by bot, displaying member count.");
        let today = new Date().getTime();
        let days = ((today - joinTime) / 86400000).toString().split(`.`)[0]
        let monthArray = [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`];
        let cDate = `${monthArray[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
        let embed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(`${member.user.username} has left the server`, member.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .setThumbnail(member.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .addFields({
                name: `User`,
                value: `${member} | ${member.user.tag} | ${member.user.id}`
            }, {
                name: `Info`,
                value: `Created ` + cDate + ` (${days} days ago)` + '\n' + `Member: ${member.guild.memberCount}`
            })
        let logs = member.guild.channels.cache.get(res.welcomeLogs);
        if (logs) logs.send(embed);
    });
}