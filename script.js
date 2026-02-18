let current = 0;
let answers = [];
let questions = [];
let timeLeft = 3600;
let candidateName = "";
let timerInterval = null;
let fullDatabase = {};

async function loadDatabase() {
    const response = await fetch("database.json");
    fullDatabase = await response.json();
}
loadDatabase();

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function beginTest() {

    candidateName = document.getElementById("candidateName").value.trim();
    if (!candidateName) {
        alert("Enter your name first.");
        return;
    }

    document.getElementById("startSection").style.display = "none";
    document.getElementById("examSection").style.display = "block";

    let mockID = "WBSSC-" + Math.floor(Math.random()*100000);

    document.getElementById("examInfo").innerHTML = `
        <p><strong>Exam Title:</strong> WBSSC Group C & D Mock Test</p>
        <p><strong>Candidate Name:</strong> ${candidateName}</p>
        <p><strong>Mock ID:</strong> ${mockID}</p>
    `;

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
    let letters = ["A","B","C","D"];

    let html = `
        <h4>Question ${current+1} of 60</h4>
        <p class="questionText">${q.question}</p>
        <div class="options">
    `;

    q.options.forEach((opt,i)=>{
        html += `
            <label class="optionRow">
                <input type="radio" name="option" value="${i}"
                ${answers[current]===i?"checked":""}>
                <span><strong>${letters[i]}.</strong> ${opt}</span>
            </label>
        `;
    });

    html += `</div>`;
    document.getElementById("questionBox").innerHTML = html;
}

function saveAnswer(){
    let selected=document.querySelector('input[name="option"]:checked');
    if(selected) answers[current]=parseInt(selected.value);
}

function nextQuestion(){ saveAnswer(); if(current<59){current++;loadQuestion();} }
function prevQuestion(){ saveAnswer(); if(current>0){current--;loadQuestion();} }

function startTimer(){
    timerInterval=setInterval(()=>{
        let m=Math.floor(timeLeft/60);
        let s=timeLeft%60;
        document.getElementById("timer").innerText=`Time Left: ${m}:${s<10?"0":""}${s}`;
        timeLeft--;
        if(timeLeft<0){clearInterval(timerInterval);submitTest();}
    },1000);
}

function submitTest(){

    if(!confirm("Submit Test?")) return;

    saveAnswer();
    clearInterval(timerInterval);

    let score=0;
    let attempted=0;
    let reviewHTML="";

    questions.forEach((q,i)=>{

        if(answers[i]!==undefined){

            attempted++;
            let correctIndex=q.answer;
            let userIndex=answers[i];
            let isCorrect=userIndex===correctIndex;

            if(isCorrect) score++;

            reviewHTML+=`
                <div>
                    <p><strong>Q${i+1}:</strong> ${q.question}</p>
                    <p class="${isCorrect?"correct":"wrong"}">
                        <strong>Your Answer:</strong> ${q.options[userIndex]}
                    </p>
                    <p><strong>Correct Answer:</strong> ${q.options[correctIndex]}</p>
                </div>
                <hr>
            `;
        }
    });

    let percent=((score/60)*100).toFixed(1);

    document.body.innerHTML=`
        <div class="container">
            <h2>Test Result</h2>
            <p><strong>Name:</strong> ${candidateName}</p>
            <p><strong>Score:</strong> ${score}/60 (${percent}%)</p>
            <p><strong>Attempted:</strong> ${attempted}/60</p>
            <hr>
            ${reviewHTML}
            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

/* FULL SCREEN FUNCTION */
function toggleFullScreen(){
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
