import { ApiVerveResponse, PromptType } from "../types";

// High quality non-adult prompts for offline / fallback party play
const FALLBACK_TRUTHS = [
  "Who is your secret crush in your friend circle?",
  "What is the most embarrassing thing you've done in public?",
  "What is the weirdest food combination you secretly enjoy?",
  "Have you ever lied to get out of plans with friends?",
  "What is your biggest fear that nobody knows about?",
  "If you could trade lives with anyone in this room for a day, who would it be?",
  "What was the worst haircut or fashion disaster you've ever had?",
  "What is a secret talent you have that you've never shown anyone?",
  "Have you ever accidentally sent a text about someone to that exact person?",
  "What is the funniest rumor you've ever heard about yourself?",
  "What is the most ridiculous excuse you've ever used to get out of trouble?",
  "If you could only eat one meal for the rest of your life, what would it be?",
  "What is a childish habit you still secretly do?",
  "What was your most awkward first impression of someone here?",
  "If you were a superhero, what would your ridiculous weakness be?",
  "What song are you totally embarrassed to admit you love?",
  "What is the strangest dream you remember having?",
  "Have you ever re-gifted a present? If so, what was it?",
  "What is the biggest harmless lie you ever told your parents without getting caught?",
  "If you won a million dollars tomorrow, what is the very first thing you would buy?",
];

const FALLBACK_DARES = [
  "Post the oldest selfie on your phone to your story.",
  "Do your best impression of another player in the room until someone guesses who it is.",
  "Send a random funny emoji to the 5th contact in your recent message list.",
  "Speak in an accent of the group's choice for the next 2 turns.",
  "Eat a spoonful of hot sauce or mustard without drinking water for 30 seconds.",
  "Do 15 pushups or 20 jumping jacks while counting out loud in another language.",
  "Show the group your screen time report for today.",
  "Sing the chorus of your favorite song out loud with full energy and passion.",
  "Let someone in the room send a funny text message from your phone.",
  "Talk like a pirate until your next turn.",
  "Balance a spoon or book on your head for 30 seconds without dropping it.",
  "Do your best runway model walk across the room.",
  "Show everyone the funniest meme saved in your camera roll.",
  "Try not to laugh for 1 minute while the other players make silly faces at you.",
  "Send a voice note to a friend singing Happy Birthday (even if it's not their birthday).",
  "Pretend to be an alien reporting on human behavior for 45 seconds.",
  "Do an interpretive robot dance for 30 seconds.",
];

/**
 * Fetch Truth or Dare prompt with automatic free public API integration (truthordarebot API - PG rated)
 */
export async function fetchTruthOrDarePrompt(
  type: PromptType = "random",
  _adultMode?: boolean,
  apiKey?: string,
): Promise<{ type: "truth" | "dare"; prompt: string }> {
  const selectedType: "truth" | "dare" =
    type === "random" ? (Math.random() > 0.5 ? "truth" : "dare") : type;

  // 1. Try 100% FREE Public TruthOrDareBot API (rating=pg for safe family/party prompts)
  try {
    const response = await fetch(
      `https://api.truthordarebot.xyz/v1/${selectedType}?rating=pg`,
    );

    if (response.ok) {
      const json = await response.json();
      if (json && json.question) {
        return {
          type: selectedType,
          prompt: json.question,
        };
      }
    }
  } catch (err) {
    console.warn("TruthOrDareBot API fetch failed, trying APIVerve / fallback:", err);
  }

  // 2. Try APIVerve API if API Key provided (strictly non-adult)
  const keyToUse = apiKey || import.meta.env.VITE_APIVERVE_API_KEY;
  if (keyToUse) {
    try {
      const url = `https://api.apiverve.com/v1/truthordare?type=${selectedType}&adult=false`;
      const response = await fetch(url, {
        headers: { "X-API-Key": keyToUse },
      });
      if (response.ok) {
        const json: ApiVerveResponse = await response.json();
        if (json.status === "ok" && json.data) {
          return {
            type: json.data.type,
            prompt: json.data.prompt,
          };
        }
      }
    } catch (err) {
      console.warn("APIVerve fetch failed:", err);
    }
  }

  // 3. Built-in clean offline fallback prompt generator
  const promptList = selectedType === "truth" ? FALLBACK_TRUTHS : FALLBACK_DARES;
  const randomPrompt = promptList[Math.floor(Math.random() * promptList.length)];
  return {
    type: selectedType,
    prompt: randomPrompt,
  };
}
