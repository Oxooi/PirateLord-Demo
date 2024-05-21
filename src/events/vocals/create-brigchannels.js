const { ChannelType } = require("discord.js");
const brigNames = require("../../utils/names/brig/names.json")
require('dotenv').config();

module.exports = (client) => {

    client.on('voiceStateUpdate', async (oldState, newState) => {

        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        
        const CHANNEL_ID = process.env.BRIG_CHANNEL_ID;
        const PARENT_ID = process.env.BRIG_PARENT_ID;

        // Get all the names inside the json file
        const names = brigNames.noms;
        // Get a random name
        const randomName = names[Math.floor(Math.random() * names.length)];

        try {
            if (newChannel?.id === CHANNEL_ID) {
                const channel = await newChannel.guild.channels.create({
                    type: ChannelType.GuildVoice,
                    name: `${randomName}`,
                    parent: newChannel.parentId,
                    userLimit: 3,
                })
                await channel.setParent(newChannel.parentId);

                await newState.guild.members.cache.get(newState.id).voice.setChannel(channel)
            }

            if (oldChannel?.parentId === PARENT_ID && oldChannel?.id !== CHANNEL_ID) {
                if (oldChannel.members.size <= 0) await oldChannel.delete();
            }

        } catch (error) {
            console.error(error);
        }

    });
}