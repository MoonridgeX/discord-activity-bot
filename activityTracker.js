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
                return JSON.parse(data);
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
            fs.writeFileSync(this.dataFile, JSON.stringify(this.activityData, null, 2));
        } catch (error) {
            console.error('Error saving activity data:', error);
        }
    }

    trackMessage(userId, channelId) {
        const today = new Date().toISOString().split('T')[0];
        
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