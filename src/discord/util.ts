import { Interaction, TextBasedChannel } from 'discord.js';

const getChannelName = (channel: TextBasedChannel | null) => {
  let channelName = 'unknown';

  if (channel) {
    if ('name' in channel) {
      channelName = `#${channel.name}`;
    } else {
      channelName = channel.id;
    }
  }

  return channelName;
};

export const logInteraction = (interaction: Interaction) => {
  let logString = '';

  const channelName = getChannelName(interaction.channel);
  logString = `${interaction.user.tag} in channel ${channelName} triggered an interaction`;

  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    logString += ` - command: ${commandName}`;
  }

  console.log(logString);
};
