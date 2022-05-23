import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getUserCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('cookies')
    .setDescription('Look at someone elses cookies')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to get cookies from')
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
      await interaction.reply({ content: 'User not found', ephemeral: true });
      return;
    }

    let cookies;
    try {
      cookies = await getUserCookies(user.id);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while getting the cookies',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      `${user.username} has ${cookies} cookie${cookies === 1 ? '' : 's'}`,
    );
  },
};
