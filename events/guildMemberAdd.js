const { MessageEmbed, MessageAttachment } = require("discord.js");
const Canvas = require("canvas");
const path = require("path");
const { registerFont } = require('canvas')
registerFont('./src/local/Acme-Regular.ttf', { family: 'sans-seriff' })
module.exports = async(client, member) => {
    client.utils.status(client);
    client.db.findById(member.guild.id, async function(err, res) {
        let welcomeChan = await member.guild.channels.cache.get(res.welcomes);
        let joinRole = await member.guild.roles.cache.get(res.autoRole);
        let memCountChannl = await member.guild.channels.cache.get(res.discordCount);
        if (memCountChannl) memCountChannl.setName(`Discord Members: ${member.guild.memberCount}`, "Updated by bot, displaying member count.");
        if (joinRole) member.roles.add(joinRole).catch(e => {});
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');
        const loadBack = await Canvas.loadImage(path.join(__dirname, "../", "src/", "local/", "welcomecard.png"));
        ctx.drawImage(loadBack, 0, 0, canvas.width, canvas.height);
        const avatar = await Canvas.loadImage(member.user.avatarURL({ format: 'jpg' }));
        ctx.drawImage(avatar, 25, 25, 200, 200);
        ctx.font = '30px sans-seriff';
        ctx.fillStyle = "#1560b0";
        ctx.fillText(`Welcome to ${member.guild.name}`, canvas.width / 2.5, canvas.height / 3.5);
        ctx.font = verifySize(canvas, `${member.user.username}`);
        ctx.fillStyle = `#1560b0`;
        ctx.fillText(member.user.username, canvas.width / 2.5, canvas.height / 1.8);
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const image = await new MessageAttachment(canvas.toBuffer(), `welcome.png`);
        if (welcomeChan) {
            welcomeChan.send(`👋 ${member}`, image);
        };
        var date = await member.user.createdAt;
        var joinTime = member.user.createdTimestamp
        var today = new Date().getTime();
        var days = ((today - joinTime) / 86400000).toString().split(`.`)[0]
        var monthArray = [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`];
        var cDate = `${monthArray[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
        var embed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(`${member.user.username} has joined the server`, member.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .setThumbnail(member.user.displayAvatarURL({ format: `png`, dynamic: true, size: 1024 }))
            .addFields({
                name: `User`,
                value: `${member} | ${member.user.tag} | ${member.user.id}`
            }, {
                name: `Info`,
                value: `Created ` + cDate + ` (${days} days ago)` + '\n' + `Member: ${member.guild.memberCount}`
            })
        let logs = member.guild.channels.cache.get(res.welcomeLogs);
        if (logs) logs.send(embed);
    })
}

function verifySize(canvas, text) {
    const ctx = canvas.getContext('2d')

    let fontSize = 65;

    do {
        ctx.font = `${fontSize -= 10}px sans-seriff`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
}