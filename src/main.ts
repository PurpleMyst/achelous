import { promises as fs } from "fs";
import * as path from "path";

import OBSController from "./obscontroller";
import * as dotenv from "dotenv";
import * as Discord from "discord.js";

async function randomEpisode() {
  if (!process.env.SHERA_EPISODE_DIR) throw new Error("no ep dir");
  const dir = await fs.readdir(process.env.SHERA_EPISODE_DIR);
  const episode = path.join(
    process.env.SHERA_EPISODE_DIR,
    dir[Math.floor(Math.random() * dir.length)]
  );
  return episode;
}

async function main() {
  dotenv.config();

  const controller = new OBSController();
  await controller.connect({
    address: process.env.SHERA_ADDRESS,
    password: process.env.SHERA_PASSWORD,
  });

  const bot = new Discord.Client();
  await bot.login(process.env.SHERA_DISCORD_TOKEN);

  bot.on("message", async (message) => {
    if (message.author.bot) return;

    switch (message.content) {
      case "s!pause":
        message.channel.send("Pausing episode");
        await controller.pauseEpisode();
        break;

      case "s!unpause":
        message.channel.send("Unpausing episode");
        await controller.unpauseEpisode();
        break;

      case "s!randomep":
        const episode = await randomEpisode();
        message.channel.send(`Setting episode to ${path.basename(episode)}`);
        await controller.startEpisode(episode);
        break;

      case "s!quit":
        message.channel.send("Bye!");
        bot.destroy();
        break;
    }
  });

  bot.once("disconnect", () => controller.disconnect());
}

main();
