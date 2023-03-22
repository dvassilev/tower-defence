'use strict'
let level1icon, level2icon, unloadedLevel;
let level1;

const levelsState = {
    preload: function () {
        Game.load.image('background', '../IMG/levelsBackground.png');
        Game.load.image('Level1', '../IMG/Levels/level1Logo.png');
        Game.load.image('Level2', '../IMG/Levels/level2Logo.png');
        Game.load.image('unloadedLevelIcon', '../IMG/Levels/lockedlevelLogo.png');
    },

    create: function () {
        Game.add.image(0, 0, 'background');

        Game.add.text(Game.width / 2, 130, 'Levels', { fontSize: 65, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18}).anchor.setTo(0.5);

        for (let i = 1; i <= 3; i++) {
            let ycoordinates = 3 * 64 + (i - 1) * 3 * 64;

            for (let j = 1; j <= 5; j++) {
                let xcoordinates = 3 * 64 + (j - 1) * 3 *64;
                let imageKey = (j - 1) + (i - 1) * 5;

                if (imageKey > this.levels.length - 1) {
                    imageKey = this.levels.length - 1;
                }

                if(this.levels[imageKey] != 'unloadedLevelIcon') {
                    Game.add.button(xcoordinates, ycoordinates, this.levels[imageKey], () => Game.state.start(this.levels[imageKey]));
                } else {
                    Game.add.image(xcoordinates, ycoordinates, this.levels[imageKey]);
                }
            }
        };

    },

    update: function () {

    },

    levels: ['Level1', 'unloadedLevelIcon'],
}