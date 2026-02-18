let current = 0;
let answers = [];
let score = 0;
let questions = [];
let timeLeft = 3600;
let fullDatabase = {};
let candidateName = "";
let mockID = "";
let timerInterval = null;

async function loadDatabase() {
    const response = await fetch("database.json");
    fullDatabase = await response.json();
}

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function generateMockID() {
    return "WBSSC-" + Math.floor(Math.random() * 100000);
}

function beginTest() {

    candidateName = document.getElementById("candidateName").value.trim();
    if (candidateName === "") {
        alert("Enter your name first.");
        return;
    }

    mockID = generateMockID();

    document.getElementById("startSection").style.display = "none";
    document.getElementById("examSection").style.display = "block";

    document.getElementById("examHeader").innerHTML =
        "Candidate: " + candidateName + " | Mock ID: " + mockID;

    questions = [
        ...shuffle(fullDatabase.arithmetic).slice(0,15),
        ...shuffle(fullDatabase.gk).slice(0,15),
        ...shuffle(fullDatabase.english).slice(0,10),
        ...shuffle(fullDatabase.reasoning).slice(0,10),
        ...shuffle(fullDatabase.currentAffairs).slice(0,10)
    ];

    questions = shuffle(questions);

    startTimer();
    loadQuestion();
}

function loadQuestion() {

    let q = questions[current];
    let letters = ["A", "B", "C", "D"];

    let html = `
        <div class="questionContainer">
            <h4>Question ${current+1} of 60</h4>
            <p class="questionText">${q.question}</p>
            <div class="options">
    `;

    q.options.forEach((opt, i) => {
        html += `
            <div class="optionRow">
                <input type="radio" name="option" value="${i}"
                ${answers[current] === i ? "checked" : ""}>
                <span class="optionLabel">${letters[i]}.</span>
                <span>${opt}</span>
            </div>
        `;
    });

    html += `</div></div>`;

    document.getElementById("questionBox").innerHTML = html;
}

function saveAnswer() {
    let selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        answers[current] = parseInt(selected.value);
    }
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

function startTimer() {
    timerInterval = setInterval(() => {

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
}

function submitTest() {

    if (!confirm("Submit test?")) return;

    saveAnswer();
    clearInterval(timerInterval);

    score = 0;
    let letters = ["A", "B", "C", "D"];
    let reviewHTML = "";

    answers.forEach((ans, i) => {

        if (ans !== undefined) {

            let correct = questions[i].answer;

            if (ans === correct) score++;

            reviewHTML += `
                <div>
                    <p><strong>Question ${i+1}:</strong> ${questions[i].question}</p>
                    <p>Your Answer: ${letters[ans]}</p>
                    <p>Correct Answer: ${letters[correct]}</p>
                </div>
                <hr>
            `;
        }
    });

    let percentage = ((score / 60) * 100).toFixed(1);

    document.body.innerHTML = `
        <div class="container">
            <h2>Test Result</h2>
            <p><strong>Candidate:</strong> ${candidateName}</p>
            <p><strong>Score:</strong> ${score} / 60 (${percentage}%)</p>
            <hr>
            ${reviewHTML}
            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

loadDatabase();
