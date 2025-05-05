const { EmbedBuilder } = require('discord.js');

class Scheduler {
    constructor(client, activityTracker) {
        this.client = client;
        this.activityTracker = activityTracker;
        this.reportChannelId = null;
        this.dailyReportTime = '18:00';
    }

    setReportChannel(channelId) {
        this.reportChannelId = channelId;
    }

    startDailyReports() {
        setInterval(() => {
            this.checkDailyReport();
        }, 60000);
    }

    async checkDailyReport() {
        if (!this.reportChannelId) return;
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (timeStr === this.dailyReportTime) {
            await this.sendDailyReport();
        }
    }

    async sendDailyReport() {
        try {
            const channel = await this.client.channels.fetch(this.reportChannelId);
            if (!channel) return;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            
            const data = this.activityTracker.activityData;
            const dayStats = data.dailyStats[dateStr] || { totalMessages: 0, activeUsers: new Set() };
            const dayEvents = data.memberEvents[dateStr] || { joins: [], leaves: [] };
            
            const embed = new EmbedBuilder()
                .setColor(0x9932CC)
                .setTitle(`📊 Daily Activity Report - ${yesterday.toDateString()}`)
                .addFields(
                    { name: '💬 Total Messages', value: dayStats.totalMessages.toString(), inline: true },
                    { name: '👥 Active Users', value: dayStats.activeUsers.size.toString(), inline: true },
                    { name: '➕ New Members', value: dayEvents.joins.length.toString(), inline: true },
                    { name: '➖ Members Left', value: dayEvents.leaves.length.toString(), inline: true }
                )
                .setFooter({ text: 'Daily activity summary' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log('Daily report sent successfully');
        } catch (error) {
            console.error('Error sending daily report:', error);
        }
    }

    async sendWeeklyReport() {
        try {
            const channel = await this.client.channels.fetch(this.reportChannelId);
            if (!channel) return;

            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const weekKey = this.activityTracker.getWeekKey(lastWeek.toISOString().split('T')[0]);
            
            const weekStats = this.activityTracker.getWeeklyStats(weekKey);
            
            const topUsers = Object.entries(weekStats.userMessages || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([userId, count], index) => `${index + 1}. <@${userId}> - ${count} messages`)
                .join('\n') || 'No activity this week';
            
            const embed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('📈 Weekly Activity Report')
                .setDescription(`Week of ${lastWeek.toDateString()}`)
                .addFields(
                    { name: '💬 Total Messages', value: weekStats.totalMessages.toString(), inline: true },
                    { name: '👥 Active Users', value: weekStats.activeUsers.size.toString(), inline: true },
                    { name: '🏆 Top Contributors', value: topUsers, inline: false }
                )
                .setFooter({ text: 'Weekly summary - sent every Sunday' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log('Weekly report sent successfully');
        } catch (error) {
            console.error('Error sending weekly report:', error);
        }
    }

    startWeeklyReports() {
        setInterval(() => {
            const now = new Date();
            if (now.getDay() === 0 && now.getHours() === 18 && now.getMinutes() === 0) {
                this.sendWeeklyReport();
            }
        }, 60000);
    }
}

module.exports = Scheduler;