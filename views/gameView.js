"use strict";

JSGRID.SquareGridView = function(gameModel, appId, resetFuncString) {

    this.gameModel = gameModel;
    this.gridModel = gameModel.gridModel; // for convenience
    this.appId = appId;

    this.makeElementId = function(id) {
        return id + '_' + this.appId;
    }

    this.getElement = function(id) {
        var fullId = this.makeElementId(id);
        return document.getElementById(fullId);
    }

    this.overwriteHtml = function(id, txt) {
        var elem = document.getElementById(id);
        elem.innerHTML = txt;
    }

    // Translate model grid coordinates to view grid coordinates.
    // The view is almost 2W x 2H (whereas the model is just W x H, but each
    // cell is 3x3 internally, with overlapping edges).
    // For a grid of 4x4 cells, the view is a 7x7 table.
    function viewCoord(x) {
        return (x * 2) + 1;
    }

    // Translate a coordinate from the big view grid into a cell coordinate
    // Note: all except 0 look before themselves (i.e. up or left).
    function modelCoord(x) {
        var d = x ? Math.floor((x - 1) / 2) : 0;
        return d;
    }

    // respond to a user click
    this.fillLine = function(id) {
        // compute row, col, sideName based on id
        var coord = id.split('.');
        var i = Number(coord[0]);
        var j = Number(coord[1]);
        var sideName;
        if (i.isOdd()) {
            // vertical line, usually 'right'
            sideName = j ? 'right' : 'left';
        } else {
            // horizontal line, usually 'bottom'
            sideName = i ? 'bottom' : 'top';
        }
        var row = modelCoord(i);
        var col = modelCoord(j);

        // alert(id + ': ' + row + ', ' + col + ' ' + sideName);
        this.gridModel.tryTurn(row, col, sideName);
        this.refresh();
    }

    // Builds an HTML table cell, based on a very specific kind of 2D array:
    // The array includes both lines and cells (sparse: has gaps for vertices
    // and empty cells).
    // Each line is stored as a simple boolean. Each owned cell is a player
    // object.
    this.tdHtml = function(viewPm, i, j) {
        var td = viewPm[i][j];
        var id = '' + i + '.' + j;
        var content = '';
        var bg = '';

        var click = '';
        if ((i + j).isOdd()) { // i.e. exactly one is even, so it's a side
            click = ' onclick="JSGRID.' + this.appId
                    + '.gridView.fillLine(this.id);" ';
        }

        var c = 'vertex'; // if both are even, class is vertex

        if (i.isOdd()) {
            if (j.isOdd()) {
                c = 'cell'; // both odd, td is owner
                if (td) {
                    content += td.abbr;
                    bg = ' style="background-color:' + td.color + '" ';
                }
            } else {
                c = 'vline';
                c += td.filled ? ' filledLine' : '';
            }
        } else if (j.isOdd()) {
            c = "hline";
            c += td.filled ? ' filledLine' : '';
        }

        var tmp = '    <td class="' + c + '" id="' + id + '" ' + click + bg
                + '> <div class="' + c + '"> ' + content + ' </div> </td> \n';
        return tmp;
    }

    // render the latest of whatever is in the model
    this.refresh = function() { // TODO: split the HTML bits out into a template
                                // file?
        var h = this.gridModel.height;
        var w = this.gridModel.width;

        // Initialize the UI table, whose dimensions are bigger than the
        // model's.
        var viewPm = [];
        var hLen = viewCoord(h);
        var wLen = viewCoord(w);
        for (var i = 0; i < hLen; i++) {
            viewPm[i] = [];
        }

        // But loop over the model when actually filling it in. (We'll do extra
        // writes to viewPm, but oh well.)
        for (var row = 0; row < h; row++) {
            for (var col = 0; col < w; col++) {
                var cell = this.gridModel.matrix[row][col];
                var i = viewCoord(row), j = viewCoord(col);
                viewPm[i][j] = cell.owner;
                viewPm[i - 1][j] = cell.sides['top'];
                viewPm[i + 1][j] = cell.sides['bottom'];
                viewPm[i][j - 1] = cell.sides['left'];
                viewPm[i][j + 1] = cell.sides['right'];
                // Note: vertices left undefined here.
            }
        }

        var t = []; // the html text
        var msg = this.gameModel.statusMessage();
        var tmp = this.makeElementId('width');
        t.push('Width: <input type="number" id="' + tmp + '" value="'
                + this.gridModel.width + '" min="2" max="99" /> ');
        tmp = this.makeElementId('height');
        t.push('Height: <input type="number" id="' + tmp + '" value="'
                + this.gridModel.height + '" min="2" max="99" /> ');
        tmp = this.makeElementId('players');
        t
                .push('Players: <input type="number" id="' + tmp + '" value="'
                        + this.gridModel.players.all().length
                        + '" min="2" max="9" /> ');

        t.push('<button type="button" onclick="' + resetFuncString
                + '">Reset</button>'); // TODO: split out into presenter?
        t.push('<br/>' + msg);

        t.push('<table class="squaregrid">\n');
        var tdClass = 'vertex', tdId = '0.0'; // though we'll recompute these 
        for (var i = 0; i < hLen; i++) {
            t.push("  <tr> \n");
            for (var j = 0; j < wLen; j++) {
                t.push(this.tdHtml(viewPm, i, j));
            }
            t.push(" </tr>\n");
        }
        t.push("</table>\n");
        this.overwriteHtml(this.appId, t.join(""));
        //alert("done resetting");

    }

    // reset (init)
    this.reset = function() {
        var inputW = this.getElement('width');
        var inputH = this.getElement('height');
        var inputP = this.getElement('players');
        var w = inputW ? inputW.value : 4;
        var h = inputH ? inputH.value : 4;
        var p = inputP ? inputP.value : 2;
        var players = new JSGRID.PlayerList(p);
        this.gridModel.reset(w, h, players);
        this.refresh();
    }

    this.reset(); // init

} // SquareGridView
