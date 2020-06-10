# achelous

A discord bot that handles streaming marathons for you

## Setup

Installation has a few pre-requisites:

- **[node.js](https://nodejs.org/en/download/)** (tested version: 12.16.3)
- **[OBS](https://obsproject.com/)** (tested version: 25.0.8)
- **obs-websocket**, which at the time of writing _does not_ include media control capabilities in its latest release
  so you'll have to **download a custom fork** at [this azure devops page](https://dev.azure.com/Palakis/obs-websocket/_build/results?buildId=1282&view=artifacts&type=publishedArtifacts)

Now, you must **download the source code to the bot** from the GitHub page, by clicking on the `Clone or Download` button near the top of the page and then pressing `Download ZIP` and extracting the downloaded file into a folder of your choosing.

Once you've done that, you must somehow **open a terminal inside the source code folder**.
If you're on **Windows**, this can be done by opening the folder in the file manager, pressing right click while holding the shift key
and then pressing `Open PowerShell window here`. If you're on **OSX**, may the gods help you. If you're on **Linux**, you probably already know how to do this.

Now, you must run the command `npm install` to install the projects dependencies, then run the command `npm run build` to **compile the project**.

It's probably the time to **[set up a discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)** if you haven't done so already and **[add it to a server of your choice](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)**

Now it's time to **set up the bot's parameters**.
This is done by **creating a file named `.env` in the bot directory** and filling it in the following way, where text between `<>` represents placeholders.

```dotenv
ACHELOUS_PASSWORD=<password for the obs websocket server, which you should set, but if you haven't just exclude this line>
ACHELOUS_EPISODE_DIR=<which directory all the episodes are stored in>
ACHELOUS_DISCORD_TOKEN=<the discord bot token you have>
```

Now you'll need to **set up the correct OBS scenes**. Since `obs-websocket` has no ability to do this on its own, you must do these yourself.
Here are the scenes you'll need to set up, and keep in mind the names are important and case sensitive.
Also, apart from specific sources explicitly mentioned, which must be present and placed correctly, you can fill each scene with whatever you want.

- `Blank`, the scene which will be shown once the bot starts.
- `Loading`, the scene which will be shown while the episode is loading.
- `Episode`, the scene that will show the viewers the episode.
  It must contain a `MediaSource` named `EpisodeSource` whose source file must be named `episode.mkv` and placed in the directory of the bot.
- `Discussion`, the scene that will be switched to once the episode is over.

## Usage

You're now all set to run the bot! Just **run `npm start` in the terminal to start it and keep the terminal open**. You'll see a lot of pretty colored output, I think.  
You probably want to know what the bot's commands are, huh? Well I'm not telling you.  
Just kidding, here they are. Keep in mind that the names must be prefixed with a `$`

### nextep

Play the next episode, as the name says.

Episode order is decided by lexicographical ordering (AKA alphabetical order), and if no episode has been played yet it plays the first one.

### pause

Pause the currently running episode.

### unpause

Unpause the currently running episode.

### rewind <N>

Rewind the currently running episode by N seconds.
If no time is given, a default value will be chosen, which at the time of writing is 10 seconds.

### fastforward <N>

Fast-forward the currently running episode by N seconds.
If no time is given, a default value will be chosen, which at the time of writing is 10 seconds.
