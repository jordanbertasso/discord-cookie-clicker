import config from './config';
import connectToDB from './db';
import client from './discord';

// Login to Discord with your client's token
console.log('Connecting to Discord');
client.login(config.discord.token);

console.log('Connecting to database');
connectToDB();

export default client;
