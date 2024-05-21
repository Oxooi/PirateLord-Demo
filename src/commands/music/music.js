const { SlashCommandBuilder, PermissionsFlagBits, VoiceChannel, GuildEmoji, EmbedBuilder } = require('discord.js');
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Play & manage YouTube link in a voice channel.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a music in a voice channel.')
                .addStringOption(option =>
                    option.setName('requete')
                        .setDescription('Give me a music link or a name of a music.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('volume')
                .setDescription('Adjust the volume of the music.')
                .addIntegerOption(option =>
                    option.setName('pourcentage')
                        .setDescription('10 = 10%')
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('options')
                .setDescription('Select the music options.')
                .addStringOption(option =>
                    option.setName('options')
                        .setDescription('Select the music options.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Pause', value: 'pause' },
                            { name: 'Resume', value: 'resume' },
                            { name: 'Stop', value: 'stop' },
                            { name: 'Skip', value: 'skip' },
                            { name: 'Loop', value: 'loop' },
                            { name: 'Queue', value: 'queue' }
                        )
                )
        ),
    async execute(interaction) {
        const { options, member, guild, channel } = interaction;

        const subcommand = options.getSubcommand();
        const query = options.getString("requete");
        const volume = options.getInteger("pourcentage");
        const option = options.getString("options");
        const VoiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!VoiceChannel) {
            embed.setColor("Red").setDescription("You need to be in a voice channel to use this command.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed.setColor("Red").setDescription(`You can't request a music, because there already a music playing in ${guild.members.me.voice.channel.name}`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }


        try {
            switch (subcommand) {
                case "play":
                    client.distube.play(VoiceChannel, query, { textChannel: channel, member: member });
                    embed
                        .setColor(0x0099FF)
                        .setTitle('# Adding to the queue')
                        .addFields(
                            { name: "🎶 Request :", value: `- \`${query}\`` },
                            { name: "👤 Ask by:", value: `- ${member}` },
                            { name: "For more information about the next music", value: `-  \`/music options \"File d'attente\"\`` },
                            { name: "To adjuste the volume :", value: `\n- \`/music volume\` \n` },
                        )
                        .setFooter({ text: `Seigneur de la piraterie - DJ Pirate Lord` })
                        .setTimestamp()
                    return interaction.reply({ embeds: [embed], content: "🎶 Added to the queue" });
                case "volume":
                    client.distube.setVolume(VoiceChannel, volume);
                    return interaction.reply({ content: `🔊 The volume has set to ${volume}%` });
                case "options":
                    const queue = await client.distube.getQueue(VoiceChannel);

                    if (!queue) {
                        embed.setColor("Red").setDescription("There is no music playing.");
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                    switch (option) {
                        case "skip":
                            await queue.skip(VoiceChannel);
                            embed.setColor("Green").setDescription("⏩ The music has been skip.")
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        case "stop":
                            await queue.stop(VoiceChannel);
                            embed.setColor("Red").setDescription("⏹️ The queue has been stopped.")
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        case "pause":
                            await queue.pause(VoiceChannel);
                            embed.setColor("Orange").setDescription("⏸️ The music has been paused.")
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        case "resume":
                            await queue.resume(VoiceChannel);
                            embed.setColor("Green").setDescription("▶️ The music has been resumed.")
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        case "queue":

                            let fields = queue.songs.map((song, id) => ({
                                name: id === 0 ? "- Music Playing " : "- Next : ",
                                value: `${id + 1}. \`${song.name}\` - \`${song.formattedDuration}\`\n- Asked by: ${song.user}\n`,
                                inline: false
                            }));

                            embed
                                .setColor("Purple")
                                .setTitle(`# Queue of the music`)
                                .addFields(fields)
                                .setFooter({ text: `Seigneur de la piraterie - DJ Pirate Lord` })
                                .setTimestamp()

                            return interaction.reply({ embeds: [embed], ephemeral: true });

                    }
            }
        } catch (err) {
            console.log(err);
            embed.setColor("Red").setDescription("🛑 | Quelque chose s'est mal passer");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

    }


};