let questionBank = {};
let selectedQuestions = [];
let userAnswers = {};
let timerInterval;
let totalTime = 60 * 60;

fetch("production_final_database.json")
  .then(res => res.json())
  .then(data => {
    questionBank = data;
    startTest();
  });

function getRandom(arr, count) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function startTest() {
  selectedQuestions = [];

  selectedQuestions.push(...getRandom(questionBank.arithmetic, 15));
  selectedQuestions.push(...getRandom(questionBank.gk, 15));
  selectedQuestions.push(...getRandom(questionBank.english, 10));
  selectedQuestions.push(...getRandom(questionBank.reasoning, 10));
  selectedQuestions.push(...getRandom(questionBank.currentAffairs, 10));

  selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

  renderQuestions();
  startTimer();
}

function renderQuestions() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  selectedQuestions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question-block";

    const labels = ["A", "B", "C", "D"];

    let optionsHTML = "";
    q.options.forEach((opt, i) => {
      optionsHTML += `
        <label class="option">
          <input type="radio" name="q${index}" value="${labels[i]}" 
          onchange="saveAnswer(${index}, '${labels[i]}')">
          <strong>${labels[i]}.</strong> ${opt}
        </label>
      `;
    });

    div.innerHTML = `
      <p class="question-number">Q${index + 1}. ${q.question}</p>
      ${optionsHTML}
    `;

    container.appendChild(div);
  });
}

function saveAnswer(index, value) {
  userAnswers[index] = value;
}

function startTimer() {
  const timerDisplay = document.getElementById("timer");

  timerInterval = setInterval(() => {
    totalTime--;

    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    timerDisplay.textContent =
      minutes.toString().padStart(2, "0") + ":" +
      seconds.toString().padStart(2, "0");

    if (totalTime <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function submitTest() {
  clearInterval(timerInterval);

  let score = 0;
  let attempted = 0;
  let resultHTML = "<h2>Answer Review</h2>";

  selectedQuestions.forEach((q, index) => {
    const correctAnswer = q.answer || "N/A";
    const userAnswer = userAnswers[index] || "Not Attempted";

    if (userAnswer !== "Not Attempted") attempted++;
    if (userAnswer === correctAnswer) score++;

    resultHTML += `
      <div class="review-block">
        <p><strong>Q${index + 1}:</strong> ${q.question}</p>
        <p>Your Answer: ${userAnswer}</p>
        <p>Correct Answer: ${correctAnswer}</p>
      </div>
    `;
  });

  let preparationAdvice = "";

  if (score >= 50) {
    preparationAdvice = "Excellent performance. You are exam ready.";
  } else if (score >= 35) {
    preparationAdvice = "Good attempt. Minor revision needed.";
  } else {
    preparationAdvice = "More preparation required. Focus on weak subjects.";
  }

  resultHTML += `
    <h3>Total Score: ${score} / 60</h3>
    <p>Attempted: ${attempted} / 60</p>
    <p><strong>Preparation Advice:</strong> ${preparationAdvice}</p>
  `;

  document.getElementById("quiz-container").innerHTML = "";
  document.getElementById("result-container").innerHTML = resultHTML;
}
