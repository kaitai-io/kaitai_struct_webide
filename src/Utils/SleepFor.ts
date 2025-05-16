export const SleepFor = (time: number) => new Promise((resolve) => setTimeout(resolve, time || 0));
