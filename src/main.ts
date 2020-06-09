import { basename } from "path";

import OBSController from "./obscontroller";
import * as dotenv from "dotenv";
import * as Discord from "discord.js";

async function main() {
  dotenv.config();

  const controller = new OBSController();
  await controller.connect({
    address: process.env.SHERA_ADDRESS,
    password: process.env.SHERA_PASSWORD,
  });

  const bot = new Discord.Client();
  await bot.login(process.env.SHERA_DISCORD_TOKEN);

  bot.on("message", async function messageHandler(message) {
    if (message.author.bot) return;

    message.channel.startTyping();
    switch (message.content) {
      case "s!pause":
        message.channel.send("Pausing episode");
        await controller.pauseEpisode();
        break;

      case "s!unpause":
        message.channel.send("Unpausing episode");
        await controller.unpauseEpisode();
        break;

      case "s!nextep":
        const ep = await controller.startNextEpisode();
        if (ep) {
          message.channel.send(`Playing "${basename(ep)}"`);
        } else {
          message.channel.send("That was the last one!");
        }
        break;
    }
    message.channel.stopTyping();
  });

  bot.once("disconnect", () => controller.disconnect());
}

main();
