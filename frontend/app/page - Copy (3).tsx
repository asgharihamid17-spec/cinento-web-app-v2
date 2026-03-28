"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  generateStory,
  saveProject,
  getProjects,
  getProjectById,
  registerUser,
  loginUser,
} from "../api";

type FormState = {
  title: string;
  format: string;
  genre: string;
  language: string;
  tone: string;
  setting: string;
  idea: string;
};

type ProjectItem = {
  id: number;
  title: string;
  format: string;
  genre: string;
  language: string;
  created_at: string;
};

type CurrentUser = {
  id: number;
  full_name: string;
  email: string;
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

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("cinento_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem("cinento_user");
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      loadProjects(currentUser.id);
    } else {
      setProjects([]);
    }
  }, [currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loadProjects = async (userId: number) => {
    try {
      const data = await getProjects(userId);
      setProjects(data.projects || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.full_name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setError("Please fill all register fields.");
      return;
    }

    setAuthLoading(true);
    setError("");

    try {
      const data = await registerUser(registerForm);
      setCurrentUser(data.user);
      localStorage.setItem("cinento_user", JSON.stringify(data.user));
      setRegisterForm({ full_name: "", email: "", password: "" });
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please fill email and password.");
      return;
    }

    setAuthLoading(true);
    setError("");

    try {
      const data = await loginUser(loginForm);
      setCurrentUser(data.user);
      localStorage.setItem("cinento_user", JSON.stringify(data.user));
      setLoginForm({ email: "", password: "" });
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cinento_user");
    setCurrentUser(null);
    setProjects([]);
    setOutput(null);
    setError("");
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      setError("Please login first.");
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

    if (!form.idea.trim()) {
      setError("Please enter your story idea.");
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

  const handleSaveProject = async () => {
    if (!currentUser) {
      setError("Please login first.");
      return;
    }

    if (!output) {
      setError("Please generate output first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveProject({
        ...form,
        user_id: currentUser.id,
        output,
      });

      await loadProjects(currentUser.id);
    } catch (err: any) {
      setError(err?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = async (projectId: number) => {
    if (!currentUser) {
      setError("Please login first.");
      return;
    }

    try {
      const project = await getProjectById(projectId, currentUser.id);

      setForm({
        title: project.title || "",
        format: project.format || "Series",
        genre: project.genre || "",
        language: project.language || "English",
        tone: project.tone || "",
        setting: project.setting || "",
        idea: project.idea || "",
      });

      setOutput(project.output || null);
      setError("");
    } catch (err: any) {
      setError(err?.message || "Failed to load project.");
    }
  };

  const addWrappedText = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 7
  ) => {
    const lines = doc.splitTextToSize(text || "", maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  const ensurePageSpace = (doc: jsPDF, y: number, needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const handleDownloadPDF = () => {
    if (!output) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CINENTO AI STORY BIBLE", 14, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Project Title: ${form.title}`, 14, y);
    y += 7;
    doc.text(`Format: ${form.format}`, 14, y);
    y += 7;
    doc.text(`Genre: ${form.genre}`, 14, y);
    y += 7;
    doc.text(`Language: ${form.language}`, 14, y);
    y += 7;
    doc.text(`Tone: ${form.tone}`, 14, y);
    y += 7;
    doc.text(`Setting: ${form.setting}`, 14, y);
    y += 12;

    y = ensurePageSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Logline", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = addWrappedText(doc, output.logline || "", 14, y, 180);
    y += 6;

    y = ensurePageSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Series Overview", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = addWrappedText(doc, output.series_overview || "", 14, y, 180);
    y += 6;

    y = ensurePageSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("World Setting", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = addWrappedText(doc, output.world_setting || "", 14, y, 180);
    y += 6;

    y = ensurePageSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Tone Style", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = addWrappedText(doc, output.tone_style || "", 14, y, 180);
    y += 10;

    if (output.main_characters?.length) {
      y = ensurePageSpace(doc, y, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Main Characters", 14, y);
      y += 10;

      output.main_characters.forEach((c: any, index: number) => {
        y = ensurePageSpace(doc, y, 28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${c.name || ""}`, 14, y);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        y = addWrappedText(doc, `Age: ${c.age || ""}`, 18, y, 176);
        y = addWrappedText(doc, `Role: ${c.role || ""}`, 18, y, 176);
        y = addWrappedText(doc, `Description: ${c.description || ""}`, 18, y, 176);
        y += 6;
      });
    }

    if (output.episode_guide?.length) {
      y = ensurePageSpace(doc, y, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Episode Guide", 14, y);
      y += 10;

      output.episode_guide.forEach((ep: any) => {
        y = ensurePageSpace(doc, y, 24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Episode ${ep.episode_number}: ${ep.title || ""}`, 14, y);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        y = addWrappedText(doc, ep.summary || "", 18, y, 176);
        y += 6;
      });
    }

    doc.save(`${form.title || "cinento_story_bible"}.pdf`);
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
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "10px" }}>
          CINENTO AI Studio
        </h1>

        <p style={{ fontSize: "22px", marginBottom: "30px", color: "#ccc" }}>
          AI Series Bible Generator
        </p>

        {!currentUser && (
          <div style={authWrapStyle}>
            <div style={authCardStyle}>
              <h3 style={{ marginTop: 0, color: "#f2c94c" }}>Register</h3>
              <input
                placeholder="Full Name"
                value={registerForm.full_name}
                onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                style={inputStyle}
              />
              <div style={{ height: 10 }} />
              <input
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                style={inputStyle}
              />
              <div style={{ height: 10 }} />
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                style={inputStyle}
              />
              <div style={{ height: 12 }} />
              <button onClick={handleRegister} style={buttonStyle} disabled={authLoading}>
                {authLoading ? "Please wait..." : "Register"}
              </button>
            </div>

            <div style={authCardStyle}>
              <h3 style={{ marginTop: 0, color: "#f2c94c" }}>Login</h3>
              <input
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                style={inputStyle}
              />
              <div style={{ height: 10 }} />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                style={inputStyle}
              />
              <div style={{ height: 12 }} />
              <button onClick={handleLogin} style={buttonStyle} disabled={authLoading}>
                {authLoading ? "Please wait..." : "Login"}
              </button>
            </div>
          </div>
        )}

        {currentUser && (
          <div style={userBarStyle}>
            <div>
              Logged in as <strong>{currentUser.full_name}</strong> ({currentUser.email})
            </div>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
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

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={handleGenerate} disabled={loading} style={buttonStyle}>
                {loading ? "Generating..." : "Generate Series Bible"}
              </button>

              {output && currentUser && (
                <>
                  <button onClick={handleSaveProject} disabled={saving} style={saveButtonStyle}>
                    {saving ? "Saving..." : "Save Project"}
                  </button>

                  <button onClick={handleDownloadPDF} style={pdfButtonStyle}>
                    Download PDF
                  </button>
                </>
              )}
            </div>

            {error && (
              <div
                style={{
                  marginTop: "20px",
                  color: "#ff6b6b",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </div>
            )}

            {output && (
              <div style={outputBox}>
                <h2 style={sectionTitle}>🎬 Logline</h2>
                <p style={paragraphStyle}>{output.logline}</p>

                <h2 style={sectionTitle}>📖 Series Overview</h2>
                <p style={paragraphStyle}>{output.series_overview}</p>

                <h2 style={sectionTitle}>🌍 World Setting</h2>
                <p style={paragraphStyle}>{output.world_setting}</p>

                <h2 style={sectionTitle}>🎭 Tone</h2>
                <p style={paragraphStyle}>{output.tone_style}</p>

                <h2 style={sectionTitle}>👥 Main Characters</h2>
                {output.main_characters?.map((c: any, i: number) => (
                  <div key={i} style={cardStyle}>
                    <strong style={{ fontSize: "18px" }}>
                      {c.name} {c.age ? `(${c.age})` : ""}
                    </strong>
                    <div style={{ color: "#f2c94c", marginTop: "6px", marginBottom: "10px" }}>
                      {c.role}
                    </div>
                    <p style={paragraphStyle}>{c.description}</p>
                  </div>
                ))}

                <h2 style={sectionTitle}>📺 Episode Guide</h2>
                {output.episode_guide?.map((ep: any, i: number) => (
                  <div key={i} style={episodeCardStyle}>
                    <strong style={{ fontSize: "18px" }}>
                      Episode {ep.episode_number}: {ep.title}
                    </strong>
                    <p style={{ ...paragraphStyle, marginTop: "8px" }}>{ep.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={sidebarStyle}>
            <h3 style={{ marginTop: 0, color: "#f2c94c" }}>Saved Projects</h3>

            {!currentUser ? (
              <p style={{ color: "#bbb" }}>Please login to see your projects.</p>
            ) : projects.length === 0 ? (
              <p style={{ color: "#bbb" }}>No saved projects yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} style={projectItemStyle}>
                  <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{project.title}</div>
                  <div style={{ fontSize: "13px", color: "#bbb", marginBottom: "10px" }}>
                    {project.genre} • {project.format}
                  </div>
                  <button
                    onClick={() => handleLoadProject(project.id)}
                    style={loadButtonStyle}
                  >
                    Load Project
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
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
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "10px",
  background: "#f2c94c",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  color: "#111",
};

const saveButtonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "10px",
  background: "#3498db",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  color: "white",
};

const pdfButtonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "10px",
  background: "#27ae60",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  color: "white",
};

const logoutButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "8px",
  background: "#aa2e2e",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const loadButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "8px",
  background: "#222",
  border: "1px solid #555",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const outputBox: React.CSSProperties = {
  marginTop: "30px",
  padding: "24px",
  background: "#111",
  borderRadius: "12px",
  border: "1px solid #333",
  lineHeight: 1.7,
};

const sectionTitle: React.CSSProperties = {
  marginTop: "26px",
  marginBottom: "10px",
  fontSize: "24px",
  color: "#f2c94c",
};

const paragraphStyle: React.CSSProperties = {
  marginTop: 0,
  color: "#f1f1f1",
  lineHeight: 1.8,
};

const cardStyle: React.CSSProperties = {
  background: "#181818",
  border: "1px solid #2f2f2f",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "16px",
};

const episodeCardStyle: React.CSSProperties = {
  background: "#181818",
  border: "1px solid #2f2f2f",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "14px",
};

const sidebarStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "20px",
  height: "fit-content",
};

const projectItemStyle: React.CSSProperties = {
  background: "#181818",
  border: "1px solid #2f2f2f",
  borderRadius: "10px",
  padding: "14px",
  marginBottom: "12px",
};

const authWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "24px",
};

const authCardStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "20px",
};

const userBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#111",
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "24px",
};