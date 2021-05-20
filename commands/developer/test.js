exports.run = async(client, message, args) => {
    if (message.author.id !== "399718367335940117") return;

    let data = { file: "./src/ticket.txt" };

    fetch("whiskeygaming.net/X341235", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        console.log("Request complete! response:", res);
    });
}, exports.info = {
    name: "test",
    aliases: [],
    permission: `@everyone`,
    description: ``,
    arguments: '<prefix>'
};