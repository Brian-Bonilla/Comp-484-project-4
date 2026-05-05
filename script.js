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
let errorCount = 0;
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
        saveScore(); // Save score when the test is completed
    } else {
        if (textEntered === originTextMatch) {
            testWrapper.style.borderColor = "#65CCf3";
        } else {
            testWrapper.style.borderColor = "#E95D0F";
            errorCount++;
            errorsDisplay.innerHTML = "Errors: " + errorCount;
        }
    }
    updateStats()
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
    loadRandomSentence(); // Load a new random sentence on reset
    errorCount = 0;
    wpmDisplay.innerHTML = "WPM: 0";
    errorsDisplay.innerHTML = "Errors: 0";
}

// Event listeners for keyboard input and the reset button:
function keyupHandler() {
    startTimer();
    matchText();
}
testArea.addEventListener("keyup", keyupHandler);
resetButton.addEventListener("click", resetEverything);

//sentences for testing
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

// Function to load a random sentence into the origin text area
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
    displayTopScores(); // Display top scores on page load
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
    scores.sort((a, b) => b.wpm - a.wpm); // Sort by WPM in descending order
    scores = scores.slice(0, 3); // Keep only top 3 scores
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