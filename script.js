let current = 0;
let answers = [];
let score = 0;
let questions = [];
let timeLeft = 3600;
let fullDatabase = {};

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

async function loadDatabase() {
    const response = await fetch("database.json");
    fullDatabase = await response.json();
    startTest();
}

function pickQuestions(sectionArray, count) {
    let shuffled = shuffle([...sectionArray]);
    return shuffled.slice(0, count);
}

function startTest() {

    if (sessionStorage.getItem("mockQuestions")) {
        questions = JSON.parse(sessionStorage.getItem("mockQuestions"));
    } else {

        questions = [
            ...pickQuestions(fullDatabase.gk, 15),
            ...pickQuestions(fullDatabase.currentAffairs, 15),
            ...pickQuestions(fullDatabase.english, 10),
            ...pickQuestions(fullDatabase.arithmetic, 15),
            ...pickQuestions(fullDatabase.reasoning, 5)
        ];

        questions = shuffle(questions);

        sessionStorage.setItem("mockQuestions", JSON.stringify(questions));
    }

    loadQuestion();
}

function loadQuestion() {
    let q = questions[current];

    let html = `<h3>Q${current+1}. ${q.question}</h3>`;

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
            <h3>Your Score: ${score}/60</h3>
            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

setInterval(function () {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").innerText =
        "Time Left: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    timeLeft--;

    if (timeLeft < 0) {
        submitTest();
    }

}, 1000);

loadDatabase();
