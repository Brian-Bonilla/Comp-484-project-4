const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");

let minutes = 0;
let seconds = 0;
let hundredths = 0;
let timerRunning = false;
let timerInterval = null;
let errorCount = 0; // tracks number of mistakes
let wpmDisplay;
let errorsDisplay;
let scoresList;

// Add leading zero to numbers 9 or below (purely for aesthetics):
function addLeadingZero(number) {
  if (number <= 9) {
    return "0" + number;
  } else {
    return number;
  }
}

// Run a standard minute/second/hundredths timer:
function runTimer() {
    hundredths++;
    if (hundredths === 100) {
        hundredths = 0;
        seconds++;
    }
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    theTimer.innerHTML = addLeadingZero(minutes) + ":" + addLeadingZero(seconds) + ":" + addLeadingZero(hundredths);
}

// Match the text entered with the provided text on the page:
function matchText() {
    let textEntered = testArea.value;
    let currentOriginText = document.querySelector("#origin-text p").innerHTML;
    let originTextMatch = currentOriginText.substring(0, textEntered.length);

    if (textEntered === currentOriginText) {
        clearInterval(timerInterval);
        testWrapper.style.borderColor = "#429890";
        saveScore();
    } else {
        if (textEntered === originTextMatch) {
            testWrapper.style.borderColor = "#65CCf3";
        } else {
            testWrapper.style.borderColor = "#E95D0F";

            // increment error count when user types wrong character
            errorCount++;

            // --- SUDDEN DEATH MODE ---
            // if user makes more than 3 mistakes, reset automatically
            if (errorCount > 3) {
                alert("Sudden Death! Too many errors. Starting over...");
                resetEverything();
                return; // stop function from continuing
            }

            errorsDisplay.innerHTML = "Errors: " + errorCount;
        }
    }
    updateStats();
}

// Start the timer:
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(runTimer, 10);
    }
}

// Reset everything:
function resetEverything() {
    minutes = 0;
    seconds = 0;
    hundredths = 0;
    timerRunning = false;
    clearInterval(timerInterval);
    theTimer.innerHTML = "00:00:00";
    testArea.value = "";
    testWrapper.style.borderColor = "grey";
    loadRandomSentence();
    errorCount = 0; // reset error count for fresh start
    wpmDisplay.innerHTML = "WPM: 0";
    errorsDisplay.innerHTML = "Errors: 0";
    startCountdown();
}

// Event listeners for keyboard input and the reset button:
function keyupHandler() {
    startTimer();
    matchText();
}
testArea.addEventListener("keyup", keyupHandler);
resetButton.addEventListener("click", resetEverything);

// --- RANDOMIZATION STRATEGY ---
// Array of 10 sentences to randomly select from
const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Go to the store and buy milk and cookies.",
    "Do not forget about the party tonight.",
    "Soccer is one of the most popular sports in the world.",
    "Coding is a skill that takes practice and patience to learn.",
    "The sun sets in the west and rises in the east.",
    "She sells seashells by the seashore.",
    "The rain in Spain stays mainly in the plain.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question."
];

// Math.random() gives a decimal between 0-1
// Multiplying by sentences.length (10) gives 0-10
// Math.floor() rounds down to a whole number (0-9)
// That number is used as the index to grab a sentence
function loadRandomSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    document.querySelector("#origin-text p").innerHTML = sentences[randomIndex];
}

// Load a random sentence when the page loads
window.onload = function() {
    loadRandomSentence();
    wpmDisplay = document.querySelector("#wpm");
    errorsDisplay = document.querySelector("#errors");
    scoresList = document.querySelector("#scores-list");
    displayTopScores();
    startCountdown();
};

// Function to calculate and display WPM and errors
function updateStats() {
    let totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
        let wpm = Math.round((testArea.value.length / 5) / (totalSeconds / 60));
        wpmDisplay.innerHTML = "WPM: " + wpm;
    }
    errorsDisplay.innerHTML = "Errors: " + errorCount;
}

// Function to save score to local storage
function saveScore() {
    let totalSeconds = minutes * 60 + seconds;
    let wpm = Math.round((testArea.value.length / 5) / (totalSeconds / 60));
    let score = { wpm: wpm, errors: errorCount };
    
    let scores = JSON.parse(localStorage.getItem("typingTestScores")) || [];
    scores.push(score);
    scores.sort((a, b) => b.wpm - a.wpm);
    scores = scores.slice(0, 3);
    localStorage.setItem("typingTestScores", JSON.stringify(scores));
    displayTopScores();
}

// Function to display top scores
function displayTopScores() {
    scoresList.innerHTML = "";
    
    let scores = JSON.parse(localStorage.getItem("typingTestScores")) || [];
    scores.forEach(score => {
        let listItem = document.createElement("li");
        listItem.textContent = `WPM: ${score.wpm}, Errors: ${score.errors}`;
        scoresList.appendChild(listItem);
    });
}

// Countdown Start: disables textarea and counts down 3-2-1-Go!
function startCountdown() {
    testArea.disabled = true;
    let countdownElement = document.getElementById("countdown");
    let countdownTime = 3;

    countdownElement.textContent = countdownTime;
    let countdownInterval = setInterval(() => {
        countdownTime--;
        if (countdownTime > 0) {
            countdownElement.textContent = countdownTime;
        } else {
            clearInterval(countdownInterval);
            countdownElement.textContent = "Go!";
            setTimeout(() => {
                countdownElement.textContent = "";
                testArea.disabled = false;
                testArea.focus();
            }, 500);
        }
    }, 1000);
}