import OBSController from "./obscontroller";
import * as dotenv from "dotenv";

import { error } from "./output";

async function main() {
  dotenv.config();

  const controller = new OBSController();
  try {
    await controller.connect({
      address: process.env.SHERA_ADDRESS,
      password: process.env.SHERA_PASSWORD,
    });

    if (process.env.SHERA_EPISODE) {
      await controller.startEpisode(process.env.SHERA_EPISODE);
    }
  } catch (e) {
    error(e);
  } finally {
    controller.disconnect();
  }
}

main();
