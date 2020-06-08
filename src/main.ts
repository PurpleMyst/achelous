import { promises as fs } from "fs";
import * as path from "path";

import OBSController from "./obscontroller";
import * as dotenv from "dotenv";

import { error } from "./output";

async function main() {
  dotenv.config();

  const controller = new OBSController();

  try {
    if (!process.env.SHERA_EPISODE_DIR) throw new Error("no ep dir");
    const dir = await fs.readdir(process.env.SHERA_EPISODE_DIR);
    const episode = path.join(
      process.env.SHERA_EPISODE_DIR,
      dir[Math.floor(Math.random() * dir.length)]
    );

    await controller.connect({
      address: process.env.SHERA_ADDRESS,
      password: process.env.SHERA_PASSWORD,
    });

    await controller.startEpisode(episode);
  } catch (e) {
    error(e);
  } finally {
    controller.disconnect();
  }
}

main();
