export async function generateStory(form: {
  title: string;
  format: string;
  genre: string;
  language: string;
  tone: string;
  setting: string;
  idea: string;
}) {
  const response = await fetch("http://127.0.0.1:8000/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: form.title,
      format: form.format,
      genre: form.genre,
      language: form.language,
      tone: form.tone,
      setting: form.setting,
      idea: form.idea,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || JSON.stringify(data));
  }

  return data;
}

export async function downloadPitchDeck(output: any) {
  const response = await fetch("http://127.0.0.1:8000/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(output),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.detail || err?.error || "Export failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cinento_pitch_deck.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}