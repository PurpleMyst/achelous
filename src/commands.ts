import { basename } from "path";

import type { Message } from "discord.js";

import { ObsController, SceneName } from "./obscontroller";

const DEFAULT_TIMESTEP = 10;

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

async function rewind(controller: ObsController, message: Message) {
  if ((await controller.getScene()) != SceneName.Episode) return;
  const timestep = Number(message.content.split(" ")[1] ?? DEFAULT_TIMESTEP);
  await message.channel.send(`Rewinding by ${timestep} seconds`);
  await controller.scrub(-timestep);
}

async function fastforward(controller: ObsController, message: Message) {
  if ((await controller.getScene()) != SceneName.Episode) return;
  const timestep = Number(message.content.split(" ")[1] ?? DEFAULT_TIMESTEP);
  await message.channel.send(`Fast-forwarding by ${timestep} seconds`);
  await controller.scrub(timestep);
}

export default { nextep, pause, unpause, rewind, fastforward } as Record<
  string,
  ((controller: ObsController, message: Message) => Promise<void>) | undefined
>;
