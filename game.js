"use strict";

// THE GAME APP (basically a self-contained applet)

JSGRID.App = function(appId) {

    this._appId = appId;

    var gm = JSGRID;
    //var gm = require ("models/gameModel");


    this.init = function() {
        var w = 4, h = 4;
        // this._players = ['player1', 'player2'];
        var players = new gm.PlayerList(2);
        var gridModel = new gm.SquareGrid(w, h, players);
        this.gameModel = new gm.Game(gridModel);
        var resetFuncString = 'JSGRID.' + this._appId + '.init()'; // a
                                                                    // plain-string
                                                                    // callback
        this.gridView = new JSGRID.SquareGridView(this.gameModel, appId,
                resetFuncString); // for now, just inject the dependencies
    }

    this.init();
}

// TODO: be more event-driven?
// (For the current simple stuff, passive control flow via tryTurn() and
// refresh() works.)
// TODO: Move more presentation logic into PM objects?

