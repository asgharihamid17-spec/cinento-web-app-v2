from fastapi import APIRouter
from pydantic import BaseModel
from app.services.openai_service import generate_text
import json
import re

router = APIRouter()


class GenerateRequest(BaseModel):
    title: str
    format: str
    genre: str
    language: str
    tone: str
    setting: str
    idea: str


def extract_json(text: str):
    text = text.strip()

    # حالت 1: اگر داخل ```json ... ``` باشد
    code_block_match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if code_block_match:
        return json.loads(code_block_match.group(1))

    # حالت 2: اگر داخل ``` ... ``` باشد
    generic_code_block_match = re.search(r"```\s*(\{.*?\})\s*```", text, re.DOTALL)
    if generic_code_block_match:
        return json.loads(generic_code_block_match.group(1))

    # حالت 3: استخراج از اولین { تا آخرین }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start:end + 1])

    raise ValueError("No valid JSON found")


@router.post("/generate")
def generate(request: GenerateRequest):

    prompt = f"""
You are a professional TV series development strategist.

Based on the following project details, generate a premium international SERIES BIBLE package.

TITLE: {request.title}
FORMAT: {request.format}
GENRE: {request.genre}
LANGUAGE: {request.language}
TONE: {request.tone}
SETTING: {request.setting}
IDEA: {request.idea}

Return the result ONLY as valid JSON.

Use exactly this structure:

{{
  "logline": "string",
  "series_overview": "string",
  "world_setting": "string",
  "tone_style": "string",
  "main_characters": [
    {{
      "name": "string",
      "age": "string",
      "role": "string",
      "description": "string"
    }}
  ],
  "season_arc": "string",
  "episode_guide": [
    {{
      "episode_number": 1,
      "title": "string",
      "summary": "string"
    }}
  ]
}}

Rules:
- Create exactly 4 main_characters
- Create exactly 8 episode_guide entries
- Keep the output cinematic, premium, serious, and suitable for an international streaming platform
- Output valid JSON only
"""

    result = generate_text(prompt)

    try:
        parsed = extract_json(result)
        return parsed

    except Exception:
        return {
            "error": "JSON parsing failed",
            "raw_output": result
        }