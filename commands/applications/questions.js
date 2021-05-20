exports.run = async(client, message, args) => {
    client.db.findById(message.guild.id, async(err, res) => {
        if (!args[0]) return client.utils.missing(message, `APPLICATION_NAME`);
        if (!res.applications[args.join(` `).toLowerCase()]) return client.utils.missing(message, `VALID_APPLICATION_NAME`);
        var number = 1;
        var array = [];
        res.applications[args.join(` `).toLowerCase()].questions.forEach(question => {
            array.push({
                [`[#]`]: `[${number}]`,
                Question: question
            });
            number++;
        });
        var tab = client.table.create(array, {
            outerBorder: ' ',
            innerBorder: ' '
        });
        var string = '```css\n' + tab + '\n```';
        if (message.member.hasPermission(`MANAGE_SERVER`)) {
            string = '```css\n' + tab + '\nTo edit a question run .edit question [question_number] [name_of_application] ```';
        }
        var temp = [];
        array.forEach(item => {
            temp.push(item);
            var tab = client.table.create(temp, {
                outerBorder: ' ',
                innerBorder: ' '
            });
            var string = '```css\n' + tab + '\n```';
            if (message.member.hasPermission(`MANAGE_SERVER`)) {
                string = '```css\n' + tab + '\nTo edit a question run .edit question [question_number] [name_of_application] ```';
            };
            if (string.length > 1500) {
                message.channel.send(string);
                temp = [];
            }
        });
        if (temp.length) {
            var tab = client.table.create(temp, {
                outerBorder: ' ',
                innerBorder: ' '
            });
            var string = '```css\n' + tab + '\n```';
            if (message.member.hasPermission(`MANAGE_SERVER`)) {
                string = '```css\n' + tab + '\nTo edit a question run .edit question [question_number] [name_of_application] ```';
            };
            message.channel.send(string);
        }
        number = undefined;
        array = undefined;
        tab = undefined;
        string = undefined;
    });
}, exports.info = {
    name: "questions",
    aliases: [],
    permission: `@everyone`,
    description: `View the questions of an application.`,
    arguments: '<prefix>questions'
}