from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import os
from datetime import datetime


def create_pitch_deck(data: dict):
    output_dir = "exports"
    os.makedirs(output_dir, exist_ok=True)

    filename = f"pitch_deck_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(output_dir, filename)

    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    y = height - 2 * cm

    def write_title(text, size=20):
        nonlocal y
        c.setFont("Helvetica-Bold", size)
        c.drawString(2 * cm, y, text)
        y -= 1.2 * cm

    def write_heading(text):
        nonlocal y
        if y < 4 * cm:
            c.showPage()
            y = height - 2 * cm
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2 * cm, y, text)
        y -= 0.8 * cm

    def write_paragraph(text):
        nonlocal y
        c.setFont("Helvetica", 11)
        lines = split_text(text, 90)
        for line in lines:
            if y < 3 * cm:
                c.showPage()
                y = height - 2 * cm
                c.setFont("Helvetica", 11)
            c.drawString(2 * cm, y, line)
            y -= 0.55 * cm
        y -= 0.3 * cm

    def split_text(text, max_chars=90):
        words = text.split()
        lines = []
        current = ""
        for word in words:
            if len(current) + len(word) + 1 <= max_chars:
                current = f"{current} {word}".strip()
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    write_title("CINENTO AI Studio")
    write_title("Series Pitch Deck", size=16)

    write_heading("Logline")
    write_paragraph(data.get("logline", ""))

    write_heading("Series Overview")
    write_paragraph(data.get("series_overview", ""))

    write_heading("World & Setting")
    write_paragraph(data.get("world_setting", ""))

    write_heading("Tone & Style")
    write_paragraph(data.get("tone_style", ""))

    write_heading("Main Characters")
    for char in data.get("main_characters", []):
        write_paragraph(
            f"{char.get('name', '')} | Age: {char.get('age', '')} | Role: {char.get('role', '')}\n{char.get('description', '')}"
        )

    write_heading("Season Arc")
    write_paragraph(data.get("season_arc", ""))

    write_heading("Episode Guide")
    for ep in data.get("episode_guide", []):
        write_paragraph(
            f"Episode {ep.get('episode_number', '')}: {ep.get('title', '')}\n{ep.get('summary', '')}"
        )

    c.save()
    return filepath, filename