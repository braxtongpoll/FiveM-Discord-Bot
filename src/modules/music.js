const ytdlDiscord = require('ytdl-core-discord');
const Logger = require(`../modules/Logger`);


module.exports = {
    async play(song, message, client) {
        const queue = message.client.queue.get(message.guild.id);

        if (!song) {
            queue.channel.leave();
            message.client.queue.delete(message.guild.id);
            return queue.textChannel.send(`❌ The music queue has ended. ❌`).catch(console.error);
        }

        let stream = null;

        try {
            if (song.url.includes("youtube.com")) {
                stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
            } else {
                return message.channel.send(`I only support youtube songs.`).then(a => a.delete({ timeout: 10000 }));
            }
        } catch (e) {
            if (queue) {
                queue.songs.shift()
                module.exports.play(queue.songs[0], message);
            }

            console.error(e)
            return Logger.log(`Failed to play Music: [${e.stack}]`, "error");
        }

        queue.connection.on('disconnect', () => message.client.queue.delete(message.guild.id));

        const type = song.url.includes("youtube.com") ? "opus" : "ogg/opus";
        const dispatcher = queue.connection.play(stream, { type: type }).on('finish', () => {
            if (collector && !collector.ended) collector.stop();

            if (queue.loop) {
                let lastSong = queue.songs.shift();
                queue.songs.push(lastSong);
                module.exports.play(queue.songs[0], message);
            } else {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }
        }).on('error', async(e) => {
            await Logger.log(e, "error");
            queue.songs.shift();
            module.exports.play(queue.songs[0], message);
        });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);

        try {
            var pMessage = await queue.textChannel.send(`🎶 Now playing: **${song.title}**`);
            await pMessage.react("⏭");
            await pMessage.react("⏯");
            await pMessage.react("🔁");
            await pMessage.react("⏹");
        } catch (e) {
            Logger.log(e, "error");
        }

        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = pMessage.createReactionCollector(filter, { time: song.duration > 0 ? song.duration * 1000 : 60000 });

        collector.on("collect", (reaction, user) => {
            if (!queue) return;

            switch (reaction.emoji.name) {
                case "⏭":
                    queue.playing = true;
                    reaction.users.remove(user).catch(console.error);

                    queue.connection.dispatcher.end();
                    queue.textChannel.send(`${user} ⏩ skipped the song`).catch(console.error);
                    collector.stop();
                    break;

                case "⏯":
                    reaction.users.remove(user).catch(console.error);

                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.pause(true);
                        queue.textChannel.send(`${user} ⏸ paused the music.`).catch(console.error);
                    } else {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.resume();
                        queue.textChannel.send(`${user} ▶ resumed the music!`).catch(console.error);
                    }
                    break;

                case "🔁":
                    reaction.users.remove(user).catch(console.error);

                    queue.loop = !queue.loop;
                    queue.textChannel.send(`Loop is now ${queue.loop ? "**on**" : "**off**"}`).catch(console.error);
                    break;

                case "⏹":
                    reaction.users.remove(user).catch(console.error);

                    queue.songs = [];
                    queue.textChannel.send(`${user} ⏹ stopped the music!`).catch(console.error);
                    try {
                        queue.connection.dispatcher.end();
                    } catch (error) {
                        console.error(error);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });

        collector.on('end', () => {
            pMessage.reactions.removeAll().catch(console.error);
            if (pMessage && !pMessage.deleted) {
                pMessage.delete({ timeout: 3000 }).catch(console.error);
            }
        })
    }
}