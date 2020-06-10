import { promises as fs } from "fs";
import { basename, join as joinPath } from "path";

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
  private lastPlayedEpisode: string | null = null;

  public constructor() {
    this.socket = new ObsWebSocket();
  }

  private async setScene(scene: SceneName) {
    await this.socket.send("SetCurrentScene", { "scene-name": scene });
  }

  public async connect(options: {
    address?: string;
    password?: string;
  }): Promise<void> {
    info("Connecting ...");
    await this.socket.connect(options);
    await this.verifyScenes();

    info("Blanking out the screen");
    await this.setScene(SceneName.Blank);

    await this.registerDiscussionScene();
  }

  private async registerDiscussionScene() {
    info("Registering discussion scene changer");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket.on("MediaEnded" as any, async ({ sourceName }) => {
      if (sourceName !== SOURCE_NAME) return;
      if ((await this.socket.send("GetCurrentScene")).name != SceneName.Episode)
        return;
      info("Moving to discussion scene");
      await this.setScene(SceneName.Discussion);
    });
  }

  public async disconnect(): Promise<void> {
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

  public async startEpisode(episodePath: string): Promise<void> {
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
      } catch (e) {
        /* nom */
      }
      await fs.copyFile(episodePath, EPISODE_FILE);
    } finally {
      stopSpinner();
    }
    success("Copied episode file");

    // Lights on!
    await this.unpauseEpisode();

    success("Started episode!");
  }

  public async startNextEpisode(): Promise<string | null> {
    if (!process.env.SHERA_EPISODE_DIR)
      throw new Error("Missing SHERA_EPISODE_DIR environment variable");
    info("Playing next episode");

    const eps = await fs.readdir(process.env.SHERA_EPISODE_DIR);
    if (eps.length === 0) throw new Error("SHERA_EPISODE_DIR is empty");
    eps.sort();

    let ep;
    if (this.lastPlayedEpisode) {
      const lastIdx = eps.findIndex((item) => item === this.lastPlayedEpisode);
      if (lastIdx === -1)
        throw new Error("Last played episode is not in directory");
      if (lastIdx === eps.length - 1) return null; /* no more eps */
      ep = eps[lastIdx + 1];
    } else {
      ep = eps[0];
    }
    this.lastPlayedEpisode = ep;
    ep = joinPath(process.env.SHERA_EPISODE_DIR, ep);

    await this.startEpisode(ep);

    return ep;
  }

  public async pauseEpisode(): Promise<void> {
    info("Pausing episode");
    await this.setScene(SceneName.Episode);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.socket.send("PlayPauseMedia" as any, {
      sourceName: SOURCE_NAME,
      playPause: PAUSE,
    });
  }

  public async unpauseEpisode(): Promise<void> {
    info("Unpausing episode");
    await this.setScene(SceneName.Episode);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.socket.send("PlayPauseMedia" as any, {
      sourceName: SOURCE_NAME,
      playPause: PLAY,
    });
  }
}
