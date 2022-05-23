import dotenv from 'dotenv';

interface IConfig {
  discord: {
    token: string;
    clientId: string;
    guildId: string;
  };
}

const loadConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    dotenv.config();
  }

  const config: IConfig = {
    discord: {
      token: process.env.DISCORD_TOKEN || '',
      clientId: process.env.DISCORD_CLIENT_ID || '',
      guildId: process.env.DISCORD_GUILD_ID || '',
    },
  };

  // Recursively check if any of the config values are missing
  const checkConfig = (config: object) => {
    for (const key in config) {
      if (typeof config[key as keyof typeof config] === 'object') {
        checkConfig(config[key as keyof typeof config]);
      } else if (config[key as keyof typeof config] === '') {
        throw new Error(`Missing config value: ${key}`);
      }
    }
  };
  checkConfig(config);

  return config;
};

export default loadConfig();
