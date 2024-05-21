const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

module.exports = async (client) => {

    // Get all the channels ID
    const WELCOME_CHANNEL = process.env.WELCOME_CHANNEL;
    const GUESTBOOK_CHANNEL = process.env.GUESTBOOK_CHANNEL;
    const GUEST_ROLE = process.env.GUEST_ROLE;

    client.on('guildMemberAdd', async (member) => {
        if (member.user.bot) return;
        try {

            // Get the channel
            const channel = member.guild.channels.cache.find(channel => channel.id === WELCOME_CHANNEL);
            if (!channel) return;

            // Pass the pseudo to Uppercase
            member.user.username = member.user.username.toLowerCase();

            // Define the canvas settings
            const canvas = createCanvas(1024, 500);
            const ctx = canvas.getContext('2d');

            // Get the background
            const bg = await loadImage('./src/assets/img/SeaOfSands.png');

            // Create the background image
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Text 1 "Hello There"
            ctx.font = "50px 'Times New Roman'";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(`Ahoy ! ${member.user.username}`, 512, 350);

            ctx.font = "50px 'Times New Roman'";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(`Welcome aboard`, 512, 400);

            // Pick up the pen
            ctx.beginPath();
            ctx.arc(512, 166, 119, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Get the avatar
            const avatar = await loadImage(member.user.displayAvatarURL({
                extension: "png",
                size: 1024
            }));


            // Draw the shrunken avatar
            ctx.drawImage(avatar, 393, 47, 238, 238);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), "uwu.png");

            // Send the attachment in the message channel with a text

            // Get a channel 
            const guestbook_channel = member.guild.channels.cache.get(GUESTBOOK_CHANNEL).toString();

            await channel.send({
                // content: `🔱 Bienvenue à bord ${member.user} Sur le serveur **${member.guild.name}** !\nN'oublie pas d'aller lire le règlement dans le ${rules_channel} 🔱`,
                content: `🔱 Welcome to my **${member.guild.name}** ${member.user}! Here you will find all my projects and my bot. There is a ${guestbook_channel} where you can write a message 🔱.
                `,
                files: [attachment]
            });

            // Add the role to the member
            const role = member.guild.roles.cache.find(role => role.id === GUEST_ROLE);
            if (!role) return;

            await member.roles.add(role);


        } catch (err) {
            console.error(err);
        }
    });
}