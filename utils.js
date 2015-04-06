"use strict";

// "extension methods"

//Augment Number ----------

Number.prototype.isOdd = function() {
    return this % 2;
};

// Augment String ----------

String.prototype.trim = function() { // [Crockford]
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"); // todo: maybe
                                                            // simplify by using
                                                            // a non-greedy
                                                            // regex
};

// Augment Object ----------

// After the specified delay (ms), run the specified method on this object.  [Crockford]
// Example: my_object.later(1000, "erase", true)
if (typeof Object.prototype.later != 'function') {
    Object.prototype.later = function(ms, method) {
        var that = this // make this available to closures
        var args = Array.prototype.slice.apply(arguments, [ 2 ]); // all but
                                                                    // the first
                                                                    // two args
        if (typeof method === 'string') {
            method = that[method];
        } // (else assume that method is already a function)
        setTimeout(function() {
            method.apply(that, args);
        }, ms);
        return that;
    };
}

//export default null;  // nothing to export; it's all side effects

