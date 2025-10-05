const keepAlive = require("./keepAlive");
keepAlive();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const PREFIX = ',';
const BOT_NAME = '[BOT] Sandhurst British Army';

client.once('clientReady', () => {
    console.log(`${BOT_NAME} is now online!`);
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} server(s)`);
    client.user.setActivity(',help for commands', { type: 'WATCHING' });
});

client.on('guildMemberAdd', member => {
    const channel = member.guild.systemChannel;
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Welcome!')
            .setDescription(`Welcome to the server, ${member}! 🎖️`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: BOT_NAME })
            .setTimestamp();
        channel.send({ embeds: [embed] });
    }
});

client.on('messageDelete', message => {
    if (message.author.bot) return;
    message.channel.lastDeletedMessage = {
        content: message.content,
        author: message.author,
        deletedAt: new Date()
    };
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        if (command === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${BOT_NAME} - Command List`)
                .setDescription('Here are all available commands:')
                .addFields(
                    { name: '📋 Moderation', value: '`,kick` `,ban` `,unban` `,softban` `,mute` `,unmute` `,warn` `,clear` `,purge` `,slowmode` `,lock` `,unlock`', inline: false },
                    { name: 'ℹ️ Information', value: '`,serverinfo` `,userinfo` `,avatar` `,botinfo` `,membercount` `,channelinfo` `,roleinfo` `,emojis` `,banner` `,firstmessage` `,stats` `,spotify`', inline: false },
                    { name: '🛠️ Utility', value: '`,poll` `,announce` `,say` `,embed` `,timestamp` `,calc` `,reverse` `,uppercase` `,lowercase` `,base64encode` `,base64decode` `,binary` `,choose` `,morse` `,timer` `,remindme` `,enlarge`', inline: false },
                    { name: '🎮 Games', value: '`,rps` `,guess` `,slots` `,roll` `,coinflip` `,trivia` `,minesweeper`', inline: false },
                    { name: '🎭 Roles', value: '`,addrole` `,removerole` `,createrole` `,deleterole` `,rolelist`', inline: false },
                    { name: '💬 Fun & Social', value: '`,hug` `,slap` `,pat` `,kiss` `,poke` `,rate` `,ship` `,wyr` `,8ball` `,joke` `,meme` `,roast` `,compliment` `,truthordare` `,neverhaveiever` `,thisorthat`', inline: false },
                    { name: '📚 Random', value: '`,fact` `,advice` `,quote` `,ascii` `,randommember` `,randomnumber` `,randomcolor` `,password` `,leaderboard`', inline: false },
                    { name: '🎨 Colors', value: '`,colorinfo`', inline: false },
                    { name: '📢 Community', value: '`,suggest` `,report` `,snipe` `,afk`', inline: false },
                    { name: '⚙️ Server Management', value: '`,setnick`', inline: false },
                    { name: '💬 General', value: '`,ping` `,uptime` `,invite` `,weather` `,wikipedia`', inline: false }
                )
                .setFooter({ text: `Use ${PREFIX}command for each command | Total: 90+ commands` })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (command === 'ping') {
            const sent = await message.reply('Pinging...');
            const ping = sent.createdTimestamp - message.createdTimestamp;
            sent.edit(`🏓 Pong! Latency: ${ping}ms | API Latency: ${Math.round(client.ws.ping)}ms`);
        }

        if (command === 'uptime') {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;
            const seconds = Math.floor(uptime) % 60;
            message.reply(`⏱️ Bot uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        }

        if (command === 'kick') {
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return message.reply('❌ You need the Kick Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to kick.');
            if (!member.kickable) return message.reply('❌ I cannot kick this user.');
            const reason = args.slice(1).join(' ') || 'No reason provided';
            await member.kick(reason);
            message.reply(`✅ ${member.user.tag} has been kicked. Reason: ${reason}`);
        }

        if (command === 'ban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply('❌ You need the Ban Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to ban.');
            if (!member.bannable) return message.reply('❌ I cannot ban this user.');
            const reason = args.slice(1).join(' ') || 'No reason provided';
            await member.ban({ reason });
            message.reply(`✅ ${member.user.tag} has been banned. Reason: ${reason}`);
        }

        if (command === 'unban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply('❌ You need the Ban Members permission to use this command.');
            }
            const userId = args[0];
            if (!userId) return message.reply('❌ Please provide a user ID to unban.');
            try {
                await message.guild.members.unban(userId);
                message.reply(`✅ User with ID ${userId} has been unbanned.`);
            } catch (error) {
                message.reply('❌ Could not unban this user. Make sure the ID is correct and the user is banned.');
            }
        }

        if (command === 'mute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return message.reply('❌ You need the Timeout Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to mute.');
            const duration = parseInt(args[1]) || 60;
            const reason = args.slice(2).join(' ') || 'No reason provided';
            await member.timeout(duration * 1000, reason);
            message.reply(`✅ ${member.user.tag} has been muted for ${duration} seconds. Reason: ${reason}`);
        }

        if (command === 'unmute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return message.reply('❌ You need the Timeout Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to unmute.');
            await member.timeout(null);
            message.reply(`✅ ${member.user.tag} has been unmuted.`);
        }

        if (command === 'warn') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return message.reply('❌ You need the Moderate Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to warn.');
            const reason = args.slice(1).join(' ') || 'No reason provided';
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⚠️ Warning Issued')
                .setDescription(`${member.user.tag} has been warned.`)
                .addFields({ name: 'Reason', value: reason })
                .setFooter({ text: `Warned by ${message.author.tag}` })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            try {
                await member.send(`⚠️ You have been warned in ${message.guild.name}. Reason: ${reason}`);
            } catch (error) {
                message.channel.send('⚠️ Could not DM the user.');
            }
        }

        if (command === 'clear') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return message.reply('❌ You need the Manage Messages permission to use this command.');
            }
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount <= 0 || amount > 100) {
                return message.reply('❌ Please provide a number between 1 and 100.');
            }
            const deleted = await message.channel.bulkDelete(amount + 1, true);
            const reply = await message.channel.send(`✅ Deleted ${deleted.size - 1} messages.`);
            setTimeout(() => reply.delete(), 3000);
        }

        if (command === 'serverinfo') {
            const { guild } = message;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${guild.name} - Server Information`)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Members', value: `${guild.memberCount}`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                    { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                    { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'userinfo') {
            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user.tag} - User Information`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'User ID', value: user.id, inline: true },
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None', inline: false }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'avatar') {
            const user = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user.tag}'s Avatar`)
                .setImage(user.displayAvatarURL({ size: 512 }))
                .setFooter({ text: BOT_NAME });
            message.reply({ embeds: [embed] });
        }

        if (command === 'botinfo') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(BOT_NAME)
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: 'Bot Tag', value: client.user.tag, inline: true },
                    { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Users', value: `${client.users.cache.size}`, inline: true },
                    { name: 'Uptime', value: `${Math.floor(process.uptime() / 60)} minutes`, inline: true },
                    { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: 'Discord.js v14' })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'membercount') {
            message.reply(`👥 This server has **${message.guild.memberCount}** members.`);
        }

        if (command === 'poll') {
            if (!args.length) return message.reply('❌ Usage: !poll <question>');
            const question = args.join(' ');
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 Poll')
                .setDescription(question)
                .setFooter({ text: `Poll by ${message.author.tag}` })
                .setTimestamp();
            const pollMessage = await message.channel.send({ embeds: [embed] });
            await pollMessage.react('👍');
            await pollMessage.react('👎');
            await pollMessage.react('🤷');
        }

        if (command === 'announce') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return message.reply('❌ You need the Manage Messages permission to use this command.');
            }
            if (!args.length) return message.reply('❌ Usage: !announce <message>');
            const announcement = args.join(' ');
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('📢 Announcement')
                .setDescription(announcement)
                .setFooter({ text: `Announced by ${message.author.tag}` })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            message.delete();
        }

        if (command === 'say') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return message.reply('❌ You need the Manage Messages permission to use this command.');
            }
            if (!args.length) return message.reply('❌ Usage: !say <message>');
            const text = args.join(' ');
            message.channel.send(text);
            message.delete();
        }

        if (command === 'embed') {
            if (!args.length) return message.reply('❌ Usage: !embed <message>');
            const text = args.join(' ');
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setDescription(text)
                .setFooter({ text: `By ${message.author.tag}` })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }

        if (command === 'timestamp') {
            const timestamp = Math.floor(Date.now() / 1000);
            message.reply(`⏰ Current timestamp: <t:${timestamp}:F> (\`${timestamp}\`)`);
        }

        if (command === 'roll') {
            const sides = parseInt(args[0]) || 6;
            if (sides < 2 || sides > 100) return message.reply('❌ Please specify a number between 2 and 100.');
            const result = Math.floor(Math.random() * sides) + 1;
            message.reply(`🎲 You rolled a **${result}** out of ${sides}!`);
        }

        if (command === 'coinflip') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            message.reply(`🪙 The coin landed on **${result}**!`);
        }

        if (command === '8ball') {
            if (!args.length) return message.reply('❌ Please ask a question!');
            const responses = [
                'Yes, definitely.',
                'Without a doubt.',
                'You may rely on it.',
                'As I see it, yes.',
                'Most likely.',
                'Outlook good.',
                'Signs point to yes.',
                'Reply hazy, try again.',
                'Ask again later.',
                'Better not tell you now.',
                'Cannot predict now.',
                'Concentrate and ask again.',
                "Don't count on it.",
                'My reply is no.',
                'My sources say no.',
                'Outlook not so good.',
                'Very doubtful.'
            ];
            const answer = responses[Math.floor(Math.random() * responses.length)];
            message.reply(`🎱 ${answer}`);
        }

        if (command === 'joke') {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "What do you call a fake noodle? An impasta!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "What do you call a bear with no teeth? A gummy bear!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What did the ocean say to the beach? Nothing, it just waved!",
                "Why do seagulls fly over the sea? Because if they flew over the bay, they'd be bagels!",
                "What do you call a dinosaur with an extensive vocabulary? A thesaurus!",
                "How does a penguin build its house? Igloos it together!",
                "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
                "what is more horrible than a baby in a trash? a baby in two trashs..."
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            message.reply(`😄 ${joke}`);
        }

        if (command === 'meme') {
            const memes = [
                'This is the way.',
                'Always has been. 🔫',
                'Is this a pigeon?',
                'Stonks 📈',
                'I am speed.',
                'It is what it is.',
                'Perfectly balanced, as all things should be.',
                'Modern problems require modern solutions.',
                'Improvise. Adapt. Overcome.',
                'Task failed successfully.',
                'This is fine.',
                '*speed drinks water*; *speed puts away the water*; double W speed.'
            ];
            const meme = memes[Math.floor(Math.random() * memes.length)];
            message.reply(meme);
        }

        if (command === 'addrole') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('❌ You need the Manage Roles permission to use this command.');
            }
            const member = message.mentions.members.first();
            const roleName = args.slice(1).join(' ');
            if (!member) return message.reply('❌ Please mention a user.');
            if (!roleName) return message.reply('❌ Please specify a role name.');
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
            if (!role) return message.reply('❌ Role not found.');
            await member.roles.add(role);
            message.reply(`✅ Added the **${role.name}** role to ${member.user.tag}.`);
        }

        if (command === 'removerole') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('❌ You need the Manage Roles permission to use this command.');
            }
            const member = message.mentions.members.first();
            const roleName = args.slice(1).join(' ');
            if (!member) return message.reply('❌ Please mention a user.');
            if (!roleName) return message.reply('❌ Please specify a role name.');
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
            if (!role) return message.reply('❌ Role not found.');
            await member.roles.remove(role);
            message.reply(`✅ Removed the **${role.name}** role from ${member.user.tag}.`);
        }

        if (command === 'createrole') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('❌ You need the Manage Roles permission to use this command.');
            }
            const roleName = args.join(' ');
            if (!roleName) return message.reply('❌ Please specify a role name.');
            const role = await message.guild.roles.create({
                name: roleName,
                color: Math.floor(Math.random() * 16777215),
                reason: `Created by ${message.author.tag}`
            });
            message.reply(`✅ Created role **${role.name}** with color ${role.hexColor}.`);
        }

        if (command === 'deleterole') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('❌ You need the Manage Roles permission to use this command.');
            }
            const roleName = args.join(' ');
            if (!roleName) return message.reply('❌ Please specify a role name.');
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
            if (!role) return message.reply('❌ Role not found.');
            await role.delete();
            message.reply(`✅ Deleted role **${roleName}**.`);
        }

        if (command === 'rolelist') {
            const roles = message.guild.roles.cache
                .filter(role => role.name !== '@everyone')
                .sort((a, b) => b.position - a.position)
                .map(role => role.name)
                .join(', ');
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Roles in ${message.guild.name}`)
                .setDescription(roles || 'No roles found')
                .setFooter({ text: `Total: ${message.guild.roles.cache.size - 1} roles` });
            message.reply({ embeds: [embed] });
        }

        if (command === 'slowmode') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply('❌ You need the Manage Channels permission to use this command.');
            }
            const seconds = parseInt(args[0]);
            if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
                return message.reply('❌ Please provide a number between 0 and 21600 seconds.');
            }
            await message.channel.setRateLimitPerUser(seconds);
            message.reply(`✅ Slowmode set to ${seconds} seconds.`);
        }

        if (command === 'lock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply('❌ You need the Manage Channels permission to use this command.');
            }
            await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
            message.reply('🔒 Channel locked.');
        }

        if (command === 'unlock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply('❌ You need the Manage Channels permission to use this command.');
            }
            await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
            message.reply('🔓 Channel unlocked.');
        }

        if (command === 'channelinfo') {
            const channel = message.mentions.channels.first() || message.channel;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`#${channel.name} - Channel Information`)
                .addFields(
                    { name: 'Channel ID', value: channel.id, inline: true },
                    { name: 'Type', value: channel.type.toString(), inline: true },
                    { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Topic', value: channel.topic || 'No topic', inline: false }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'roleinfo') {
            const roleName = args.join(' ');
            if (!roleName) return message.reply('❌ Please specify a role name.');
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
            if (!role) return message.reply('❌ Role not found.');
            const embed = new EmbedBuilder()
                .setColor(role.color)
                .setTitle(`${role.name} - Role Information`)
                .addFields(
                    { name: 'Role ID', value: role.id, inline: true },
                    { name: 'Color', value: role.hexColor, inline: true },
                    { name: 'Members', value: `${role.members.size}`, inline: true },
                    { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                    { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                    { name: 'Position', value: `${role.position}`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'emojis') {
            const emojis = message.guild.emojis.cache.map(e => `${e} \`${e.name}\``).join('\n') || 'No custom emojis';
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${message.guild.name} - Custom Emojis`)
                .setDescription(emojis.slice(0, 4000))
                .setFooter({ text: `Total: ${message.guild.emojis.cache.size} emojis` });
            message.reply({ embeds: [embed] });
        }

        if (command === 'banner') {
            const user = message.mentions.users.first() || message.author;
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            const banner = fetchedUser.bannerURL({ size: 512 });
            if (!banner) return message.reply('❌ This user has no banner.');
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user.tag}'s Banner`)
                .setImage(banner)
                .setFooter({ text: BOT_NAME });
            message.reply({ embeds: [embed] });
        }

        if (command === 'rps') {
            const choices = ['rock', 'paper', 'scissors'];
            const userChoice = args[0]?.toLowerCase();
            if (!choices.includes(userChoice)) {
                return message.reply('❌ Please choose: rock, paper, or scissors');
            }
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            let result;
            if (userChoice === botChoice) result = "It's a tie!";
            else if (
                (userChoice === 'rock' && botChoice === 'scissors') ||
                (userChoice === 'paper' && botChoice === 'rock') ||
                (userChoice === 'scissors' && botChoice === 'paper')
            ) result = 'You win! 🎉';
            else result = 'You lose! 😢';
            message.reply(`You chose **${userChoice}**, I chose **${botChoice}**. ${result}`);
        }

        if (command === 'guess') {
            const number = Math.floor(Math.random() * 10) + 1;
            const guess = parseInt(args[0]);
            if (isNaN(guess) || guess < 1 || guess > 10) {
                return message.reply('❌ Please guess a number between 1 and 10!');
            }
            if (guess === number) {
                message.reply(`🎉 Correct! The number was **${number}**!`);
            } else {
                message.reply(`❌ Wrong! The number was **${number}**. Better luck next time!`);
            }
        }

        if (command === 'slots') {
            const slots = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
            const result = [
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)]
            ];
            const win = result[0] === result[1] && result[1] === result[2];
            message.reply(`🎰 ${result.join(' | ')} 🎰\n${win ? '🎉 JACKPOT! You won!' : '😢 Better luck next time!'}`);
        }

        if (command === 'hug') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention someone to hug!');
            message.channel.send(`${message.author} hugs ${user} 🤗`);
        }

        if (command === 'slap') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention someone to slap!');
            message.channel.send(`${message.author} slaps ${user} 👋`);
        }

        if (command === 'pat') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention someone to pat!');
            message.channel.send(`${message.author} pats ${user} 🤚`);
        }

        if (command === 'kiss') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention someone to kiss!');
            message.channel.send(`${message.author} kisses ${user} 💋`);
        }

        if (command === 'poke') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention someone to poke!');
            message.channel.send(`${message.author} pokes ${user} 👉`);
        }

        if (command === 'rate') {
            const thing = args.join(' ');
            if (!thing) return message.reply('❌ Please provide something to rate!');
            const rating = Math.floor(Math.random() * 11);
            message.reply(`I rate ${thing} a **${rating}/10**! ⭐`);
        }

        if (command === 'ship') {
            const user1 = message.mentions.users.first() || message.author;
            const user2 = message.mentions.users.toArray()[1];
            if (!user2) return message.reply('❌ Please mention two users to ship!');
            const percentage = Math.floor(Math.random() * 101);
            const hearts = percentage > 75 ? '💖💖💖' : percentage > 50 ? '💕💕' : percentage > 25 ? '💗' : '💔';
            message.reply(`${user1.username} 💕 ${user2.username}\nLove percentage: **${percentage}%** ${hearts}`);
        }

        if (command === 'wyr') {
            const questions = [
                'Would you rather have the ability to fly or be invisible?',
                'Would you rather live in the city or the countryside?',
                'Would you rather be able to speak all languages or play all instruments?',
                'Would you rather have unlimited money or unlimited time?',
                'Would you rather never use social media again or never watch TV/movies again?',
                'Would you rather be able to teleport or read minds?',
                'Would you rather live in the past or the future?',
                'Would you rather have super strength or super speed?'
            ];
            const question = questions[Math.floor(Math.random() * questions.length)];
            message.reply(`🤔 ${question}`);
        }

        if (command === 'calc') {
            if (!args.length) return message.reply('❌ Usage: ,calc <expression> (e.g., ,calc 5 + 3)');
            try {
                const expression = args.join(' ');
                const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));
                message.reply(`🧮 Result: **${result}**`);
            } catch (error) {
                message.reply('❌ Invalid expression!');
            }
        }

        if (command === 'reverse') {
            if (!args.length) return message.reply('❌ Please provide text to reverse!');
            const text = args.join(' ');
            message.reply(text.split('').reverse().join(''));
        }

        if (command === 'uppercase') {
            if (!args.length) return message.reply('❌ Please provide text to convert!');
            message.reply(args.join(' ').toUpperCase());
        }

        if (command === 'lowercase') {
            if (!args.length) return message.reply('❌ Please provide text to convert!');
            message.reply(args.join(' ').toLowerCase());
        }

        if (command === 'base64encode') {
            if (!args.length) return message.reply('❌ Please provide text to encode!');
            const text = args.join(' ');
            const encoded = Buffer.from(text).toString('base64');
            message.reply(`🔒 Encoded: \`${encoded}\``);
        }

        if (command === 'base64decode') {
            if (!args.length) return message.reply('❌ Please provide text to decode!');
            try {
                const decoded = Buffer.from(args[0], 'base64').toString('utf-8');
                message.reply(`🔓 Decoded: ${decoded}`);
            } catch (error) {
                message.reply('❌ Invalid base64 string!');
            }
        }

        if (command === 'binary') {
            if (!args.length) return message.reply('❌ Please provide text to convert to binary!');
            const text = args.join(' ');
            const binary = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            message.reply(`🔢 Binary: \`${binary}\``);
        }

        if (command === 'choose') {
            if (args.length < 2) return message.reply('❌ Please provide at least 2 options separated by spaces!');
            const choice = args[Math.floor(Math.random() * args.length)];
            message.reply(`🤔 I choose: **${choice}**`);
        }

        if (command === 'setnick') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return message.reply('❌ You need the Manage Nicknames permission to use this command.');
            }
            const member = message.mentions.members.first();
            const nickname = args.slice(1).join(' ');
            if (!member) return message.reply('❌ Please mention a user.');
            if (!nickname) return message.reply('❌ Please provide a nickname.');
            await member.setNickname(nickname);
            message.reply(`✅ Changed ${member.user.tag}'s nickname to **${nickname}**.`);
        }

        if (command === 'roast') {
            const roasts = [
                "You're like a software update. Whenever I see you, I think 'Not now.'",
                "I'd agree with you, but then we'd both be wrong.",
                "You bring everyone so much joy when you leave the room.",
                "If laughter is the best medicine, your face must be curing the world.",
                "I'm not saying you're stupid, you just have bad luck when thinking.",
                "You're the reason the gene pool needs a lifeguard.",
                "Somewhere out there is a tree tirelessly producing oxygen for you. You owe it an apology."
            ];
            const roast = roasts[Math.floor(Math.random() * roasts.length)];
            message.reply(`🔥 ${roast}`);
        }

        if (command === 'compliment') {
            const compliments = [
                "You're an awesome friend!",
                "You light up the room!",
                "You have a great sense of humor!",
                "You're a smart cookie!",
                "You're one of a kind!",
                "You're really something special!",
                "You've got all the right moves!",
                "You're like sunshine on a rainy day!"
            ];
            const compliment = compliments[Math.floor(Math.random() * compliments.length)];
            message.reply(`✨ ${compliment}`);
        }

        if (command === 'fact') {
            const facts = [
                "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
                "Octopuses have three hearts and blue blood.",
                "Bananas are berries, but strawberries aren't!",
                "A group of flamingos is called a 'flamboyance'.",
                "The shortest war in history lasted 38-45 minutes.",
                "There are more stars in the universe than grains of sand on all of Earth's beaches.",
                "A single cloud can weigh more than 1 million pounds!",
                "Scotland's national animal is the unicorn."
            ];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            message.reply(`📚 **Fun Fact:** ${fact}`);
        }

        if (command === 'advice') {
            const adviceList = [
                "Don't take life too seriously. Nobody gets out alive anyway.",
                "Be yourself; everyone else is already taken.",
                "The best time to plant a tree was 20 years ago. The second best time is now.",
                "Don't wait for opportunity. Create it.",
                "Fall seven times, stand up eight.",
                "Every expert was once a beginner.",
                "Progress, not perfection.",
                "Your vibe attracts your tribe."
            ];
            const advice = adviceList[Math.floor(Math.random() * adviceList.length)];
            message.reply(`💡 **Advice:** ${advice}`);
        }

        if (command === 'quote') {
            const quotes = [
                '"The only way to do great work is to love what you do." - Steve Jobs',
                '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
                '"Stay hungry, stay foolish." - Steve Jobs',
                '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
                '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
                '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
                '"The only impossible journey is the one you never begin." - Tony Robbins'
            ];
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            message.reply(`📜 ${quote}`);
        }

        if (command === 'ascii') {
            if (!args.length) return message.reply('❌ Please provide text to convert to ASCII art!');
            const text = args.join(' ').toUpperCase();
            const asciiArt = text.split('').map(char => `\`${char}\``).join(' ');
            message.reply(asciiArt);
        }

        if (command === 'firstmessage') {
            const fetchedMessages = await message.channel.messages.fetch({ after: '1', limit: 1 });
            const firstMessage = fetchedMessages.first();
            if (!firstMessage) return message.reply('❌ Could not find the first message.');
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('First Message in This Channel')
                .setDescription(firstMessage.content || 'No content')
                .addFields(
                    { name: 'Author', value: `${firstMessage.author}`, inline: true },
                    { name: 'Sent', value: `<t:${Math.floor(firstMessage.createdTimestamp / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: BOT_NAME });
            message.reply({ embeds: [embed], components: [{ type: 1, components: [{ type: 2, style: 5, label: 'Jump to Message', url: firstMessage.url }] }] });
        }

        if (command === 'softban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply('❌ You need the Ban Members permission to use this command.');
            }
            const member = message.mentions.members.first();
            if (!member) return message.reply('❌ Please mention a user to softban.');
            if (!member.bannable) return message.reply('❌ I cannot ban this user.');
            const reason = args.slice(1).join(' ') || 'No reason provided';
            await member.ban({ reason, deleteMessageDays: 7 });
            await message.guild.members.unban(member.id);
            message.reply(`✅ ${member.user.tag} has been softbanned (banned and unbanned to delete messages). Reason: ${reason}`);
        }

        if (command === 'purge') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return message.reply('❌ You need the Manage Messages permission to use this command.');
            }
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount <= 0 || amount > 100) {
                return message.reply('❌ Please provide a number between 1 and 100.');
            }
            const user = message.mentions.users.first();
            if (user) {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(m => m.author.id === user.id).first(amount);
                await message.channel.bulkDelete(userMessages, true);
                const reply = await message.channel.send(`✅ Purged ${userMessages.length} messages from ${user.tag}.`);
                setTimeout(() => reply.delete(), 3000);
            } else {
                const deleted = await message.channel.bulkDelete(amount, true);
                const reply = await message.channel.send(`✅ Purged ${deleted.size} messages.`);
                setTimeout(() => reply.delete(), 3000);
            }
        }

        if (command === 'snipe') {
            if (!message.channel.lastDeletedMessage) {
                return message.reply('❌ No recently deleted messages to snipe!');
            }
            const { content, author, deletedAt } = message.channel.lastDeletedMessage;
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
                .setDescription(content || 'No content')
                .setFooter({ text: `Deleted at ${deletedAt.toLocaleString()}` });
            message.reply({ embeds: [embed] });
        }

        if (command === 'suggest') {
            if (!args.length) return message.reply('❌ Please provide a suggestion!');
            const suggestion = args.join(' ');
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('💡 New Suggestion')
                .setDescription(suggestion)
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            const suggestionMsg = await message.channel.send({ embeds: [embed] });
            await suggestionMsg.react('👍');
            await suggestionMsg.react('👎');
            message.delete();
        }

        if (command === 'report') {
            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Please mention a user to report!');
            const reason = args.slice(1).join(' ');
            if (!reason) return message.reply('❌ Please provide a reason for the report!');
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚨 User Report')
                .addFields(
                    { name: 'Reported User', value: `${user} (${user.tag})`, inline: true },
                    { name: 'Reported By', value: `${message.author}`, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Channel', value: `${message.channel}`, inline: true }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            message.reply('✅ Report submitted successfully.');
        }

        if (command === 'afk') {
            const reason = args.join(' ') || 'AFK';
            message.reply(`✅ I set your AFK: ${reason}`);
        }

        if (command === 'trivia') {
            const questions = [
                { q: 'What is the capital of France?', a: ['paris'] },
                { q: 'What is 2 + 2?', a: ['4', 'four'] },
                { q: 'What planet is known as the Red Planet?', a: ['mars'] },
                { q: 'How many continents are there?', a: ['7', 'seven'] },
                { q: 'What is the largest ocean?', a: ['pacific', 'pacific ocean'] },
                { q: 'What year did World War 2 end?', a: ['1945'] },
                { q: 'What is the smallest country in the world?', a: ['vatican', 'vatican city'] }
            ];
            const question = questions[Math.floor(Math.random() * questions.length)];
            message.reply(`🧠 **Trivia:** ${question.q}\nYou have 15 seconds to answer!`);
            
            const filter = m => m.author.id === message.author.id;
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
                const answer = collected.first().content.toLowerCase();
                if (question.a.includes(answer)) {
                    message.channel.send('🎉 Correct!');
                } else {
                    message.channel.send(`❌ Wrong! The answer was: **${question.a[0]}**`);
                }
            } catch {
                message.channel.send(`⏰ Time's up! The answer was: **${question.a[0]}**`);
            }
        }

        if (command === 'truthordare') {
            const truths = [
                'What is your biggest fear?',
                'What is your most embarrassing moment?',
                'Who was your first crush?',
                'What is something you have never told anyone?',
                'What is your biggest regret?'
            ];
            const dares = [
                'Send a message in all caps for the next 10 minutes',
                'Change your nickname to something silly for an hour',
                'React to every message in this channel with an emoji for the next 5 minutes',
                'Say something nice about the person above you',
                'Send a random meme'
            ];
            const choice = Math.random() < 0.5 ? 'truth' : 'dare';
            const list = choice === 'truth' ? truths : dares;
            const selected = list[Math.floor(Math.random() * list.length)];
            message.reply(`**${choice.toUpperCase()}:** ${selected}`);
        }

        if (command === 'neverhaveiever') {
            const statements = [
                'Never have I ever skipped school',
                'Never have I ever broken a phone',
                'Never have I ever stayed up all night',
                'Never have I ever lied to my parents',
                'Never have I ever forgotten someone\'s birthday',
                'Never have I ever sent a text to the wrong person',
                'Never have I ever pretended to be sick',
                'Never have I ever fallen asleep during a movie'
            ];
            const statement = statements[Math.floor(Math.random() * statements.length)];
            const msg = await message.reply(`🍻 **${statement}**\nReact with 👍 if you HAVE done this!`);
            await msg.react('👍');
        }

        if (command === 'thisorthat') {
            const questions = [
                ['Coffee', 'Tea'],
                ['Cats', 'Dogs'],
                ['Summer', 'Winter'],
                ['Pizza', 'Burger'],
                ['Movies', 'Books'],
                ['Beach', 'Mountains'],
                ['Day', 'Night'],
                ['Sweet', 'Salty']
            ];
            const [option1, option2] = questions[Math.floor(Math.random() * questions.length)];
            const msg = await message.reply(`🤔 **This or That:** ${option1} or ${option2}?`);
            await msg.react('1️⃣');
            await msg.react('2️⃣');
        }

        if (command === 'minesweeper') {
            const size = 5;
            const bombs = 5;
            const grid = Array(size).fill(null).map(() => Array(size).fill(0));
            
            for (let i = 0; i < bombs; i++) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * size);
                    y = Math.floor(Math.random() * size);
                } while (grid[x][y] === 'B');
                grid[x][y] = 'B';
            }
            
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (grid[i][j] !== 'B') {
                        let count = 0;
                        for (let di = -1; di <= 1; di++) {
                            for (let dj = -1; dj <= 1; dj++) {
                                const ni = i + di, nj = j + dj;
                                if (ni >= 0 && ni < size && nj >= 0 && nj < size && grid[ni][nj] === 'B') {
                                    count++;
                                }
                            }
                        }
                        grid[i][j] = count;
                    }
                }
            }
            
            const emoji = { 0: '||:zero:||', 1: '||:one:||', 2: '||:two:||', 3: '||:three:||', 4: '||:four:||', B: '||:boom:||' };
            const board = grid.map(row => row.map(cell => emoji[cell]).join(' ')).join('\n');
            message.reply(`💣 **Minesweeper**\n${board}`);
        }

        if (command === 'randommember') {
            const members = message.guild.members.cache.filter(m => !m.user.bot);
            const random = members.random();
            message.reply(`🎲 Random member: ${random}`);
        }

        if (command === 'randomnumber') {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            if (min >= max) return message.reply('❌ Min must be less than max!');
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            message.reply(`🎲 Random number between ${min} and ${max}: **${num}**`);
        }

        if (command === 'randomcolor') {
            const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            const embed = new EmbedBuilder()
                .setColor(`#${color}`)
                .setTitle('🎨 Random Color')
                .setDescription(`Hex: \`#${color}\`\nRGB: \`rgb(${parseInt(color.substr(0, 2), 16)}, ${parseInt(color.substr(2, 2), 16)}, ${parseInt(color.substr(4, 2), 16)})\``);
            message.reply({ embeds: [embed] });
        }

        if (command === 'colorinfo') {
            const hex = args[0]?.replace('#', '');
            if (!hex || !/^[0-9A-F]{6}$/i.test(hex)) {
                return message.reply('❌ Please provide a valid hex color (e.g., #FF5733 or FF5733)');
            }
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const embed = new EmbedBuilder()
                .setColor(`#${hex}`)
                .setTitle('🎨 Color Information')
                .addFields(
                    { name: 'Hex', value: `#${hex.toUpperCase()}`, inline: true },
                    { name: 'RGB', value: `${r}, ${g}, ${b}`, inline: true },
                    { name: 'Decimal', value: `${parseInt(hex, 16)}`, inline: true }
                );
            message.reply({ embeds: [embed] });
        }

        if (command === 'password') {
            const length = parseInt(args[0]) || 12;
            if (length < 4 || length > 32) return message.reply('❌ Password length must be between 4 and 32!');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            try {
                await message.author.send(`🔒 Your generated password: \`${password}\``);
                message.reply('✅ Password sent to your DMs!');
            } catch {
                message.reply('❌ I cannot DM you! Please enable DMs from server members.');
            }
        }

        if (command === 'morse') {
            const morseCode = {
                'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
                'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
                'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
                's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
                'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--',
                '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
                '9': '----.', '0': '-----', ' ': '/'
            };
            if (!args.length) return message.reply('❌ Please provide text to convert to Morse code!');
            const text = args.join(' ').toLowerCase();
            const morse = text.split('').map(char => morseCode[char] || char).join(' ');
            message.reply(`📡 **Morse Code:** \`${morse}\``);
        }

        if (command === 'timer') {
            const seconds = parseInt(args[0]);
            if (isNaN(seconds) || seconds <= 0 || seconds > 300) {
                return message.reply('❌ Please provide a time between 1 and 300 seconds!');
            }
            message.reply(`⏱️ Timer set for ${seconds} seconds!`);
            setTimeout(() => {
                message.reply(`⏰ ${message.author} Time's up! (${seconds}s timer)`);
            }, seconds * 1000);
        }

        if (command === 'remindme') {
            const time = parseInt(args[0]);
            if (isNaN(time) || time <= 0 || time > 1440) {
                return message.reply('❌ Please provide a time between 1 and 1440 minutes!');
            }
            const reminder = args.slice(1).join(' ');
            if (!reminder) return message.reply('❌ Please provide what to remind you about!');
            message.reply(`✅ I'll remind you in ${time} minutes about: ${reminder}`);
            setTimeout(() => {
                message.reply(`⏰ ${message.author} Reminder: ${reminder}`);
            }, time * 60 * 1000);
        }

        if (command === 'stats') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 Server Statistics')
                .addFields(
                    { name: 'Total Members', value: `${message.guild.memberCount}`, inline: true },
                    { name: 'Total Channels', value: `${message.guild.channels.cache.size}`, inline: true },
                    { name: 'Total Roles', value: `${message.guild.roles.cache.size}`, inline: true },
                    { name: 'Total Emojis', value: `${message.guild.emojis.cache.size}`, inline: true },
                    { name: 'Boost Level', value: `${message.guild.premiumTier}`, inline: true },
                    { name: 'Boost Count', value: `${message.guild.premiumSubscriptionCount || 0}`, inline: true },
                    { name: 'Server Created', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:R>`, inline: false }
                )
                .setFooter({ text: BOT_NAME })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }

        if (command === 'weather') {
            message.reply('☁️ Weather feature coming soon! (Requires API integration)');
        }

        if (command === 'wikipedia') {
            message.reply('📚 Wikipedia search coming soon! (Requires API integration)');
        }

        if (command === 'enlarge') {
            const emoji = args[0];
            if (!emoji) return message.reply('❌ Please provide an emoji!');
            const match = emoji.match(/<a?:\w+:(\d+)>/);
            if (!match) return message.reply('❌ Please provide a custom emoji!');
            const emojiId = match[1];
            const isAnimated = emoji.startsWith('<a:');
            const extension = isAnimated ? 'gif' : 'png';
            const url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔍 Enlarged Emoji')
                .setImage(url);
            message.reply({ embeds: [embed] });
        }

        if (command === 'reverse') {
            if (!args.length) return message.reply('❌ Please provide text to reverse!');
            const text = args.join(' ');
            message.reply(text.split('').reverse().join(''));
        }

        if (command === 'leaderboard') {
            const members = message.guild.members.cache
                .filter(m => !m.user.bot)
                .sort(() => Math.random() - 0.5)
                .first(10);
            const list = members.map((m, i) => `${i + 1}. ${m.user.tag} - ${Math.floor(Math.random() * 1000)} points`).join('\n');
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🏆 Server Leaderboard')
                .setDescription(list || 'No data')
                .setFooter({ text: 'Random leaderboard for demo' });
            message.reply({ embeds: [embed] });
        }

        if (command === 'spotify') {
            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);
            const spotify = member.presence?.activities.find(a => a.name === 'Spotify');
            if (!spotify) return message.reply('❌ This user is not listening to Spotify!');
            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle('🎵 Spotify')
                .setDescription(`**${spotify.details}**\nby ${spotify.state}`)
                .setThumbnail(spotify.assets.largeImageURL())
                .addFields({ name: 'Album', value: spotify.assets.largeText || 'Unknown' });
            message.reply({ embeds: [embed] });
        }

        if (command === 'invite') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Invite the Bot')
                .setDescription(`[Click here to invite ${BOT_NAME}](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)`)
                .setFooter({ text: BOT_NAME });
            message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('Command error:', error);
        message.reply('❌ An error occurred while executing this command.');
    }
});

const token = process.env.DISCORD_BOT_TOKEN?.trim();
if (!token) {
    console.error('ERROR: DISCORD_BOT_TOKEN is not set in environment variables!');
    process.exit(1);
}

client.login(token);
