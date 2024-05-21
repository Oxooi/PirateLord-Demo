require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, IntentsBitField } = require('discord.js');
const TOKEN = process.env.TOKEN;

const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,

    ],
});

// All events for messages
const messagesReactions = require('./events/messages/messages-reactions');
const poll = require('./events/messages/poll');

// All events for roles
const addRoles = require('./events/roles/add-roles');

// All events for Guilds events
const AddMember = require('./events/guilds/guild-member-add');

// All events for vocals
const createSloopChannels = require('./events/vocals/create-sloopchannels');
const createBrigChannels = require('./events/vocals/create-brigchannels');
const createGalleonChannels = require('./events/vocals/create-galleonchannels');

module.exports = client;
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false,
    emitAddSongWhenCreatingQueue: false,
    plugins: [new SpotifyPlugin()]
});

client.on('ready', () => {
    client.user.setActivity({
        name: 'Sea of Thieves',
    });
    console.log(`🟢 ${client.user.tag} is online !`);
});


// Detect all reactions on messages
messagesReactions(client);
poll(client);

// Guilds Events
AddMember(client);

// Roles Events
addRoles(client);

// Detect all vocals events
createSloopChannels(client);
createBrigChannels(client);
createGalleonChannels(client);



////
// Slash Commands Handling
////
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

////
// End Of Slash Commands Handling
////

// Login the client
client.login(TOKEN);