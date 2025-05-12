# Discord Activity Bot

A Discord bot that tracks server activity including messages, member joins/leaves, and provides statistics through interactive commands.

## Features

- **Message Tracking**: Monitors all messages sent in the server
- **Member Events**: Tracks when users join or leave the server  
- **Daily & Weekly Statistics**: Comprehensive activity tracking with persistence
- **Modern Slash Commands**: Full Discord slash command integration
- **User Profiles**: Detailed activity profiles with rankings and statistics
- **Leaderboards**: View top contributors and activity rankings
- **Scheduled Reports**: Automated daily and weekly activity summaries
- **Admin Tools**: Data backup, cleanup, export, and management utilities
- **Data Persistence**: Robust JSON storage with Set serialization support

## Commands

### Slash Commands
- `/stats` - Show today's server activity statistics  
- `/activity [user]` - Show activity for a specific user
- `/leaderboard [limit]` - View the most active users
- `/profile [user]` - View detailed user profile and statistics

### Text Commands (Legacy)
- `!stats` - Show today's server activity statistics
- `!activity [user]` - Show activity for a specific user (mention them)
- `!help` - Display available commands

### Admin Commands (Requires Administrator permissions)
- `/admin-backup` - Create a backup of activity data
- `/admin-cleanup [days]` - Clean up old activity data
- `/admin-stats` - View detailed bot statistics  
- `/admin-export [format]` - Export activity data (JSON/CSV)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   - `DISCORD_BOT_TOKEN` - Your Discord bot token
   - `GUILD_ID` - Your Discord server ID
4. Run the bot: `npm start`

## Development

- `npm run dev` - Run with nodemon for development

## Configuration

The bot can be configured through `config.js`:
- Activity check interval
- Tracking settings
- Bot permissions

Activity data is automatically saved to `activity_data.json` and excluded from version control.