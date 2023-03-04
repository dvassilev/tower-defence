'use strict'

const level1State = {
    preload: function() {
        Game.load.tilemap('game-map', '../Maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        Game.load.image('map-tileset', '../Maps/map-tilesheet.png');
    },

    create: function() {
        level1State.createMap();
    },

    createMap: function() {
        const map = Game.add.tilemap('game-map');
        map.addTilesetImage('map-tilesheet', 'map-tileset');
        map.createLayer('path');
        map.createLayer('pathOutlines');
        map.createLayer('turrets');
        map.createLayer('decoration');
    },

    update: function() {
        
    },

    map: [],

}