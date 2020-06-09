import { basename } from "path";

import type { Message } from "discord.js";

import type OBSController from "./obscontroller";

async function nextep(controller: OBSController, message: Message) {
  const ep = await controller.startNextEpisode();
  if (ep) {
    await message.channel.send(`Playing "${basename(ep, "mkv")}"`);
  } else {
    await message.channel.send("That was the last one!");
  }
}

async function pause(controller: OBSController, message: Message) {
  await message.channel.send("Pausing episode");
  await controller.pauseEpisode();
}

async function unpause(controller: OBSController, message: Message) {
  await message.channel.send("Unpausing episode");
  await controller.unpauseEpisode();
}

export default { nextep, pause, unpause } as Record<
  string,
  ((controller: OBSController, message: Message) => Promise<void>) | undefined
>;
