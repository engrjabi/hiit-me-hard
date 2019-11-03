export const dateWithSecOffset = secondsOffset => {
  const t = new Date();
  t.setSeconds(t.getSeconds() + secondsOffset);
  return t;
};

export const timeToSeconds = (min, sec) => {
  return min * 60 + sec;
};
