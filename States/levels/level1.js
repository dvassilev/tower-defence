'use strict'
let pathOutlinesLayer;

const level1State = {
    preload: function () {
        //Load map
        Game.load.tilemap('game-map', '../Maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        Game.load.image('map-tileset', '../Maps/map-tilesheet.png');

        //Load enemy troops
        Game.load.image('enemy-troop-1', '../IMG/enemy-troop-1.png');

        //Load hearts
        Game.load.image('fullLive', './/IMG/fullLive.png');
        Game.load.image('emptyLive', './/IMG/takenLive.png');



        Game.load.spritesheet('turretBTN','.//IMG/TurretBtn.png')
        Game.load.spritesheet('turret','.//IMG/towerDefense_tile250.png') 
    },




    create: function () {
        //Create the map
        this.createMap();

        //Create and spawn enemy troops
        this.enemyTroops = Game.add.group();

        for (let i = 0; i <= this.troopsPerWave; i++) {
            this.createEnemyTroop(-i * 90 - 64, 11);
        }

        //Add lives
        this.lives = Game.add.group();

        for (let i = 0; i < 3; i++) {
            this.createHeart(i * 64, 0, 'full');
        };



        this.lives.inputEnableChildren = true;

        this.createTurretBtn();
    },

    //Functions for create
    createMap: function () {
        this.map = Game.add.tilemap('game-map');
        this.map.addTilesetImage('map-tilesheet', 'map-tileset');
        this.map.createLayer('path');
        this.map.setCollisionByExclusion([]);

        pathOutlinesLayer = this.map.createLayer('pathOutlines');
        this.turretsLayer = this.map.createLayer('turrets')
       this.turretsLayer.inputEnabled = true;
        this.map.createLayer('decoration');

    },
    createEnemyTroop: function (Xpositions, startingTileHeightNumber) {
        let troop = level1State.enemyTroops.create(Xpositions, startingTileHeightNumber * 64 - 32, 'enemy-troop-1');
        troop.anchor.setTo(0.5);
        troop.width = 64;
        troop.height = 64;
        troop.angle = 90;

        troop.direction = this.gameDirection;
        Game.physics.enable(troop);
        troop.body.velocity.x = this.enemyTroopsSpeed;


        // troop.checkWorldBounds = true;
        // troop.events.onOutOfBounds.add(level1State.troopOut, this);
    },
    createHeart: function (x, y, type) {
        let heart;

        if(type == 'full') {
            heart = this.lives.create(x, y, 'fullLive');
        } else if(type =='empty') {
            heart = this.lives.create(x, y, 'emptyLive');
        } else {
            console.log('herat type error');
        }

        heart.type = type;

        heart.width = 64;
        heart.height = 64
    },

    createTurretBtn: function () {
        this.turretBtn = Game.add.button(0, Game.height - 600, 'turretBTN', level1State.spawnTurret)
        this.turretBtn.scale.setTo(0.5)

        level1State.LBtn = Game.input.activePointer.leftButton

  
    },


    spawnTurret: function () {
        level1State.turret = Game.add.sprite(0, Game.height - 100, 'turret')
        level1State.turret.width = 64
        level1State.turret.height = 64
        level1State.turret.anchor.setTo(0.5)
        level1State.toMove = true

        Game.physics.enable(level1State.turret)
       
       
    },

    dragDropTurret: function () {
        this.turret.position.x = this.input.activePointer.worldX
        this.turret.position.y = this.input.activePointer.worldY
    },



    update: function () {
        //Check if the furthest enemy is in the world
        this.ifEnemyInWorld();

        if(this.LBtn.isDown) {
            
            this.toMove = false
                      
                    };
                    if (this.toMove) {
                        level1State.dragDropTurret()
                    };
            
            
                    if (this.lives.input.pointerOver()) {
                        console.log(1)
                    }

        //Make enemy troops collide with the map
        Game.physics.arcade.collide(level1State.enemyTroops, pathOutlinesLayer, this.changeDirection);
    },




    //Additional functions 
    changeDirection: function () {
        let currentTroop = arguments[0]
        let direction = currentTroop.direction;

        let troopX = currentTroop.position.x;
        let troopY = currentTroop.position.y

        if (direction == 'left' || direction == 'right') {
            currentTroop.body.velocity.x = 0;

            //Check if there is path down or up
            if (!level1State.checkIfInCollidingLayer(troopX, troopY - 70)) {
                currentTroop.body.velocity.y = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'up';
                currentTroop.angle = 0;
            } else if (!level1State.checkIfInCollidingLayer(troopX, troopY + 70)) {
                currentTroop.body.velocity.y = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'down';
                currentTroop.angle = 180;
            } else {
                console.log('error with previous direction left or right');
            }
        } else if (direction == 'up' || direction == 'down') {
            currentTroop.body.velocity.y = 0;

            //Check if there is path to the left or to the right
            if (!level1State.checkIfInCollidingLayer(troopX - 70, troopY)) {
                currentTroop.body.velocity.x = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'left';
                currentTroop.angle = 270;
            } else if (!level1State.checkIfInCollidingLayer(troopX + 70, troopY)) {
                currentTroop.body.velocity.x = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'right';
                currentTroop.angle = 90;
            } else {
                console.log('error with previous direction up or down');
            }
        }
    },
    checkIfInCollidingLayer: function (x, y) {
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
    ifEnemyInWorld: function () {
        let furthestEnemy = this.enemyTroops.children[0];

        if (furthestEnemy != undefined) {
            let furthestEnemyX = furthestEnemy.position.x;
            let furthestEnemyY = furthestEnemy.position.y;


            if (this.gameDirection == 'right') {
                if (furthestEnemyX - 64 > Game.width) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'left') {
                if (furthestEnemyX + 64 < 0) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'up') {
                if (furthestEnemyY + 64 < 0) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'down') {
                if (furthestEnemyY - 64 > Game.height) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }

            }
        }
    },
    removeLive: function () {
        let lives = this.lives;
        let currentLive;

        for(let i = lives.children.length - 1; i >= 0; i--) {
            let live = lives.children[i];

            if(live.type == 'full') {
                currentLive = live;
                break;
            }
        }

        let fullLiveX = currentLive.position.x;
        let fullLiveY = currentLive.position.y;

        currentLive.destroy();

        this.createHeart(fullLiveX, fullLiveY, 'empty');


        if (lives.length == 0) {
            this.endGame();
        } 
    },
    endGame: function() {
        this.enemyTroops.children.forEach(enemy => {
            enemy.body.velocity = 0;
        })
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
    troopsPerWave: [5]
}