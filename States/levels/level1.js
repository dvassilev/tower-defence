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
        troop.currentDirection = this.gameDirection;
    },

    update: function () {
        this.changeDirection(troop);
        Game.physics.arcade.collide(troop, pathOutlinesLayer);
        console.log(troop.body.touching.up);
        console.log(troop.body.touching.right);
    },

    changeDirection: function (currentTroop) {
        console.log(currentTroop.currentDirection);
        console.log(currentTroop.previousDirection);
        console.log(pathOutlinesLayer.getBounds())
        // if (Game.physics.arcade.collide(currentTroop, pathOutlinesLayer)) {
        //     if (currentTroop.currentDirection == 'left' || currentTroop.currentDirection == 'right') {
        //         currentTroop.body.velocity.x = 0;

        //         if (currentTroop.previousDirection == 'up') {
        //             currentTroop.body.velocity.y = this.enemyTroopsSpeed;
        //             currentTroop.previousDirection = currentTroop.currentDirection;
        //             currentTroop.currentDirection = 'down';
        //         } else {
        //             currentTroop.body.velocity.y = -this.enemyTroopsSpeed;
        //             currentTroop.previousDirection = currentTroop.currentDirection;
        //             currentTroop.currentDirection = 'up';
                    
        //         }
        //     } else if (currentTroop.currentDirection == 'up' || currentTroop.currentDirection == 'down') {
        //         currentTroop.body.velocity.y = 0;

        //         if (currentTroop.previousDirection == 'right') {
        //             currentTroop.body.velocity.x = this.enemyTroopsSpeed;
        //             currentTroop.previousDirection = currentTroop.currentDirection;
        //             currentTroop.currentDirection = 'left';
        //         } else {
        //             currentTroop.body.velocity.x = -this.enemyTroopsSpeed;
        //             currentTroop.previousDirection = currentTroop.currentDirection;
        //             currentTroop.currentDirection = 'right';
                    
        //         }
        //     }
        // }

        
    },

    gameDirection: 'left',
    enemyTroopsSpeed: 500,
}