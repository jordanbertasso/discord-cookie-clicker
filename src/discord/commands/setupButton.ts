import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('setup-cookie')
    .setDescription('Creates a cookie button'),
  async execute(interaction: CommandInteraction) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('primary')
        .setLabel('Click :)')
        .setStyle('PRIMARY'),
    );

    try {
      await interaction.channel?.send({ components: [row] });
      await interaction.reply({ content: 'All done!', ephemeral: true });
    } catch (error) {
      console.error(error);
    }
  },
};
