import { timeToSeconds } from "./date";
import _random from "lodash/random";

const sampleShareableConfig = {
  spotifyURILow: "spotify:playlist:5MiUNFzBc7Y1Ccq7iEtex5",
  spotifyURIHigh: "spotify:playlist:16zWE2aZ4Y6zUOxEncGcdQ",
  youtubeURL: "https://www.youtube.com/watch?v=VvfVMkWngRM",
  timerWarmUpSec: 20,
  timerLowSec: 30,
  timerHighSec: 30,
  timerRestSec: 15,
  timerCoolDownSec: 60,
  timeSeekPosSecMin: 30,
  timeSeekPosSecMax: 90,
  intervalMultiplier: 1,
  coolDownExercise: {
    title: "easy cool down",
    timeStart: [31, 0],
    timeEnd: [33, 26]
  },
  warmUpExercise: {
    title: "easy warm up",
    timeStart: [0, 22],
    timeEnd: [2, 29]
  },
  exercises: [
    {
      high: "punch with knee up (right)",
      highTime: [3, 3],
      low: "arm down and up",
      lowTime: [6, 20]
    },
    {
      high: "punch with knee up (left)",
      highTime: [3, 3],
      low: "arm down and up",
      lowTime: [6, 20]
    },
    {
      high: "punches straight",
      highTime: [7, 44],
      low: "side knee up (right)",
      lowTime: [8, 50]
    },
    {
      high: "punches straight",
      highTime: [7, 44],
      low: "side knee up (left)",
      lowTime: [8, 50]
    },
    {
      high: "punches with weights",
      highTime: [15, 32],
      low: "side pull ups with weights",
      lowTime: [16, 20]
    },
    {
      high: "arms forward foot side (left)",
      highTime: [10, 50],
      low: "arm up and pull up",
      lowTime: [12, 10]
    },
    {
      high: "arms forward foot side (right)",
      highTime: [10, 50],
      low: "arm up and pull up",
      lowTime: [12, 10]
    },
    {
      high: "punches with weights",
      highTime: [15, 32],
      low: "side pull ups with weights",
      lowTime: [16, 20]
    }
  ]
};

export const importParser = (importContents = sampleShareableConfig) => {
  const bufferSec = 2;
  const warmUpExerciseStartSec = timeToSeconds(
    importContents.warmUpExercise.timeStart[0],
    importContents.warmUpExercise.timeStart[1]
  );
  const warmUpExerciseEndSec = timeToSeconds(importContents.warmUpExercise.timeEnd[0], importContents.warmUpExercise.timeEnd[1]);

  const coolDownExerciseStartSec = timeToSeconds(
    importContents.coolDownExercise.timeStart[0],
    importContents.coolDownExercise.timeStart[1]
  );
  const coolDownExerciseEndSec = timeToSeconds(
    importContents.coolDownExercise.timeEnd[0],
    importContents.coolDownExercise.timeEnd[1]
  );

  return {
    spotifyURILow: importContents.spotifyURILow,
    spotifyURIHigh: importContents.spotifyURIHigh,
    youtubeURL: importContents.youtubeURL,
    timerWarmUpSec: warmUpExerciseEndSec - warmUpExerciseStartSec + bufferSec,
    timerLowSec: importContents.timerLowSec + bufferSec,
    timerHighSec: importContents.timerHighSec + bufferSec,
    timerRestSec: importContents.timerRestSec + bufferSec,
    timerCoolDownSec: coolDownExerciseEndSec - coolDownExerciseStartSec + bufferSec,
    timeSeekPosMs: () => _random(importContents.timeSeekPosSecMin * 1000, importContents.timeSeekPosSecMax * 1000, false),
    coolDownExercise: {
      ...importContents.coolDownExercise,
      timeStart: timeToSeconds(importContents.coolDownExercise.timeStart[0], importContents.coolDownExercise.timeStart[1]),
      timeEnd: timeToSeconds(importContents.coolDownExercise.timeEnd[0], importContents.coolDownExercise.timeEnd[1])
    },
    warmUpExercise: {
      ...importContents.warmUpExercise,
      timeStart: timeToSeconds(importContents.warmUpExercise.timeStart[0], importContents.warmUpExercise.timeStart[1]),
      timeEnd: timeToSeconds(importContents.warmUpExercise.timeEnd[0], importContents.warmUpExercise.timeEnd[1])
    },
    exercises: importContents.exercises.map(exercise => {
      return {
        ...exercise,
        highTime: timeToSeconds(exercise.highTime[0], exercise.highTime[1]),
        lowTime: timeToSeconds(exercise.lowTime[0], exercise.lowTime[1])
      };
    })
  };
};
