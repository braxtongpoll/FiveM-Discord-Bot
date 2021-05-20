const { MessageEmbed } = require(`discord.js`);
exports.run = async(client, message, args) => {
    if (message.author.id !== `399718367335940117`) return;
    if (!args[0]) return client.utils.missing(message, `TYPE OF SETUP`);
    let setup;
    switch (args[0]) {
        case `department`:
            setup = {
                channels: {
                    Information: [
                        { type: `text`, name: `announcements` },
                        { type: `text`, name: `important links` },
                        { type: `text`, name: `faq` }
                    ],
                    General: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `off topic` },
                        { type: `text`, name: `gallery` },
                        { type: `text`, name: `request roles` },
                        { type: `voice`, name: `General Voice` },
                        { type: `voice`, name: `Meeting` }
                    ],
                    [`Senior Command`]: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `notes` },
                        { type: `voice`, name: `SC Voice` }
                    ],
                    [`High Command`]: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `notes` },
                        { type: `voice`, name: `HC Voice` }
                    ],
                    Logs: [
                        { type: `text`, name: `discord logs` },
                        { type: `text`, name: `moderation logs` },
                        { type: `text`, name: `request role logs` },
                        { type: `text`, name: `join leave logs` }
                    ]
                },
                roles: [
                    `Backwoods Staff`
                ]
            };
            break;
        case `staff`:
            setup = {
                channels: {
                    Information: [
                        { type: `text`, name: `announcements` },
                        { type: `text`, name: `important links` },
                        { type: `text`, name: `faq` }
                    ],
                    General: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `off topic` },
                        { type: `text`, name: `gallery` },
                        { type: `text`, name: `request roles` },
                        { type: `voice`, name: `General Voice` },
                        { type: `voice`, name: `Meeting` }
                    ],
                    Development: [
                        { type: `text`, name: `announcements` },
                        { type: `text`, name: `assignments` },
                        { type: `text`, name: `information` },
                        { type: `text`, name: `general` }
                    ],
                    [`Senior Leadership`]: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `notes` },
                        { type: `voice`, name: `SC Voice` }
                    ],
                    [`Senior Management`]: [
                        { type: `text`, name: `general` },
                        { type: `text`, name: `notes` },
                        { type: `voice`, name: `HC Voice` }
                    ],
                    Logs: [
                        { type: `text`, name: `discord logs` },
                        { type: `text`, name: `moderation logs` },
                        { type: `text`, name: `request role logs` },
                        { type: `text`, name: `join leave logs` }
                    ]
                }
            };
            break
    }
    Object.keys(setup.channels).forEach(cname => {
        message.guild.channels.create(cname, {
            type: `category`
        }).then(category => {
            setup.channels[cname].forEach(channel => {
                message.guild.channels.create(channel.name, {
                    type: channel.type,
                    parent: category.id
                }).then(() => {})
            });
        });
    });
    if (setup.roles) setup.roles.forEach(role => {
        message.guild.roles.create({
            date: {
                name: role
            }
        }).then(() => {})
    })
}, exports.info = {
    name: "setup",
    aliases: [],
    permission: `DEVELOPER`,
    description: `Used for server setup.`,
    arguments: '<prefix>setup [type of setup]'
}