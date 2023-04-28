'use strict'
let level1icon, level2icon, level3icon, level4icon,level5icon,level6icon,level7icon,level8icon,level9icon,unloadedLevel;

const levelsState = {
    preload: function () {
        Game.load.image('background', '../IMG/Backgrounds/levelsBackground.png');
        Game.load.image('Level1', '../IMG/Levels/level1Logo.png');
        Game.load.image('Level2', '../IMG/Levels/level2Logo.png');
        Game.load.image('Level3', '../IMG/Levels/level3Logo.png');
        Game.load.image('Level4', '../IMG/Levels/level4Logo.png');
        Game.load.image('Level5', '../IMG/Levels/level5Logo.png');
        Game.load.image('Level6', '../IMG/Levels/level6Logo.png');
        Game.load.image('Level7', '../IMG/Levels/level7Logo.png');
        Game.load.image('Level8', '../IMG/Levels/level8Logo.png');
        Game.load.image('Level9', '../IMG/Levels/level9Logo.png');
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

    levels: ['Level1', 'Level2', 'Level3', 'unloadedLevelIcon'],
}