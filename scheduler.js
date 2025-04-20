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
        console.log('Weekly report feature - coming soon!');
    }
}

module.exports = Scheduler;