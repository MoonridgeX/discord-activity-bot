const { EmbedBuilder } = require('discord.js');

class Commands {
    constructor(activityTracker) {
        this.activityTracker = activityTracker;
        this.prefix = '!';
    }

    async handleCommand(message) {
        if (!message.content.startsWith(this.prefix)) return false;
        
        const args = message.content.slice(this.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        try {
            switch (command) {
                case 'stats':
                    await this.statsCommand(message, args);
                    break;
                case 'help':
                    await this.helpCommand(message);
                    break;
                case 'activity':
                    await this.activityCommand(message, args);
                    break;
                default:
                    return false;
            }
            return true;
        } catch (error) {
            console.error('Command error:', error);
            message.reply('Something went wrong executing that command.');
            return true;
        }
    }

    async statsCommand(message, args) {
        const today = new Date().toISOString().split('T')[0];
        const data = this.activityTracker.activityData;
        
        const todayStats = data.dailyStats[today] || { totalMessages: 0, activeUsers: new Set() };
        const todayEvents = data.memberEvents[today] || { joins: [], leaves: [] };
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📊 Server Activity Stats')
            .addFields(
                { name: 'Today\'s Messages', value: todayStats.totalMessages.toString(), inline: true },
                { name: 'Active Users Today', value: todayStats.activeUsers.size.toString(), inline: true },
                { name: 'Members Joined Today', value: todayEvents.joins.length.toString(), inline: true },
                { name: 'Members Left Today', value: todayEvents.leaves.length.toString(), inline: true }
            )
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }

    async helpCommand(message) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🤖 Bot Commands')
            .setDescription('Available commands for the Activity Bot:')
            .addFields(
                { name: '!stats', value: 'Show today\'s server activity statistics' },
                { name: '!activity [user]', value: 'Show activity for a specific user (mention them)' },
                { name: '!help', value: 'Show this help message' }
            )
            .setFooter({ text: 'Activity Bot - Tracking server engagement' });
        
        await message.reply({ embeds: [embed] });
    }

    async activityCommand(message, args) {
        let targetUser = message.author;
        
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        }
        
        const data = this.activityTracker.activityData;
        const userMessages = data.messages[targetUser.id] || {};
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = userMessages[today] || 0;
        
        let totalMessages = 0;
        Object.values(userMessages).forEach(count => {
            totalMessages += count;
        });
        
        const embed = new EmbedBuilder()
            .setColor(0xFF9900)
            .setTitle(`📈 Activity for ${targetUser.username}`)
            .addFields(
                { name: 'Messages Today', value: todayCount.toString(), inline: true },
                { name: 'Total Messages', value: totalMessages.toString(), inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
}

module.exports = Commands;