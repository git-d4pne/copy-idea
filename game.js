const question = document.getElementById('question');
const questionImage = document.getElementById('question-image'); // Reference to the question image
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const nextButton = document.getElementById('next-btn'); // Reference to Next Question button
const popup = document.getElementById('popup'); // Reference to the popup

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

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

      // Include image if it exists
      if (loadedQuestion.image) {
        formattedQuestion.image = loadedQuestion.image;
      }

      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

// CONSTANTS
const CORRECT_BONUS = 10;
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

  // Display the image if it exists
  if (currentQuestion.image) {
    questionImage.src = currentQuestion.image; // Set the image source
    questionImage.style.display = 'block'; // Show the image
  } else {
    questionImage.style.display = 'none'; // Hide the image if no image is available
  }

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

    if (classToApply === 'incorrect') {
      choices.forEach((choice) => {
        if (choice.dataset['number'] == currentQuestion.answer) {
          choice.parentElement.classList.add('correct');
        }
      });
    }

    // Update score and show popup
    if (classToApply === 'correct') {
      score += CORRECT_BONUS;
      showPopup("Very Good!", "correct"); // Show popup for correct answer
    } else {
      showPopup("Incorrect", "incorrect"); // Show popup for incorrect answer
    }

    scoreText.innerText = score; // Update score display
    // Show the next question button
    nextButton.classList.remove('hidden');
  });
});

// Show the popup with appropriate styling and message
const showPopup = (message, result) => {
  popup.innerText = message;
  popup.classList.remove('hidden');
  popup.classList.add('visible');

  // Apply styles based on result
  if (result === "correct") {
    popup.style.border = "0.5rem solid green";
    popup.style.color = "green";
    popup.style.backgroundColor = "white";
  } else {
    popup.style.border = "0.5rem solid red";
    popup.style.color = "red";
    popup.style.backgroundColor = "white";
  }

  // Hide popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('visible');
    popup.classList.add('hidden');
  }, 3000);
};

// Add event listener for the Next Question button
nextButton.addEventListener('click', () => {
  // Remove highlight before proceeding
  choices.forEach((choice) => {
    choice.parentElement.classList.remove('correct');
    choice.parentElement.classList.remove('incorrect');
  });

  getNewQuestion(); // Load the next question
});
