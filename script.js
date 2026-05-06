document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const welcomeScreen = document.getElementById("welcome-screen");
  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");
  const livesDisplay = document.getElementById("lives");
  const scoreDisplay = document.getElementById("score");
  const missionNumDisplay = document.getElementById("mission-num");
  const timerDisplay = document.getElementById("timer");
  const missionTextDisplay = document.getElementById("mission-text");
  const optionsContainer = document.getElementById("options-container");
  const statusMessage = document.getElementById("status-message");
  const finalResult = document.getElementById("final-result");
  const finalScore = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const exitBtn = document.getElementById("exit-btn");
  const historyBtn = document.getElementById("match-history");
  const historyScreen = document.getElementById("history-screen");
  const historyList = document.getElementById("history-list");
  const closeHistory = document.getElementById("close-history");

  let missions = [];
  let score = 0;
  let lives = 3;
  let currentMission = 0;
  let timeLeft = 10;
  let timeInterval;

  let matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];

  function decodeText(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  }

  async function fetchMission() {
    statusMessage.textContent = "Mission Loading Agent....";

    try {
      const url =
        "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple";
      const response = await fetch(url);
      const data = await response.json();

      missions = data.results.map((item) => {
        const options = [...item.incorrect_answers, item.correct_answer];
        options.sort(() => Math.random() - 0.5);

        return {
          question: decodeText(item.question),
          options: options.map((op) => decodeText(op)),
          answer: decodeText(item.correct_answer),
        };
      });
    } catch (error) {
      statusMessage.textContent = "Mission Server Failed!";
    }
  }

  startBtn.addEventListener("click", async () => {
    welcomeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    resetGameVariables();

    await fetchMission();
    showMission();
    updateDashBoard();
  });

  function showMission() {
    optionsContainer.innerHTML = "";
    statusMessage.textContent = "";
    missionTextDisplay.textContent = missions[currentMission].question;

    clearInterval(timeInterval);
    timeLeft = 10;
    updateDashBoard();

    timeInterval = setInterval(() => {
      timeLeft--;
      updateDashBoard();

      if (timeLeft === 0) {
        clearInterval(timeInterval);
        lives--;
        optionsContainer.innerHTML = "";
        missionTextDisplay.textContent = "";
        statusMessage.textContent = "Time Up Agent!";
        currentMission++;
        updateDashBoard();

        setTimeout(() => {
          if (lives === 0 || currentMission === missions.length) {
            endGame();
          } else {
            showMission();
          }
        }, 1500);
      }
    }, 1000);

    missions[currentMission].options.forEach((choice) => {
      const li = document.createElement("li");
      li.textContent = choice;
      li.addEventListener("click", () => checkAnswer(choice));
      optionsContainer.appendChild(li);
    });
  }

  function checkAnswer(choice) {
    clearInterval(timeInterval);

    optionsContainer.innerHTML = "";
    missionTextDisplay.textContent = "";

    const correctAnswer = missions[currentMission].answer;

    if (choice === correctAnswer) {
      score++;
      statusMessage.textContent = "Correct Choice Agent!";
    } else {
      lives--;
      statusMessage.textContent = "Wrong Choice Agent!";
    }

    currentMission++;
    updateDashBoard();

    setTimeout(() => {
      if (lives === 0 || currentMission === missions.length) {
        endGame();
      } else {
        showMission();
      }
    }, 1500);
  }

  function updateDashBoard() {
    livesDisplay.textContent = `Lives : ${lives}`;
    scoreDisplay.textContent = `Score : ${score}`;
    missionNumDisplay.textContent = `Mission-Number : ${Math.min(currentMission + 1, missions.length)}`;
    timerDisplay.textContent = `Timer : ${timeLeft}`;
  }

  function endGame() {
    saveMatchHistory();

    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
    showFinalResult();
  }

  function showFinalResult() {
    if (lives == 0) {
      finalResult.textContent = "Agent! You couldn't clear the mission.";
    } else if (lives > 0 && score == missions.length)
      finalResult.textContent = "Congratulations Agent!You did it!!!";
    else
      finalResult.textContent =
        "Agent!!You did well to see the end to challenge but for your skills performance could have been better....";

    finalScore.textContent = `Final Score = ${score} / ${missions.length}`;
  }
  restartBtn.addEventListener("click", async () => {
    resetGameVariables();
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    await fetchMission();
    showMission();
    updateDashBoard();
  });

  exitBtn.addEventListener("click", () => {
    resetGameVariables();
    endScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
  });

  function saveMatchHistory() {
    let matchResult;
    if (score <= missions.length / 3) matchResult = "Defeat";
    else if (score >= (2 * missions.length) / 3)
      matchResult = "Perfect Victory!!!";
    else matchResult = "Good Game";

    const match = {
      score: score,
      total: missions.length,
      result: matchResult,
      time: new Date().toLocaleString(),
    };
    matchHistory.push(match);
    localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
  }

  historyBtn.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    historyScreen.classList.remove("hidden");
    showHistory();
  });

  closeHistory.addEventListener("click", () => {
    welcomeScreen.classList.remove("hidden");
    historyScreen.classList.add("hidden");
  });

  function showHistory() {
    historyList.innerHTML = "";
    if (matchHistory.length == 0) {
      historyList.textContent = "No match played yet";
      return;
    }

    [...matchHistory].reverse().forEach((match) => {
      const historyli = document.createElement("li");
      historyli.innerHTML = `
      Score: ${match.score}/${match.total} | 
      Result: ${match.result} | 
      Time: ${match.time}`;

      historyList.appendChild(historyli);
    });
  }

  function resetGameVariables() {
    clearInterval(timeInterval);
    score = 0;
    lives = 3;
    currentMission = 0;
    timeLeft = 10;
    statusMessage.textContent = "";
  }
});
