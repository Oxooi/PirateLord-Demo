const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute (c) {
        try {
            console.log(`✅ ${c.user.tag} is online.`);
        } catch (error) {
            console.error(error);
        }
    }
}