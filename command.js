require('dotenv').config();
const id = process.env.ID;
const banId = new Set((process.env.BAN_ID || "").split(","));
const banRes = process.env.BAN_REASONS || "Server rules violation";
const running = require('./server');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});
client.on("messageCreate", async (msg) => {
  try{
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
    console.log(`Banning ${member.user.tag} from ${msg.guild.name} for ${banRes}`);
    await msg.guild.members.ban(member.id, {reason: banRes});
    msg.channel.send(`Banned ${member.user.tag} Because ${banRes}`);
}catch(err){
  console.error("Could not ban user: ", err);
}
} );
running();
client.login(process.env.TOKEN);
