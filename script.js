const questionElement = document.getElementById("question");
const wordDisplayElement = document.getElementById("wordDisplay");
const keyboardElement = document.getElementById("keyboard");
const livesElement = document.getElementById("lives");
const messageElement = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");

let questions = [];
let currentQuestion = {};
let wordToGuess = "";
let wordDisplay = [];
let lives = 6;
let gameActive = false;

async function fetchQuestions() {
  try {
    const response = await fetch(
      "http://codeapi.net.cws18.my-hosting-panel.com/hangman.php"
    );
    questions = await response.json();

    if (!questions || questions.length === 0) {
      console.log("API returned empty response. Loading data from local file.");
      await fetchLocalData();
    } else {
      startNewGame();
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    await fetchLocalData();
  }
}

async function fetchLocalData() {
  try {
    const response = await fetch("data.json");
    questions = await response.json();
    startNewGame();
  } catch (error) {
    console.error("Error fetching local data:", error);
    questionElement.textContent =
      "Error loading questions. Please try again later.";
  }
}

function initializeKeyboard() {
  keyboardElement.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const keyButton = document.createElement("button");
    keyButton.classList.add("key");
    keyButton.textContent = letter;
    keyButton.addEventListener("click", () => handleLetterClick(letter));
    keyboardElement.appendChild(keyButton);
  }
}

function startNewGame() {
  lives = 6;
  livesElement.textContent = lives;
  messageElement.textContent = "";
  messageElement.className = "message";
  gameActive = true;

  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.disabled = false;
    key.classList.remove("correct", "wrong");
  });

  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  questionElement.textContent = currentQuestion.Question;

  wordToGuess = currentQuestion.Answer.toUpperCase();
  wordDisplay = Array(wordToGuess.length).fill("_");

  for (let i = 0; i < wordToGuess.length; i++) {
    if (wordToGuess[i] === " ") {
      wordDisplay[i] = " ";
    }
  }

  updateWordDisplay();
}

function updateWordDisplay() {
  wordDisplayElement.innerHTML = "";
  wordDisplay.forEach((char) => {
    const letterElement = document.createElement("div");
    letterElement.classList.add("letter");
    letterElement.textContent = char;
    wordDisplayElement.appendChild(letterElement);
  });
}

function handleLetterClick(letter) {
  if (!gameActive) return;

  const clickedButton = [...document.querySelectorAll(".key")].find(
    (key) => key.textContent === letter
  );
  clickedButton.disabled = true;

  let letterFound = false;
  for (let i = 0; i < wordToGuess.length; i++) {
    if (wordToGuess[i] === letter) {
      wordDisplay[i] = letter;
      letterFound = true;
    }
  }

  if (letterFound) {
    clickedButton.classList.add("correct");
    updateWordDisplay();

    if (!wordDisplay.includes("_")) {
      gameActive = false;
      messageElement.textContent = "Congratulations! You have won!";
      messageElement.classList.add("win");
    }
  } else {
    clickedButton.classList.add("wrong");
    lives--;
    livesElement.textContent = lives;

    if (lives === 0) {
      gameActive = false;
      messageElement.textContent = `Game Over! The answer was: ${wordToGuess}`;
      messageElement.classList.add("lose");
    }
  }
}

newGameBtn.addEventListener("click", startNewGame);

document.addEventListener("DOMContentLoaded", () => {
  initializeKeyboard();
  fetchQuestions();
});