'use strict'
let level1icon;
let level1;

const levelsState = {
    preload: function() {
        level1icon = Game.load.image('level1icon', '../IMG/Levels/level1.png')
    },

    create: function() {
        Game.add.text(Game.width / 2, 50, 'Levels', {fontSize: 100}).anchor.setTo(0.5);
        
        Game.add.button(150, 150, 'level1icon', ()=> Game.state.start('level1')).scale.setTo(0.8);
        Game.add.image(368.2, 150, 'level1icon').scale.setTo(0.8);
        Game.add.image(586.4, 150, 'level1icon').scale.setTo(0.8);
        Game.add.image(804.6, 150, 'level1icon').scale.setTo(0.8);
        Game.add.image(1022.8, 150, 'level1icon').scale.setTo(0.8);

        Game.add.image(150, 343.2, 'level1icon').scale.setTo(0.8);
        Game.add.image(368.2, 343.2, 'level1icon').scale.setTo(0.8);
        Game.add.image(586.4, 343.2, 'level1icon').scale.setTo(0.8);
        Game.add.image(804.6, 343.2, 'level1icon').scale.setTo(0.8);
        Game.add.image(1022.8, 343.2, 'level1icon').scale.setTo(0.8);

    },

    update: function() {

    },
}