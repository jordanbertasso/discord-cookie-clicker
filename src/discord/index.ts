import {
  Client,
  Collection,
  Intents,
  Permissions,
  CommandInteraction,
  ButtonInteraction,
} from 'discord.js';
import pingCommand from './commands/ping';
import setupButton from './commands/setupButton';
import { addCookie, getUserCookies } from '../db';
import { SlashCommandBuilder } from '@discordjs/builders';
import me from './commands/me';
import cookieJar from './commands/cookie-jar';
import { logInteraction } from './util';
import cookies from './commands/cookies';
import share from './commands/share';
import steal from './commands/steal';

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

type TPermissionSlashCommand = {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: CommandInteraction) => Promise<void>;
  requiresAdmin: boolean;
};

// Add commands
const commands = new Collection<string, TPermissionSlashCommand>();
commands.set(pingCommand.data.name, pingCommand);
commands.set(setupButton.data.name, setupButton);
commands.set(me.data.name, me);
commands.set(cookies.data.name, cookies);
commands.set(cookieJar.data.name, cookieJar);
commands.set(share.data.name, share);
commands.set(steal.data.name, steal);

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Handle command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  logInteraction(interaction);

  const command = commands.get(interaction.commandName);

  if (!command) return;

  if (command.requiresAdmin) {
    if (!interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
      interaction.reply('You are not authorized to use this command.');
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
});

// Handle button click interactions
// (This only handles buttons created before the recent changes for backwards compatability)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if ((interaction as ButtonInteraction).customId !== "primary") return;

  await addCookie(interaction.user.id);

  const count = await getUserCookies(interaction.user.id);

  await interaction
    .reply({ content: count.toString(), ephemeral: true })
    .catch(console.error);
});

export default client;
