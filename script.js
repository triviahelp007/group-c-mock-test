let questionBank = {};
let selectedQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;
let totalTime = 60 * 60; // 1 hour

// Load JSON
fetch("production_final_database.json")
  .then(res => res.json())
  .then(data => {
    questionBank = data;
  });

// -------- START TEST --------
function beginTest() {
  const name = document.getElementById("candidateName").value.trim();
  if (!name) {
    alert("Please enter your full name.");
    return;
  }

  document.getElementById("startSection").style.display = "none";
  document.getElementById("examSection").style.display = "block";
  document.getElementById("examHeader").innerText = "Candidate: " + name;

  generateTest();
  loadQuestion();
  startTimer();
}

// -------- STRICT 60 GENERATION --------
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

// -------- LOAD SINGLE QUESTION --------
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
        <input type="radio" name="option" value="${labels[i]}" ${checked}
        onchange="saveAnswer('${labels[i]}')">
        <strong>${labels[i]}.</strong> ${opt}
      </label>
    `;
  });

  container.innerHTML = `
    <h4>Question ${currentQuestionIndex + 1} of 60</h4>
    <p>${q.question}</p>
    ${optionsHTML}
  `;
}

// -------- SAVE ANSWER --------
function saveAnswer(value) {
  userAnswers[currentQuestionIndex] = value;
}

// -------- NAVIGATION --------
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

// -------- TIMER --------
function startTimer() {
  const timerDisplay = document.getElementById("timer");

  timerInterval = setInterval(() => {
    totalTime--;

    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    timerDisplay.innerText =
      "Time Left: " +
      minutes.toString().padStart(2, "0") + ":" +
      seconds.toString().padStart(2, "0");

    if (totalTime <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

// -------- SUBMIT --------
function submitTest() {
  clearInterval(timerInterval);

  let score = 0;
  let attempted = 0;
  let reviewHTML = "<h2>Exam Result</h2>";

  selectedQuestions.forEach((q, index) => {
    const correctAnswer = q.answer || "N/A";
    const userAnswer = userAnswers[index] || "Not Attempted";

    if (userAnswer !== "Not Attempted") attempted++;
    if (userAnswer === correctAnswer) score++;

    reviewHTML += `
      <div style="margin-bottom:15px;">
        <p><strong>Q${index + 1}:</strong> ${q.question}</p>
        <p>Your Answer: ${userAnswer}</p>
        <p>Correct Answer: ${correctAnswer}</p>
      </div>
    `;
  });

  let advice = "";
  if (score >= 50) {
    advice = "Excellent performance. You are exam ready.";
  } else if (score >= 35) {
    advice = "Good attempt. Some revision required.";
  } else {
    advice = "You need more preparation. Focus on weak subjects.";
  }

  reviewHTML += `
    <h3>Total Score: ${score} / 60</h3>
    <p>Attempted: ${attempted} / 60</p>
    <p><strong>Preparation Advice:</strong> ${advice}</p>
  `;

  document.getElementById("examSection").innerHTML = reviewHTML;
}
