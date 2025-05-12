const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config');
const ActivityTracker = require('./activityTracker');
const Commands = require('./commands');
const { slashCommands, SlashCommandHandler } = require('./slashCommands');
const { adminSlashCommands, AdminCommandHandler } = require('./adminCommands');

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
const slashCommandHandler = new SlashCommandHandler(activityTracker);
const adminCommandHandler = new AdminCommandHandler(activityTracker);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is ready and monitoring activity...`);
    
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('Registering slash commands...');
        const allCommands = [...slashCommands, ...adminSlashCommands];
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.guildId),
            { body: allCommands.map(command => command.toJSON()) }
        );
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
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

client.on('interactionCreate', async (interaction) => {
    const adminHandled = await adminCommandHandler.handleInteraction(interaction);
    if (!adminHandled) {
        await slashCommandHandler.handleInteraction(interaction);
    }
});

client.login(config.token);