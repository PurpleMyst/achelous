import * as dotenv from "dotenv";
import * as Discord from "discord.js";

import OBSController from "./obscontroller";
import commands from "./commands";
import { info } from "./output";

const COMMAND_PREFIX = "$";

async function main() {
  dotenv.config();

  const controller = new OBSController();
  await controller.connect({
    address: process.env.ACHELOUS_ADDRESS,
    password: process.env.ACHELOUS_PASSWORD,
  });

  const bot = new Discord.Client();
  await bot.login(process.env.ACHELOUS_DISCORD_TOKEN);

  bot.on("message", async function messageHandler(message) {
    if (message.author.bot) return;

    await message.channel.startTyping();
    const command = message.content.split(" ")[0];
    if (command?.startsWith(COMMAND_PREFIX)) {
      const handler = commands[command.substr(COMMAND_PREFIX.length)];
      info(`Got command ${command} (handler exists? ${!!handler})`);
      if (handler) await handler(controller, message);
    }
    message.channel.stopTyping();
  });

  bot.once("disconnect", () => controller.disconnect());
}

main();
