"use strict";



// JSGRID is our one global variable, our 'namespace', so as to not pollute the
// global namespace.
var JSGRID = {};  // TODO: in the future, change this to let
if  (typeof module !== 'undefined' && this.module !== module) {
    // We're in a node.js type of environment; e.g. used for our mocha tests
    module.exports = JSGRID;
}

// TODO: move more functions out of constructors and into prototypes
// Note: For the current simple stuff, passive control flow via 'refreshing' works.
// See detectSurrounded(), tryTurn(), nextPlayer(), and message()

// PLAYER MODEL ---------

JSGRID.Player = function(name, abbr, color) {
    this.name = name;
    this.abbr = abbr;
    this.color = color;
    this.score = 0;

    this.toString = function() {
        return '' + name;
    }
};

/*
 * this didn't work for FF debug... JSGRID.Player.prototype.toString = function () {
 * return '' + name; }
 */

// JSGRID.nullPlayer = new JSGRID.Player('', '', 'yellow'); // Null pattern to
// avoid crashes, but prob not worth it (since it's not false)
JSGRID.PlayerList = function(count) {

    var colors = [ 'tan', 'lightblue', 'pink', 'lightgreen', 'lightgray',
            'lightyellow', 'lavender' ] // hmm, too UI-related?
    this._currentPlayer = 0;
    this._players = [];

    for (var i = 0; i < count; i++) {
        this._players[i] = new JSGRID.Player('Player ' + (i + 1),
                'p' + (i + 1), colors[i]);
    }

    this.all = function() {
        return this._players;
    };

    this.get = function(i) {
        return this._players[i];
    };

    this.firstPlayer = function() {
        this._currentPlayer = 0;
        return this._currentPlayer;
    };

    this.nextPlayer = function() {
        this._currentPlayer++;
        if (this._currentPlayer >= this._players.length) {
            this._currentPlayer = 0; // wrap around
        }
        return this.currentPlayer();
    };

    this.currentPlayer = function() { // TODO: use property syntax instead
        return this._players[this._currentPlayer];
    };

    this.totalScore = function() {
        var ps = this._players;
        var L = ps.length;
        var total = 0;
        for (var i = 0; i < L; i++) {
            total += ps[i].score;
        }
        return total
    };

    this.allScores = function() {
        var ps = this._players;
        var L = ps.length;
        var msg = '';
        for (var i = 0; i < L; i++) {
            msg += ps[i].name + ': ' + ps[i].score + '  ';
        }
        return msg;
    };

};

// GAME MODEL ---------

JSGRID.Game = function(gridModel) {

    this.gridModel = gridModel;

    this.statusMessage = function() {
        var ps = this.gridModel.players;
        var totalScore = ps.totalScore();
        var totalPossible = this.gridModel.maxScore();
        var msg;
        if (totalScore === totalPossible) {
            msg = 'Game over! The final scores were: ' + ps.allScores();
        } else {
            msg = this.gridModel.players.currentPlayer()
                    + ', '
                    + 'select any line. If this causes a cell (or two) to be completely surrounded, it will become yours, and you will get an extra turn. \n'
                    + '<br/>' + "Current scores: " + ps.allScores(); // TODO:
            // eliminate
            // the
            // <br/>
        }
        return msg;

    }
};

// GRID MODEL ---------

JSGRID.Side = function() {
    this.filled = false;
    this.toString = function() {
        return this.filled ? 'Y' : 'N';
    }
};

/*
 * JSGRID.Side.prototype.toString = function () { return this.filled ? 'Y' :
 * 'N'; }
 */

// Represents any 2D polygon
JSGRID.Cell = function(sides) {
    this.owner = null; // JSGRID.nullPlayer; // cells start out 'empty'
    this.sides = sides;

    this.sideFilled = function(key) {
        var side = this.sides[key];
        return side.filled;
    }

    this.fillSide = function(key, player) {
        var side = this.sides[key];
        if (!side.filled) {
            side.filled = true;
            this.detectSurrounded(player);
            return true;
        }
        return false; // was already filled
    }
    // If the cell is now surrounded and wasn't before, assign it to the current
    // player.
    this.detectSurrounded = function(player) {
        if (!this.owner) {
            var surrounded = true;
            var ss = this.sides;
            for ( var key in ss) {
                if (ss.hasOwnProperty(key)) {
                    if (!ss[key].filled) {
                        surrounded = false;
                    }
                }
            }
            if (surrounded) {
                this.owner = player;
                player.score++;
            }
        }
    }
};

// Creates a square cell, mostly from scratch, but if it's to the right
// of or below an existing cell, you must pass in the cells that share sides.
JSGRID.createSquareCell = function(cellAbove, cellToLeft) {
    var t = cellAbove ? cellAbove.sides['bottom'] : new JSGRID.Side();
    var b = new JSGRID.Side();
    var L = cellToLeft ? cellToLeft.sides['right'] : new JSGRID.Side();
    var r = new JSGRID.Side();
    var sides = {
        top : t,
        bottom : b,
        left : L,
        right : r
    }
    // TODO: for each key:val in sharedSides, overwrite matches in sides
    var cell = new JSGRID.Cell(sides);
    return cell;
}

JSGRID.SquareGrid = function(width, height, players) {

    // reset (also serves as init)
    this.reset = function(w, h, players) {
        this.players = players;
        this.player = players.firstPlayer();
        var m = [];
        this.matrix = m; // will be a 2D array (well, array of arrays)
        this.height = h;
        this.width = w;

        // fill matrix
        var toLeft = null, above = null; // these will be used for cells
                                            // sharing sides
        for (var row = 0; row < h; row++) {
            m[row] = [];
            for (var col = 0; col < w; col++) {
                toLeft = col ? m[row][col - 1] : null;
                above = row ? m[row - 1][col] : null;
                m[row][col] = JSGRID.createSquareCell(above, toLeft);
            }
        }
    }

    this.maxScore = function() {
        return this.height * this.width;
    }

    // Gets the appropriate adjacent cell by flipping on the provided side
    // Will return the cell itself if you try to flip on an outer edge.
    this.getNeighbor = function(row, col, side) {
        var cell2 = null;
        switch (side) {
        case 'top': {
            if (row > 0) {
                row--;
            }
        }
            break;
        case 'bottom': {
            if (row < this.matrix.length - 1) {
                row++;
            }
        }
            break;
        case 'left': {
            if (col > 0) {
                col--;
            }
        }
            break;
        case 'right': {
            if (col < this.matrix[row].length - 1) {
                col++;
            }
        }
            break;
        }
        cell2 = this.matrix[row][col];
        return cell2;
    }

    this.tryTurn = function(row, col, side) {
        var cell = this.matrix[row][col];
        var player = this.players.currentPlayer();
        if (cell.sideFilled(side)) {
            return; // not a valid turn
        }
        cell.fillSide(side, player); // we only do this once (trusting our sides are shared as needed)
        var cell2 = this.getNeighbor(row, col, side);
        cell2.detectSurrounded(player); // refresh the neighbor
        if (!(cell.owner || cell2.owner)) {
            this.players.nextPlayer(); // current one didn't earn an extra turn here
        }
    };

    this.reset(width, height, players); // i.e. init
}



