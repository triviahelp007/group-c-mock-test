let questions = [];
let current = 0;
let answers = [];
let score = 0;
let TOTAL_QUESTIONS = 60;

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function startTest() {
    // Shuffle and take only 60 questions
    questions = shuffle([...allQuestions]).slice(0, TOTAL_QUESTIONS);
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

    document.body.innerHTML = `
        <div style="text-align:center; margin-top:50px;">
            <h2>Test Completed</h2>
            <h3>Your Score: ${score}/${questions.length}</h3>
        </div>
    `;
}

startTest();

let time = 3600;

setInterval(function () {
    let m = Math.floor(time / 60);
    let s = time % 60;

    document.getElementById("timer").innerText =
        "Time Left: " + m + ":" + (s < 10 ? "0" : "") + s;

    time--;

    if (time <= 0) {
        submitTest();
    }
}, 1000);
