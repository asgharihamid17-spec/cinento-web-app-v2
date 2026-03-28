"use client";

import React, { useState } from "react";
import { generateStory } from "../api";

type FormState = {
  title: string;
  format: string;
  genre: string;
  language: string;
  tone: string;
  setting: string;
  idea: string;
};

export default function Page() {
  const [form, setForm] = useState<FormState>({
    title: "",
    format: "Series",
    genre: "",
    language: "English",
    tone: "",
    setting: "",
    idea: "",
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async () => {
    if (!form.idea.trim()) {
      setError("Please enter your story idea.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter project title.");
      return;
    }

    if (!form.genre.trim()) {
      setError("Please enter genre.");
      return;
    }

    if (!form.tone.trim()) {
      setError("Please enter tone.");
      return;
    }

    if (!form.setting.trim()) {
      setError("Please enter setting.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput(null);

    try {
      const result = await generateStory(form);
      setOutput(result);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1000px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "10px" }}>
          CINENTO AI Studio
        </h1>

        <p style={{ fontSize: "22px", marginBottom: "30px", color: "#ccc" }}>
          AI Series Bible Generator
        </p>

        {/* FORM */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <input name="title" placeholder="Project Title" value={form.title} onChange={handleChange} style={inputStyle} />
          <select name="format" value={form.format} onChange={handleChange} style={inputStyle}>
            <option value="Series">Series</option>
            <option value="Mini Series">Mini Series</option>
            <option value="Feature Film">Feature Film</option>
          </select>

          <input name="genre" placeholder="Genre" value={form.genre} onChange={handleChange} style={inputStyle} />
          <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
            <option value="English">English</option>
            <option value="Turkish">Turkish</option>
            <option value="Persian">Persian</option>
          </select>

          <input name="tone" placeholder="Tone" value={form.tone} onChange={handleChange} style={inputStyle} />
          <input name="setting" placeholder="Setting" value={form.setting} onChange={handleChange} style={inputStyle} />
        </div>

        <textarea
          name="idea"
          placeholder="Write your series idea..."
          value={form.idea}
          onChange={handleChange}
          rows={7}
          style={textareaStyle}
        />

        <br /><br />

        <button onClick={handleGenerate} disabled={loading} style={buttonStyle}>
          {loading ? "Generating..." : "Generate Series Bible"}
        </button>

        {/* ERROR */}
        {error && (
          <div style={{ marginTop: "20px", color: "red", whiteSpace: "pre-wrap" }}>
            {error}
          </div>
        )}

        {/* OUTPUT UI */}
        {output && (
          <div style={outputBox}>
            <h2>🎬 Logline</h2>
            <p>{output.logline}</p>

            <h2>📖 Series Overview</h2>
            <p>{output.series_overview}</p>

            <h2>🌍 World Setting</h2>
            <p>{output.world_setting}</p>

            <h2>🎭 Tone</h2>
            <p>{output.tone_style}</p>

            <h2>👥 Characters</h2>
            {output.main_characters?.map((c: any, i: number) => (
              <div key={i} style={{ marginBottom: "15px" }}>
                <strong>{c.name}</strong> ({c.age}) — {c.role}
                <p>{c.description}</p>
              </div>
            ))}

            <h2>📺 Episodes</h2>
            {output.episode_guide?.map((ep: any, i: number) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <strong>Episode {ep.episode_number}: {ep.title}</strong>
                <p>{ep.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* STYLES */

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "10px",
  background: "#f2c94c",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};

const outputBox: React.CSSProperties = {
  marginTop: "30px",
  padding: "20px",
  background: "#111",
  borderRadius: "12px",
  border: "1px solid #333",
  lineHeight: 1.7,
};