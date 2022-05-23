import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getUserCookies, setUsersCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('steal')
    .setDescription('Steal cookies 😈. Be careful, you may get caught!')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The amount of cookies to steal. Maximum 10 at time.')
        .setMaxValue(10)
        .setMinValue(1)
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to steal from')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName('mention').setDescription('Mention the user'),
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
      await interaction.reply({ content: 'User not found', ephemeral: true });
      return;
    }

    if (user.id === interaction.user.id) {
      await interaction.reply({
        content: "You can't steal from yourself 😉",
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger('amount');
    if (!amount) {
      await interaction.reply({
        content: 'No amount specified',
        ephemeral: true,
      });
      return;
    }

    if (amount > 10 || amount < 0) {
      await interaction.reply({
        content: 'Terrible!',
        ephemeral: true,
      });
      return;
    }

    let thiefCookies;
    try {
      thiefCookies = await getUserCookies(interaction.user.id);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while getting the cookies',
        ephemeral: true,
      });
      return;
    }

    if (thiefCookies < 21) {
      return await interaction.reply({
        content: "You don't have enough cookies to steal from someone",
        ephemeral: true,
      });
    }

    let victimCookies;
    try {
      victimCookies = await getUserCookies(user.id);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while getting the cookies',
        ephemeral: true,
      });
      return;
    }

    if (victimCookies < amount) {
      await interaction.reply({
        content: 'They do not have enough cookies!',
        ephemeral: true,
      });
      return;
    }

    if (victimCookies - amount < 1) {
      await interaction.reply({
        content: 'You should really leave them one. Shame on you!',
        ephemeral: true,
      });
      return;
    }

    // Calculate a random chance of getting caught
    let success;
    const chance = Math.random();
    if (chance <= 0.5) {
      success = true;
    } else {
      success = false;
    }

    const mention = interaction.options.getBoolean('mention');
    const recipientString = mention ? `<@${user.id}>` : user.username;

    if (success) {
      // Steal the cookies
      await setUsersCookies(user.id, victimCookies - amount);
      await setUsersCookies(interaction.user.id, thiefCookies + amount);

      await interaction.reply(
        `<@${interaction.user.id}> stole ${amount} cookie${
          amount === 1 ? '' : 's'
        } from ${recipientString}!`,
      );
    } else {
      const amountLost = 20;

      await setUsersCookies(interaction.user.id, thiefCookies - amountLost);
      await setUsersCookies(user.id, victimCookies + amountLost);

      await interaction.reply(
        `<@${interaction.user.id}> was caught stealing from ${recipientString}! They lost ${amountLost} cookies!`,
      );
    }
  },
};
