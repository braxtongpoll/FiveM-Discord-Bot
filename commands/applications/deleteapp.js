const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args, base, missing, invalid) => {
    client.db.findById(message.guild.id, async(err, res) => {
        if (!message.member.hasPermission(`MANAGE_GUILD`)) {
            var cont = false;
            res.managers.forEach(id => {
                if (message.member.roles.cache.has(id)) cont = true;
            })
            if (cont == false) client.permission(message, `MANAGE_GUILD`);
        };
        if (!res.applications[args.join(` `).toLowerCase()]) return client.utils.missing(message, `VALID APPLICATION NAME`)
        res.applications[args.join(` `).toLowerCase()] = undefined;
        let name = args.join(` `)
        await client.docUpdate(message, `applications`, res.applications, `The application **${name}** was deleted.`);
        var adminLogs = await message.guild.channels.cache.find(c => c.id === res.appLogs);
        if (adminLogs) {
            var adminEmbed = new MessageEmbed()
                .setColor(client.config.color)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                .setDescription(`Deleted the application **${name}**`)
            adminLogs.send(adminEmbed);
        };
    });
}, exports.info = {
    name: "deleteapplication",
    aliases: [`deleteapp`, `da`, `delete`],
    permission: `MANAGE_GUILD`,
    description: `Delete an application.`,
    arguments: '<prefix>deleteapplication [application name]'
}