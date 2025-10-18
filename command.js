/*  Ban Bot Code Structure
  This bot instantly bans users who send messages in specified channels.
  also including the unban command and some structue explanations for the readers
*/ 
// Load environment variables from .env file
require('dotenv').config();
const id = process.env.ID;
const banId = new Set((process.env.BAN_ID || "").split(","));
const banRes = process.env.BAN_REASONS || "Server rules violation";
/*const running = require('./server'); */ //Commented out as no webserver is attached for now
// Import necessary classes from discord.js
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
// Create a new Discord client instance with specified intents (functionality)
const client = new Client({
  intents: [ 
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});
// Event listener for when the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});
// Event listener for when a message is detected
client.on("messageCreate", async (msg) => {
  //asynchronous to handle potential delays in API responses
  try{
    //Testing cases
    if(msg.author.bot) return;
    if(!msg.guild) return;
    if (msg.content.startsWith('!unban')) {
      const args = msg.content.split(' ');
      const userId = args[1];
      if (!userId) {
        msg.reply('Provide a user ID to unban.');
        return;
      }
      try {
        // unban the user 
        await msg.guild.members.unban(userId);
        msg.reply(`<@${userId}> successfully unbanned`);
      } catch (err) {
        msg.reply('Could not unban that user. Check permissions or user ID.');
      }
      return;
    }
    if(!banId.has(msg.channel.id)) return;
    const member = msg.member;
    if(!member) return;
    if(member.id === member.guild.ownerId){
      msg.channel.send("No ban for the server owner ");
      return;
    }
    if(member.id === id){
      msg.channel.send("Can't ban my creator");
      return; 
    }
    if(member.permissions.has(PermissionsBitField.Flags.Administrator ) || member.permissions.has(PermissionsBitField.Flags.BanMembers)){
    msg.channel.send("Moderator or Administrator detected, no ban");
    return;
    }
    //Banning Procedure
    console.log(`Banning ${member.user.tag} from ${msg.guild.name} for ${banRes}`);
    await msg.guild.members.ban(member.id, {reason: banRes});
    msg.channel.send(`Banned ${member.user.tag} Because ${banRes}`);
}catch(err){
  //Error Handling
  console.error("Could not ban user: ", err);
}
} );
//running(); //Commented out as no webserver is attached for now
// Log in to Discord to start the bot
client.login(process.env.TOKEN);
