/*frame count used to define how events happen, such as
generating a red cell that must be clicked every 1 frames vs
moving the laser bar every 2 frames */
let laserUpdate = 70; //update laser every "x" frames
let redCellUpdate = 60; //update red cells every "x" frames
let frameNum = 0;
//initiate game speed (in milliseconds)
const tickSpeed = 20;
//initiate field (x * y)
const fieldXMax = 14;
const fieldYMax = 7;
let field = initiateField();
setInterval(main, tickSpeed); // calling main every frame
//initiate variable characters
const clearCellChar = "-", redCellChar = "R", laserChar = "B"; //console display
const clearCellCol = "black", redCellCol = "lime", laserCol = "red"; //canvas display
//initiate canvas
let canvas = document.querySelector("canvas");
let pixelSize = 500 / fieldXMax;
canvas.width = pixelSize * fieldXMax;
canvas.height = pixelSize * fieldYMax;
let c = canvas.getContext("2d");
//initiate html table 
document.getElementById("laserfield-table").innerHTML = initiateTableHTML();
//initiate laser bar
let laserPos = 1; // must be between 0 and fieldX
let laserDir = 1; // must be 1 or -1
let prevLaserDir = 1;
//initiate score 
let redCellsCleared = 0;
let redCellsLasered = 0;
let startingLives = 10;
let currentLives = 0;
let gameOver = false;
let prevScoreUpdate = 0; //variable to make sure game parameters only update once per score
let score = 0;
let laserDirChanges = 0;
let bonusLives = 0;
let bonusLivesUpdatedAt = 0;
//set game type
let gameType = "standard";

//functions
function main() {
    if (gameOver === false) {
        document.getElementById("frame-count").innerHTML = frameNum;
        //generate field
        generateField();
        //display the field
        displayField();
        //update the score
        doGameMode();
        //update frame count
        frameNum += 1;
    }
}

function doGameMode() {
    if (gameType === "standard") {

        //for every 5 points increase laser speed and redcell spawn rate
        if (laserDir !== prevLaserDir) {
            laserUpdate = Math.ceil(laserUpdate * 0.80);
            prevLaserDir = laserDir;
            laserDirChanges += 1;
        }
        if (redCellsCleared % 20 === 0 && bonusLivesUpdatedAt !== redCellsCleared) {
            bonusLives += 1;
            bonusLivesUpdatedAt = redCellsCleared;
        }
        if (redCellsCleared % 10 === 0 && prevScoreUpdate !== redCellsCleared) {
            redCellUpdate = Math.ceil(redCellUpdate * 0.95);
            prevScoreUpdate = redCellsCleared;
        }
        score = redCellsCleared + (laserDirChanges * 20);
        currentLives = startingLives - redCellsLasered + bonusLives;
        document.getElementById("player-lives").innerHTML = "Lives left <br>" + currentLives;
        document.getElementById("laser-score").innerHTML = "Laser score <br>" + redCellsLasered;
        document.getElementById("player-score").innerHTML = "Your score <br>" + score;
        document.getElementById("difficulty-params").innerHTML = "laserup: " + laserUpdate
         + "," 
         + "redCellUp" + redCellUpdate;
        if (currentLives <= 0) {
            gameOver = true;
        }
    }
}

function generateField() {
    for (let row = 0; row < fieldYMax; row++) {
        for (let col = 0; col < fieldXMax; col++) {
            if (field[row][col] !== redCellChar && field[row][col] !== laserChar) {
                field[row][col] = clearCellChar;
            }
        }
    } 
    updateLaserPos();
    addRedCell();
}

function updateLaserPos() {
    //if time to update laser position move laser pos
    if (frameNum % laserUpdate === 0) {
        //if laser pos is at either end of the array flip direction
        if (laserPos === fieldXMax - 1|| laserPos === 0) {
            laserDir = -laserDir;
        } 
        //clear prev laser
        for (let row = 0; row < fieldYMax; row++) {
            field[row][laserPos] = clearCellChar;
        }
        //update laser position
        laserPos += laserDir;
        //draw laser in new position
        for (row = 0; row < fieldYMax; row++) {
            if (field[row][laserPos] === redCellChar) {
                redCellsLasered += 1;
            }
            field[row][laserPos] = laserChar;
        }
    }
}

function addRedCell() {
    let availibleCell = false;
    let newRedCell = false;
    let newRedCellX = 0;
    let newRedCellY = 0;
    //if there is no space for another red cell game over
    for (let row = 0; row < fieldYMax; row++) {
        for (let col = 0; col < fieldXMax; col++) {
            if (field[row][col] === clearCellChar) {
                availibleCell = true;
            }
        }
    }
    //if time to update add new red cell
    if (frameNum % redCellUpdate === 0) {
        do {
            //get new position for cell
            newRedCellX = Math.floor(Math.random() * fieldXMax);
            newRedCellY = Math.floor(Math.random() * fieldYMax);
            if (field[newRedCellY][newRedCellX] === clearCellChar) {
                field[newRedCellY][newRedCellX] = redCellChar;
                newRedCell = true;
            }
        } while (newRedCell === false && availibleCell === true)     
    }
}

function displayField() {
    //canvas
    for (let row = 0; row < fieldYMax; row++) {
        for (let col = 0; col < fieldXMax; col++) {
            if (field[row][col] === clearCellChar) {
                c.fillStyle = clearCellCol;
            } else if (field[row][col] === redCellChar) {
                c.fillStyle = redCellCol; 
            } else if (field[row][col] === laserChar) {
                c.fillStyle = laserCol;
            }
            c.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize); 
        }
    }
    //html
    /*for (let row = 0; row < fieldYMax; row++) {
        for(let col = 0; col < fieldXMax; col++) {
            if (field[row][col] === clearCellChar) {
                document.getElementById("laserTableCellR" + row + "C" + col).className = "clearCell";
            } else if (field[row][col] === redCellChar) {
                document.getElementById("laserTableCellR" + row + "C" + col).className = "redCell";
            } else if (field[row][col] === laserChar) {
                document.getElementById("laserTableCellR" + row + "C" + col).className = "laser";
            }
        }
    }*/
    //console
    /*
    let dispStr = "";
    for (let row = 0; row < fieldYMax; row++) {
        for(let col = 0; col < fieldXMax; col++) {
            dispStr += field[row][col];
        }
        dispStr += "\n";
    }
    console.log(dispStr);
    */
}

function initiateField() {
    let retField = [];
    for (let row = 0; row < fieldYMax; row++) {
        retField[row] = [];
    }
    return retField;
}

function restartGame (event) {
    bonusLives = 0;
    laserDirChanges = 0;
    frameNum = 0;
    laserPos = 1;
    laserUpdate = 90;
    redCellUpdate = 30;
    redCellsLasered = 0;
    redCellsCleared = 0;
    gameOver = false;
    for (let row = 0; row < fieldYMax; row++) {
        for (let col = 0; col < fieldXMax; col++) {
            field[row][col] = clearCellChar;
        }
    }
}

function initiateTableHTML() {
    //the html table takes click input to adjust the array displayed by the canvas
    let tableStr = "";
    for (let row = 0; row < fieldYMax; row++) {
        tableStr = tableStr + "<tr>";
            for (col = 0; col < fieldXMax; col++) {
                tableStr += "<td style='height:" + pixelSize + "px; width:"
                 + pixelSize + "px;' class='clearCell' onclick='tableCellClicked(event)'" +
                " id='laserTableCellR" + row + "C" + col +"'></td>";
            }
        }
    tableStr = "<table cellpadding='0' cellspacing='0' id='laserTable' border='1'>" + tableStr + "</tr></table>";
    return tableStr;
}

function tableCellClicked(event) {
    //this doesn't need to be called from main as it runs every time the table is clicked
    //get coords of cell that was clicked
    let id = event.srcElement.id;
    let clickCoord = "";
    let col = "";
    let row = "";
    id = id.split("R");
    clickCoord = id[1];
    clickCoord = clickCoord.split("C");
    row = clickCoord[0];
    col = clickCoord[1];
    //if those cells are a redcell, clear cell
    if (field[row][col] === redCellChar) {
        field[row][col] = clearCellChar;
        redCellsCleared += 1;
    }
    displayField();
}

//essential features
// -generate red blocks
// -generate scrolling laser bar
// -----should the bar scroll or the redblock field?
// -remove red blocks on click
// -lose lives every time the laser bar hits a red block
// -some sort of score system
//possible features
// -marathon and sprint mode
// -scrolling field or moving bar
// -2 player with livesocket API or node or json or even postgres (but hopefully not)
// -
