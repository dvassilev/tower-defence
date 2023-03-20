'use strict'

const loseScreenState = {
    preload: function () {
        Game.load.image('background', '../IMG/loseScreenBackground.png');
    },

    create: function () {
        this.createBackground();
    },

    createBackground: function () {
        let background = Game.add.sprite(Game.width / 2, Game.height / 2, 'background');
        background.width -= 100
        background.height -= 100;
        background.anchor.setTo(0.5);
    },

    update: function () {

    },
}