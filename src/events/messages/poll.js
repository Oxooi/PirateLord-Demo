module.exports = (client) => {
    const polls = new Map(); // Pour suivre les différents sondages
    const votedUsers = new Map(); // Pour suivre les utilisateurs qui ont déjà voté pour chaque sondage
    const censored = "█";

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (message.content.startsWith('-')) {
            try {
                const array = message.content.slice(1).trim().split(/ +/);
                const command = array.shift().toLowerCase();

                if (command !== 'poll') return;

                const args = array;

                if (args.length < 2) {
                    await message.author.send('Tu dois donner au moins deux arguments pour faire un sondage');
                    await message.delete();
                    return;
                }
                await message.delete();

                let msgToSend = '';
                for (let i = 0; i < args.length; i++) {
                    msgToSend += `${i + 1}: ${args[i]}\n[${censored.repeat(1)}]\n\n`;
                }

                const sentMessage = await message.channel.send(msgToSend);

                const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                for (let i = 0; i < args.length && i < 10; i++) {
                    await sentMessage.react(numberEmojis[i]);
                }

                polls.set(sentMessage.id, {
                    messageId: sentMessage.id,
                    options: args,
                    emojis: numberEmojis.slice(0, args.length)
                });

            } catch (error) {
                console.error(error);
            }
        }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) return;

        const poll = polls.get(reaction.message.id);
        if (poll) {
            const userId = user.id;

            if (votedUsers.has(userId)) {
                reaction.users.remove(userId);
                return;
            }

            votedUsers.set(userId, reaction.emoji.name);

            const index = poll.emojis.indexOf(reaction.emoji.name);
            if (index > -1) {
                const lines = reaction.message.content.split('\n');
                const lineToUpdate = 3 * index + 1;
                const regexPattern = /\[(.*?)\]/;
                const match = lines[lineToUpdate].match(regexPattern);
                if (match) {
                    const currentProgress = match[1];
                    const newProgress = `${currentProgress}${censored.trim()}`;
                    lines[lineToUpdate] = lines[lineToUpdate].replace(regexPattern, `[${newProgress}]`);
                    await reaction.message.edit(lines.join('\n'));
                }
            }
        }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
        if (user.bot) return;

        const poll = polls.get(reaction.message.id);
        if (poll && votedUsers.has(user.id) && votedUsers.get(user.id) === reaction.emoji.name) {
            const index = poll.emojis.indexOf(reaction.emoji.name);
            if (index > -1) {
                const lines = reaction.message.content.split('\n');
                const lineToUpdate = 3 * index + 1;
                const regexPattern = /\[(.*?)\]/;
                const match = lines[lineToUpdate].match(regexPattern);
                if (match) {
                    const currentProgress = match[1].trim();
                    if (currentProgress.length > 0) {
                        const newProgress = currentProgress.slice(0, -1);
                        lines[lineToUpdate] = lines[lineToUpdate].replace(regexPattern, `[${newProgress}]`);
                        await reaction.message.edit(lines.join('\n'));
                    }
                }
            }

            votedUsers.delete(user.id);
        }
    });
}
