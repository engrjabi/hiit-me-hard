import React, { useState } from "react";
import _get from "lodash/get";
import _padStart from "lodash/padStart";
import { useTimer } from "react-timer-hook";
import "./App.css";
import { YoutubePlayer } from "./youtube/youtubePlayer";
import { dateWithSecOffset, timeToSeconds } from "./utils/date";
import { parseParams } from "./utils/urls";
import { beepRest, beepStart } from "./utils/beep";
import { makeNewSpotifyPlayer, spotifyApi } from "./spotify/spotify";
import { importParser } from "./utils/dataImportExport";
import LinearProgress from "@material-ui/core/LinearProgress";

const linearBarColorBasedOnMode = {
  "warm-up": "bar-color-warm-up",
  "rest-low": "bar-color-rest",
  "rest-high": "bar-color-rest",
  high: "bar-color-high",
  low: "bar-color-low",
  "cool-down": "bar-color-cool-down"
};

function App() {
  const hashCollection = parseParams(window.location.hash);
  const [deviceId, setDeviceId] = React.useState(null);
  const [timerExpired, setTimerExpired] = React.useState(false);
  const [setNumber, setSetNumber] = React.useState(-1); // -1 so it will be zero on start. Starts at 0 but displayed plus 1
  const [mainPlayer, setMainPlayer] = React.useState(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentMode, setNextMode] = React.useState("warm-up"); // "warm-up", "rest-low", "rest-high", "high", "low", "cool-down"
  const {
    timerWarmUpSec,
    timerCoolDownSec,
    spotifyURILow,
    exercises,
    timeSeekPosMs,
    timerRestSec,
    spotifyURIHigh,
    timerLowSec,
    timerHighSec,
    youtubeURL,
    coolDownExercise,
    warmUpExercise
  } = importParser();
  const youtubePlayer = React.useRef(null);

  const [currentExpirationTimeSec, setCurrentExpirationTimeSec] = useState(timerWarmUpSec);

  const { seconds, minutes, pause, resume, restart } = useTimer({
    expiryTimestamp: dateWithSecOffset(timerWarmUpSec),
    onExpire: () => setTimerExpired(true)
  });

  React.useEffect(() => {
    if (timerExpired) {
      if (currentMode === "low" && exercises.length === setNumber + 1) {
        beepRest();
        setNextMode("cool-down");
        setCurrentExpirationTimeSec(timerCoolDownSec);
        restart(dateWithSecOffset(timerCoolDownSec));
        youtubePlayer.current.seekTo(coolDownExercise.timeStart);
        return;
      }

      if (currentMode === "high") {
        beepRest();
        setNextMode("rest-low");
        mainPlayer.setVolume(0.3);
        youtubePlayer.current.seekTo(exercises[setNumber].lowTime);

        (async () => {
          await spotifyApi.play({
            device_id: deviceId,
            context_uri: spotifyURILow
          });
          await spotifyApi.seek(timeSeekPosMs(), {
            device_id: deviceId
          });
        })();

        setCurrentExpirationTimeSec(timerRestSec);
        restart(dateWithSecOffset(timerRestSec));
      }

      if (currentMode === "low" || currentMode === "warm-up") {
        beepRest();
        setSetNumber(prev => prev + 1);
        setNextMode("rest-high");
        mainPlayer.setVolume(0.3);
        youtubePlayer.current.seekTo(exercises[setNumber + 1].highTime);

        (async () => {
          spotifyApi.play({
            device_id: deviceId,
            context_uri: spotifyURIHigh
          });
          await spotifyApi.seek(timeSeekPosMs(), {
            device_id: deviceId
          });
        })();

        setCurrentExpirationTimeSec(timerRestSec);
        restart(dateWithSecOffset(timerRestSec));
      }

      if (currentMode === "rest-low") {
        beepStart();
        setNextMode("low");
        mainPlayer.setVolume(1);
        youtubePlayer.current.seekTo(exercises[setNumber].lowTime);
        setCurrentExpirationTimeSec(timerLowSec);
        restart(dateWithSecOffset(timerLowSec));
      }

      if (currentMode === "rest-high") {
        beepStart();
        setNextMode("high");
        mainPlayer.setVolume(1);
        youtubePlayer.current.seekTo(exercises[setNumber].highTime);
        setCurrentExpirationTimeSec(timerHighSec);
        restart(dateWithSecOffset(timerHighSec));
      }

      // Reset flag
      setTimerExpired(false);
    }
  }, [timerExpired]);

  /***
   * Save access tokens on localstorage for reuse
   * @todo
   * - renew on expire
   * - don't refresh after setting but instead just call the player initialize and remove access token on url
   */
  React.useEffect(() => {
    if (_get(hashCollection, "access_token")) {
      localStorage.setItem(
        "accessKeys",
        JSON.stringify({
          ...hashCollection,
          expirationTimeStamp: parseFloat(hashCollection.expires_in) + Date.now()
        })
      );
      window.location = "/";
    }
  }, [hashCollection]);

  /**
   * initially set the spotify player if access token is present
   */
  React.useEffect(() => {
    (async () => {
      const accessKeys = localStorage.getItem("accessKeys");
      const accessKeysParsed = accessKeys ? JSON.parse(accessKeys) : {};

      if (accessKeysParsed) {
        pause();
        const { device_id, player } = await makeNewSpotifyPlayer(accessKeysParsed.access_token);
        await spotifyApi.setAccessToken(accessKeysParsed.access_token);

        await spotifyApi.play({
          device_id: device_id,
          context_uri: spotifyURILow
        });

        // Wait some time before setting shuffle so it can detect active device
        await new Promise(resolve => setTimeout(resolve, 1000));
        await spotifyApi.setShuffle({
          state: true
        });

        // Skip so it will not always play the first song
        // await spotifyApi.skipToNext();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await spotifyApi.pause({
          device_id: device_id
        });
        setIsPaused(true);

        // Set device id on main state so other functions can use
        setMainPlayer(player);
        setDeviceId(device_id);
        youtubePlayer.current.seekTo(warmUpExercise.timeStart);
      }
    })();
  }, []);

  const exerNameDisplay = React.useMemo(() => {
    if (currentMode.includes("low")) {
      return exercises[setNumber].low;
    }

    if (currentMode.includes("high")) {
      return exercises[setNumber].high;
    }

    return "";
  }, [setNumber, currentMode]);

  const normalizedPercentage = (timeToSeconds(minutes, seconds) / currentExpirationTimeSec) * 100;

  return (
    <div className="App">
      <LinearProgress
        variant="determinate"
        value={normalizedPercentage}
        style={{
          height: "1rem",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 5
        }}
        classes={{
          barColorPrimary: linearBarColorBasedOnMode[currentMode]
        }}
      />

      <YoutubePlayer youtubePlayerRef={youtubePlayer} isPaused={isPaused} url={youtubeURL} />

      <header className="App-header">
        {setNumber > -1 && (
          <h2>
            SET {setNumber + 1} OF {exercises.length}
          </h2>
        )}
        <h2>{exerNameDisplay}</h2>
        <h3>{currentMode.toUpperCase()}</h3>
        <p>
          {_padStart(minutes, 2, "0")} : {_padStart(seconds, 2, "0")}
        </p>

        <div
          style={{
            margin: "1rem 0"
          }}
        >
          {_get(window.mainPlayer, "track_window.current_track.name")}
          <div
            style={{
              fontSize: "1rem"
            }}
          >
            - {_get(window.mainPlayer, "track_window.current_track.artists.0.name")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: 80,
            justifyContent: "space-around"
          }}
        >
          <button
            onClick={() => {
              /**
               * Give user access to generate new token
               */
              const url = new URL("https://accounts.spotify.com/authorize");
              const params = {
                response_type: "token",
                client_id: "2b410735b67846eda6ef8187775de8ef",
                redirect_uri: "http://localhost:3000/",
                scope: "streaming user-read-email user-modify-playback-state user-read-private",
                show_dialog: false
              };

              Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
              window.location = url;
            }}
          >
            Get new auth code
          </button>

          <button
            onClick={() => {
              if (isPaused) {
                mainPlayer.resume();
                resume();
                setIsPaused(false);
              }

              if (!isPaused) {
                mainPlayer.pause();
                pause();
                setIsPaused(true);
              }
            }}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
