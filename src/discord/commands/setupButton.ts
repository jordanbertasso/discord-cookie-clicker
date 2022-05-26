import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { addCookie, getUserCookies } from '../../db';

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('setup-cookie')
    .setDescription('Creates a cookie button'),
  async execute(interaction: CommandInteraction) {
    const button = new MessageButton()
      .setCustomId('cookie')
      .setLabel('Click :)')
      .setStyle('PRIMARY');
    const row = new MessageActionRow().addComponents(button);

    let count = await getUserCookies(interaction.user.id);
    const msg = await interaction.reply({
      content: `${count}`,
      components: [row],
      ephemeral: true,
      fetchReply: true
    }) as Message;

    const collector = msg.createMessageComponentCollector({
      filter: i => i.customId === button.customId && i.user.id === interaction.user.id,
      componentType: "BUTTON",
      time: 15 * 60 * 1000 // 15 minutes
    });

    collector.on("collect", async i => {
      try {
        await addCookie(interaction.user.id);
        count = await getUserCookies(interaction.user.id);

        await i.update({
          content: `${count}`,
          components: [row]
        });
      } catch(e) {
        await i.reply({
          content: "Failed to give cookie :( Try again later",
          ephemeral: true
        });
      }
    });

  },
};
