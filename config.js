require('dotenv').config();

function validateConfig() {
    const errors = [];
    
    if (!process.env.DISCORD_BOT_TOKEN) {
        errors.push('DISCORD_BOT_TOKEN is required');
    }
    
    if (!process.env.GUILD_ID) {
        errors.push('GUILD_ID is required');
    }
    
    if (process.env.GUILD_ID && !/^\d+$/.test(process.env.GUILD_ID)) {
        errors.push('GUILD_ID must be a valid Discord ID (numbers only)');
    }
    
    if (process.env.REPORT_CHANNEL_ID && !/^\d+$/.test(process.env.REPORT_CHANNEL_ID)) {
        errors.push('REPORT_CHANNEL_ID must be a valid Discord ID (numbers only)');
    }
    
    if (errors.length > 0) {
        console.error('Configuration validation failed:');
        errors.forEach(error => console.error(`- ${error}`));
        process.exit(1);
    }
}

validateConfig();

module.exports = {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.GUILD_ID,
    activityCheckInterval: parseInt(process.env.ACTIVITY_CHECK_INTERVAL) || 60000,
    trackingEnabled: process.env.TRACKING_ENABLED !== 'false',
    dailyReportsEnabled: process.env.DAILY_REPORTS_ENABLED === 'true',
    weeklyReportsEnabled: process.env.WEEKLY_REPORTS_ENABLED === 'true',
    reportChannelId: process.env.REPORT_CHANNEL_ID || null,
    maxDataAgeDays: parseInt(process.env.MAX_DATA_AGE_DAYS) || 90
};