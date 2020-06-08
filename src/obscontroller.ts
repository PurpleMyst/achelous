import { promises as fs } from "fs";
import { basename } from "path";

import ObsWebSocket from "obs-websocket-js";

import { info, makeSpinner, success } from "./output";

const NOTHING = "Nothing";
const EPISODE = "Episode";

const SOURCE_NAME = "EpisodeSource";

const PLAY = false;

const EPISODE_FILE = "episode.mkv";

export default class ObsController {
  private socket: ObsWebSocket;

  public constructor() {
    this.socket = new ObsWebSocket();
  }

  public async connect(options: { address?: string; password?: string }) {
    info("Connecting ...");
    await this.socket.connect(options);
    await this.verifyScenes();
  }

  public async disconnect() {
    info("Disconnecting ...");
    this.socket.disconnect();
  }

  private async verifyScenes() {
    info("Verifying scenes");
    const { scenes } = await this.socket.send("GetSceneList");
    const sceneNames = scenes.map((scene) => scene.name);
    sceneNames.sort();
    if (sceneNames[0] !== EPISODE || sceneNames[1] !== NOTHING) {
      throw new Error(
        `Invalid scene names, expected ${EPISODE} and ${NOTHING}`
      );
    }
    info("Blanking out the screen");
    await this.socket.send("SetCurrentScene", { "scene-name": NOTHING });
  }

  public async startEpisode(episodePath: string) {
    // Blank out the screen so that we can switch the episode file outg
    info("Clearing the screen");
    await this.socket.send("SetCurrentScene", { "scene-name": NOTHING });

    // Copy the file to the location, ignoring any errors that occur within unlink
    // Because the only error that could probably happen is the file doesn't exist
    const stopSpinner = makeSpinner(
      `Copying episode file "${basename(episodePath)}" to ${EPISODE_FILE}`
    );
    // Lord forgive me for what I'm about to do ...
    try {
      try {
      await fs.unlink(EPISODE_FILE);
    } catch (e) {}
    await fs.copyFile(episodePath, EPISODE_FILE);
    } finally {
    stopSpinner();
    }
    success("Copied episode file");

    // Lights on!
    info("Switching to episode scene and starting media");
    await this.socket.send("SetCurrentScene", { "scene-name": EPISODE });
    await this.socket.send("PlayPauseMedia" as any, {
      sourceName: SOURCE_NAME,
      playPause: PLAY,
    });

    success("Started episode!");
  }
}
