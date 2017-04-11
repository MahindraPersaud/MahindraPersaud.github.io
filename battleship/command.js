var grid = new Array();
//stores tiles
var alpha = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');
//for easy conversion between letter coordinate and number
var ships = new Array();
//stores arrays that store name, coordinates, "alive" status, health, and damage
var badseeds = new Array(new Array(), new Array());
//seeds that cause ships to be in "badconditions" e.g. illegal placements (intersecting pieces, etc.)
var strikes = new Array();
//history of all moves by player
var done = false;
//gameover status
var debug = false;
//debug mode; displays all ships for debugging

function init() {
    initializeboard();
    setships();
    draw();
    document.getElementById("coor").focus();
}

function fire() {
    if (done)
        return false;
    inputbox = document.getElementById("coor");
    input = String(inputbox.value);
    if (input.length != 2 && input.length != 3) {
        alert("Please enter coordinates!  example: A4");
        cleartxt();
        return false;
    } else if (!checkalpha(input)) {
        alert("First character must be a letter (A-J)!");
        cleartxt();
        return false;
    } else if (isNaN(parseInt(input[1]))) {
        alert('Second character must be a number!');
        cleartxt();
        return false;
    } else if (input.length == 3)
        if (isNaN(parseInt(input[2]))) {
            alert('Third character must be a number!');
            cleartxt();
            return false;
        }
    var xval = getval(input[0]);
    var yval = null;
    if (input.length == 3)
        yval = parseInt((String(input[1]) + String(input[2]))) - 1;
    else
        yval = parseInt(input[1]) - 1;
    //alert(xval + ", " + yval)

    if (yval > 10 || yval < 0) {
        alert('Number must be between 0 and 10!');
        cleartxt();
        return false;
    }
    pair = new Array(yval, xval);

    if (checkpair(pair)) {
        alert("You already shot there, sir!");
        cleartxt();
        return false;
    }
    strikes.push(pair);
    if (hit(pair))
        update("Target hit!");
    else
        update("Missed!");

    draw();
    inputbox.value = null;
    inputbox.focus();
    checkvictory();
}

function enter(e) {
    if (e.keyCode == 13)
        fire();
    return false;
}

function hit(pair) {
    success = false;
    for (t = 0; t < ships.length; t++) {
        if (ships[t][2] == true) {
            for (u = 0; u < ships[t][1].length; u++) {
                if ((ships[t][1][u][0] == pair[0] && ships[t][1][u][1] == pair[1])) {
                    success = true;
                    grid[pair[0]][pair[1]] = "hit";
                    ships[t][4]++;
                    //increase hitcount
                    if (ships[t][4] == ships[t][3]) {
                        ships[t][2] = false;
                        alert("Enemy " + ships[t][0] + " destroyed!");
                    }
                    return success;
                }
            }
        }
    }
    if (!success)
        grid[pair[0]][pair[1]] = "miss";
    return success;
}

function cleartxt() {
    document.getElementById("coor").value = null;
    document.getElementById("coor").focus();
}

function checkvictory() {
    if (strikes.length > 50) {
        alert("I regret to inform that we have failed.");
        update("You LOSE! Refresh to play again!");
        done = true;
        return false;
    }

    var shipsdown = 0;
    for (r = 0; r < ships.length; r++) {
        if (ships[r][2] == false)
            shipsdown++;
    }

    if (shipsdown == 5) {
        alert("You win!");
        update("You WIN! Refresh to play again!");
        done = true;
        return true;
    }
}

function checkpair(pair) {
    dupe = false;
    for (o = 0; o < strikes.length; o++) {
        if (strikes[o][0] == pair[0] && strikes[o][1] == pair[1])
            dupe = true;
    }
    return dupe
}

function update(msg) {
    output = document.getElementById("event");
    output.innerHTML = msg;
}

function getval(letter) {
    var xval = null;
    for (p = 0; p < alpha.length; p++) {
        if ((alpha[p].toLowerCase() == letter) || (alpha[p] == letter)) {
            xval = p;
            break;
        }
    }
    return xval;
}

function checkalpha(input) {
    var letter = false;
    for (p = 0; p < alpha.length; p++) {
        if ((alpha[p] == input[0]) || (alpha[p].toLowerCase() == input[0])) {
            letter = true;
            break;
        }
    }
    return letter;
}

function initializeboard() {
    for (x = 0; x < 10; x++) {
        grid[x] = new Array();
        for (y = 0; y < 10; y++) {
            grid[x][y] = "empty";
        }
    }
}

function draw() {
    var board = document.getElementById("output");
    var out = "";
    for (x = 0; x < 11; x++) {
        out += "<tr>"
        for (y = 0; y < 11; y++) {
            out += "<td>";
            if (x == 0 && y != 0)
                out += alpha[y - 1];
            else if (x == 0 && y == 0)
                out += "&nbsp;";
            else if (y == 0)
                out += x;
            else if (grid[x - 1][y - 1] == "empty")
                out += "&nbsp;";
            else if (grid[x - 1][y - 1] == "hit")
                out += "X";
            else if (grid[x - 1][y - 1] == "miss")
                out += "-";
            else if (grid[x - 1][y - 1] == "Destroyer" && debug)
                out += "D";
            else if (grid[x - 1][y - 1] == "Cruiser" && debug)
                out += "C";
            else if (grid[x - 1][y - 1] == "Submarine" && debug)
                out += "S";
            else if (grid[x - 1][y - 1] == "Battleship" && debug)
                out += "B";
            else if (grid[x - 1][y - 1] == "Carrier" && debug)
                out += "A";
            out += "</td>";
        }
        out += "</tr>";
    }
    board.innerHTML = out;
}

function setships() {
    placeship("Destroyer", 2);
    placeship("Cruiser", 3);
    placeship("Submarine", 3);
    placeship("Battleship", 4);
    placeship("Carrier", 5);
}

function checkseed(seed, spot) {
    len = badseeds[spot].length
    for (n = 0; n < len; n++) {
        if (badseeds[spot][n] == seed)
            return true;
    }
    return false;
}

function placeship(ship, length) {
    badseeds = new Array(new Array(), new Array());
    var attempts = 0;
    var seed = Math.floor(Math.random() * 10);
    var seed2 = Math.floor(Math.random() * 10);
    var horiz = false

    if (seed % 2 == 0)
        horiz = true;
    else
        horiz = false;

    var badconditions = true;
    while (badconditions) {
        var shipend = seed2 + length;
        if (shipend > 9) {
            badconditions = true;
            attempts++;
        } else {
            for (i = seed2; i <= shipend; i++) {
                if ((grid[seed][i] != "empty") && (horiz)) {
                    badconditions = true;
                    attempts++;
                    break;
                } else if ((grid[i][seed] != "empty") && (!horiz)) {
                    badconditions = true;
                    attempts++;
                    break;
                } else {
                    badconditions = false;
                }
            }
        }
        if (attempts > 9) {
            badseeds[0].push(seed)
            if (badseeds[0].length <= 9)
                while (checkseed(seed, 0))
                    seed = Math.floor(Math.random() * 10);
            attempts = 0;
            badseeds[1] = new Array();
        }
        if (badconditions) {
            badseeds[1].push(seed2);
            if (badseeds[1].length <= 9) {
                while (checkseed(seed2, 1)) {
                    seed2 = Math.floor(Math.random() * 10);
                }
            }
        }
    }
    if (!badconditions) {
        var shipcoor = new Array();
        for (i = seed2; i < seed2 + length; i++) {
            if (horiz) {
                grid[seed][i] = ship;
                shipcoor.push(new Array(seed, i));
            } else {
                grid[i][seed] = ship;
                shipcoor.push(new Array(i, seed));
            }
        }
        alive = true;
        hits = 0;
        ships.push(new Array(ship, shipcoor, alive, length, hits));
    }
}
