const { MessageEmbed } = require('discord.js');
const fs = require(`fs`);
module.exports = async(client, reaction, user) => {
    if (reaction.partial) try { await reaction.fetch().catch(e => { console.log(e) }) } catch (e) { return client.logger.log(`Failed to fetch partial reactions | [${e}]`, "error") };
    if (user.bot) return
    if (!reaction.message.guild) return;
    client.db.findById(reaction.message.guild.id, async function(err, res) {
        if (res.reactionRoles[reaction.message.id]) {
            if (res.reactionRoles[reaction.message.id][reaction.emoji.name]) {
                let role = await reaction.message.guild.roles.cache.find(r => r.id === res.reactionRoles[reaction.message.id][reaction.emoji.name]);
                let member = await reaction.message.guild.members.cache.find(m => m.id === user.id);
                if (!member) return
                if (member.roles.cache.has(role.id)) member.roles.remove(role);
            };
        };
    });
};