const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DataUtils = require('./utils');

const adminSlashCommands = [
    new SlashCommandBuilder()
        .setName('admin-backup')
        .setDescription('Create a backup of activity data')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('admin-cleanup')
        .setDescription('Clean up old activity data')
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Keep data from the last N days (default: 30)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(365))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('admin-stats')
        .setDescription('View detailed bot statistics')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('admin-export')
        .setDescription('Export activity data')
        .addStringOption(option =>
            option.setName('format')
                .setDescription('Export format')
                .setRequired(false)
                .addChoices(
                    { name: 'JSON', value: 'json' },
                    { name: 'CSV', value: 'csv' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
];

class AdminCommandHandler {
    constructor(activityTracker) {
        this.activityTracker = activityTracker;
        this.dataUtils = new DataUtils(activityTracker);
    }

    async handleInteraction(interaction) {
        if (!interaction.isChatInputCommand()) return false;
        
        if (!interaction.commandName.startsWith('admin-')) return false;
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ 
                content: '❌ You need Administrator permissions to use admin commands.', 
                ephemeral: true 
            });
            return true;
        }

        try {
            switch (interaction.commandName) {
                case 'admin-backup':
                    await this.handleBackup(interaction);
                    break;
                case 'admin-cleanup':
                    await this.handleCleanup(interaction);
                    break;
                case 'admin-stats':
                    await this.handleStats(interaction);
                    break;
                case 'admin-export':
                    await this.handleExport(interaction);
                    break;
                default:
                    return false;
            }
            return true;
        } catch (error) {
            console.error('Admin command error:', error);
            const reply = { content: 'There was an error executing this admin command!', ephemeral: true };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
            return true;
        }
    }

    async handleBackup(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const backupFile = await this.dataUtils.createBackup();
            const fileName = backupFile.split('/').pop();
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Backup Created')
                .setDescription(`Activity data has been backed up successfully.`)
                .addFields({ name: 'File', value: fileName })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to create backup.' });
        }
    }

    async handleCleanup(interaction) {
        const days = interaction.options.getInteger('days') || 30;
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const cleaned = this.dataUtils.cleanupOldData(days);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF9900)
                .setTitle('🧹 Data Cleanup Complete')
                .setDescription(`Removed data older than ${days} days.`)
                .addFields({ name: 'Entries Cleaned', value: cleaned.toString() })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to cleanup data.' });
        }
    }

    async handleStats(interaction) {
        const stats = this.dataUtils.getDataStats();
        const validation = this.dataUtils.validateData();
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📊 Bot Statistics')
            .addFields(
                { name: 'Total Users', value: stats.totalUsers.toString(), inline: true },
                { name: 'Days Tracked', value: stats.totalDays.toString(), inline: true },
                { name: 'Weeks Tracked', value: stats.totalWeeks.toString(), inline: true },
                { name: 'Total Messages', value: stats.totalMessages.toString(), inline: true },
                { name: 'Data Size (bytes)', value: stats.dataSize.toString(), inline: true },
                { name: 'Data Valid', value: validation.isValid ? '✅ Yes' : '❌ No', inline: true }
            )
            .addFields({ name: 'Last Update', value: stats.lastUpdate || 'Never' })
            .setTimestamp();
        
        if (!validation.isValid) {
            embed.addFields({ 
                name: 'Validation Issues', 
                value: validation.issues.join('\n') || 'None' 
            });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    async handleExport(interaction) {
        const format = interaction.options.getString('format') || 'json';
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const exportFile = await this.dataUtils.exportData(format);
            const fileName = exportFile.split('/').pop();
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📤 Data Exported')
                .setDescription(`Activity data exported as ${format.toUpperCase()}.`)
                .addFields({ name: 'File', value: fileName })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to export data.' });
        }
    }
}

module.exports = { adminSlashCommands, AdminCommandHandler };