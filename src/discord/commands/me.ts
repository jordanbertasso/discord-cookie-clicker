import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getUserCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder().setName('me').setDescription('Your cookies'),
  async execute(interaction: CommandInteraction) {
    const count = await getUserCookies(interaction.user.id);

    await interaction
      .reply(`You have ${count} cookie${count === 1 ? '' : 's'}.`)
      .catch(console.error);
  },
};
