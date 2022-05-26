import { SlashCommandBuilder } from '@discordjs/builders';
import { APIMessage } from 'discord.js/node_modules/discord-api-types/v9';
import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { addCookie, getUserCookies } from '../../db';

export const EPHEMERAL_COOKIE_ID = 'ephemeral-cookie';
export const NON_EPHEMERAL_COOKIE_ID = 'non-ephemeral-cookie';

const isMessageType = (
  msg: APIMessage | Message<boolean> | void,
): msg is Message => {
  return (msg as Message).createMessageComponentCollector !== undefined;
};

const createButtonRow = (ephemeral: boolean) => {
  const button = new MessageButton()
    .setCustomId(ephemeral ? EPHEMERAL_COOKIE_ID : NON_EPHEMERAL_COOKIE_ID)
    .setLabel('Click :)')
    .setStyle('PRIMARY');
  return new MessageActionRow().addComponents(button);
};

const createCollector = (msg: Message, row: MessageActionRow) => {
  const button = row.components.at(0);
  if (!button) return;

  const collector = msg.createMessageComponentCollector({
    filter: (i) => i.customId === button.customId,
    componentType: 'BUTTON',
    time: 15 * 60 * 1000, // 15 minutes
  });

  collector.on('collect', async (i) => {
    try {
      const count = await addCookie(i.user.id);

      await i.update({
        content: count.toString(),
        components: [row],
      });
    } catch (e) {
      console.error(e);

      await i.reply({
        content: 'Failed to give cookie 😔 Try again later',
        ephemeral: true,
      });
    }
  });
};

export default {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName('setup-cookie')
    .setDescription('Creates a cookie button'),
  async execute(interaction: CommandInteraction) {
    try {
      // Send button visible to everyone
      const buttonRow = createButtonRow(false);
      await interaction.channel?.send({
        components: [buttonRow],
      });

      // Send button visible to invoker
      const ephemeralButtonRow = createButtonRow(true);
      const count = await getUserCookies(interaction.user.id);
      const msg = await interaction.reply({
        content: count.toString(),
        components: [ephemeralButtonRow],
        ephemeral: true,
        fetchReply: true,
      });

      if (!isMessageType(msg)) return;

      createCollector(msg, ephemeralButtonRow);
    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: 'Failed to send cookie button 😔 Try again later',
        ephemeral: true,
      });
    }
  },
};
