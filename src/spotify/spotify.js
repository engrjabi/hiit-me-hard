import SpotifyWebApi from "spotify-web-api-node";

export const spotifyApi = new SpotifyWebApi();

export const makeNewSpotifyPlayer = (token, globalStateName = "mainPlayer") => {
  return new Promise(resolve => {
    const player = new window.SpotifyPlayerInstanceMaker({
      name: "Web Playback SDK Quick Start Player",
      getOAuthToken: cb => {
        cb(token);
      }
    });

    // Error handling
    player.addListener("initialization_error", ({ message }) => {
      console.error(message);
    });
    player.addListener("authentication_error", ({ message }) => {
      console.error(message);
    });
    player.addListener("account_error", ({ message }) => {
      console.error(message);
    });
    player.addListener("playback_error", ({ message }) => {
      console.error(message);
    });

    // Playback status updates
    player.addListener("player_state_changed", state => {
      console.log(state);
      window[globalStateName] = state;
    });

    // Ready
    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      resolve({
        player,
        device_id
      });
    });

    // Not Ready
    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    // Connect to the player!
    player.connect();
  });
};
