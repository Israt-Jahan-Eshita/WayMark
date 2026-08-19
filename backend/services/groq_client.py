import os
import json
import base64
import io
import time
from PIL import Image
from typing import List
from groq import Groq
from dotenv import load_dotenv
from models.schemas import ExtractionResult

load_dotenv()

# Initialize Groq client
# It will automatically use the GROQ_API_KEY environment variable
client = Groq()

def encode_image(image_path, max_size=768, quality=70):
    try:
        img = Image.open(image_path)
        img.thumbnail((max_size, max_size))
        buffer = io.BytesIO()
        # Convert to RGB to avoid issues with PNGs having alpha channels
        img.convert("RGB").save(buffer, format="JPEG", quality=quality)
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"Error compressing image, falling back to raw: {e}")
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

def extract_features(image_paths: List[str]) -> ExtractionResult:
    """
    Sends images to Groq API to extract accessibility features dynamically
    based on the standard checklist criteria.
    """
    if len(image_paths) > 5:
        raise ValueError("A maximum of 5 images can be processed at once.")

    # Load dynamic criteria from the standard checklist
    try:
        with open("data/checklist_standard.json", "r") as f:
            checklist_data = json.load(f)
            criteria = checklist_data.get("criteria", [])
    except Exception as e:
        raise RuntimeError(f"Could not load checklist data: {e}")

    # Build the prompt dynamically based on the criteria
    criteria_list_str = "\n".join([f"- {c['label']}: {c['description']}" for c in criteria])
    feature_names = [c["label"] for c in criteria]

    prompt = f"""
    You are an expert accessibility auditor.
    Analyze the provided images and extract physical accessibility features.

    Look ONLY for the following features:
    {criteria_list_str}

    CRITICAL RULES:
    1. ONLY report what is visibly present in the photos.
    2. Do NOT guess about anything that is not visible.
    3. If a feature's presence is ambiguous or partially obscured, set its status to "uncertain".
    4. For each feature in this list: {feature_names}, you MUST return exactly one entry.
    5. 'source_photo_index' should be the VISIBLE NUMBER LABEL (1-5) of the panel in the image where the feature is found. If not visible or uncertain, use -1.

    ABSOLUTE MANDATORY REQUIREMENT:
    DO NOT output a <think> block. DO NOT output any reasoning, chain of thought, or conversational text. 
    You must IMMEDIATELY start your response with the opening curly brace character and output ONLY the raw JSON object.
    
    Example JSON output format:
    {{
        "features": [
            {{
                "feature_name": "{feature_names[0] if feature_names else 'Ramp'}",
                "status": "detected",
                "confidence_note": "A clear concrete ramp is visible at the main entrance.",
                "confidence_note_bn": "প্রধান প্রবেশদ্বারে একটি পরিষ্কার কংক্রিটের র‍্যাম্প দৃশ্যমান।",
                "source_photo_index": 0
            }}
        ]
    }}
    """

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt}
            ]
        }
    ]

    # Add images to the message payload
    for i, path in enumerate(image_paths):
        base64_image = encode_image(path)
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })

    # Call Groq API with 1 retry on failure
    max_retries = 1
    for attempt in range(max_retries + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="qwen/qwen3.6-27b",
                response_format={"type": "json_object"},
                extra_body={"reasoning_effort": "none"},
                temperature=0.1,
                max_tokens=4096
            )
            
            result_text = chat_completion.choices[0].message.content
            
            import re
            
            # Remove any <think> block (even if truncated by max_tokens)
            cleaned = re.sub(r'<think>.*?(?:</think>|$)', '', result_text, flags=re.DOTALL)
            cleaned = cleaned.strip()
            
            # 1. Try to find a standard markdown JSON block
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', cleaned, re.DOTALL)
            json_str = json_match.group(1) if json_match else ""
            
            # 2. If no markdown block, try to find the outermost curly braces
            if not json_str:
                json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                json_str = json_match.group(0) if json_match else ""
                
            if not json_str:
                # If we still don't have JSON, it means the model likely hit the token limit 
                # while thinking and never output the actual JSON.
                raise ValueError(f"Model failed to generate JSON. This is usually because it hit the token limit while reasoning. Please try again.")
                
            try:
                return ExtractionResult.model_validate_json(json_str)
            except Exception as parse_err:
                raise ValueError(f"JSON Parsing Error: {parse_err}. Raw extracted JSON: {json_str}")
            
        except Exception as e:
            if attempt < max_retries:
                time.sleep(2)  # Wait before retrying
                continue
            raise RuntimeError(f"Failed to extract features from Groq API after {max_retries + 1} attempts: {str(e)}")
