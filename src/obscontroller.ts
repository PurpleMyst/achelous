import { promises as fs } from "fs";
import { basename } from "path";

import ObsWebSocket from "obs-websocket-js";

import { info, makeSpinner, success } from "./output";

enum SceneName {
  Blank = "Blank",
  Loading = "Loading",
  Episode = "Episode",
  Discussion = "Discussion",
}

const SOURCE_NAME = "EpisodeSource";

const PLAY = false;
const PAUSE = !PLAY;

const EPISODE_FILE = "episode.mkv";

export default class ObsController {
  private socket: ObsWebSocket;

  public constructor() {
    this.socket = new ObsWebSocket();
  }

  private async setScene(scene: SceneName) {
    await this.socket.send("SetCurrentScene", { "scene-name": scene });
  }

  public async connect(options: { address?: string; password?: string }) {
    info("Connecting ...");
    await this.socket.connect(options);
    await this.verifyScenes();

    info("Blanking out the screen");
    await this.setScene(SceneName.Blank);

    await this.registerDiscussionScene();
  }

  private async registerDiscussionScene() {
    info("Registering discussion scene changer");
    this.socket.on("MediaEnded" as any, async ({ sourceName }) => {
      if (sourceName !== SOURCE_NAME) return;
      if ((await this.socket.send("GetCurrentScene")).name != SceneName.Episode)
        return;
      info("Moving to discussion scene");
      await this.setScene(SceneName.Discussion);
    });
  }

  public async disconnect() {
    info("Disconnecting ...");
    this.socket.disconnect();
  }

  private async verifyScenes() {
    info("Verifying scenes");
    const { scenes } = await this.socket.send("GetSceneList");
    const sceneNames = scenes.map((scene) => scene.name);
    for (const sceneName of Object.keys(SceneName)) {
      const idx = sceneNames.findIndex((item) => item === sceneName);
      if (idx === -1) throw new Error(`Could not find scene "${sceneName}"`);
    }
  }

  public async startEpisode(episodePath: string) {
    // Blank out the screen so that we can switch the episode file outg
    info("Putting up a loading screen");
    await this.setScene(SceneName.Loading);

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
    await this.unpauseEpisode();

    success("Started episode!");
  }

  public async pauseEpisode() {
    info("Pausing episode");
    await this.setScene(SceneName.Episode);
    await this.socket.send("PlayPauseMedia" as any, {
      sourceName: SOURCE_NAME,
      playPause: PAUSE,
    });
  }

  public async unpauseEpisode() {
    info("Unpausing episode");
    await this.setScene(SceneName.Episode);
    await this.socket.send("PlayPauseMedia" as any, {
      sourceName: SOURCE_NAME,
      playPause: PLAY,
    });
  }
}
