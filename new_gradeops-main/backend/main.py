from pymongo import MongoClient
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from fastapi import Body
from openai import OpenAI
import base64
from PIL import Image
import os
import json
from datetime import datetime
import uuid
from dotenv import load_dotenv

load_dotenv()
# ======================

# ======================

client_ai = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# ======================
# FASTAPI
# ======================

app = FastAPI()
import certifi
from pymongo import MongoClient

client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsCAFile=certifi.where()
)


db = client["ai_grading"]

collection = db["evaluations"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# TEST ROUTE
# ======================

@app.get("/")
def home():
    return {"message": "Backend running"}

# ======================
# GRADE ROUTE
# ======================

@app.put("/approve/{answer_id}")
def approve(answer_id: str):

    collection.update_one(
    {"_id": ObjectId(answer_id)},
    {"$set": {"status": "approved"}}
)

    return {"message": "Approved"}

@app.put("/flag/{answer_id}")
def flag(answer_id: str):

    collection.update_one(
    {"_id": ObjectId(answer_id)},
    {"$set": {"status": "flagged"}}
)

    return {"message": "Flagged"}

from pydantic import BaseModel

class OverrideRequest(BaseModel):
    score: int
    comment: str

@app.put("/override/{answer_id}")
def override(answer_id: str, data: OverrideRequest):

    collection.update_one(
        {"_id": ObjectId(answer_id)},
        {
            "$set": {
                "score": data.score,
                "reviewer_comment": data.comment,
                "status": "overridden"
            }
        }
    )

    return {"message": "Overridden"}



@app.post("/grade")
async def grade_answer(file: UploadFile = File(...)):

    try:

        # Read uploaded image
        contents = await file.read()

        # Save image temporarily
        with open("temp.jpg", "wb") as f:
            f.write(contents)

        # Prompt
        prompt = """
        Evaluate this handwritten answer.

        Return ONLY valid JSON.

        {
          "score": 8,
          "feedback": "Good answer but missing assumptions.",
          "mistakes": ["Assumptions"],
          "confidence": 0.91
        }
        """

        # Convert image to base64
        with open("temp.jpg", "rb") as img_file:
            base64_image = base64.b64encode(
                img_file.read()
            ).decode("utf-8")

        # Qwen VL API call
        response = client_ai.chat.completions.create(
    model="qwen/qwen2.5-vl-72b-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
)
        print(response)
        print(response.choices[0].message.content)

        cleaned = response.choices[0].message.content.strip()

        # Remove markdown json
        if cleaned.startswith("```json"):
            cleaned = cleaned.replace("```json", "")
            cleaned = cleaned.replace("```", "")
            cleaned = cleaned.strip()

        from datetime import datetime
        import uuid

        result = json.loads(cleaned)

        evaluation = {  
             
            "score": result.get("score", 0),
            "feedback": result.get("feedback", ""),
            "mistakes": result.get("mistakes", []),
            "confidence": result.get("confidence", 0),
            "status": "pending",
            "reviewer_comment": "",
            "created_at": datetime.utcnow()
        }

        inserted = collection.insert_one(evaluation)

        return {
        "_id": str(inserted.inserted_id),
        "score": int(evaluation["score"]),
        "feedback": str(evaluation["feedback"]),
        "mistakes": [str(x) for x in evaluation["mistakes"]],
        "confidence": float(evaluation["confidence"]),
        "status": str(evaluation["status"]),
        "reviewer_comment": str(evaluation["reviewer_comment"]),
        "created_at": evaluation["created_at"].isoformat()
        }
    except Exception as e:

        print("ERROR:", str(e))

        return {
            "success": False,
            "error": str(e)
        }