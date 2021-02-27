const Command = require('../../Command')
const Discord = require('discord.js');
const util = require('../../util');

class ServerinfoCommand extends Command{
  
    static names = ['si', 'server'];

    static usage = '';

    static description = 'Show the servers info';

    async execute() {
        const guild = this.message.guild;
        
        let generic = '';
        generic += `**Owner:** <@!${guild.ownerID}> \n`;
        generic += `**Owner ID:** ${guild.ownerID} \n`;
        generic += `**Created:** ${guild.createdAt.toDateString()} \n`;
        generic += `**Region:** ${guild.region.toUpperCase()} \n`;
        generic += `**Guild ID:** ${guild.id} \n`;
        
        let statistics = '';
        statistics += `**Members:** ${guild.memberCount} \n`;
        statistics += `**Max members:** ${guild.maximumMembers} \n`;
        statistics += `**Verified:** ${guild.verified ? 'yes' : 'no'} \n`;
        statistics += `**Partnered:** ${guild.partnered ? 'yes' : 'no'} \n`;
        
        const embed = new Discord.MessageEmbed()
            .setTitle(`Info of ${guild.name}`)
            .setThumbnail(guild.iconURL({dynamic: true, size: 2048}))
            .setFooter(`Command executed by ${this.message.author.username}`)
            .setTimestamp()
            .addFields(
              {name: '__**Generic**__', value: generic, inline: true},
              {name: '__**Statistics**__', value: statistics, inline: true }
            );
              
        await this.message.channel.send(embed);
    }
}
        
module.exports = ServerinfoCommand;