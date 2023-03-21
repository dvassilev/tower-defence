'use strict'

const loseScreenState = {
    preload: function () {
        Game.load.image('background', '../IMG/loseScreenBackground.png');
        Game.load.image('button', './/IMG/buttonTemplate.png');
    },

    create: function () {
        this.createBackground();
    },

    createBackground: function () {
        let background = Game.add.sprite(Game.width / 2, Game.height / 2, 'background');
        background.anchor.setTo(0.5);
        Game.add.text(Game.width / 2 + 5, 256, 'You lost', {'fontSize': 82, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18}).anchor.setTo(0.5);


        let restartButton = Game.add.button(Game.width / 2, 590, 'button');
        restartButton.width = 410;
        restartButton.height = 120;
        restartButton.anchor.setTo(0.5);

        Game.add.text(Game.width / 2 + 5, 590, 'Restart', {'fontSize': 48, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 12}).anchor.setTo(0.5);


        let levelsButton = Game.add.button(Game.width / 2, 750, 'button');
        levelsButton.width = 260;
        levelsButton.height = 80;
        levelsButton.anchor.setTo(0.5);
        
        Game.add.text(Game.width / 2 + 3, 750, 'Levels', {'fontSize': 30, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#61461b', 'strokeThickness': 8}).anchor.setTo(0.5);
    },

    update: function () {
        // Game.add.text(Game.width / 2 + 10, 190, 'Tower', {'fontSize': 90, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18}).anchor.setTo(0.5);
    },
}