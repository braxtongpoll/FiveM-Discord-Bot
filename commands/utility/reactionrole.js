exports.run = async(client, message, args) => {
    client.utils.permissionCheck(message, `ADMINISTRATOR`).then(async(bool) => {
        if (bool == false) return;
        message.delete();
        client.db.findById(message.guild.id, async function(err, res) {
            if (!args[2]) return client.utils.missing(message, `MESSAGE_ID || ROLE_ID || EMOJI`);
            var role;
            if (message.mentions.roles.first()) {
                role = message.mentions.roles.first();
            } else {
                role = await message.guild.roles.cache.find(r => r.id === args[1]);
            };
            if (!role) return client.utils.missing(message, `ROLE`);
            var react;
            var db;
            if (!args[2].replace(`<`, ``).replace(`>`, ``).split(`:`)[2]) {
                react = args[2];
                db = react;
            } else {
                var array = args[2].replace(`<`, ``).replace(`>`, ``).split(`:`);
                react = array[2];
                db = array[1];
            }
            if ((!db) || (!react)) return client.utils.missing(message, `EMOJI`);
            message.channel.messages.fetch(args[0]).then(msg => {
                msg.react(react);
                client.db.findById(message.guild.id, async function(err, res) {
                    if (!res.reactionRoles[msg.id]) {
                        res.reactionRoles[msg.id] = {
                            [db]: `${role.id}`
                        };
                    } else {
                        res.reactionRoles[msg.id][db] = `${role.id}`;
                    }
                    client.db.findByIdAndUpdate(message.guild.id, {
                        reactionRoles: res.reactionRoles
                    }).then(() => {});
                });
            }).catch(e => {
                return client.utils.missing(messge, `VALID MESSAGE ID`);
            })
        });
    });
}, exports.info = {
    name: "reactionrole",
    permission: `ADMINISTRATOR`,
    aliases: ["rr"],
    description: `Setup a reaction role.`,
    arguments: '<prefix>requestrole [message_id] [role_mention/id] [emoji]'
}