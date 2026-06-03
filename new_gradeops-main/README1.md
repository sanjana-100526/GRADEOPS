
# 📊 GradeOps – AI Powered Answer Sheet Grading Platform

GradeOps is an AI-powered full-stack system that automates evaluation of student answer sheets using Vision-Language Models.  
It generates automatic scoring, structured feedback, and stores results for analysis.

---

## 📁 Project Structure
gradeops/
│
├── ai-grading-platform/ # Frontend (React / Next.js)
├── backend/ # FastAPI Backend
├── .env # Environment variables (NOT pushed to GitHub)


---

## 🚀 Features

- 📄 Upload handwritten or typed answer sheets
- 🤖 AI-based evaluation using Vision-Language Models (Qwen-VL / Gemini / OpenAI)
- 📊 Automatic scoring system
- 🧠 Question-wise feedback generation
- 💾 Stores results in MongoDB
- ⚡ FastAPI backend for processing requests
- 🌐 Responsive React frontend

---

## 🛠 Tech Stack

**Frontend**
- React / Next.js
- Tailwind CSS

**Backend**
- FastAPI (Python)
- Uvicorn

**Database**
- MongoDB Atlas

**AI Model**
- Vision-Language Models (Qwen-VL / Gemini / OpenAI)

---

## ⚙️ How to Run Locally

### Clone the repository
```bash
git clone https://github.com/ShreyaSahoo5009/new_gradeops.git
cd new_gradeops
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd ai-grading-platform
npm install
npm run dev
```

### Create a .env file inside the backend folder:
```bash
MONGO_URI=your_mongodb_connection_string
API_KEY=your_ai_api_key
```
