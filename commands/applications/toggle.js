const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        if (!message.member.hasPermission(`MANAGE_GUILD`)) {
            var cont = false;
            res.managers.forEach(id => {
                if (message.member.roles.cache.has(id)) cont = true;
            })
            if (cont == false) message.reply(`Missing MANAGE_GUILD permission.`);
        };
        var adminLogs = await message.guild.channels.cache.find(c => c.id === res.appLogs);
        var appname = args.join(` `).toLowerCase();
        var adminEmbed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
        if (!args[0]) return client.utils.missing(message, `APPLICATION_NAME`);
        if (!res.applications[args.join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        if (res.applications[args.join(` `).toLowerCase()].active == true) {
            res.applications[args.join(` `).toLowerCase()].active = false;
            adminEmbed.setDescription(`Disabled the application **${appname}**`)
        } else {
            res.applications[args.join(` `).toLowerCase()].active = true;
            adminEmbed.setDescription(`Enabled the application **${appname}**`)
        }
        if (adminLogs) adminLogs.send(adminEmbed);
        client.docUpdate(message, `applications`, res.applications, `The application was updated.`);
    });
}, exports.info = {
    name: "toggle",
    aliases: [],
    permission: `MANAGE_GUILD`,
    description: `Toggle an application open or closed.`,
    arguments: '<prefix>toggle [application_name]'
}