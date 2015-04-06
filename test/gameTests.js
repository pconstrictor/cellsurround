var assert = require("assert");
//import assert from "assert";

var gm = require("../models/gameModel");

function freshPlayer(p) {
    return ((p instanceof gm.Player) && (p.score == 0));
}

describe("Player", function() {
    describe('constructor', function() {
        it('produces a fresh player', function() {
            var tmp;
            tmp = new gm.Player('Johnny');
            console.log(freshPlayer(tmp));
            assert(freshPlayer(tmp));
            assert.equal(tmp.name, 'Johnny');
        })
    })
});

describe("PlayerList", function() {
    describe('constructor', function() {
        it('produces N fresh players', function() {
            var tmp;
            tmp = new gm.PlayerList(2);
            assert.equal(tmp._players.length, 2);
            assert(freshPlayer(tmp.get(0)));
            assert(freshPlayer(tmp.get(1)));
            tmp = new gm.PlayerList(5);
            assert.equal(tmp._players.length, 5);

        })
    })
});

describe("PlayerList", function() {
    describe('next()', function() {
        var pp = new gm.PlayerList(3);
        it('increments and wraps', function() {
            assert.equal(pp._currentPlayer, 0);
            assert.equal(pp.currentPlayer().name, 'Player 1');
            pp.nextPlayer();
            assert.equal(pp._currentPlayer, 1);
            assert.equal(pp.currentPlayer().name, 'Player 2');
            pp.nextPlayer();
            assert.equal(pp._currentPlayer, 2);
            assert.equal(pp.currentPlayer().name, 'Player 3');
            pp.nextPlayer();
            assert.equal(pp._currentPlayer, 0);
            assert.equal(pp.currentPlayer().name, 'Player 1');

        })
    })
    describe('totalScore()', function() {
        it('tallies', function() {
            var pp = new gm.PlayerList(3);
            pp.get(0).score = 3;
            pp.get(1).score = 0;
            pp.get(2).score = 5;
            assert.equal(pp.totalScore(), 8);
        })
    })
});

// TODO: tests for
// Game statusMessage
// Cell sideFilled fillSide detectSurrounded
// SquareGrid reset  'sparse array is write-safe' getNeighbor tryTurn

