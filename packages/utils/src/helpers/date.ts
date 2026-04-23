export const timeIntervalSinceNow = (futureOrPastDateMillis: number) => {
  return (futureOrPastDateMillis - Date.now()) / 1000;
};
