const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {

    // Detect all reactions on messages
    client.on('messageReactionAdd', async (reaction, user) => {

        // Get the author id of the message
        const authorId = reaction.message.author.id

        // Create embed message
        const embed = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle('Wrong channel !')
            .setDescription(`Ahoy <@${authorId}> !\n It seems that this channel was not the most appropriate for your message. Check the available channels to see if there is a more suitable one and repost your message.`)
            .setTimestamp();

        // If the reaction is emote ❌, we send the embed message
        if (reaction.emoji.name === "⛔") {
            try {
                // Reply to the user who reacted to the message
                reaction.message.reply({
                    embeds: [embed]
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
}