export const dateWithSecOffset = secondsOffset => {
  const t = new Date();
  t.setSeconds(t.getSeconds() + secondsOffset);
  return t;
};

export const timeToSeconds = (min, sec) => {
  return min * 60 + sec;
};

export function fancyTimeFormat(timeSec) {
  // Hours, minutes and seconds
  const hrs = Math.floor(timeSec / 3600);
  const mins = Math.floor((timeSec % 3600) / 60);
  const secs = Math.floor(timeSec) % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}
