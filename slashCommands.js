const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfileManager = require('./userProfiles');

const slashCommands = [
    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View server activity statistics'),
    
    new SlashCommandBuilder()
        .setName('activity')
        .setDescription('View user activity data')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check activity for')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the most active users')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of users to show (default: 10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25)),
    
    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View detailed user profile and statistics')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view profile for')
                .setRequired(false))
];

class SlashCommandHandler {
    constructor(activityTracker) {
        this.activityTracker = activityTracker;
        this.profileManager = new UserProfileManager(activityTracker);
    }

    async handleInteraction(interaction) {
        if (!interaction.isChatInputCommand()) return;

        try {
            switch (interaction.commandName) {
                case 'stats':
                    await this.handleStats(interaction);
                    break;
                case 'activity':
                    await this.handleActivity(interaction);
                    break;
                case 'leaderboard':
                    await this.handleLeaderboard(interaction);
                    break;
                case 'profile':
                    await this.handleProfile(interaction);
                    break;
            }
        } catch (error) {
            console.error('Slash command error:', error);
            const reply = { content: 'There was an error executing this command!', ephemeral: true };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    async handleStats(interaction) {
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
        
        await interaction.reply({ embeds: [embed] });
    }

    async handleActivity(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
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
            .setTitle(`📈 Activity for ${targetUser.displayName}`)
            .addFields(
                { name: 'Messages Today', value: todayCount.toString(), inline: true },
                { name: 'Total Messages', value: totalMessages.toString(), inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }

    async handleLeaderboard(interaction) {
        const limit = interaction.options.getInteger('limit') || 10;
        const data = this.activityTracker.activityData;
        
        const userTotals = {};
        Object.entries(data.messages).forEach(([userId, messages]) => {
            userTotals[userId] = Object.values(messages).reduce((sum, count) => sum + count, 0);
        });
        
        const sorted = Object.entries(userTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit);
        
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🏆 Activity Leaderboard')
            .setDescription(`Top ${Math.min(limit, sorted.length)} most active users:`)
            .setTimestamp();
        
        if (sorted.length === 0) {
            embed.addFields({ name: 'No Data', value: 'No activity data available yet.' });
        } else {
            const leaderboardText = sorted.map(([userId, count], index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[index] || `${index + 1}.`;
                return `${medal} <@${userId}> - ${count} messages`;
            }).join('\n');
            
            embed.addFields({ name: 'Rankings', value: leaderboardText });
        }
        
        await interaction.reply({ embeds: [embed] });
    }

    async handleProfile(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const embed = await this.profileManager.createProfileEmbed(targetUser, interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = { slashCommands, SlashCommandHandler };