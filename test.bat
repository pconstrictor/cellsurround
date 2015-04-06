REM Run tests, with node.js syntax enabled so we can require() modules.
REM (But avoid that syntax in the production code itself.)
mocha --harmony
