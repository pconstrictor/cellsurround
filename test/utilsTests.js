var assert = require("assert");

var tmp = require("../utils.js");

describe("Number", function() {
    describe('isOdd', function() {
        it('works', function() {
            var n = 3;
            assert.equal(true, n.isOdd());
            n = 4;
            assert.equal(false, n.isOdd());
            n = 0;
            assert.equal(false, n.isOdd());

        })
    })
});
