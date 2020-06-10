import { basename } from "path";

import type { Message } from "discord.js";

import { ObsController, SceneName } from "./obscontroller";

async function nextep(controller: ObsController, message: Message) {
  const ep = await controller.startNextEpisode();
  if (ep) {
    await message.channel.send(`Playing "${basename(ep, "mkv")}"`);
  } else {
    await message.channel.send("That was the last one!");
  }
}

async function pause(controller: ObsController, message: Message) {
  if ((await controller.getScene()) != SceneName.Episode) return;
  await message.channel.send("Pausing episode");
  await controller.pauseEpisode();
}

async function unpause(controller: ObsController, message: Message) {
  if ((await controller.getScene()) != SceneName.Episode) return;
  await message.channel.send("Unpausing episode");
  await controller.unpauseEpisode();
}

export default { nextep, pause, unpause } as Record<
  string,
  ((controller: ObsController, message: Message) => Promise<void>) | undefined
>;
