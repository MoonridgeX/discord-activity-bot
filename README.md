# Discord Activity Bot

A Discord bot that tracks server activity including messages, member joins/leaves, and provides statistics through interactive commands.

## Features

- **Message Tracking**: Monitors all messages sent in the server
- **Member Events**: Tracks when users join or leave the server  
- **Daily Statistics**: Stores daily activity data with persistence
- **Interactive Commands**: View stats and user activity via bot commands
- **Data Persistence**: Stores activity data in JSON format

## Commands

- `!stats` - Show today's server activity statistics
- `!activity [user]` - Show activity for a specific user (mention them)
- `!help` - Display available commands

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