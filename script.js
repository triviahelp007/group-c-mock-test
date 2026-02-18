let questionBank = {};
let selectedQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;
let totalTime = 60 * 60;

// Load JSON
fetch("production_final_database.json")
  .then(res => res.json())
  .then(data => {
    questionBank = data;
  })
  .catch(err => console.error("Database load error:", err));

// Start Test
function beginTest() {
  const name = document.getElementById("candidateName").value.trim();

  if (!name) {
    alert("Please enter your full name.");
    return;
  }

  if (!questionBank.arithmetic) {
    alert("Question database not loaded yet. Refresh page.");
    return;
  }

  document.getElementById("startSection").style.display = "none";
  document.getElementById("examSection").style.display = "block";
  document.getElementById("examHeader").innerText = "Candidate: " + name;

  generateTest();
  loadQuestion();
  startTimer();
}

// Strict 60 Generator
function getRandom(arr, count) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateTest() {
  selectedQuestions = [];

  selectedQuestions.push(...getRandom(questionBank.arithmetic, 15));
  selectedQuestions.push(...getRandom(questionBank.gk, 15));
  selectedQuestions.push(...getRandom(questionBank.english, 10));
  selectedQuestions.push(...getRandom(questionBank.reasoning, 10));
  selectedQuestions.push(...getRandom(questionBank.currentAffairs, 10));

  selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
}

// Load Question
function loadQuestion() {
  const q = selectedQuestions[currentQuestionIndex];
  const container = document.getElementById("questionBox");
  const labels = ["A", "B", "C", "D"];

  let optionsHTML = "";

  q.options.forEach((opt, i) => {
    const checked =
      userAnswers[currentQuestionIndex] === labels[i] ? "checked" : "";

    optionsHTML += `
      <label class="option">
        <input type="radio" name="option"
          value="${labels[i]}" ${checked}
          onchange="saveAnswer('${labels[i]}')">
        <div><strong>${labels[i]}.</strong> ${opt}</div>
      </label>
    `;
  });

  container.innerHTML = `
    <h4>Question ${currentQuestionIndex + 1} of 60</h4>
    <p>${q.question}</p>
    ${optionsHTML}
  `;
}

// Save Answer
function saveAnswer(value) {
  userAnswers[currentQuestionIndex] = value;
}

// Navigation
function nextQuestion() {
  if (currentQuestionIndex < 59) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

// Timer
function startTimer() {
  const timerDisplay = document.getElementById("timer");

  timerInterval = setInterval(() => {
    totalTime--;

    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    timerDisplay.innerText =
      "Time Left: " +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");

    if (totalTime <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

// Submit
function submitTest() {
  clearInterval(timerInterval);

  let score = 0;
  let attempted = 0;
  let resultHTML = "<h2>Exam Result</h2>";

  selectedQuestions.forEach((q, index) => {
    const correct = q.answer || "N/A";
    const user = userAnswers[index] || "Not Attempted";

    if (user !== "Not Attempted") attempted++;
    if (user === correct) score++;

    resultHTML += `
      <div style="margin-bottom:15px; padding:10px; border-bottom:1px solid #ccc;">
        <p><strong>Q${index + 1}:</strong> ${q.question}</p>
        <p>Your Answer: ${user}</p>
        <p>Correct Answer: ${correct}</p>
      </div>
    `;
  });

  let advice = score >= 50
    ? "Excellent performance. You are exam ready."
    : score >= 35
    ? "Good attempt. Some revision required."
    : "More preparation required. Focus on weak subjects.";

  resultHTML += `
    <h3>Total Score: ${score} / 60</h3>
    <p>Attempted: ${attempted} / 60</p>
    <p><strong>Preparation Advice:</strong> ${advice}</p>
  `;

  document.getElementById("examSection").innerHTML = resultHTML;
}
