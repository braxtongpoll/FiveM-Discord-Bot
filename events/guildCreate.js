module.exports = async(client, guild) => {
    client.db.findById(guild.id, (err, res) => {
        if (err) {
            client.db.create({
                _id: `${guild.id}`
            }).then(() => {});
        };
        if (!res) {
            client.db.create({
                _id: `${guild.id}`
            }).then(() => {});
        };
    }).catch(e => {
        client.db.create({
            _id: `${guild.id}`
        }).then(() => {});
    })
};