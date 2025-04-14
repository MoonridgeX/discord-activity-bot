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
                
                return parsed;
            }
        } catch (error) {
            console.error('Error loading activity data:', error);
        }
        return {
            messages: {},
            dailyStats: {},
            memberEvents: {},
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
}

module.exports = ActivityTracker;