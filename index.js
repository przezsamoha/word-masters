const letters = document.querySelectorAll('.letter-tile');
const loader = document.querySelector('.loader');
const answerLength = 5;
const rounds = 6;

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;

  const WORD_OF_THE_DAY_URL = 'https://words.dev-apis.com/word-of-the-day';
  const VALIDATE_WORD_URL = 'https://words.dev-apis.com/validate-word';

  const { word } = await fetch(WORD_OF_THE_DAY_URL).then((res) => res.json());
  const wordParts = word.split('');
  let done = false;
  setLoading(false);
  isLoading = false;

  function addLetter(letter) {
    //add letter to the end
    if (currentGuess.length < answerLength) {
      currentGuess += letter;
    } else {
      return;
    }
    //render letter in proper square, the 'answerLength*currentRow' defines proper row for current guess
    letters[currentRow * answerLength + currentGuess.length - 1].innerText =
      letter;
    letters[currentRow * answerLength + currentGuess.length - 1].classList.add(
      'letter-tile-border'
    );
  }

  async function handleEnter() {
    if (currentGuess.length !== answerLength) {
      //do nothing
      return;
    }

    isLoading = true;
    setLoading(true);

    const { validWord } = await fetch(VALIDATE_WORD_URL, {
      method: 'POST',
      body: JSON.stringify({ word: currentGuess }),
    }).then((res) => res.json());

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      handleInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('');
    const map = makeMap(wordParts);

    for (let i = 0; i < answerLength; i++) {
      //mark as correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * answerLength + i].classList.add('mark-as-correct');
        letters[currentRow * answerLength + i].classList.remove(
          'letter-tile-border'
        );
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < answerLength; i++) {
      if (guessParts[i] === wordParts[i]) {
        //do nothing, its solved above
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        // mark as close
        letters[currentRow * answerLength + i].classList.add('mark-as-close');
        letters[currentRow * answerLength + i].classList.remove(
          'letter-tile-border'
        );

        map[guessParts[i]]--;
      } else {
        // mark as wrong
        letters[currentRow * answerLength + i].classList.add('mark-as-wrong');
        letters[currentRow * answerLength + i].classList.remove(
          'letter-tile-border'
        );
      }
    }

    if (currentGuess === word) {
      // win
      
      for (let i = 0; i < answerLength; i++) {
        letters[currentRow * answerLength + i].classList.add('winner');
      }
      done = true;
      // alert('you win')
      return;
    }

    if (currentRow === rounds) {
      alert(`you loose, the word was: ${word}`);
      done = true;
    }

    currentRow++;

    if (currentGuess === word) {
      // win
      alert('you win');
      done = true;
      return;
    } else if (currentRow === rounds) {
      alert(`you loose, the word was: ${word}`);
      done = true;
    }

    currentGuess = '';
  }

  function handleBackspace() {
    // taking one letter from the end
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    // taking one past the last one to render
    letters[currentRow * answerLength + currentGuess.length].innerText = '';
    letters[currentRow * answerLength + currentGuess.length].classList.remove(
      'letter-tile-border'
    );
  }

  function handleInvalidWord() {
    for (let i = 0; i < answerLength; i++) {
      letters[currentRow * answerLength + i].classList.remove('invalid');

      setTimeout(function () {
        letters[currentRow * answerLength + i].classList.add('invalid');
      }, 10);
    }
  }

  document.addEventListener('keydown', function handleKeyPress(event) {
    if (done || isLoading) {
      // do nothing
      return;
    }

    const keyValue = event.key;

    if (isLetter(keyValue)) {
      addLetter(keyValue);
    } else if (keyValue == 'Enter') {
      handleEnter();
    } else if (keyValue == 'Backspace') {
      handleBackspace();
    } else {
      //do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loader.classList.toggle('show', isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
}

init();
