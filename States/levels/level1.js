'use strict'
let troop, pathOutlinesLayer;

const level1State = {
    preload: function () {
        //Load map
        Game.load.tilemap('game-map', '../Maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        Game.load.image('map-tileset', '../Maps/map-tilesheet.png');

        //Load enemy troops
        Game.load.image('enemy-troop-1', '../IMG/enemy-troop-1.png');
    },

    create: function () {
        this.createMap();

        this.createEnemyTroop(11);

        this.createCollisionLayers();

    },

    //Functions for create
    createMap: function () {
        this.map = Game.add.tilemap('game-map');
        this.map.addTilesetImage('map-tilesheet', 'map-tileset');
        this.map.createLayer('path');
        this.map.setCollisionByExclusion([]);

    },
    createCollisionLayers: function () {
        pathOutlinesLayer = this.map.createLayer('pathOutlines');
        this.map.createLayer('turrets');
        this.map.createLayer('decoration');
    },
    createEnemyTroop: function (startingTile) {
        troop = Game.add.sprite(30, (startingTile - 1) * 64 + 32, 'enemy-troop-1');
        troop.anchor.setTo(0.5);
        troop.width = 64;
        troop.height = 64;
        troop.direction = this.gameDirection;
        Game.physics.enable(troop);
        troop.body.velocity.x = this.enemyTroopsSpeed;
    },



    
    update: function () {
        //Make the troops moving
        Game.physics.arcade.collide(troop, pathOutlinesLayer, this.changeDirection);
    },

    //Additional functions for update
    changeDirection: function () {
        let currentTroop = troop;
        let direction = currentTroop.direction;

        let troopX = currentTroop.position.x;
        let troopY = currentTroop.position.y
        
        if (direction == 'left' || direction == 'right') {
            currentTroop.body.velocity.x = 0;

            //Check if there is path down or up
            if (!level1State.checkIfInCollidingLayer(troopX, troopY - 70)) {
                currentTroop.body.velocity.y = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'up';
            } else if(!level1State.checkIfInCollidingLayer(troopX, troopY + 70)){
                currentTroop.body.velocity.y = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'down';
            } else {
                console.log('error with previous direction left or right');
            }
        } else if (direction == 'up' || direction == 'down') {
            currentTroop.body.velocity.y = 0;

            //Check if there is path to the left or to the right
            if (!level1State.checkIfInCollidingLayer(troopX - 70, troopY)) {
                currentTroop.body.velocity.x = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'left';
            } else if(!level1State.checkIfInCollidingLayer(troopX + 70, troopY)){
                currentTroop.body.velocity.x = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'right';
            } else {
                console.log('error with previous direction up or down');
            }
        }
    },

    checkIfInCollidingLayer: function(x, y) {
        //14
        let layerHeightTiles = this.collidingLayerData.height;
        //21
        let layerWidthTiles = this.collidingLayerData.width;

        //Find the coordinates tile properties
        let widthInTiles = Math.floor(x / 64);
        let heightInTiles = Math.floor(y / 64);

        let tileIndexInArray = heightInTiles * layerWidthTiles + widthInTiles;

        if (this.collidingLayerData.data[tileIndexInArray] != 0) {
            return true;
        } else {
            return false;
        }
    },

    //Variables
    collidingLayerData: {
        "data": [130, 130, 130, 130, 70, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 72, 130,
            130, 130, 130, 130, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 73, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 74, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 93, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 93, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 70, 71, 71, 71, 71, 71, 71, 97, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 93, 0, 0, 0, 0, 0, 0, 0, 0, 95, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 93, 0, 73, 117, 117, 117, 117, 117, 117, 118, 130,
            130, 130, 130, 130, 93, 0, 95, 130, 130, 130, 93, 0, 95, 130, 130, 130, 130, 130, 130, 130, 130,
            71, 71, 71, 71, 97, 0, 95, 130, 130, 130, 93, 0, 95, 130, 130, 130, 130, 130, 130, 130, 130,
            0, 0, 0, 0, 0, 0, 95, 130, 130, 130, 93, 0, 96, 71, 71, 71, 71, 71, 71, 71, 71,
            117, 117, 117, 117, 117, 117, 118, 130, 130, 130, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 116, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117,
            130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130, 130],
        "height": 14,
        "id": 1,
        "name": "pathOutlines",
        "opacity": 1,
        "type": "tilelayer",
        "visible": true,
        "width": 21,
        "x": 0,
        "y": 0
    },
    gameDirection: 'right',
    enemyTroopsSpeed: 1000,
}