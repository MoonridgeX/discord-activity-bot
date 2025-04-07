const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const ActivityTracker = require('./activityTracker');
const Commands = require('./commands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const activityTracker = new ActivityTracker();
const commands = new Commands(activityTracker);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is ready and monitoring activity...`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const isCommand = await commands.handleCommand(message);
    
    if (!isCommand) {
        activityTracker.trackMessage(message.author.id, message.channel.id);
        console.log(`Tracked message from ${message.author.username} in #${message.channel.name}`);
    }
});

client.on('guildMemberAdd', (member) => {
    activityTracker.trackMemberJoin(member.id, member.user.username);
    console.log(`Member joined: ${member.user.username}`);
});

client.on('guildMemberRemove', (member) => {
    activityTracker.trackMemberLeave(member.id, member.user.username);
    console.log(`Member left: ${member.user.username}`);
});

client.login(config.token);