'use strict'
let level1icon, level2icon, unloadedLevel;
let level1;

const levelsState = {
    preload: function () {
        Game.load.image('background', '../IMG/levelsBackground.png');
        Game.load.image('level1Icon', '../IMG/Levels/level1Logo.png');
        Game.load.image('level2Icon', '../IMG/Levels/level2Logo.png');
        Game.load.image('unloadedLevelIcon', '../IMG/Levels/lockedlevelLogo.png');
    },

    create: function () {
        Game.add.image(0, 0, 'background');

        Game.add.text(Game.width / 2, 130, 'Levels', { fontSize: 100 }).anchor.setTo(0.5);

        console.log(this.levels);

        for (let i = 1; i <= 3; i++) {
            let ycoordinates = 3 * 64 + (i - 1) * 3 * 64;

            for (let j = 1; j <= 5; j++) {
                let xcoordinates = 3 * 64 + (j - 1) * 3 *64;
                let imageKey = (j - 1) + (i - 1) * 5;

                if (imageKey > this.levels.length - 1) {
                    imageKey = this.levels.length - 1;
                }

                console.log('imageKey:' + imageKey);
                console.log('levelsLength:' + this.levels.length);
                console.log(xcoordinates);
                console.log(ycoordinates);
                console.log(this.levels[imageKey])

                Game.add.image(xcoordinates, ycoordinates, this.levels[imageKey]);
            }
        };

    },

    update: function () {

    },

    levels: ['level1Icon', 'level2Icon', 'unloadedLevelIcon'],
}