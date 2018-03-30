/**
 * Conway's Game of Life
 *
 * Author: Lee Keitel
 * License: MIT
 */

"use strict";

// Change these settings to suit the simulation
var GameSettings =
{
    height: 500,
    width: 500,
    cellSize: 10,
    pauseOnStall: false
}

// Main game logic
var Game =
{
    nextState: [],
    currentState: [],
    lastState: [],
    cellCount: 0,
    cellsPerRow: 0,
    cellsPerColumn: 0,
    generation: 1,
    ctx: null,
    canvas: null,
    paused: true,
    stalled: false,
    visualize: true,

    init: function() {
        const settingsHeight = document.getElementById('settings-height')
        const settingsWidth = document.getElementById('settings-width')
        const settingsCellSize = document.getElementById('settings-cell-size')

        GameSettings.height = parseInt(settingsHeight.value);
        GameSettings.width = parseInt(settingsWidth.value);
        GameSettings.cellSize = parseInt(settingsCellSize.value);

        settingsHeight.addEventListener('input', function() {
            document.getElementById('settings-height-val').innerHTML = settingsHeight.value;
        });
        settingsWidth.addEventListener('input', function() {
            document.getElementById('settings-width-val').innerHTML = settingsWidth.value;
        });
        settingsCellSize.addEventListener('input', function() {
            document.getElementById('settings-cell-size-val').innerHTML = settingsCellSize.value;
        });

        Game.canvas = document.getElementById('game-grid');
        Game.canvas.height = GameSettings.height;
        Game.canvas.width = GameSettings.width;

        Game.canvas.addEventListener('mousedown', Game.markGrid, false);
        Game.canvas.addEventListener('mousemove', Game.getMouse, false);
        Game.ctx = Game.canvas.getContext('2d');

        Game.cellsPerRow = GameSettings.width / GameSettings.cellSize;
        Game.cellsPerColumn = GameSettings.height / GameSettings.cellSize;
        Game.cellCount = Game.cellsPerRow * Game.cellsPerColumn;

        Game.reset();
    },

    reset: function() {
        Game.nextState = Game.newBlankGrid();
        Game.currentState = Game.newBlankGrid();
        Game.lastState = Game.newBlankGrid();
        Game.stalled = false;
        Game.paused = true;
        Game.generation = 1;
        Game.randomize();

        Game.setMessage('Ready to start...');
        document.getElementById('generation-count').innerHTML = Game.generation;
    },

    randomize: function() {
        for (var i = 0; i < Game.cellsPerRow; i++) {
            for (var j = 0; j < Game.cellsPerColumn; j++) {
                Game.currentState[i][j] = (Math.random() < 0.3) ? 1 : 0;
            }
        }

        const oldVisualize = Game.visualize;
        Game.visualize = true;
        Game.drawGrid();
        Game.visualize = oldVisualize;
    },

    clear: function() {
        for (var i = 0; i < Game.cellsPerRow; i++) {
            for (var j = 0; j < Game.cellsPerColumn; j++) {
                Game.currentState[i][j] = 0;
            }
        }

        Game.drawGrid(true);
    },

    getMouse: function(event) {
        if (event.which == 1) {
            Game.markGrid(event, true);
        }
    },

    setMessage: function(message) {
        document.getElementById('messages').innerHTML = message;
    },

    setPauseOnStall: function(setting) {
        if (typeof(setting) == 'undefined') {
            GameSettings.pauseOnStall = document.getElementById('pause-stall').checked;
        } else if (typeof(setting) == 'boolean') {
            GameSettings.pauseOnStall = setting;
        }
    },

    setNoVisuals: function() {
        const val = document.getElementById('no-visual').checked
        Game.visualize = !val;
    },

    showState: function() {
        var liveCells = 'Live Cell Coordinates:<br>';
        for (var i = 0; i < Game.cellsPerRow; i++) {
            for (var j = 0; j < Game.cellsPerColumn; j++) {
                if (Game.currentState[i][j] === 1) {
                    liveCells += 'X: ' + i + ' Y: ' + j + '<br>';
                }
            }
        }

        document.getElementById('raw-state').value = JSON.stringify(Game.currentState);
        document.getElementById('live-cell-coor').innerHTML = liveCells;
    },

    loadInitState: function(premade) {
        if (!premade) {
            var JSONstate = document.getElementById('raw-state').value;

            try {
                Game.currentState = JSON.parse(document.getElementById('raw-state').value);
                Game.setMessage('Successfully loaded state');
            } catch (e) {
                Game.setMessage('Error loading state, please make sure it\'s not empty and valid JSON');
            }
        } else {
            var pattern = document.getElementById('initial-states').value;
            document.getElementById('initial-states').selectedIndex = 0;

            switch (pattern) {
                case 'glider':
                    Game.currentState[24][23] = 1;
                    Game.currentState[25][21] = 1;
                    Game.currentState[25][23] = 1;
                    Game.currentState[26][22] = 1;
                    Game.currentState[26][23] = 1;
                    break;
            }
            Game.setMessage('Ready to start...');
        }
        Game.generation = 1;
        Game.stalled = false;
        document.getElementById('generation-count').innerHTML = Game.generation;
        Game.drawGrid(true);
    },

    markGrid: function(event, onlyAlive) {
        if (!Game.paused || event.buttons === 0) {
            return;
        }
        if (typeof(onlyAlive) == 'undefined') { onlyAlive = false; }

        var x = event.layerX;
        var y = event.layerY;

        var cellX = (x - (x % GameSettings.cellSize)) / GameSettings.cellSize;
        var cellY = (y - (y % GameSettings.cellSize)) / GameSettings.cellSize;

        if (onlyAlive || Game.currentState[cellX][cellY] === 0) {
            Game.currentState[cellX][cellY] = 1;
        } else {
            Game.currentState[cellX][cellY] = 0;
        }

        Game.drawGrid();
    },

    play: function(delta) {
        if (!Game.paused) { return; }

        if (Game.visualize) {
            var frameCount = 0;
            var animationFunc = function() {
                if (frameCount % delta === 0) {
                    Game.nextGeneration();
                }

                if (!Game.paused) {
                    requestAnimationFrame(animationFunc);
                }
                frameCount++;
            };

            requestAnimationFrame(animationFunc);
            Game.paused = false;
            Game.setMessage('Simulation running');
        } else {
            Game.paused = false;
            Game.setMessage('Simulation running');
            console.log(JSON.stringify(Game.currentState));
            while (!Game.stalled) {
                console.log(Game.generation);
                Game.nextGeneration();
            }
        }
    },

    pause: function() {
        Game.paused = true;
        Game.setMessage('Simulation paused');
    },

    newBlankGrid: function() {
        var grid = new Array(Game.cellsPerRow);
        for (var i = 0; i < Game.cellsPerRow; i++) {
            grid[i] = new Array(Game.cellsPerColumn);
            grid[i].fill(0);
        }
        return grid;
    },

    nextOneStep: function() {
        Game.setMessage('Simulated one step');
        Game.nextGeneration();
    },

    nextGeneration: function() {
        var stalled = true;

        for (var i = 0; i < Game.cellsPerRow; i++) {
            for (var j = 0; j < Game.cellsPerColumn; j++) {
                var neighbors = Game.getNeighborCount(i, j);

                if (neighbors < 2) {
                    Game.nextState[i][j] = 0;
                } else if ((neighbors === 2 || neighbors === 3) && Game.currentState[i][j] === 1) {
                    Game.nextState[i][j] = 1;
                } else if (neighbors > 3) {
                    Game.nextState[i][j] = 0;
                } else if (neighbors === 3 && Game.currentState[i][j] === 0) {
                    Game.nextState[i][j] = 1;
                } else {
                    Game.nextState[i][j] = 0;
                }

                if (Game.nextState[i][j] !== Game.lastState[i][j]) {
                    stalled = false;
                }
            }
        }

        Game.rotateGrids();
        Game.generation++;
        document.getElementById('generation-count').innerHTML = Game.generation;
        Game.drawGrid();

        if (stalled && !Game.stalled) {
            if (GameSettings.pauseOnStall) {
                Game.pause();
            }
            Game.setMessage('Life has stalled at generation '+Game.generation);
            Game.stalled = true;
        }
    },

    rotateGrids: function() {
        var last = Game.lastState;
        Game.lastState = Game.currentState;
        Game.currentState = Game.nextState;
        Game.nextState = last;
    },

    drawGrid: function(force) {
        if (!Game.visualize && !force) { return; }
        Game.ctx.clearRect(0, 0, GameSettings.width, GameSettings.height);

        for (var i = 0; i < (Game.cellsPerColumn); i++) {
            for (var j = 0; j < (Game.cellsPerRow); j++) {
                if (Game.currentState[i][j] === 1) {
                    Game.ctx.fillRect(i*GameSettings.cellSize, j*GameSettings.cellSize, GameSettings.cellSize, GameSettings.cellSize);
                } else {
                    Game.ctx.strokeRect(i*GameSettings.cellSize, j*GameSettings.cellSize, GameSettings.cellSize, GameSettings.cellSize);
                }
            }
        }
    },

    getNeighborCount: function(x, y) {
        var count = 0;

        if (x-1 >= 0) {
            if (Game.currentState[x-1][y] === 1) {
                count++;
            }
        }

        if (x+1 < Game.cellsPerRow) {
            if (Game.currentState[x+1][y] === 1) {
                count++;
            }
        }

        if (y-1 >= 0) {
            if (Game.currentState[x][y-1] === 1) {
                count++;
            }
        }

        if (y+1 < Game.cellsPerColumn) {
            if (Game.currentState[x][y+1] === 1) {
                count++;
            }
        }

        if (y-1 >= 0 && x-1 >= 0) {
            if (Game.currentState[x-1][y-1] === 1) {
                count++;
            }
        }

        if (y-1 >= 0 && x+1 < Game.cellsPerRow) {
            if (Game.currentState[x+1][y-1] === 1) {
                count++;
            }
        }

        if (y+1 < Game.cellsPerColumn && x-1 >= 0) {
            if (Game.currentState[x-1][y+1] === 1) {
                count++;
            }
        }

        if (y+1 < Game.cellsPerColumn && x+1 < Game.cellsPerRow) {
            if (Game.currentState[x+1][y+1] === 1) {
                count++;
            }
        }

        return count;
    }
};

Game.init();
