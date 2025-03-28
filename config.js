require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.GUILD_ID,
    activityCheckInterval: 60000, // 1 minute
    trackingEnabled: true
};