'use strict'
let pathOutlinesLayer;

const level1State = {
    preload: function () {
        //Load map
        Game.load.tilemap('game-map', '../Maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        Game.load.image('map-tileset', '../Maps/map-tilesheet.png');

        //Load enemy troops
        Game.load.image('enemy-troop-1', '../IMG/enemy-troop-1.png');

        //Load turrets
        Game.load.spritesheet('redTower', './/IMG/Tiles PNG/towerDefense_tile250.png');
        Game.load.spritesheet('greenTower', './/IMG/Tiles PNG/towerDefense_tile249.png');
        Game.load.spritesheet('doubleRocketTower', './/IMG/Tiles PNG/towerDefense_tile205.png');
        Game.load.spritesheet('singleRocketTower', './/IMG/Tiles PNG/towerDefense_tile206.png');
        Game.load.spritesheet('bulletTower', './/IMG/Tiles PNG/towerDefense_tile203.png');

        //Load bullets
        Game.load.image('basicBullet', './/IMG/Tiles PNG/towerDefense_tile275.png')

        //Load turrets bases
        Game.load.image('bulletTowerBase', './/IMG/Turrets Bases/bulletBase.png');
        Game.load.image('doubleRocketTowerBase', './/IMG/Turrets Bases/doubleRocketTower.png');
        Game.load.image('greenTowerBase', './/IMG/Turrets Bases/greenTowerBase.png');
        Game.load.image('redTowerBase', './/IMG/Turrets Bases/redTowerBase.png');
        Game.load.image('singleRocketTowerBase', './/IMG/Turrets Bases/singleRocketBase.png');


        //Load hearts
        Game.load.image('fullLive', './/IMG/fullLive.png');
        Game.load.image('emptyLive', './/IMG/takenLive.png');

        //Load pause and start buttons
        Game.load.image('pauseButton', './/IMG/pauseButton.png');
        Game.load.image('playButton', './/IMG/playButton.png');

        //Load lose screen atributes
        Game.load.image('loseBackground', './/IMG/loseScreenBackground.png');
        Game.load.image('buttonTemplate', './/IMG/buttonTemplate.png');
    },




    create: function () {
        //Create the map
        this.createMap();

        // Create and spawn enemy troops
        this.enemyTroops = Game.add.group();

        for (let i = 0; i < this.troopsPerWave; i++) {
            this.createEnemyTroop(-i * 90 - 64, 11);
        }

        //Add lives
        this.lives = Game.add.group();

        for (let i = 0; i < 3; i++) {
            this.createHeart(i * 64, 0, 'full');
        }

        //Create turrets
        this.activeTurrets = Game.add.group();

        for (let i = 0; i < this.turretsThisLevel.length; i++) {
            let currentRow = 5 + i;

            this.createTurretBases(32, currentRow, this.turretsThisLevel[i]);
        }

        Game.input.onDown.add(this.clickHandler);

        //Create pause and start buttons
        this.createPausePlayButton('pauseButton');

        //Create bullets group
        this.bulletsOnScreen = Game.add.group();
    },

    //Functions for create
    createMap: function () {
        this.map = Game.add.tilemap('game-map');
        this.map.addTilesetImage('map-tilesheet', 'map-tileset');
        this.map.createLayer('path');
        this.map.setCollisionByExclusion([]);

        pathOutlinesLayer = this.map.createLayer('pathOutlines');
        this.map.createLayer('decoration');

        this.turretsLayer = this.map.createLayer('turrets');

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
    },
    createHeart: function (x, y, type) {
        let heart;

        if (type == 'full') {
            heart = this.lives.create(x, y, 'fullLive');
        } else if (type == 'empty') {
            heart = this.lives.create(x, y, 'emptyLive');
        } else {
            console.log('herat type error');
        }

        heart.type = type;

        heart.width = 64;
        heart.height = 64
    },
    createTurretBases: function (Xposition, startingTileHeightNumber, turretBaseKey) {
        let currentBase = Game.add.button(Xposition, startingTileHeightNumber * 64 - 32, turretBaseKey, this.createTurret);
        currentBase.anchor.setTo(0.5);
        currentBase.width = 64;
        currentBase.height = 64;
    },
    createTurret: function () {
        if (!Game.paused) {
            if (level1State.draggingTurret) {
                if (level1State.draggingTurret.currentlyDragging) {
                    level1State.draggingTurret.destroy();
                }
            }

            let key = this.key.replace('Base', '');
            level1State.draggingTurret = Game.add.sprite(Game.input.x, Game.input.y, key);
            level1State.draggingTurret.width = 64;
            level1State.draggingTurret.height = 64;
            level1State.draggingTurret.anchor.setTo(0.5);
            level1State.draggingTurret.currentlyDragging = true;

            level1State.activeTurrets.add(level1State.draggingTurret);
        }
    },
    createPausePlayButton: function (type) {
        this.pauseButton = Game.add.button(20 * 64 + 32, 32, type, this.onPauseButtonClick);
        this.pauseButton.anchor.setTo(0.5);
        this.pauseButton.width = 56;
        this.pauseButton.height = 56
    },
    spawnBullet: function (turretX, turretY) {
        level1State.bulletsOnScreen.create(turretX, turretY, 'basicTurret');
    },




    update: function () {
        //Check if the furthest enemy is in the world
        this.ifEnemyInWorld();

        //Make enemy troops collide with the map
        Game.physics.arcade.collide(level1State.enemyTroops, pathOutlinesLayer, this.changeDirection);

        if (level1State.draggingTurret) {
            if (level1State.draggingTurret.currentlyDragging) {
                this.dragDropTurret();
            }
        }

        //Rotate turrets to former target
        this.activeTurrets.children.forEach((child) => {
            let formerTarget = this.enemyTroops.children[0];

            child.rotation = Game.physics.arcade.angleBetween(child, formerTarget) + 1.6;
        })

    },


    //Additional functions 
    changeDirection: function () {
        let currentTroop = arguments[0]
        let direction = currentTroop.direction;

        let troopX = currentTroop.position.x;
        let troopY = currentTroop.position.y
        let layer = level1State.collidingLayerData;

        if (direction == 'left' || direction == 'right') {
            currentTroop.body.velocity.x = 0;

            //Check if there is path down or up
            if (!level1State.checkIfInCollidingLayer(troopX, troopY - 70, layer)) {
                currentTroop.body.velocity.y = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'up';
                currentTroop.angle = 0;
            } else if (!level1State.checkIfInCollidingLayer(troopX, troopY + 70, layer)) {
                currentTroop.body.velocity.y = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'down';
                currentTroop.angle = 180;
            } else {
                console.log('error with previous direction left or right');
            }
        } else if (direction == 'up' || direction == 'down') {
            currentTroop.body.velocity.y = 0;

            //Check if there is path to the left or to the right
            if (!level1State.checkIfInCollidingLayer(troopX - 70, troopY, layer)) {
                currentTroop.body.velocity.x = -level1State.enemyTroopsSpeed;
                currentTroop.direction = 'left';
                currentTroop.angle = 270;
            } else if (!level1State.checkIfInCollidingLayer(troopX + 70, troopY, layer)) {
                currentTroop.body.velocity.x = level1State.enemyTroopsSpeed;
                currentTroop.direction = 'right';
                currentTroop.angle = 90;
            } else {
                console.log('error with previous direction up or down');
            }
        }
    },
    checkIfInCollidingLayer: function (x, y, layer) {
        let layerWidthTiles = layer.width;

        //Find the coordinates tile properties
        let widthInTiles = Math.floor(x / 64);
        let heightInTiles = Math.floor(y / 64);

        let tileIndexInArray = heightInTiles * layerWidthTiles + widthInTiles;

        if (layer.data[tileIndexInArray] != 0) {
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
                if (furthestEnemyX - 55 >= Game.width) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'left') {
                if (furthestEnemyX + 64 <= 0) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'up') {
                if (furthestEnemyY + 64 <= 0) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }
            } else if (this.gameDirection == 'down') {
                if (furthestEnemyY - 64 >= Game.height) {
                    furthestEnemy.destroy();
                    this.removeLive();
                }

            }
        }
    },
    removeLive: function () {
        let lives = this.lives;
        let currentLive;
        let lastLive = false

        for (let i = lives.children.length - 1; i >= 0; i--) {
            let live = lives.children[i];

            if (live.type == 'full') {
                currentLive = live;

                if (i == 0) {
                    lastLive = true;
                }
                break;
            }
        }

        let fullLiveX = currentLive.position.x;
        let fullLiveY = currentLive.position.y;

        currentLive.destroy();

        this.createHeart(fullLiveX, fullLiveY, 'empty');

        if (lastLive) {
            this.endGame();
        }
    },
    clickHandler: function () {
        let pointerX = Game.input.mousePointer.x;
        let pointerY = Game.input.mousePointer.y;

        if (level1State.checkIfInCollidingLayer(pointerX, pointerY, level1State.turretLayerData)) {
            if (level1State.draggingTurret) {
                if (level1State.draggingTurret.currentlyDragging) {
                    level1State.draggingTurret.position.x = pointerX - (pointerX % 64) + 32;
                    level1State.draggingTurret.position.y = pointerY - (pointerY % 64) + 32;
                    level1State.draggingTurret.currentlyDragging = false;
                }
            }
        }
    },
    endGame: function () {
        this.enemyTroops.children.forEach(enemy => {
            enemy.body.velocity = 0;
        });
        
        Game.camera.fade('#000000', 1500, true, 0.7);
        setTimeout(function () {
            Game.camera.resetFX();
            Game.world.removeAll();
            level1State.laodLoseScreen();
        }, "1500");
    },
    dragDropTurret: function () {
        this.draggingTurret.position.x = this.input.activePointer.worldX
        this.draggingTurret.position.y = this.input.activePointer.worldY
        this.draggingTurret.currentlyDragging = true;
    },
    onPauseButtonClick: function () {
        let currentTypeOfButton = this.key;
        level1State.pauseButton.destroy();

        if (level1State.draggingTurret) {
            if (level1State.draggingTurret.currentlyDragging) {
                level1State.draggingTurret.destroy();
            }
        }

        if (currentTypeOfButton == 'pauseButton') {
            level1State.createPausePlayButton('playButton');
            Game.paused = true;
        } else if (currentTypeOfButton == 'playButton') {
            level1State.createPausePlayButton('pauseButton');
            Game.paused = false;
        } else {
            console.log('unknownTypeOfButton');
        }
    },
    laodLoseScreen: function () {
        let background = Game.add.sprite(Game.width / 2, Game.height / 2, 'loseBackground');
        background.anchor.setTo(0.5);
        Game.add.text(Game.width / 2 + 5, 256, 'You lost', { 'fontSize': 82, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 }).anchor.setTo(0.5);


        let restartButton = Game.add.button(Game.width / 2, 590, 'buttonTemplate', () => {
            Game.state.start(Game.state.current);
        });
        restartButton.width = 410;
        restartButton.height = 120;
        restartButton.anchor.setTo(0.5);

        Game.add.text(Game.width / 2 + 5, 590, 'Restart', { 'fontSize': 48, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 12 }).anchor.setTo(0.5);


        let levelsButton = Game.add.button(Game.width / 2, 750, 'buttonTemplate', () => Game.state.start('Levels'));
        levelsButton.width = 260;
        levelsButton.height = 80;
        levelsButton.anchor.setTo(0.5);

        Game.add.text(Game.width / 2 + 3, 750, 'Levels', { 'fontSize': 30, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#61461b', 'strokeThickness': 8 }).anchor.setTo(0.5);
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
    turretLayerData: {
        "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39,
            0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 39, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 39, 0, 0, 0, 0, 39, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 39, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0],
        "height": 14,
        "id": 3,
        "name": "turrets",
        "opacity": 1,
        "type": "tilelayer",
        "visible": true,
        "width": 21,
        "x": 0,
        "y": 0
    },
    gameDirection: 'right',
    enemyTroopsSpeed: 1000,
    troopsPerWave: [5],
    turretsThisLevel: ['redTowerBase', 'greenTowerBase', 'singleRocketTowerBase', 'doubleRocketTowerBase', 'bulletTowerBase'],

}