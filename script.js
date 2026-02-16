let questions = [];
let current = 0;
let answers = [];
let score = 0;

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function startTest() {
    questions = shuffle(allQuestions);
    loadQuestion();
}

function loadQuestion() {
    let q = questions[current];
    let html = `<h3>Q${current+1}. (${q.section}) ${q.question}</h3>`;
    
    q.options.forEach((opt, i) => {
        html += `
        <div>
            <input type="radio" name="option" value="${i}">
            ${opt}
        </div>`;
    });

    document.getElementById("questionBox").innerHTML = html;
}

function nextQuestion() {
    saveAnswer();
    if(current < questions.length - 1){
        current++;
        loadQuestion();
    }
}

function prevQuestion() {
    if(current > 0){
        current--;
        loadQuestion();
    }
}

function saveAnswer() {
    let selected = document.querySelector('input[name="option"]:checked');
    if(selected){
        answers[current] = parseInt(selected.value);
    }
}

function submitTest() {
    saveAnswer();
    score = 0;
    answers.forEach((ans, i) => {
        if(ans === questions[i].answer){
            score++;
        }
    });
    alert("Your Score: " + score + "/" + questions.length);
}

startTest();

let time = 3600;
setInterval(function(){
    let m = Math.floor(time/60);
    let s = time%60;
    document.getElementById("timer").innerText =
    "Time Left: " + m + ":" + (s<10?"0":"") + s;
    time--;
    if(time <= 0){
        submitTest();
    }
},1000);
