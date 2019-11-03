import { timeToSeconds } from "./date";
import _random from "lodash/random";

const sampleShareableConfig = {
  spotifyURILow: "spotify:playlist:5MiUNFzBc7Y1Ccq7iEtex5",
  spotifyURIHigh: "spotify:playlist:5MiUNFzBc7Y1Ccq7iEtex5",
  youtubeURL: "https://www.youtube.com/watch?v=VvfVMkWngRM",
  timerWarmUpSec: 20,
  timerLowSec: 30,
  timerHighSec: 30,
  timerRestSec: 15,
  timerCoolDownSec: 60,
  timeSeekPosSecMin: 30,
  timeSeekPosSecMax: 90,
  exercises: [
    {
      high: "punch with knee up",
      highTime: [3, 3],
      low: "arm down and up",
      lowTime: [6, 20]
    },
    {
      high: "punches straight",
      highTime: [7, 44],
      low: "side knee up",
      lowTime: [8, 50]
    },
    {
      high: "arms forward foot side",
      highTime: [10, 50],
      low: "arm up and pull up",
      lowTime: [12, 10]
    }
  ]
};

export const importParser = (importContents = sampleShareableConfig) => {
  const bufferSec = 2;
  return {
    spotifyURILow: importContents.spotifyURILow,
    spotifyURIHigh: importContents.spotifyURIHigh,
    youtubeURL: importContents.youtubeURL,
    timerWarmUpSec: importContents.timerWarmUpSec + bufferSec,
    timerLowSec: importContents.timerLowSec + bufferSec,
    timerHighSec: importContents.timerHighSec + bufferSec,
    timerRestSec: importContents.timerRestSec + bufferSec,
    timerCoolDownSec: importContents.timerCoolDownSec + bufferSec,
    timeSeekPosMs: () => _random(importContents.timeSeekPosSecMin * 1000, importContents.timeSeekPosSecMax * 1000, false),
    exercises: importContents.exercises.map(exercise => {
      return {
        ...exercise,
        highTime: timeToSeconds(exercise.highTime[0], exercise.highTime[1]),
        lowTime: timeToSeconds(exercise.lowTime[0], exercise.lowTime[1])
      };
    })
  };
};
