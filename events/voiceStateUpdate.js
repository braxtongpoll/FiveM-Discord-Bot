const { MessageEmbed } = require("discord.js");
module.exports = async function(client, oldM, newM) {
    let dataID;
    try { dataID = oldM.guild.id } catch { dataId = newM.guild.id };
    client.db.findById(dataID, async function(err, res) {
        let embed = new MessageEmbed()
            .setColor(client.config.color)
            .setAuthor(oldM.member.user.username, oldM.member.user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
        let logs = client.channels.cache.find(c => c.id === res.voiceChannelLogs);
        if (!logs) return;
        // Leave all guild channels.
        if (oldM.channel && !newM.channel) {
            if (oldM.channel.name) {
                let fetchedLogs = await newM.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_DISCONNECT',
                });
                let deletionLog = fetchedLogs.entries.first();
                var { executor, target } = deletionLog;
                let reason;
                if (deletionLog && target !== null) {
                    let staff = newM.guild.members.cache.find(m => m.user.tag === executor.tag) || executor.tag
                    if (target.id == oldM.member.id) {
                        reason = "Disconnect from `" + oldM.channel.name + "`" + "\nAction by: " + `${staff}`;
                    } else {
                        fetchedLogs = await newM.guild.fetchAuditLogs({
                            limit: 1,
                            type: 'MEMBER_MOVE',
                        });
                        deletionLog = fetchedLogs.entries.first();
                        staff = newM.guild.members.cache.find(m => m.user.tag === executor.tag) || executor.tag
                        if (deletionLog && target !== null) {
                            if (target.id == oldM.member.id) {
                                reason = "Moved from `" + oldM.channel.name + "` to `" + newM.channel.name + "`" + "\nAction by: " + `${staff}`;
                            } else {
                                reason = "Exiting `" + oldM.channel.name + "`";
                            }
                        } else {
                            reason = "Exiting `" + oldM.channel.name + "`";
                        }
                    }
                    embed.setDescription(reason)
                } else {
                    embed.setDescription("Exiting `" + oldM.channel.name + "`")
                }
            }
        };
        if (embed.description) return post(logs, embed);
        // Joining a new guild channel.
        if (newM.channel !== oldM.channel) {
            embed.setDescription("Joined the voice channel `" + newM.channel.name + "`")
        };
        if (embed.description) return post(logs, embed);
        // Member was server deafened.
        if (oldM.serverDeaf !== newM.serverDeaf) {
            let fetchedLogs = await newM.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });
            let deletionLog = fetchedLogs.entries.first();
            let { executor, target } = deletionLog;
            let reason;
            let staff = newM.guild.members.cache.find(m => m.user.tag === executor.tag) || executor.tag
            if (target.id == newM.member.id) {
                reason = "Action by: " + `${staff}`;
            } else {
                reason = "Action by: Unknown";
            }
            if (newM.serverDeaf == true) {
                embed.setDescription("Server Deafen was enabled.\n" + reason);
            } else {
                embed.setDescription("Server Deafen was disabled.\n" + reason)
            };
        };
        if (embed.description) return post(logs, embed);
        // Member was server muted.
        if (oldM.serverMute !== newM.serverMute) {
            let fetchedLogs = await newM.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });
            let deletionLog = fetchedLogs.entries.first();
            let { executor, target } = deletionLog;
            let reason;
            let staff = newM.guild.members.cache.find(m => m.user.tag === executor.tag) || executor.tag
            if (target.id == newM.member.id) {
                reason = "Action by: " + `${staff}`;
            } else {
                reason = "Action by: Unknown";
            }
            if (newM.serverMute == true) {
                embed.setDescription("Server Mute was enabled.\n" + reason);
            } else {
                embed.setDescription("Server Mute was disabled.\n" + reason)
            };
        };
        if (embed.description) return post(logs, embed);
        // Member deafened themselves.
        if (oldM.selfDeaf !== newM.selfDeaf) {
            if (newM.selfDeaf == true) {
                embed.setDescription("Self Deafen was enabled.");
            } else {
                embed.setDescription("Self Deafen was disabled.");
            };
        };
        if (embed.description) return post(logs, embed);
        // Member muted themselves
        if (oldM.selfMute !== newM.selfMute && oldM.selfDeaf == newM.selfDeaf) {
            if (newM.selfMute == true) {
                embed.setDescription("Self Mute was enabled.");
            } else {
                embed.setDescription("Self Mute was disabled.");
            };
        };
        if (embed.description) return post(logs, embed);
        // Face camera
        if (oldM.selfVideo !== newM.selfVideo) {
            if (newM.selfVideo == true) {
                embed.setDescription("Turned on camera in `" + newM.channel.name + "`");
            } else {
                embed.setDescription("Turned off camera in `" + newM.channel.name + "`");
            };
        };
        if (embed.description) return post(logs, embed);
        // Screen share
        if (oldM.streaming !== newM.streaming) {
            if (newM.streaming == true) {
                embed.setDescription("Started streaming in `" + newM.channel.name + "`");
            } else {
                embed.setDescription("Stopped streaming in `" + newM.channel.name + "`");
            };
        };
        if (embed.description) return post(logs, embed);
    });
};

function post(logs, embed) {
    logs.send(embed).catch(error => {
        client.logger.log("There was an error posting to the channel for voice channel logs. Possibly missing permissions to post to this channel.", "error");
    })
};