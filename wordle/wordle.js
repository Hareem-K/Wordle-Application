//global variables
var height = 4; //number of guesses
var width = 4; //length of word
var hint;

//current guessing posiiton
var row = 0; //current guess (attempt #)
var col = 0; //current letter for that attempt
var value;
var words;
var word;
var dictionary;

var gameOver = false;

//making dictionary and getting a random word/hint
const apiKey = "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv";
const apiUrl = "https://api.masoudkf.com/v1/wordle";

fetch(apiUrl, {
  headers: {
    "x-api-key": apiKey,
  },
})
.then((response) => { 
    if (response.ok) {
        return response.json();
    } 
    else {
        throw new Error("Request failed with status " + response.status);
    }
})
.then((data) => {
    console.log("data:", data);
    const localdictionary = data.dictionary;
    dictionary = localdictionary;
    console.log("dictionary:", dictionary);
    const localWords = Object.keys(dictionary);

    console.log("words:", localWords);

    words = localWords; // assign localWords to global words variable

    const randomIndex = Math.floor(Math.random() * words.length);
    word = dictionary[randomIndex].word.toUpperCase();
    value = dictionary[randomIndex].hint;

    console.log("word:", word);
    console.log("value:", value);

    initialize(); // call the initialize function after the value has been set
})

.catch((error) => {
    const message = error.message || "Unknown error";
    const stack = error.stack || "No stack trace available";
    console.error(`Error caught: ${message}\nStack trace: ${stack}`);
    console.log("error object:", error);
});


function initialize() {

    //create game board
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            // <span id= "0-0" class = "tile">P</span>
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }

    //add event listener to the hint button
    document.getElementById("hint").addEventListener("click", getHint);

    //Listen for Key Press (user must finish clicking a key for it to input)
    document.addEventListener("keyup", (e) => {
        if (gameOver) return; 

        //If a key from A-Z is pressed
        if ("KeyA" <= e.code && e.code <= "KeyZ") {
            if (col < width) {
                let currTile = document.getElementById(row.toString() + '-' + col.toString());
                if (currTile.innerText == "") {
                    currTile.innerText = e.code[3];
                    col += 1;
                }
            }
        }
        
        //if backspace is pressed, one inputted key is removed
        else if (e.code == "Backspace") {
            if (0 < col && col <= width) {
                col -=1;
            }
            let currTile = document.getElementById(row.toString() + '-' + col.toString());
            currTile.innerText = "";
        }
        
        //if Enter is pressed, start at beginning of next row
        else if (e.code == "Enter") {
            while (col < width) {
                dropdown();
            }
            update();
            row += 1; //start new row
            col = 0; //start at 0 for new row 
        }

        //if all attempts used (row = height), display correct word to user
        if (!gameOver && row == height) {
            gameOver = true;
            displayLostMessage()
        }

        // add event listener to the hint button
        document.getElementById("hint").addEventListener("click", getHint);
    })
}

function update() {
    let correct = 0;
    let letterCount = {} //FOUR -> {F:1, O:1, U:1, R:1}
    for (let i = 0; i < word.length; i++) {
        letter = word[i];
        if (letterCount[letter]) {
            letterCount[letter] += 1;
        }
        else {
            letterCount[letter] = 1;
        }
    }

    // first iteration through map: check all correct ones

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
    
        //check if letter is in correct position
        //if the letter is in the correct position, call correct class (green)
        if (word[c] == letter) {
            currTile.classList.add("correct");
            correct += 1;
            letterCount[letter] -= 1;
        }
 
        //if user guesses the word before using up all attempts
        if (correct == width) {
            gameOver = true
            displayImage();
        }
    }

    //second iteration: mark which ones are present but in wrong position
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
      
        if (!currTile.classList.contains("correct")) {
            //check is letter is in the word
            //if the letter is present in the word, call present class (yellow)
            if (word.includes(letter) && letterCount[letter] > 0) {
                currTile.classList.add("present")
                letterCount[letter] -= 1;
            }

            //if the letter is not in the word, call absent class (grey)
            else {
                currTile.classList.add("absent")
            }
        }
    }
}


//this function displays the congrats image
function displayImage() {
    var img = document.createElement("img");
    img.src = 'https://res.cloudinary.com/mkf/image/upload/v1675467141/ENSF-381/labs/congrats_fkscna.gif';
    img.id = "gameOver";
    img.classList.add("imageFeatures");
    document.body.appendChild(img);
    document.querySelector('#openSideBar').disabled = true;
    //document.querySelector('#hint').disabled = true;
    document.getElementById("board").style.visibility = "hidden";
    document.getElementById("answer").style.visibility = "hidden";
    document.getElementById("lostGame").style.display = "none";
    displayWinMessage()
}

//this function is called when the dark-mode button is clicked   
function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}
 
//this function is called when "Enter/Return is pressed but word is not complete"
function dropdown() {
    window.alert("first complete the word");
    if ((e.code == "Enter") && (col < width)) {
      row = 0;
      col = 0;
    }
}

//this function is called when the hint button is clicked
function getHint() {
    if (gameOver) return;
    if (value === undefined) return;

    let resultMessage = document.getElementById("result");
    resultMessage.innerText = "Hint: " + value;
    resultMessage.style.display = "block";
    document.getElementById("result").style.marginTop = "20px";
    value.innerText = hint;
    document.getElementById("lostGame").style.display = "none";
    document.getElementById("wonGame").style.display = "none";
}

var toggle = false;

function toggleFunctions() {
    if (toggle) {
        closeSideBar();
    } else {
        openSideBar();
    }
    toggle = !toggle;
}

function openSideBar() {
  document.getElementById('sidebar').style.marginRight = '0';
  document.getElementById('main').style.marginRight = '460px';
  document.getElementById('wonGame').style.marginRight = '460px';
  document.getElementById('lostGame').style.marginRight = '460px';
}

function closeSideBar() {
  document.getElementById('sidebar').style.marginRight = '-460px';
  document.getElementById('main').style.marginRight = '0';
  document.getElementById('wonGame').style.marginRight = '0px';
  document.getElementById('lostGame').style.marginRight = '0px';
}

function disableWinScreen() {
    let img = document.getElementById("gameOver");
    if (img) {
        img.remove();
    }
    
    let message = document.getElementById("wonGame");
    message.style.visibility = "hidden";
    document.getElementById("board").style.visibility = "visible";
    document.querySelector('#openSideBar').disabled = false;
    document.querySelector('#hint').disabled = false;
}

function startOver() {   
    startOver.disabled = true;
    startOver.textContent = 'Loading...';
  
    disableWinScreen();
  
    //reset global variables
    row = 0;
    col = 0;
    gameOver = false;
  
    //clear game board of all guesses
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let currTile = document.getElementById(r.toString() + '-' + c.toString());
            currTile.innerText = "";
            currTile.classList.remove("correct");
            currTile.classList.remove("present");
            currTile.classList.remove("absent");
        }
    }

    //clear any displayed messages
    let message1 = document.getElementById("wonGame").style.display = "none";
    let message3 = document.getElementById("lostGame").style.display = "none";

    // fetch a new random word and hint from the API
    const randomIndex = Math.floor(Math.random() * words.length);
    word = dictionary[randomIndex].word.toUpperCase();
    value = dictionary[randomIndex].hint;
    console.log("word:", word);
    console.log("value:", value);
  
    // add event listener back to getHint button
    document.getElementById("result").addEventListener("click", getHint);

}
  

function displayWinMessage() {
    let winMessage = document.getElementById("wonGame");
    winMessage.style.visibility = "visible";
    winMessage.style.backgroundColor = "mediumspringgreen";
    winMessage.innerText = "You guessed the word " + word + " correctly!!";
    document.getElementById("wonGame").style.marginTop = "20px";
    document.getElementById("result").style.display = "none";
    document.querySelector('#openSideBar').disabled = true;
    document.querySelector('#hint').disabled = true;
    document.getElementById("lostGame").style.display = "none";
    document.getElementById("wonGame").style.display = "block";
    
}

function displayLostMessage() {
    let loseMessage = document.getElementById("lostGame");
    loseMessage.style.visibility = "visible";
    loseMessage.style.backgroundColor = "red";
    loseMessage.innerText = "You missed the word " + word + " and lost!";
    document.getElementById("lostGame").style.marginTop = "20px";
    document.getElementById("result").style.display = "none";
    document.querySelector('#openSideBar').disabled = true;
    document.querySelector('#hint').disabled = true;
    document.getElementById("wonGame").style.display = "none";
    document.getElementById("lostGame").style.display = "block";
}