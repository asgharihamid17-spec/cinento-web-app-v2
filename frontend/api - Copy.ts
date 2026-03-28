export type StoryPayload = {
  title: string;
  format: string;
  genre: string;
  language: string;
  tone: string;
  setting: string;
  idea: string;
};

export async function generateStory(payload: StoryPayload) {
  const response = await fetch("http://127.0.0.1:8000/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();
  return data;
}