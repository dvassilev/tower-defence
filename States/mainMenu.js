'use strict'

const mainMenuState = {
    preload: function() {
        Game.load.image('startButton', '../IMG/Buttons/start button.png')
        Game.load.image('background', '../IMG/Backgrounds/menuBackground.png')
    },

    create: function() {
        //Load background
        Game.add.image(0, 0, 'background');

        //Add text
        Game.add.text(Game.width / 2 + 10, 190, 'Tower', {'fontSize': 90, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18}).anchor.setTo(0.5);
        Game.add.text(Game.width / 2 + 10, 320, 'Defence', {'fontSize': 90, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18}).anchor.setTo(0.5);

        //Add the start button
        this.button = Game.add.button(Game.width / 2, Game.height / 2 + 210, 'startButton', () => Game.state.start('Levels'));
        this.button.anchor.setTo(0.5);
        this.button.scale.setTo(0.2);
    },

    update: function() {

    }

}