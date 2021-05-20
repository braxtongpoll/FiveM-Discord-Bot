const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        if (!message.member.hasPermission(`MANAGE_GUILD`)) {
            var cont = false;
            res.managers.forEach(id => {
                if (message.member.roles.cache.has(id)) cont = true;
            })
            if (cont == false) client.permission(message, `MANAGE_GUILD`);
        };
        if (!args[0]) return client.utils.missing(message, `APPLICATION_NAME`);
        if (!res.applications[args.join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        if (res.applications[args.join(` `).toLowerCase()] == null) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        var user;
        const application = res.applications[args.join(` `).toLowerCase()]
        var creator = await message.guild.members.cache.find(m => m.id === application.createdBy) || application.createdBy;
        var sRoles = ``;
        if (application.sRole) application.sRole.forEach(id => {
            var role = message.guild.roles.cache.find(r => r.id === id);
            if (role) sRoles += `${role}|`;
        });
        var rolesToGive = ``;
        var rolesToTake = ``;
        if (application.addRoles) application.addRoles.forEach(id => {
            var role = message.guild.roles.cache.find(r => r.id === id);
            if (role) rolesToGive += `${role}|`;
        });
        if (application.removeRoles) application.removeRoles.forEach(id => {
            var role = message.guild.roles.cache.find(r => r.id === id);
            if (role) rolesToTake += `${role}|`;
        });
        var loggingChannel = await message.guild.channels.cache.find(c => c.id === application.logs) || `Unknown`;
        var statusChannel = await message.guild.channels.cache.find(c => c.id === application.statusLogs) || `Unknown`;
        let acceptMessage = application.acceptMessage || `None set`;
        let displayName = application.displayName || `None set`;
        var embed = new MessageEmbed()
            .setFooter(message.guild.name, message.guild.iconURL())
            .setColor(client.config.color)
            .setAuthor(args.join(` `))
            .setDescription(`**• Created By**: ${creator}\n**• Created On**: ${application.createdOn}\n**• Editor Roles**: ${sRoles}\n**• Logging Channel**: ${loggingChannel}\n**• Display Name**: ${displayName}\n**• Roles To Give**: ${rolesToGive}\n**• Roles To Take**: ${rolesToTake}\n**• Accept Message**: ${acceptMessage}`)
        message.reply(embed);
    });
}, exports.info = {
    name: "appinfo",
    aliases: [],
    permission: `MANAGE_SERVER`,
    description: `Look at every detail of an application.`,
    arguments: '<prefix>appinfo [application_name]'
}