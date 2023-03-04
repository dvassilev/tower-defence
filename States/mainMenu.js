'use strict'

const mainMenuState = {
    preload: function() {
        Game.load.image('startButton', '../IMG/start button.png')
    },

    create: function() {
        //Add the start button
        this.button = Game.add.button(Game.width / 2, Game.height / 2, 'startButton', () => Game.state.start('level1'));
        this.button.scale.setTo(0.2);
        this.button.anchor.setTo(0.5);
    
    },

    update: function() {

    }

}