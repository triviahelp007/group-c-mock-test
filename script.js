let current = 0;
let answers = [];
let questions = [];
let timeLeft = 3600;
let candidateName = "";
let timerInterval = null;

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
    let letters=["A","B","C","D"];
    let reviewHTML="";
    let subjectStats={};

    questions.forEach((q,i)=>{
        if(answers[i]!==undefined){
            attempted++;
            let correct=q.answer;
            let isCorrect=answers[i]===correct;
            if(isCorrect) score++;

            if(!subjectStats[q.subject])
                subjectStats[q.subject]={total:0,correct:0};

            subjectStats[q.subject].total++;
            if(isCorrect) subjectStats[q.subject].correct++;

            reviewHTML+=`
                <div>
                    <p><strong>Q${i+1}:</strong> ${q.question}</p>
                    <p class="${isCorrect?"correct":"wrong"}">
                        Your Answer: ${letters[answers[i]]} |
                        Correct: ${letters[correct]}
                    </p>
                </div><hr>
            `;
        }
    });

    let analysisHTML="";
    for(let sub in subjectStats){
        let percent=((subjectStats[sub].correct/subjectStats[sub].total)*100).toFixed(0);
        let level=percent>=70?"Strong":
                  percent>=40?"Moderate":"Weak";
        analysisHTML+=`<p><strong>${sub}:</strong> ${percent}% (${level})</p>`;
    }

    let overallPercent=((score/60)*100).toFixed(1);
    let improvement=60-score;

    document.body.innerHTML=`
    <div class="container">
        <h2>Test Result</h2>
        <p><strong>Name:</strong> ${candidateName}</p>
        <p><strong>Score:</strong> ${score}/60 (${overallPercent}%)</p>
        <p><strong>Attempted:</strong> ${attempted}/60</p>

        <div class="analysisBox">
            <h3>Performance Analysis</h3>
            ${analysisHTML}
            <p><strong>Preparation Needed:</strong> Improve ${improvement} more marks to reach full score.</p>
        </div>

        <br>
        <button onclick="printCertificate('${candidateName}',${score},'${overallPercent}')">
            Print Certificate
        </button>

        <hr>
        <h3>Answer Review (Attempted Only)</h3>
        ${reviewHTML}

        <br>
        <button onclick="location.reload()">Start New Test</button>
    </div>
    `;
}

function printCertificate(name,score,percent){

    let win=window.open('','_blank');
    win.document.write(`
        <html>
        <head>
        <title>Certificate</title>
        <style>
        body{text-align:center;font-family:Arial;padding:40px;}
        h1{margin-top:40px;}
        </style>
        </head>
        <body>
            <img src="logo.png" width="120">
            <h1>Certificate of Achievement</h1>
            <p>This certifies that</p>
            <h2>${name}</h2>
            <p>has successfully completed WBSSC Group C Mock Test</p>
            <h3>Score: ${score}/60 (${percent}%)</h3>
            <br><br>
            <p>Examination Authority</p>
            <img src="logo.png" width="80">
        </body>
        </html>
    `);
    win.print();
}
