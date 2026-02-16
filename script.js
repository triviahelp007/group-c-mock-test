let current = 0;
let answers = [];
let score = 0;
let TOTAL_QUESTIONS = 60;
let TEST_DURATION = 3600; // 60 minutes
let questions = [];
let timeLeft = TEST_DURATION;

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function startTest() {

    if (sessionStorage.getItem("mockQuestions")) {
        questions = JSON.parse(sessionStorage.getItem("mockQuestions"));
    } else {
        questions = shuffle([...allQuestions]).slice(0, TOTAL_QUESTIONS);
        sessionStorage.setItem("mockQuestions", JSON.stringify(questions));
    }

    loadQuestion();
}

function loadQuestion() {
    let q = questions[current];

    let html = `<h3>Q${current+1}. (${q.section}) ${q.question}</h3>`;

    q.options.forEach((opt, i) => {
        let checked = answers[current] === i ? "checked" : "";
        html += `
        <div>
            <input type="radio" name="option" value="${i}" ${checked}>
            ${opt}
        </div>`;
    });

    document.getElementById("questionBox").innerHTML = html;
}

function nextQuestion() {
    saveAnswer();
    if (current < questions.length - 1) {
        current++;
        loadQuestion();
    }
}

function prevQuestion() {
    saveAnswer();
    if (current > 0) {
        current--;
        loadQuestion();
    }
}

function saveAnswer() {
    let selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        answers[current] = parseInt(selected.value);
    }
}

function submitTest() {
    saveAnswer();
    score = 0;

    answers.forEach((ans, i) => {
        if (ans === questions[i].answer) {
            score++;
        }
    });

    sessionStorage.removeItem("mockQuestions");

    document.body.innerHTML = `
        <div style="text-align:center; margin-top:50px;">
            <h2>Test Completed</h2>
            <h3>Your Score: ${score}/${questions.length}</h3>
            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

startTest();

let timerInterval = setInterval(function () {

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").innerText =
        "Time Left: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    timeLeft--;

    if (timeLeft < 0) {
        clearInterval(timerInterval);
        submitTest();
    }

}, 1000);
