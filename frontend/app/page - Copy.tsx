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
        <h1
          style={{
            fontSize: "54px",
            fontWeight: 700,
            marginBottom: "8px",
            letterSpacing: "-1px",
          }}
        >
          CINENTO AI Studio
        </h1>

        <p
          style={{
            fontSize: "24px",
            marginBottom: "36px",
            color: "#d6d6d6",
          }}
        >
          AI Series Bible Generator
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "22px 36px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label style={labelStyle}>Project Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Project Title"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Format</label>
            <select
              name="format"
              value={form.format}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Series">Series</option>
              <option value="Mini Series">Mini Series</option>
              <option value="Feature Film">Feature Film</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Genre</label>
            <input
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="Genre"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Language</label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="English">English</option>
              <option value="Turkish">Turkish</option>
              <option value="Persian">Persian</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tone</label>
            <input
              name="tone"
              value={form.tone}
              onChange={handleChange}
              placeholder="Tone"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Setting</label>
            <input
              name="setting"
              value={form.setting}
              onChange={handleChange}
              placeholder="Setting"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Write your series idea...</label>
          <textarea
            name="idea"
            value={form.idea}
            onChange={handleChange}
            placeholder="Write your series idea..."
            rows={8}
            style={textareaStyle}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: "#f2c94c",
            color: "#111",
            border: "none",
            borderRadius: "10px",
            padding: "14px 26px",
            fontWeight: 700,
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "24px",
          }}
        >
          {loading ? "Generating..." : "Generate Series Bible"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "8px",
              marginBottom: "20px",
              color: "#ff6b6b",
              fontWeight: 600,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error}
          </div>
        )}

        {output && (
          <div
            style={{
              marginTop: "16px",
              background: "#151515",
              border: "1px solid #2a2a2a",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "18px",
                fontSize: "24px",
              }}
            >
              Generated Output
            </h2>

            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#f1f1f1",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "15px",
  color: "#e7e7e7",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #3b3b3b",
  background: "#111",
  color: "white",
  outline: "none",
  fontSize: "16px",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #3b3b3b",
  background: "#111",
  color: "white",
  outline: "none",
  fontSize: "16px",
  resize: "vertical",
  boxSizing: "border-box",
};