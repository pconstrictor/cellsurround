To run these tests, install node.js and then the following:

npm install -g mocha

Running mocha should then work if run from the cellsurround directory:
mocha --harmony

The --harmony is so the unit tests can require() stuff.

Wasn't able to get the following working for ES6 imports, 
hence the use of node.js require() instead.

npm install mocha-traceur --save-dev  
mocha --compilers js:mocha-traceur  

So...
npm uninstall mocha-traceur

Mocha: runs unit tests with nice 'describe' syntax
Traceur: transpiles from ES6 to ES5, simplifying module imports.

