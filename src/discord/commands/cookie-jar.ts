import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { getEveryonesCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('cookie-jar')
    .setDescription('Everyones cookies'),
  async execute(interaction: CommandInteraction) {
    const rows = await getEveryonesCookies();

    if (rows.length === 0) {
      await interaction.reply('No one has any cookies yet!');
      return;
    }

    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Cookies')
      .setDescription('🍪 The cookie jar 🍪')
      .setTimestamp();

    rows.sort((a, b) => b.clicks - a.clicks);

    const topTen = rows.slice(0, 10);

    for (let i = 0; i < topTen.length; i++) {
      const user = await interaction.client.users.fetch(topTen[i].discordId);

      let emoji = '';
      switch (i) {
        case 0:
          emoji = '👑';
          break;
        case 1:
          emoji = '🥈';
          break;
        case 2:
          emoji = '🥉';
          break;

        default:
          break;
      }

      exampleEmbed.addField(
        `${emoji} ${user.username} ${emoji}`,
        topTen[i].clicks.toString(),
        true,
      );
    }

    await interaction.reply({ embeds: [exampleEmbed] });
  },
};
