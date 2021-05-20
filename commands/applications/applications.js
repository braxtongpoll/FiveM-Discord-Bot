const { MessageEmbed } = require("discord.js");

exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        var string = ``;
        if (args[0] == `aDisplay`) {
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setAuthor(`${message.guild.name} Applications`)
            await Object.keys(res.applications).forEach(app => {
                if (res.applications[app] == null) return;
                var status = `CLOSED`;
                if (res.applications[app].active == true) status = `OPEN`;
                if (status == `OPEN`) {
                    embed.addField(res.applications[app].displayName, '```yml\n' + `Status: ${status}     How to Apply: Run .apply ${app}` + '\n```')
                } else {
                    embed.addField(res.applications[app].displayName, '```yml\n' + `Status: ${status}   How to Apply: Run .apply ${app}` + '\n```')
                }
            });
            message.delete();
            return message.channel.send(embed);
        }
        await Object.keys(res.applications).forEach(app => {
            if (res.applications[app] == null) return;
            if (message.member.hasPermission(`MANAGE_GUILD`)) {
                if (res.applications[app].active == true) {
                    string += `**Name**: ${app}\n> **Questions**: ${res.applications[app].questions.length}\n> **Logs**: <#${res.applications[app].logs}>\n> **Status**: Open\n`;
                } else {
                    string += `**Name**: ${app}\n> **Questions**: ${res.applications[app].questions.length}\n> **Logs**: <#${res.applications[app].logs}>\n> **Status**: Closed\n`;
                }
            } else {
                if (res.applications[app].active == true) {
                    string += `**Name**: ${app}\n> **Questions**: ${res.applications[app].questions.length}\n> **Status**: Open\n`;
                } else {
                    string += `**Name**: ${app}\n> **Questions**: ${res.applications[app].questions.length}\n> **Status**: Closed\n`;
                }
            }
        })
        var embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(`${message.guild.name}'s Applications`)
            .setDescription(string)
        message.channel.send(embed);
        string = undefined;
    });
}, exports.info = {
    name: "applications",
    aliases: [`apps`],
    permission: `MANAGE_GUILD`,
    description: `View all the servers applications.`,
    arguments: '<prefix>applications'
}