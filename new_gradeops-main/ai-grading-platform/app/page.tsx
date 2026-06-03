// 

'use client'

import { useState, useEffect } from 'react'

export default function AIGradingPlatformUI() {

  const [selectedFile, setSelectedFile] = useState(null)
  const [gradeData, setGradeData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reviewerComment, setReviewerComment] = useState("")
  const [score, setScore] = useState(0)

  const shortcuts = [
    ['A', 'Approve'],
    ['+', 'Increase Marks'],
    ['-', 'Decrease Marks'],
    ['N', 'Next Answer'],
    ['P', 'Previous Answer'],
    ['F', 'Flag Answer'],
  ]

const runEvaluation = async () => {

  if (!selectedFile) {
    alert("Please upload an answer sheet first")
    return
  }

  const formData = new FormData()
  formData.append("file", selectedFile)

  try {
    setLoading(true)
    const response = await fetch("http://127.0.0.1:8000/grade", {
      method: "POST",
      body: formData
    })

    console.log(response)

    const data = await response.json()

    console.log(data)

    setGradeData(data)

    setScore(data.score)

  } catch (error) {

    console.log(error)

    alert("Backend connection failed")
  }finally {

    setLoading(false)
  }
}

  const overrideMarks = async () => {

  if (!gradeData?._id) {
    alert("No evaluation found")
    return
  }

  try {

    const response = await fetch(
      `http://127.0.0.1:8000/override/${gradeData._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          score: score,
          comment: reviewerComment
        })
      }
    )

    const data = await response.json()

    console.log(data)

    alert("Override saved")

  } catch (error) {

    console.log(error)

    alert("Override failed")
  }
}
const approveAnswer = async () => {

  if (!gradeData?._id) return

  try {

    await fetch(
      `http://127.0.0.1:8000/approve/${gradeData._id}`,
      {
        method: "PUT"
      }
    )

    alert("Approved")

  } catch (error) {

    console.log(error)
  }
}
const flagAnswer = async () => {

  if (!gradeData?._id) return

  try {

    await fetch(
      `http://127.0.0.1:8000/flag/${gradeData._id}`,
      {
        method: "PUT"
      }
    )

    alert("Flagged")

  } catch (error) {

    console.log(error)
  }
}
useEffect(() => {

  const handleKeyDown = (e) => {

    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA"
    ) {
      return
    }

    // Approve
    if (e.key.toLowerCase() === 'a') {
      approveAnswer()
    }

    // Flag
    if (e.key.toLowerCase() === 'f') {
      flagAnswer()
    }

    // Increase marks
    if (e.key === '+') {
      setScore((prev) => Math.min(prev + 1, 10))
    }

    // Decrease marks
    if (e.key === '-') {
      setScore((prev) => Math.max(prev - 1, 0))
    }

    // Next answer
    if (e.key.toLowerCase() === 'n') {
      alert("Next Answer")
    }

    // Previous answer
    if (e.key.toLowerCase() === 'p') {
      alert("Previous Answer")
    }

  }

  window.addEventListener("keydown", handleKeyDown)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
  }

}, [gradeData, score])
const clearEvaluation = () => {
  setSelectedFile(null)
  setGradeData(null)
  setReviewerComment("")
  setScore(0)
}

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* Navbar */}
      <header className="bg-white border-b shadow-sm px-8 py-4 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            AI Answer Evaluation
          </h1>

          <p className="text-sm text-gray-500">
            Professor & TA Review Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* Upload Button */}
          <label className="px-4 py-2 rounded-xl bg-black text-white cursor-pointer hover:opacity-90">

            Upload Answer Sheet

            <input
              type="file"
              hidden
              onChange={(e) => {
                setSelectedFile(e.target.files[0])
              }}
            />

          </label>

          {/* Run AI */}
          <button
  type="button"
  onClick={() => {
    console.log("BUTTON CLICKED")
    runEvaluation()
  }}
  className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 z-50 relative"
>
  {loading ? "Evaluating..." : "Run AI Evaluation"}
</button>

          

        </div>

      </header>

      {/* Main Layout */}
      <main className="p-8 grid grid-cols-12 gap-6">

        

        {/* Main Review Area */}
        <section className="col-span-9 space-y-6">

        

          {/* Review Panel */}
          <div className="grid grid-cols-2 gap-6">

            {/* Student Answer */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

              <div className="border-b px-6 py-4 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-lg">
                    Student Answer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Uploaded Answer Sheet
                  </p>
                </div>

              </div>

              <div className="p-4 bg-gray-50 h-[650px] flex items-center justify-center">

                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : "https://placehold.co/600x800/png"
                  }
                  alt="Answer Sheet"
                  className="rounded-2xl shadow-lg max-h-full"
                />

              </div>

            </div>

            {/* AI Evaluation */}
            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="font-bold text-xl">
                    AI Evaluation
                  </h2>

                  <p className="text-sm text-gray-500">
                    Generated using rubric.json
                  </p>
                </div>

                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {gradeData?.confidence
                    ? `${Math.round(gradeData.confidence * 100)}% Confidence`
                    : 'No AI Result'}
                </div>

              </div>

              <div className="space-y-5 flex-1">

                {/* Marks */}
                <div>

                  <p className="text-sm font-medium text-gray-500 mb-1">
                    AI Marks
                  </p>

                  <div className="flex items-center gap-3">

                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-24 border rounded-xl px-4 py-3 text-2xl font-bold"
                    />

                    <span className="text-gray-500 text-lg">
                      / 10
                    </span>

                  </div>

                </div>

                {/* Reasoning */}
                <div>

                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Reasoning
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-4 leading-relaxed text-sm">

                    {gradeData?.feedback || "No evaluation yet"}

                  </div>

                </div>

                {/* Mistakes */}
                <div>

                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Missing Concepts
                  </p>

                  <div className="flex gap-2 flex-wrap">

                    {gradeData?.mistakes?.map((item, idx) => (

                      <span
                        key={idx}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm"
                      >
                        {item}
                      </span>

                    ))}

                  </div>

                </div>

                {/* Reviewer Comment */}
                <div>

                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Reviewer Comment
                  </p>

                  <textarea
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      placeholder="Add comment..."
                      className="w-full border rounded-2xl p-4 h-28 resize-none"
                    />

                </div>

              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 mt-6">

                <button
                  onClick={approveAnswer}
                  className="border rounded-2xl py-4 font-semibold hover:bg-gray-50"
                >
                  Approve
                </button>

                <button
                  onClick={overrideMarks}
                  className="border rounded-2xl py-4 font-semibold hover:bg-gray-50"
                >
                  Override
                </button>

                <button
                  onClick={flagAnswer}
                  className="border rounded-2xl py-4 font-semibold hover:bg-gray-50"
                >
                  Flag
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Right Sidebar */}
        <aside className="col-span-3 space-y-6">

          {/* Keyboard Shortcuts */}
          <div className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-lg font-bold mb-4">
              Keyboard Shortcuts
            </h2>

            <div className="space-y-3">

              {shortcuts.map(([key, action]) => (

                <div
                  key={key}
                  className="flex items-center justify-between border rounded-2xl px-4 py-3"
                >

                  <span className="font-medium">
                    {action}
                  </span>

                  <span className="bg-gray-100 rounded-lg px-3 py-1 text-sm font-bold">
                    {key}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </aside>

      </main>

    </div>
  )  
}