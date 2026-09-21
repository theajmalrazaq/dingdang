import { PromptType } from "../types";

/**
 * Fetch Truth or Dare prompt directly from the public TruthOrDareBot API (PG rated)
 */
export async function fetchTruthOrDarePrompt(
  type: PromptType = "random",
): Promise<{ type: "truth" | "dare"; prompt: string }> {
  const selectedType: "truth" | "dare" =
    type === "random" ? (Math.random() > 0.5 ? "truth" : "dare") : type;

  const response = await fetch(
    `https://api.truthordarebot.xyz/v1/${selectedType}?rating=pg`,
  );

  if (!response.ok) {
    throw new Error(`TruthOrDareBot API request failed with status: ${response.status}`);
  }

  const json = await response.json();
  return {
    type: selectedType,
    prompt: json?.question || "",
  };
}
