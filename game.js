const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const nextButton = document.getElementById('next-btn'); // Reference to Next Question button
const popup = document.getElementById('popup'); // Reference to pop-up notification

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

// Fetch questions from local JSON file
fetch('questions.json')
  .then((res) => res.json())
  .then((loadedQuestions) => {
    questions = loadedQuestions.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };

      const answerChoices = [
        loadedQuestion.choice1,
        loadedQuestion.choice2,
        loadedQuestion.choice3,
        loadedQuestion.choice4,
      ];
      formattedQuestion.answer = loadedQuestion.answer;

      answerChoices.forEach((choice, index) => {
        formattedQuestion['choice' + (index + 1)] = choice;
      });

      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

// CONSTANTS
const CORRECT_BONUS = 1;
const MAX_QUESTIONS = 20;

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  game.classList.remove('hidden');
  loader.classList.add('hidden');
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem('mostRecentScore', score);
    return window.location.assign('./end.html');
  }
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset['number'];
    choice.innerText = currentQuestion['choice' + number];
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
  nextButton.classList.add('hidden'); // Hide the next button initially
};

choices.forEach((choice) => {
  choice.addEventListener('click', (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset['number'];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

    selectedChoice.parentElement.classList.add(classToApply);

    // Increment score if the answer is correct
    if (classToApply === 'correct') {
      incrementScore(CORRECT_BONUS);
      showPopup("Very Good!", true); // Pass true for correct answer
    } else {
      showPopup("Incorrect!", false); // Pass false for incorrect answer
      // Show the correct answer if the selected answer is incorrect
      choices.forEach((choice) => {
        if (choice.dataset['number'] == currentQuestion.answer) {
          choice.parentElement.classList.add('correct');
        }
      });
    }

    // Show the next question button
    nextButton.classList.remove('hidden');
  });
});

// Function to show pop-up messages
function showPopup(message, isCorrect) {
  popup.innerText = message;
  
  // Set the styles based on correctness
  if (isCorrect) {
    popup.style.backgroundColor = 'white';
    popup.style.color = 'green';
    popup.style.border = '2px solid green';
  } else {
    popup.style.backgroundColor = 'white';
    popup.style.color = 'red';
    popup.style.border = '2px solid red';
  }
  
  popup.classList.remove('hidden');
  popup.classList.add('visible');

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('visible');
    popup.classList.add('hidden');
  }, 1500);
}

// Add event listener for the Next Question button
nextButton.addEventListener('click', () => {
  // Remove highlight before proceeding
  choices.forEach((choice) => {
    choice.parentElement.classList.remove('correct');
    choice.parentElement.classList.remove('incorrect');
  });

  getNewQuestion(); // Load the next question
});

// Function to increment score
function incrementScore(num) {
  score += num;
  scoreText.innerText = score;
}
