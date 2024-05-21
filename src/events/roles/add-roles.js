const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const blacklist = require('./blacklist-roles.json'); // Get the blacklist roles
// Get the Guild ID
require('dotenv').config();
const CHANNEL_ID = process.env.ROLES_CHANNEL;

// The Roles ID

module.exports = (client) => {
    client.on('ready', async (c) => {
        try {

            // Get the channel
            const channel = client.channels.cache.get(CHANNEL_ID);
            if (!channel) return;

            // Detect if the message has already sent
            const embedTitle = "~ Choose your role ~"; // Title of the embed message you're sending

            // Check if the message was already sent
            const existingMessages = await channel.messages.fetch({ limit: 10 });
            if (existingMessages.some(msg => msg.embeds.length > 0 && msg.embeds[0].title === embedTitle)) return;

            // Save all the blacklist roles in an array
            const blacklistRoles = [];

            // Push the roles name in the array
            blacklist.forEach(role => {
                blacklistRoles.push({
                    name: role.name
                })
            });

            // Save all the roles name & id in an array
            const roles = [];

            // Push the roles name & id in the array
            channel.guild.roles.cache.forEach((role) => {

                // If the role is in the blacklist : return
                if (!blacklistRoles.some(blacklistRole => blacklistRole.name === role.name)) return;

                roles.push({
                    id: role.id,
                    label: role.name
                });
            });

            // Form the message
            const embed = new EmbedBuilder()
                .setColor('#ffc676')
                .setTitle(embedTitle)
                .setDescription('Distinguish yourself and be notified if your role is needed with these specific roles by clicking on the tabs')
                .setImage("https://cdn.discordapp.com/attachments/1186542651265257493/1242311476593557564/DALLE_2024-05-21_04.35.43_-_A_lively_pirate_tavern_with_a_rustic_and_adventurous_atmosphere._The_tavern_is_filled_with_wooden_tables_and_benches_pirate_flags_and_old_nautical_m.webp?ex=664d6039&is=664c0eb9&hm=cd2cdb3e6b5d2502b15388f9018ab69838213d261089fd3fe92413c5872105df&")
                .setTimestamp()
                .setFooter({ text: `⚓ The Pirate Lord 🛞` })


            // Create the Select Menu options
            const selectOptions = roles.map(role => {
                return {
                    label: `- 📛 ${role.label}`,
                    value: role.id,
                };
            });

            // Create the Select Menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('roles')
                .setPlaceholder('Choose your role :')
                .addOptions(selectOptions);

            // Create the Select Menu Row
            const row = new ActionRowBuilder()
                .addComponents(
                    selectMenu
                );


            // Send the message
            await channel.send({
                embeds: [embed],
                components: [row]
            })

        } catch (err) {
            console.error(err);
        }
    });


    client.on('interactionCreate', async (interaction) => {
        try {
            // If the interaction is not a select menu : return
            if (!interaction.isStringSelectMenu()) return;
            await interaction.deferReply({
                ephemeral: true
            });


            const role = interaction.guild.roles.cache.get(interaction.values[0]); // Get the role by the selected value
            // If the role doesn't exist : return
            if (!role) {
                interaction.editReply({
                    content: 'I cannot find the role you are looking for.'
                });
                return;
            }

            const hasRole = interaction.member.roles.cache.has(role.id); // Check if the user already has the role

            // If the user already has the role : remove it
            if (hasRole) {
                await interaction.member.roles.remove(role);
                await interaction.editReply(`The role ${role} has been removed.`);
                return;
            }

            // If the user doesn't have the role : add it
            await interaction.member.roles.add(role);
            await interaction.editReply(`The role ${role} has been added.`);

        } catch (error) {
            console.error(error);
        }
    });
}