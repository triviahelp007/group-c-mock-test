let current = 0;
let answers = [];
let score = 0;
let questions = [];
let timeLeft = 3600;
let fullDatabase = {};
let candidateName = "";
let mockID = "";

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
        ...shuffle(fullDatabase.gk).slice(0,15),
        ...shuffle(fullDatabase.currentAffairs).slice(0,15),
        ...shuffle(fullDatabase.english).slice(0,10),
        ...shuffle(fullDatabase.arithmetic).slice(0,15),
        ...shuffle(fullDatabase.reasoning).slice(0,5)
    ];

    questions = shuffle(questions);

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

function submitTest() {

    if (!confirm("Submit test?")) return;

    saveAnswer();
    score = 0;

    answers.forEach((ans, i) => {
        if (ans === questions[i].answer) score++;
    });

    let today = new Date().toLocaleDateString();

    document.body.innerHTML = `
        <div class="certificate">
            <h1>Certificate of Completion</h1>
            <h2>WBSSC Group C Mock Examination</h2>
            <hr>

            <p>This is to certify that</p>
            <h2>${candidateName}</h2>
            <p>Mock ID: ${mockID}</p>
            <p>has successfully completed the examination.</p>

            <h2>Score: ${score} / 60</h2>
            <p>Date: ${today}</p>

            <div class="signatureBlock">
                <img src="authority.png" class="signatureImage">
                <p><strong>Examination Authority</strong></p>
            </div>

            <br><br>
            <button onclick="window.print()">Print Certificate</button>
            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

setInterval(() => {

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    let timer = document.getElementById("timer");
    if (timer) {
        timer.innerText =
            "Time Left: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    timeLeft--;

    if (timeLeft < 0) submitTest();

}, 1000);

loadDatabase();
