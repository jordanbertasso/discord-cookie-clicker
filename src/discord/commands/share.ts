import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getUserCookies, setUsersCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('share')
    .setDescription('Share your cookies')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The amount of cookies to share')
        .setMinValue(1)
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to share with')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName('mention').setDescription('Mention the user'),
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
      return await interaction.reply({
        content: 'User not found',
        ephemeral: true,
      });
    }

    if (user.id === interaction.user.id) {
      return await interaction.reply({
        content: "You can't share with yourself 🙄",
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger('amount');
    if (!amount) {
      return await interaction.reply({
        content: 'No amount specified',
        ephemeral: true,
      });
    }

    if (amount < 1) {
      return await interaction.reply({
        content: 'Terrible!',
        ephemeral: true,
      });
    }

    let giverCookies;
    try {
      giverCookies = await getUserCookies(interaction.user.id);
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: 'There was an error while getting the cookies',
        ephemeral: true,
      });
    }

    if (giverCookies < amount) {
      return await interaction.reply({
        content: 'You do not have enough cookies!',
        ephemeral: true,
      });
    }

    if (giverCookies - amount < 1) {
      return await interaction.reply({
        content: 'Keep one! You might be hungry later.',
        ephemeral: true,
      });
    }

    // Remove the cookies from the current author
    await setUsersCookies(interaction.user.id, giverCookies - amount);

    let recipientCookies;
    try {
      recipientCookies = await getUserCookies(user.id);
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: 'There was an error while getting the cookies',
        ephemeral: true,
      });
    }

    // Add the cookies to the recipient
    await setUsersCookies(user.id, recipientCookies + amount);

    const mention = interaction.options.getBoolean('mention');
    const recipientString = mention ? `<@${user.id}>` : user.username;

    await interaction.reply(
      `<@${interaction.user.id}> gave ${recipientString} ${amount} cookie${
        amount > 1 ? 's' : ''
      }! How nice.`,
    );
  },
};
