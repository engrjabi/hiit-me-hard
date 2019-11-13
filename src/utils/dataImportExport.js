import { timeToSeconds } from "./date";
import _random from "lodash/random";

const sampleShareableConfig = {
  spotifyURILow: "spotify:playlist:2t2xQB7eGyjpVdxXuiSeRH",
  spotifyURIHigh: "spotify:playlist:2t71qpBkRHwr6rMtzSCNKr",
  youtubeURL: "https://www.youtube.com/watch?v=VvfVMkWngRM",
  timerLowSec: 30,
  timerHighSec: 30,
  timerRestSec: 10,
  timeSeekPosSecMin: 50,
  timeSeekPosSecMax: 60,
  intervalMultiplier: 2,
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
      highTime: [3, 4],
      low: "arm down and up",
      lowTime: [4, 20]
    },
    {
      high: "punch with knee up (left)",
      highTime: [3, 4],
      low: "arm down and up",
      lowTime: [4, 20]
    },
    {
      high: "clap and knee up",
      highTime: [22, 6],
      low: "side pull ups with weights",
      lowTime: [16, 14]
    },
    {
      high: "punches straight",
      highTime: [7, 44],
      low: "arm up, side, and down with weights",
      lowTime: [20, 50]
    },
    {
      high: "arms forward foot side (left)",
      highTime: [10, 50],
      low: "arm up and pull up",
      lowTime: [12, 3]
    },
    {
      high: "arms forward foot side (right)",
      highTime: [10, 50],
      low: "arm up and pull up",
      lowTime: [12, 3]
    },
    {
      high: "side punches and squat",
      highTime: [23, 46],
      low: "arm up, side, and down with weights",
      lowTime: [20, 50]
    }
  ]
};

export const multiplyArray = (arr, times) => {
  let finalArray = arr;

  for (let i = 1; i < times; i++) {
    finalArray = finalArray.concat(arr);
  }

  return finalArray;
};

export const importParser = (importContents = sampleShareableConfig) => {
  const bufferSec = 1; // Buffer for slow loading time and for timer render initialization
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

  const timerWarmUpSec = warmUpExerciseEndSec - warmUpExerciseStartSec + bufferSec;
  const timerCoolDownSec = coolDownExerciseEndSec - coolDownExerciseStartSec + bufferSec;
  const timerRestSec = importContents.timerRestSec + bufferSec;
  const timerHighSec = importContents.timerHighSec + bufferSec;
  const timerLowSec = importContents.timerLowSec + bufferSec;
  const totalTimeInOneSet = timerRestSec + timerRestSec + timerHighSec + timerLowSec;
  const totalTimeInSets = importContents.intervalMultiplier * importContents.exercises.length * totalTimeInOneSet;
  const workoutTotalTimeSec = timerWarmUpSec + totalTimeInSets + timerCoolDownSec;

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
    workoutTotalTimeSec,
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
    exercises: multiplyArray(importContents.exercises, importContents.intervalMultiplier).map(exercise => {
      return {
        ...exercise,
        highTime: timeToSeconds(exercise.highTime[0], exercise.highTime[1]),
        lowTime: timeToSeconds(exercise.lowTime[0], exercise.lowTime[1])
      };
    })
  };
};
