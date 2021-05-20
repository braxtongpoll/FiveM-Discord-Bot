const { MessageEmbed } = require(`discord.js`);
const fs = require(`fs`);
const devs = [`399718367335940117`];
const path = require("path");
exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        await message.delete()
        if (args.length) callCommand(client, message, args[0], res)
        else callMenu(client, message, res);
    });
}, exports.info = {
    name: "help",
    aliases: [],
    permission: `@everyone`,
    description: `Get help for my commands`,
    arguments: '<prefix>help'
}
async function callMenu(client, message, res) {
    let embed = new MessageEmbed()
    embed.setAuthor(`${client.user.username}'s commands`)
    embed.setColor(client.config.color)
    let commandData = {};
    fs.readdirSync(path.join(__dirname, `../`)).forEach(dir => {
        if (dir == "developer" && !devs.includes(message.author.id)) return;
        const cmds = fs.readdirSync(path.join(__dirname, `../`, `${dir}`)).filter(f => f.endsWith(".js"));
        for (let file of cmds) {
            let info = require(`../${dir}/${file}`);
            let perms = true;
            try { if (!message.member.hasPermission(info.info.permission)) perms = false; } catch {};
            if (perms == false) continue;
            let arguments = info.info.arguments.replace("<prefix>", res.prefix).replace("<prefix>", res.prefix).replace("<prefix>", res.prefix).replace("<prefix>", res.prefix).replace("<prefix>", res.prefix);
            let aliases = info.info.aliases.join(", ") || "No Aliases"
            if (commandData[dir]) {
                commandData[dir][info.info.name] = {
                    description: info.info.description,
                    permission: info.info.permission,
                    arugments: arguments,
                    aliases: aliases
                }
            } else {
                commandData[dir] = {
                    [info.info.name]: {
                        description: info.info.description,
                        permission: info.info.permission,
                        arugments: arguments,
                        aliases: aliases
                    }
                };
            };
        };
    });
    let page = 1;
    let pages = [];
    Object.keys(commandData).forEach(category => {
        pages.push(category);
    });
    embed.setDescription("Welcome to Whiskey Networks Discord Bot written by PlutoTheDev. For help use the arrows to scroll through the category of commands.");
    embed.setFooter(`Viewing page ${page} of ${pages.length}`)
    message.channel.send(embed).then(async(m) => {
        m.react(`⬅️`).then(async(r) => {
            await m.react(`❌`);
            await m.react(`➡️`);
            const removeReaction = async(m, msg, emoji) => { try { m.reactions.cache.find(r => r.emoji.name == emoji).users.remove(message.author.id); } catch (err) {} };

            const back = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id;
            const forward = (reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id;
            const close = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;

            const backwards = m.createReactionCollector(back, { time: 60000 });
            const forwards = m.createReactionCollector(forward, { time: 60000 });
            const closer = m.createReactionCollector(close, { time: 60000 });

            backwards.on('collect', async(r) => {
                await removeReaction(m, message, '⬅️')
                if (page === 1) return;
                page--;
                embed.setAuthor(pages[page - 1])
                let desc = "To get more info on a command run `" + res.prefix + "help <command_name>`\n\n";
                Object.keys(commandData[pages[page - 1]]).forEach(cmd => {
                    desc += "`" + res.prefix + cmd + "`\n" + commandData[pages[page - 1]][cmd].description + "\n";
                });
                embed.setDescription(desc)
                embed.setFooter(`Viewing page ${page} of ${pages.length}`)
                m.edit(embed)
            });

            forwards.on(`collect`, async(r) => {
                await removeReaction(m, message, '➡️')
                if (page === pages.length) return;
                page++;
                embed.setAuthor(pages[page - 1])
                let desc = "To get more info on a command run `" + res.prefix + "help <command_name>`\n\n";
                Object.keys(commandData[pages[page - 1]]).forEach(cmd => {
                    desc += "`" + res.prefix + cmd + "`\n" + commandData[pages[page - 1]][cmd].description + "\n";
                });
                embed.setDescription(desc)
                embed.setFooter(`Viewing page ${page} of ${pages.length}`)
                m.edit(embed)
            });

            closer.on('collect', r => {
                m.delete()
            });
        });
    });
}
async function callCommand(client, message, command, res) {
    var cmdData = ``;
    var cat;
    var found = false;
    let embed = new MessageEmbed()

    fs.readdirSync(path.join(__dirname, `../`)).forEach(dir => {
        const cmds = fs.readdirSync(path.join(__dirname, `../`, `${dir}`)).filter(f => f.endsWith(".js"));

        for (let file of cmds) {
            let info = require(`../${dir}/${file}`);

            if (info.info.name == command.toLowerCase()) {
                let arguments = info.info.arguments.replace("<prefix>", res.prefix).replace("<prefix>", res.prefix).replace("<prefix>", res.prefix).replace("<prefix>", res.prefix);
                cmdData += `**Description**: ${info.info.description}\n**Aliases:** ${info.info.aliases.join(" ") || "None"}\n**Arguements:**\n` + '```\n' + arguments + '\n```';
                found = true;
            } else {
                continue;
            }
        }
    });
    if (found == false) {
        embed.setColor(client.config.color);
        embed.setAuthor(`No information found for ${command}`);
        embed.setDescription(`The command by that name was not found.`);
        embed.setFooter(`Requested by ${message.author.tag}`)
        return message.channel.send(embed)
    }
    embed.setColor(client.config.color);
    embed.setAuthor(`Information for ${command}`);
    embed.setDescription(cmdData);
    embed.setFooter(`Requested by ${message.author.tag}`)
    return message.channel.send(embed)
}