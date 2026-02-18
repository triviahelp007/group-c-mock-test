let current = 0;
let answers = [];
let questions = [];
let timeLeft = 3600;
let candidateName = "";
let timerInterval = null;
let fullDatabase = {};
let mockID = "";

/* LOAD DATABASE */
async function loadDatabase() {
    const response = await fetch("database.json");
    fullDatabase = await response.json();
}
loadDatabase();

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function generateCertificateID() {
    let date = new Date();
    return "WBSSC-CERT-" +
        date.getFullYear().toString().slice(2) +
        (date.getMonth()+1) +
        date.getDate() +
        Math.floor(Math.random()*10000);
}

/* START TEST */
function beginTest() {

    candidateName = document.getElementById("candidateName").value.trim();
    if (!candidateName) {
        alert("Enter your name first.");
        return;
    }

    document.getElementById("startSection").style.display = "none";
    document.getElementById("examSection").style.display = "block";

    mockID = "WBSSC-" + Math.floor(Math.random()*100000);

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

/* LOAD QUESTION */
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

/* TIMER */
function startTimer(){
    timerInterval=setInterval(()=>{
        let m=Math.floor(timeLeft/60);
        let s=timeLeft%60;
        document.getElementById("timer").innerText=`Time Left: ${m}:${s<10?"0":""}${s}`;
        timeLeft--;
        if(timeLeft<0){clearInterval(timerInterval);submitTest();}
    },1000);
}

/* SUBMIT TEST */
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
                <div style="margin-bottom:15px;">
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
    let certificateID = generateCertificateID();

    document.body.innerHTML=`
        <div class="container">
            <h2>Test Result</h2>
            <p><strong>Name:</strong> ${candidateName}</p>
            <p><strong>Score:</strong> ${score}/60 (${percent}%)</p>
            <p><strong>Attempted:</strong> ${attempted}/60</p>

            <br>
            <button onclick="downloadCertificate('${candidateName}',${score},'${percent}','${certificateID}')">
                Download Official Certificate
            </button>

            <hr>
            ${reviewHTML}

            <button onclick="location.reload()">Start New Test</button>
        </div>
    `;
}

/* CERTIFICATE DOWNLOAD */
function downloadCertificate(name,score,percent,certID){

    let today = new Date().toLocaleDateString();

    let certificateHTML = `
    <html>
    <head>
    <title>Certificate</title>
    <style>
        body{
            font-family: Georgia, serif;
            text-align:center;
            padding:40px;
            background:white;
        }
        .certificate{
            border:12px solid gold;
            padding:50px;
            border-radius:15px;
            position:relative;
        }
        .certificate::before{
            content:"";
            position:absolute;
            top:10px;
            left:10px;
            right:10px;
            bottom:10px;
            border:3px solid #c9a227;
            border-radius:10px;
        }
        h1{
            margin-top:30px;
            font-size:32px;
            color:#004aad;
        }
        .certID{
            margin-top:10px;
            font-size:14px;
        }
        .signature{
            margin-top:60px;
        }
    </style>
    </head>
    <body>
        <div class="certificate">
            <img src="logo.png" width="120">
            <h1>Certificate of Achievement</h1>
            <p>This is to certify that</p>
            <h2>${name}</h2>
            <p>has successfully completed</p>
            <h3>WBSSC Group C & D Mock Test</h3>
            <p>Score: <strong>${score}/60 (${percent}%)</strong></p>
            <p class="certID">Certificate ID: ${certID}</p>
            <p>Date: ${today}</p>

            <div class="signature">
                <p>Examination Authority</p>
                <img src="logo.png" width="80">
            </div>
        </div>
    </body>
    </html>
    `;

    let newWin = window.open("", "_blank");
    newWin.document.write(certificateHTML);
    newWin.document.close();
    newWin.focus();
    newWin.print();
}

/* FULLSCREEN (DESKTOP ONLY) */
function toggleFullScreen() {

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const btn = document.querySelector('button[onclick="toggleFullScreen()"]');

    if (isMobile) {
        alert("Full screen mode available only on Desktop / Laptop.");
        return;
    }

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

/* CHANGE BUTTON TEXT */
document.addEventListener("fullscreenchange", () => {

    const btn = document.querySelector('button[onclick="toggleFullScreen()"]');

    if (document.fullscreenElement) {
        btn.innerText = "Exit Full Screen";
    } else {
        btn.innerText = "Full Screen";
    }

});
