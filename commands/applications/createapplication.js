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
        var name = await client.waitRes(message, `What is the name of this application?`);
        if (!name) return message.reply(`Time error.`);
        var channel = await client.waitChannel(message, `What is the logging channel for this application?`);
        if (!channel) return message.reply(`Time error.`);
        var Questions = await client.waitRes(message, `What are the questions? Seperate each by a |`, 300000);
        Questions = Questions.split(`|`);
        var date = new Date();
        var month = date.getMonth() + 1;
        date = month + `/` + date.getDate() + `/` + date.getFullYear() + ` ` + date.getHours() + `:` + date.getMinutes() + `:` + date.getSeconds();

        res.applications[name.toLowerCase()] = {
            createdBy: message.author.id,
            questions: Questions,
            createdOn: date,
            logs: channel.id,
            active: true
        };
        await client.docUpdate(message, `applications`, res.applications, `The application **${name}** was created. Try it out with ${res.prefix}apply ${name}`);
        var adminLogs = await message.guild.channels.cache.find(c => c.id === res.appLogs);
        if (adminLogs) {
            var adminEmbed = new MessageEmbed()
                .setColor(client.config.color)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
                .setDescription(`Created the application **${name}**`)
            adminLogs.send(adminEmbed);
        };
        //Memory clear
        limit = undefined;
        Questions = undefined;
        name = undefined;
        numberOfQuestions = undefined;
    });
}, exports.info = {
    name: "createapplication",
    aliases: [`createapp`, `ca`, `create`],
    permission: `MANAGE_GUILD`,
    description: `Create an application.`,
    arguments: '<prefix>createapplication'
}