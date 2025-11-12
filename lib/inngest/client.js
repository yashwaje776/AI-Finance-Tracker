// lib/inngest/client.js
import { Inngest } from "inngest";

// optional utility for retry backoff
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const inngest = new Inngest({
  id: "finsight",
  name: "finsight",
  retryFunction: async (attempt) => {
    await delay(1000 * Math.pow(2, attempt)); // exponential backoff
    if (attempt > 2) throw new Error("Max retry attempts reached");
  },
});

export default inngest;
