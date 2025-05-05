const fs = require('fs');
const path = require('path');

class DataUtils {
    constructor(activityTracker) {
        this.activityTracker = activityTracker;
        this.backupDir = path.join(__dirname, 'backups');
    }

    async createBackup() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir);
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);
            
            const data = JSON.stringify(this.activityTracker.activityData, null, 2);
            fs.writeFileSync(backupFile, data);
            
            console.log(`Backup created: ${backupFile}`);
            return backupFile;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    cleanupOldData(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        
        let cleaned = 0;
        const data = this.activityTracker.activityData;
        
        Object.keys(data.messages).forEach(userId => {
            const userMessages = data.messages[userId];
            Object.keys(userMessages).forEach(date => {
                if (date < cutoffStr) {
                    delete userMessages[date];
                    cleaned++;
                }
            });
            
            if (Object.keys(userMessages).length === 0) {
                delete data.messages[userId];
            }
        });
        
        Object.keys(data.dailyStats).forEach(date => {
            if (date < cutoffStr) {
                delete data.dailyStats[date];
                cleaned++;
            }
        });
        
        Object.keys(data.memberEvents).forEach(date => {
            if (date < cutoffStr) {
                delete data.memberEvents[date];
                cleaned++;
            }
        });
        
        if (cleaned > 0) {
            this.activityTracker.saveData();
            console.log(`Cleaned up ${cleaned} old data entries`);
        }
        
        return cleaned;
    }

    getDataStats() {
        const data = this.activityTracker.activityData;
        return {
            totalUsers: Object.keys(data.messages).length,
            totalDays: Object.keys(data.dailyStats).length,
            totalWeeks: Object.keys(data.weeklyStats || {}).length,
            totalMessages: Object.values(data.messages).reduce((total, userMessages) => {
                return total + Object.values(userMessages).reduce((sum, count) => sum + count, 0);
            }, 0),
            dataSize: JSON.stringify(data).length,
            lastUpdate: data.lastUpdate
        };
    }

    async exportData(format = 'json') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFile = path.join(__dirname, `export-${timestamp}.${format}`);
        
        try {
            if (format === 'json') {
                const data = JSON.stringify(this.activityTracker.activityData, null, 2);
                fs.writeFileSync(exportFile, data);
            } else if (format === 'csv') {
                const csv = this.convertToCSV();
                fs.writeFileSync(exportFile, csv);
            }
            
            console.log(`Data exported to: ${exportFile}`);
            return exportFile;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    convertToCSV() {
        const data = this.activityTracker.activityData;
        let csv = 'Date,UserId,Messages\n';
        
        Object.entries(data.messages).forEach(([userId, userMessages]) => {
            Object.entries(userMessages).forEach(([date, count]) => {
                csv += `${date},${userId},${count}\n`;
            });
        });
        
        return csv;
    }

    validateData() {
        const data = this.activityTracker.activityData;
        const issues = [];
        
        if (!data.messages || typeof data.messages !== 'object') {
            issues.push('Missing or invalid messages data');
        }
        
        if (!data.dailyStats || typeof data.dailyStats !== 'object') {
            issues.push('Missing or invalid dailyStats data');
        }
        
        if (!data.memberEvents || typeof data.memberEvents !== 'object') {
            issues.push('Missing or invalid memberEvents data');
        }
        
        Object.entries(data.dailyStats || {}).forEach(([date, stats]) => {
            if (!stats.activeUsers || !(stats.activeUsers instanceof Set)) {
                issues.push(`Invalid activeUsers Set for date: ${date}`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }
}

module.exports = DataUtils;