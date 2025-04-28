const fs = require('fs');
const path = require('path');

class ActivityTracker {
    constructor() {
        this.dataFile = path.join(__dirname, 'activity_data.json');
        this.activityData = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                const parsed = JSON.parse(data);
                
                if (parsed.dailyStats) {
                    Object.keys(parsed.dailyStats).forEach(date => {
                        if (Array.isArray(parsed.dailyStats[date].activeUsers)) {
                            parsed.dailyStats[date].activeUsers = new Set(parsed.dailyStats[date].activeUsers);
                        }
                    });
                }
                
                if (parsed.weeklyStats) {
                    Object.keys(parsed.weeklyStats).forEach(week => {
                        if (Array.isArray(parsed.weeklyStats[week].activeUsers)) {
                            parsed.weeklyStats[week].activeUsers = new Set(parsed.weeklyStats[week].activeUsers);
                        }
                    });
                }
                
                return parsed;
            }
        } catch (error) {
            console.error('Error loading activity data:', error);
        }
        return {
            messages: {},
            dailyStats: {},
            memberEvents: {},
            weeklyStats: {},
            lastUpdate: new Date().toISOString()
        };
    }

    saveData() {
        try {
            const dataToSave = { ...this.activityData };
            
            if (dataToSave.dailyStats) {
                Object.keys(dataToSave.dailyStats).forEach(date => {
                    if (dataToSave.dailyStats[date].activeUsers instanceof Set) {
                        dataToSave.dailyStats[date].activeUsers = Array.from(dataToSave.dailyStats[date].activeUsers);
                    }
                });
            }
            
            if (dataToSave.weeklyStats) {
                Object.keys(dataToSave.weeklyStats).forEach(week => {
                    if (dataToSave.weeklyStats[week].activeUsers instanceof Set) {
                        dataToSave.weeklyStats[week].activeUsers = Array.from(dataToSave.weeklyStats[week].activeUsers);
                    }
                });
            }
            
            fs.writeFileSync(this.dataFile, JSON.stringify(dataToSave, null, 2));
        } catch (error) {
            console.error('Error saving activity data:', error);
        }
    }

    trackMessage(userId, channelId) {
        if (!userId || typeof userId !== 'string') {
            console.error('Invalid userId provided to trackMessage');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        try {
            if (!this.activityData.messages[userId]) {
                this.activityData.messages[userId] = {};
            }
            
            if (!this.activityData.messages[userId][today]) {
                this.activityData.messages[userId][today] = 0;
            }
            
            this.activityData.messages[userId][today]++;
            
            if (!this.activityData.dailyStats[today]) {
                this.activityData.dailyStats[today] = {
                    totalMessages: 0,
                    activeUsers: new Set()
                };
            }
            
            this.activityData.dailyStats[today].totalMessages++;
            this.activityData.dailyStats[today].activeUsers.add(userId);
            
            this.updateWeeklyStats(userId, today);
            
            this.activityData.lastUpdate = new Date().toISOString();
            this.saveData();
        } catch (error) {
            console.error('Error tracking message:', error);
        }
    }

    trackMemberJoin(userId, username) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.activityData.memberEvents[today]) {
            this.activityData.memberEvents[today] = {
                joins: [],
                leaves: []
            };
        }
        
        this.activityData.memberEvents[today].joins.push({
            userId,
            username,
            timestamp: new Date().toISOString()
        });
        
        this.activityData.lastUpdate = new Date().toISOString();
        this.saveData();
    }

    trackMemberLeave(userId, username) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.activityData.memberEvents[today]) {
            this.activityData.memberEvents[today] = {
                joins: [],
                leaves: []
            };
        }
        
        this.activityData.memberEvents[today].leaves.push({
            userId,
            username,
            timestamp: new Date().toISOString()
        });
        
        this.activityData.lastUpdate = new Date().toISOString();
        this.saveData();
    }

    getWeekKey(dateStr) {
        const date = new Date(dateStr);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
    }

    updateWeeklyStats(userId, dateStr) {
        const weekKey = this.getWeekKey(dateStr);
        
        if (!this.activityData.weeklyStats[weekKey]) {
            this.activityData.weeklyStats[weekKey] = {
                totalMessages: 0,
                activeUsers: new Set(),
                userMessages: {}
            };
        }
        
        if (!this.activityData.weeklyStats[weekKey].userMessages[userId]) {
            this.activityData.weeklyStats[weekKey].userMessages[userId] = 0;
        }
        
        this.activityData.weeklyStats[weekKey].totalMessages++;
        this.activityData.weeklyStats[weekKey].activeUsers.add(userId);
        this.activityData.weeklyStats[weekKey].userMessages[userId]++;
    }

    getWeeklyStats(weekKey) {
        return this.activityData.weeklyStats[weekKey] || {
            totalMessages: 0,
            activeUsers: new Set(),
            userMessages: {}
        };
    }
}

module.exports = ActivityTracker;