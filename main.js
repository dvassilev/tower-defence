'use strict'
const Game = new Phaser.Game(1344, 896, Phaser.AUTO, 'game-canvas');

Game.state.add('MainMenu', mainMenuState);
Game.state.add('Setting', settingState);
Game.state.add('Levels', levelsState);
Game.state.add('Level1', level1State);
Game.state.add('Level2', level2State);
Game.state.add('WinScreen', winScreenState);
Game.state.add('LoseScreen', loseScreenState);

Game.state.start('MainMenu');