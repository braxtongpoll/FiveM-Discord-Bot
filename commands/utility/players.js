const { MessageEmbed } = require(`discord.js`);
const request = require("request");
exports.run = async(client, message, args) => {
    let allPlayers = [];
    client.db.findById(message.guild.id, async function(err, res) {
        try {
            request(`http://${res.ip}:${res.port}/players.json`, async function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body)
                    await body.forEach(player => {
                        var discord;
                        for (let ident of player.identifiers) {
                            if (ident.includes("discord")) {
                                discord = ident.split(":")[1];
                            };
                        };
                        if (discord) {
                            client.users.fetch(discord).then(user => {
                                allPlayers.push({ ID: String(player.id), Name: `${user}` })
                            }).catch(() => {
                                allPlayers.push({ ID: String(player.id), Name: player.name })
                            });
                        } else {
                            allPlayers.push({ ID: String(player.id), Name: player.name })
                        }
                    });
                    let string = "";
                    for (let player of allPlayers) {
                        string += "[" + player.ID + "] " + player.Name + "\n";
                    };
                    let embed = new MessageEmbed()
                        .setFooter(message.guild.name, message.guild.iconURL())
                        .setColor(client.config.color)
                        .setTitle("Online Players " + body.length)
                        .setDescription(string)
                    message.channel.send(embed);
                };
            });
        } catch {
            let embed = new MessageEmbed()
                .setFooter(message.guild.name, message.guild.iconURL())
                .setColor(client.config.color)
                .setTitle("Server Offline")
                .setDescription("No Player Data")
            message.channel.send(embed);
        }
    })
}, exports.info = {
    name: "players",
    aliases: [],
    permission: `@everyone`,
    description: `Check the online players for FiveM.`,
    arguments: '<prefix>players'
}