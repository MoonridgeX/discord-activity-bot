const { EmbedBuilder } = require('discord.js');

class UserProfileManager {
    constructor(activityTracker) {
        this.activityTracker = activityTracker;
    }

    getUserProfile(userId) {
        const data = this.activityTracker.activityData;
        const userMessages = data.messages[userId] || {};
        
        let totalMessages = 0;
        let activeDays = 0;
        let firstMessageDate = null;
        let lastMessageDate = null;
        
        const sortedDates = Object.keys(userMessages).sort();
        
        sortedDates.forEach(date => {
            const count = userMessages[date];
            if (count > 0) {
                totalMessages += count;
                activeDays++;
                
                if (!firstMessageDate) {
                    firstMessageDate = date;
                }
                lastMessageDate = date;
            }
        });
        
        const averagePerDay = activeDays > 0 ? Math.round(totalMessages / activeDays * 10) / 10 : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todayMessages = userMessages[today] || 0;
        
        const weekKey = this.activityTracker.getWeekKey(today);
        const weeklyStats = this.activityTracker.getWeeklyStats(weekKey);
        const weeklyMessages = weeklyStats.userMessages[userId] || 0;
        
        return {
            userId,
            totalMessages,
            activeDays,
            averagePerDay,
            todayMessages,
            weeklyMessages,
            firstMessageDate,
            lastMessageDate,
            joinDate: this.getUserJoinDate(userId, data)
        };
    }

    getUserJoinDate(userId, data) {
        for (const [date, events] of Object.entries(data.memberEvents)) {
            const joinEvent = events.joins?.find(join => join.userId === userId);
            if (joinEvent) {
                return date;
            }
        }
        return null;
    }

    async createProfileEmbed(user, guild) {
        const profile = this.getUserProfile(user.id);
        const member = guild.members.cache.get(user.id);
        
        const embed = new EmbedBuilder()
            .setColor(0x7289DA)
            .setTitle(`👤 Profile: ${user.displayName}`)
            .setThumbnail(user.displayAvatarURL({ size: 128 }))
            .addFields(
                { name: '📊 Total Messages', value: profile.totalMessages.toString(), inline: true },
                { name: '📅 Active Days', value: profile.activeDays.toString(), inline: true },
                { name: '📈 Daily Average', value: profile.averagePerDay.toString(), inline: true },
                { name: '💬 Today', value: profile.todayMessages.toString(), inline: true },
                { name: '📆 This Week', value: profile.weeklyMessages.toString(), inline: true },
                { name: '⭐ Activity Rank', value: this.getUserRank(user.id).toString(), inline: true }
            )
            .setTimestamp();
        
        if (member) {
            embed.addFields(
                { name: '🏠 Joined Server', value: member.joinedAt.toDateString(), inline: true }
            );
        }
        
        if (profile.firstMessageDate) {
            embed.addFields(
                { name: '🎯 First Message', value: new Date(profile.firstMessageDate).toDateString(), inline: true },
                { name: '💬 Last Active', value: new Date(profile.lastMessageDate).toDateString(), inline: true }
            );
        }
        
        return embed;
    }

    getUserRank(userId) {
        const data = this.activityTracker.activityData;
        const userTotals = {};
        
        Object.entries(data.messages).forEach(([uid, messages]) => {
            userTotals[uid] = Object.values(messages).reduce((sum, count) => sum + count, 0);
        });
        
        const sorted = Object.entries(userTotals)
            .sort(([,a], [,b]) => b - a)
            .map(([uid], index) => ({ userId: uid, rank: index + 1 }));
        
        const userRank = sorted.find(entry => entry.userId === userId);
        return userRank ? userRank.rank : sorted.length + 1;
    }

    getActivityLevel(totalMessages) {
        if (totalMessages >= 1000) return { level: 'Legend', emoji: '🏆' };
        if (totalMessages >= 500) return { level: 'Expert', emoji: '⭐' };
        if (totalMessages >= 200) return { level: 'Active', emoji: '🔥' };
        if (totalMessages >= 50) return { level: 'Regular', emoji: '👍' };
        if (totalMessages >= 10) return { level: 'Newcomer', emoji: '🌱' };
        return { level: 'Beginner', emoji: '👋' };
    }
}

module.exports = UserProfileManager;