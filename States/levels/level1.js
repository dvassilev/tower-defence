'use strict'

let pathOutlinesLayer;

const level1State = {
    preload: function () {
        //Load map
        Game.load.tilemap('game-map', '../Maps/Level1/map.json', null, Phaser.Tilemap.TILED_JSON);
        Game.load.image('map-tileset', '../Maps/map-tilesheet.png');

        //Load enemy troops
        Game.load.image('enemy-troop-1', '../IMG/enemy-troop-1.png');

        //Load turrets
        Game.load.image('redTower', '../IMG/Turrets/towerDefense_tile250.png');
        Game.load.image('greenTower', '../IMG/Turrets/towerDefense_tile249.png');
        Game.load.image('doubleRocketTower', '../IMG/Turrets/towerDefense_tile205.png');
        Game.load.image('singleRocketTower', '../IMG/Turrets/towerDefense_tile206.png');
        Game.load.image('bulletTower', '../IMG/Turrets/towerDefense_tile203.png');

        //Load health bar
        Game.load.image('fullHealthBar', '../IMG/fullHealthBar.png');
        Game.load.image('emptyHealthBar', '../IMG/emptyHealthBar.png');

        //Load bullets
        Game.load.image('rocketBullet', '../IMG/Bullets/towerDefense_tile252.png');
        Game.load.image('basicBullet', '../IMG/Bullets/towerDefense_tile275.png');
        Game.load.image('smallBullet', '../IMG/Bullets/towerDefense_tile274.png');


        //Load turrets bases
        Game.load.image('bulletTowerBase', '../IMG/Turrets Bases/bulletBase.png');
        Game.load.image('doubleRocketTowerBase', '../IMG/Turrets Bases/doubleRocketTower.png');
        Game.load.image('greenTowerBase', '../IMG/Turrets Bases/greenTowerBase.png');
        Game.load.image('redTowerBase', '../IMG/Turrets Bases/redTowerBase.png');
        Game.load.image('singleRocketTowerBase', '../IMG/Turrets Bases/singleRocketBase.png');


        //Load hearts and coin
        Game.load.image('fullLive', '../IMG/fullLive.png');
        Game.load.image('emptyLive', '../IMG/takenLive.png');
        Game.load.image('coin', '../IMG/coin.png');

        //Load pause and start buttons
        Game.load.image('pauseButton', '../IMG/Buttons/pauseButton.png');
        Game.load.image('playButton', '../IMG/Buttons/playButton.png');

        //Load lose and win screen atributes
        Game.load.image('loseBackground', '../IMG/Backgrounds/loseScreenBackground.png');
        Game.load.image('winBackground', '../IMG/Backgrounds/winScreenBackground.png');
        Game.load.image('buttonTemplate', '../IMG/Buttons/buttonTemplate.png');

    },




    create: function () {
        //Create the map
        this.createMap();

        //Add the text for new wave
        this.currentWave = 0;
        this.createNewWaveText(this.currentWave);
        this.gameIsRunning = false;

        //Add the rest of the things after the wave text disappears
        setTimeout(function () {
            level1State.newWaveText.destroy();
            level1State.waveNumberText.destroy();

            //Set game as running
            level1State.gameIsRunning = true;

            // Create and spawn enemy troops
            level1State.enemyTroops = Game.add.group();

            for (let i = 0; i < level1State.troopsPerWave[level1State.currentWave]; i++) {
                let troopsStartingHeight = 11;
                let troopsStartingWidth;

                if (level1State.gameDirection == 'left') {
                    level1State.createEnemyTroop(21 * 64 + i * 90, troopsStartingHeight * 64 - 32, 270);
                } else if (level1State.gameDirection == 'right') {
                    level1State.createEnemyTroop(-1 * 64 - i * 90, troopsStartingHeight * 64 - 32, 90);
                } else if (level1State.gameDirection == 'up') {
                    level1State.createEnemyTroop(troopsStartingWidth * 64 - 32, 14 * 64 + i * 90, 0);
                } else if (level1State.gameDirection == 'down') {
                    level1State.createEnemyTroop(troopsStartingWidth * 64 - 32, -1 * 64 - i * 90, 180);
                } else {
                    console.log('unexisting direction');
                }
            }

            //Add lives
            level1State.lives = Game.add.group();

            for (let i = 0; i < 3; i++) {
                level1State.createHeart(i * 64, 0, 'full');
            }

            //Add money
            level1State.avaliableMoney = 20;
            level1State.createMoney();

            //Create turrets bases
            level1State.turretsBases = Game.add.group();

            for (let i = 0; i < level1State.turretsThisLevel.length; i++) {
                let currentRow = 5 + i;

                level1State.createTurretBases(32, currentRow, level1State.turretsThisLevel[i]);
            }

            //Create turrets group
            level1State.activeTurrets = Game.add.group();

            //Create pause and start buttons
            level1State.createPausePlayButton('pauseButton');

            //Create bullets group
            level1State.bulletsOnScreen = Game.add.group();

            Game.input.onDown.add(level1State.checkIfTurretShouldBePlaced);
        }, 3000)

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
    createNewWaveText: function (waveNumber) {
        let newWaveText = Game.add.text(Game.width / 2 + 5, 256, `Upcoming wave`, { 'fontSize': 82, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 });
        let waveNumberText = Game.add.text(Game.width / 2 + 5, 370, `${waveNumber + 1} of ${level1State.troopsPerWave.length}`, { 'fontSize': 60, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 });

        newWaveText.anchor.setTo(0.5);
        waveNumberText.anchor.setTo(0.5);

        level1State.newWaveText = newWaveText;
        level1State.waveNumberText = waveNumberText;
    },
    createEnemyTroop: function (Xpositions, Yposition, angle) {
        let troop = level1State.enemyTroops.create(Xpositions, Yposition, 'enemy-troop-1');
        troop.anchor.setTo(0.5);
        troop.width = 64;
        troop.height = 64;
        troop.angle = angle;
        troop.health = 100;

        troop.direction = this.gameDirection;
        Game.physics.enable(troop);

        if (level1State.gameDirection == 'left') {
            troop.body.velocity.x = -level1State.enemyTroopsSpeed;
        } else if (level1State.gameDirection == 'right') {
            troop.body.velocity.x = level1State.enemyTroopsSpeed;
        } else if (level1State.gameDirection == 'up') {
            troop.body.velocity.y = -level1State.enemyTroopsSpeed;
        } else if (level1State.gameDirection == 'down') {
            troop.body.velocity.y = level1State.enemyTroopsSpeed;
        } else {
            console.log('wrong direction');
        }
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



        //Add the cost of each turret
        currentBase.price = level1State.determineTurretCost(currentBase.key);
        level1State.checkIfShouldBeTinted(currentBase);

        currentBase.priceTag = Game.add.text(64, startingTileHeightNumber * 64 - 38, currentBase.price, { 'fontSize': 12, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#000000', 'strokeThickness': 2 });
        currentBase.coinSymbol = Game.add.sprite(64 + 25, startingTileHeightNumber * 64 - 38, 'coin');
        currentBase.coinSymbol.width = 15;
        currentBase.coinSymbol.height = 13;

        level1State.turretsBases.add(currentBase);
    },
    checkIfShouldBeTinted: function (base) {
        if (level1State.avaliableMoney >= base.price) {
            base.tint = 0xffffff;
        } else {
            base.tint = 0x5e6464;
        }
    },
    checkEveryBaseForTint: function () {
        level1State.turretsBases.children.forEach((base) => {
            level1State.checkIfShouldBeTinted(base);
        });
    },
    createTurret: function () {
        if (level1State.avaliableMoney >= this.price) {
            let upcomingTurretKey = this.key.replace('Base', '');
            let turretShouldBeCreated = true;

            if (level1State.draggingTurret) {
                if (level1State.draggingTurret.currentlyDragging) {
                    //Cancel the turret
                    if (level1State.draggingTurret.key == upcomingTurretKey) {
                        turretShouldBeCreated = false;
                    }

                    level1State.draggingTurret.destroy();
                    level1State.draggingTurret = null;
                }
            }

            if (turretShouldBeCreated) {
                let currentTurret = level1State.draggingTurret = Game.add.sprite(Game.input.x, Game.input.y, upcomingTurretKey);
                currentTurret.width = 64;
                currentTurret.height = 64;
                currentTurret.anchor.setTo(0.5);

                if (upcomingTurretKey == 'redTower' || upcomingTurretKey == 'greenTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level1State.gameIsRunning) {
                            if (!Game.paused && !level1State.interWavesState) {
                                level1State.spawnBullet(turret);
                            }

                            setTimeout(turret.shootBullet, 3000, turret);
                        }
                    };
                } else if (upcomingTurretKey == 'bulletTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level1State.gameIsRunning) {
                            if (!Game.paused && !level1State.interWavesState) {
                                level1State.spawnBullet(turret);
                            }

                            setTimeout(turret.shootBullet, 800, turret);
                        }
                    };
                } else if (upcomingTurretKey == 'singleRocketTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level1State.gameIsRunning) {
                            if (!Game.paused && !level1State.interWavesState) {
                                level1State.spawnBullet(turret);
                            }
                        }
                    };
                }

                currentTurret.currentlyDragging = true;
                currentTurret.activeBullets = Game.add.group();

                level1State.activeTurrets.add(currentTurret);
            }
        }
    },
    spawnBullet: function (turret) {
        let turretX = turret.position.x;
        let turretY = turret.position.y;
        let turretType = turret.key;

        //Function to calculate the difference between the turret coordinates and the bullet coordinates based on the angle with the target
        function calculateBasicBulletDifference(totalRadius, rawAngle) {
            let piDividedByTwo = Number((Math.PI / 2).toFixed(2));

            //Get the angle between the turret and the target
            let angle = Math.abs(rawAngle - Math.trunc(rawAngle / piDividedByTwo) * piDividedByTwo).toFixed(2);
            let angleSin = Math.sin(angle);
            let angleCos = Math.cos(angle);

            //Determine turret rotation quadrant
            let quadrant;

            if (rawAngle < 0) {
                if (rawAngle >= -piDividedByTwo) {
                    quadrant = 1;
                } else {
                    quadrant = 2;
                }
            } else {
                if (rawAngle >= piDividedByTwo) {
                    quadrant = 3;
                } else {
                    quadrant = 4;
                }
            };


            //Determine the bullet coordinates 
            let spawnX;
            let spawnY;

            switch (quadrant) {
                case 1:
                    spawnX = angleCos * totalRadius;
                    spawnY = -angleSin * totalRadius;
                    break;
                case 2:
                    spawnX = -angleSin * totalRadius;
                    spawnY = -angleCos * totalRadius;
                    break;
                case 3:
                    spawnX = -angleSin * totalRadius;
                    spawnY = angleCos * totalRadius;
                    break;
                case 4:
                    spawnX = angleCos * totalRadius;
                    spawnY = angleSin * totalRadius;
                    break;
            }

            return [spawnX, spawnY];
        }


        if (turretType == 'greenTower') {
            let currentBulletType = 'basicBullet';
            let turretPlusBallRadius = 32 + 6;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level1State.enemyTroops.children[0])

            let [spawnX, spawnY] = calculateBasicBulletDifference(turretPlusBallRadius, rawAngle)

            let currentBullet = level1State.bulletsOnScreen.create(turretX + spawnX, turretY + spawnY, currentBulletType);
            currentBullet.anchor.setTo(0.5);
            Game.physics.enable(currentBullet);

            level1State.bulletsOnScreen.add(currentBullet);
        } else if (turretType == 'redTower') {
            let currentBulletType = 'basicBullet';
            let turretPlusBallRadius = 32 + 6;
            let angleDifferenceForTwoBullets = 0.22;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level1State.enemyTroops.children[0]);
            let firstAngle = rawAngle + angleDifferenceForTwoBullets;
            let secondAngle = rawAngle - angleDifferenceForTwoBullets;;

            if (rawAngle + angleDifferenceForTwoBullets > Math.PI) {
                firstAngle = -Math.PI + (angleDifferenceForTwoBullets - (Math.PI - rawAngle));
            } else if (rawAngle - angleDifferenceForTwoBullets < -Math.PI) {
                secondAngle = Math.PI - (angleDifferenceForTwoBullets - (Math.PI + rawAngle));
            }

            let [firstBallSpawnX, firstBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, firstAngle);
            let [secondBallSpawnX, secondBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, secondAngle);

            let firstBullet = level1State.bulletsOnScreen.create(turretX + firstBallSpawnX, turretY + firstBallSpawnY, currentBulletType);
            firstBullet.anchor.setTo(0.5);
            Game.physics.enable(firstBullet);

            let secondBullet = level1State.bulletsOnScreen.create(turretX + secondBallSpawnX, turretY + secondBallSpawnY, currentBulletType);
            secondBullet.anchor.setTo(0.5);
            Game.physics.enable(secondBullet);

            level1State.bulletsOnScreen.add(firstBullet);
            level1State.bulletsOnScreen.add(secondBullet);
        } else if (turretType == 'bulletTower') {
            let currentBulletType = 'smallBullet';
            let turretPlusBallRadius = 32 + 3.6;
            let angleDifferenceForTwoBullets = 0.19;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level1State.enemyTroops.children[0]);
            let firstAngle = rawAngle + angleDifferenceForTwoBullets;
            let secondAngle = rawAngle - angleDifferenceForTwoBullets;;

            if (rawAngle + angleDifferenceForTwoBullets > Math.PI) {
                firstAngle = -Math.PI + (angleDifferenceForTwoBullets - (Math.PI - rawAngle));
            } else if (rawAngle - angleDifferenceForTwoBullets < -Math.PI) {
                secondAngle = Math.PI - (angleDifferenceForTwoBullets - (Math.PI + rawAngle));
            }

            let [firstBallSpawnX, firstBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, firstAngle);
            let [secondBallSpawnX, secondBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, secondAngle);

            let firstBullet = level1State.bulletsOnScreen.create(turretX + firstBallSpawnX, turretY + firstBallSpawnY, currentBulletType);
            firstBullet.anchor.setTo(0.5);
            firstBullet.scale.setTo(0.6);
            Game.physics.enable(firstBullet);

            let secondBullet = level1State.bulletsOnScreen.create(turretX + secondBallSpawnX, turretY + secondBallSpawnY, currentBulletType);
            secondBullet.anchor.setTo(0.5);
            secondBullet.scale.setTo(0.6);
            Game.physics.enable(secondBullet);

            level1State.bulletsOnScreen.add(firstBullet);
            level1State.bulletsOnScreen.add(secondBullet);
        } else if (turretType == 'singleRocketTower') {
            let currentBulletType = 'rocketBullet';
            let turretPlusBallRadius = 32 + 10;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level1State.enemyTroops.children[0])

            let [spawnX, spawnY] = calculateBasicBulletDifference(turretPlusBallRadius, rawAngle)

            let currentBullet = level1State.bulletsOnScreen.create(turretX + spawnX, turretY + spawnY, currentBulletType);
            currentBullet.anchor.setTo(0.5);
            currentBullet.rotation = Game.physics.arcade.angleBetween(turret, level1State.enemyTroops.children[0]) + (Math.PI / 2);
            Game.physics.enable(currentBullet);

            currentBullet.parentTurret = turret;

            level1State.bulletsOnScreen.add(currentBullet);
        } else {
            console.log('unexisting type of turret');
        }
    },
    createPausePlayButton: function (type) {
        level1State.pauseButton = Game.add.button(20 * 64 + 32, 32, type, level1State.onPauseButtonClick);
        level1State.pauseButton.anchor.setTo(0.5);
        level1State.pauseButton.width = 56;
        level1State.pauseButton.height = 56
    },
    createMoney: function () {
        //Add the money number
        level1State.moneyOnScreen = Game.add.text(1 * 64 + 29, 64 + 32, level1State.avaliableMoney, { 'fontSize': 25, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#000000', 'strokeThickness': 5 });
        level1State.moneyOnScreen.anchor.setTo(0.5);

        //Add the money icon
        let moneyIcon = Game.add.sprite(0 * 64 + 32, 64 + 32, 'coin');
        moneyIcon.anchor.setTo(0.5, 0.65);
        moneyIcon.width = 59;
        moneyIcon.height = 50;
    },

    update: function () {
        if (level1State.gameIsRunning && !level1State.interWavesState) {
            //Check if the furthest enemy is in the world
            level1State.ifEnemyInWorld();

            //Make enemy troops collide with the map
            Game.physics.arcade.collide(level1State.enemyTroops, pathOutlinesLayer, level1State.changeDirection);

            //Make the healthbar follow the former target
            if (level1State.enemyTroops.children[0]) {
                if (level1State.enemyTroops.children[0].fullHealthBar) {
                    if (level1State.enemyTroops.children[0].fullHealthBar.visible) {
                        let formerTarger = level1State.enemyTroops.children[0];
                        let fullHealthBar = formerTarger.fullHealthBar;
                        let emptyHealthBar = formerTarger.emptyHealthBar;

                        fullHealthBar.position.x = formerTarger.position.x - 32;
                        fullHealthBar.position.y = formerTarger.position.y - (32 + 20);

                        emptyHealthBar.position.x = formerTarger.position.x - 32 + fullHealthBar.width;
                        emptyHealthBar.position.y = formerTarger.position.y - (32 + 20);
                    }
                }
            }

            //Rotate turrets
            if (level1State.activeTurrets.children.length > 0) {
                if (level1State.enemyTroops.children.length > 0) {
                    level1State.activeTurrets.forEach((turret) => {

                        if (!turret.currentlyDragging) {
                            let formerTarget = level1State.enemyTroops.children[0];
                            turret.rotation = Game.physics.arcade.angleBetween(turret, formerTarget) + (Math.PI / 2);
                        }
                    });
                }
            }

            //Make the bullets follow the former target and collide with the former target
            if (level1State.bulletsOnScreen.children.length > 0) {
                if (level1State.enemyTroops.children.length > 0) {
                    let formerTarget = level1State.enemyTroops.children[0];

                    level1State.bulletsOnScreen.children.forEach((bullet) => {
                        if (bullet.key == 'rocketBullet') {
                            bullet.rotation = Game.physics.arcade.angleBetween(bullet, formerTarget) + (Math.PI / 2);
                            Game.physics.arcade.moveToObject(bullet, formerTarget, 200, 70);
                        } else if (bullet.key == 'basicBullet' || bullet == 'smallBullet') {
                            Game.physics.arcade.moveToObject(bullet, formerTarget, 200, 70);
                        }
                    });

                    Game.physics.arcade.overlap(level1State.bulletsOnScreen, formerTarget, level1State.onBulletCollision);
                }
            }

            //Check for dragging turret
            if (level1State.draggingTurret) {
                if (level1State.draggingTurret.currentlyDragging) {
                    level1State.dragDropTurret();
                }
            }
        }
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
        let furthestEnemy = level1State.enemyTroops.children[0];

        if (furthestEnemy) {
            let furthestEnemyX = furthestEnemy.position.x;
            let furthestEnemyY = furthestEnemy.position.y;

            if (level1State.gameDirection == 'right') {
                if (furthestEnemyX - 55 >= Game.width) {
                    level1State.removeLive();

                    if (level1State.gameIsRunning) {
                        level1State.killTroop(furthestEnemy);
                    }
                }
            } else if (level1State.gameDirection == 'left') {
                if (furthestEnemyX + 64 <= 0) {
                    level1State.removeLive();

                    if (level1State.gameIsRunning) {
                        level1State.killTroop(furthestEnemy);
                    }
                }
            } else if (level1State.gameDirection == 'up') {
                if (furthestEnemyY + 64 <= 0) {
                    level1State.removeLive();

                    if (level1State.gameIsRunning) {
                        level1State.killTroop(furthestEnemy);
                    }
                }
            } else if (level1State.gameDirection == 'down') {
                if (furthestEnemyY - 64 >= Game.height) {
                    level1State.removeLive();

                    if (level1State.gameIsRunning) {
                        level1State.killTroop(furthestEnemy);
                    }
                }

            }
        }
    },
    removeLive: function () {
        let lives = level1State.lives;
        let currentLive;
        let lastLive = false;

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
        level1State.createHeart(fullLiveX, fullLiveY, 'empty');

        if (lastLive) {
            level1State.endGame('lose');
        }
    },
    prepareNewWave: function () {
        if (level1State.bulletsOnScreen.children.length > 0) {
            level1State.bulletsOnScreen.children.forEach(bullet => {
                bullet.kill();
            })
        }

        level1State.disableOrEnableBases('disable');

        this.interWavesState = true;
        this.currentWave++;
        this.createNewWaveText(level1State.currentWave);

        setTimeout(function () {
            level1State.newWaveText.destroy();
            level1State.waveNumberText.destroy();

            for (let i = 0; i < level1State.troopsPerWave[level1State.currentWave]; i++) {
                level1State.createEnemyTroop(-i * 90 - 64, 11);
            }

            level1State.disableOrEnableBases('enable');
            level1State.interWavesState = false;
        }, 3000);
    },
    dragDropTurret: function () {
        this.draggingTurret.position.x = this.input.activePointer.worldX
        this.draggingTurret.position.y = this.input.activePointer.worldY
        this.draggingTurret.currentlyDragging = true;
    },
    checkIfTurretShouldBePlaced: function () {
        let pointerX = Game.input.mousePointer.x;
        let pointerY = Game.input.mousePointer.y;

        if (level1State.checkIfInCollidingLayer(pointerX, pointerY, level1State.turretLayerData)) {
            if (level1State.draggingTurret) {
                if (level1State.draggingTurret.currentlyDragging) {
                    level1State.draggingTurret.position.x = (pointerX - (pointerX % 64) + 32);
                    level1State.draggingTurret.position.y = (pointerY - (pointerY % 64) + 32);

                    level1State.draggingTurret.currentlyDragging = false;
                    level1State.draggingTurret.shootBullet(level1State.draggingTurret);
                    level1State.updateMoney(level1State.determineTurretCost(level1State.draggingTurret.key), 'remove');
                }
            }
        }
    },
    determineTurretCost: function (type) {
        let price;

        if (type == 'greenTowerBase' || type == 'greenTower') {
            price = 10;
        } else if (type == 'redTowerBase' || type == 'redTower') {
            price = 20;
        } else if (type == 'bulletTowerBase' || type == 'bulletTower') {
            price = 25;
        } else if (type == 'singleRocketTowerBase' || type == 'singleRocketTower') {
            price = 30;
        } else if (type == 'doubleRocketTowerBase' || type == 'doubleRocketTower') {
            price = 50;
        }

        return price;
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
            level1State.disableOrEnableBases('disable');

            level1State.createPausePlayButton('playButton');
            Game.paused = true;
        } else if (currentTypeOfButton == 'playButton') {
            level1State.disableOrEnableBases('enable');

            level1State.createPausePlayButton('pauseButton');
            Game.paused = false;
        }
    },
    disableOrEnableBases: function (toDo) {
        if (toDo == 'enable') {
            level1State.turretsBases.children.forEach(base => {
                base.inputEnabled = true;
            });
        } else if (toDo == 'disable') {
            level1State.turretsBases.children.forEach(base => {
                base.inputEnabled = false;
            });
        } else {
            console.log('You have to either enable or disable bases')
        }
    },
    onBulletCollision: function () {
        let troop = arguments[0];
        let bullet = arguments[1];

        // bullet.destroy();
        let bulletType = bullet.key;
        let bulletDamage;

        switch (bulletType) {
            case 'basicBullet':
                bulletDamage = 20;
                break;
            case 'smallBullet':
                bulletDamage = 8;
                break;
            case 'rocketBullet':
                bulletDamage = 30;

                //Fire another rocket
                let parentTurret = bullet.parentTurret;
                parentTurret.shootBullet(parentTurret)
                break;
        }

        let troopHealthLeft = troop.health - bulletDamage;

        if (troopHealthLeft <= 0) {
            level1State.killTroop(troop);
        } else {
            troop.health = troopHealthLeft;

            //Determine the length of each part of the health bar
            let fullPartLength = troopHealthLeft * 64 / 100;
            let emptyPartLength = 64 - fullPartLength;

            //Create health bar for the troop if there isn't
            if (!troop.fullHealthBar) {
                troop.fullHealthBar = Game.add.sprite(troop.position.x - 32, troop.position.y - (32 + 20), 'fullHealthBar');
                troop.emptyHealthBar = Game.add.sprite(troop.position.x - 32 + fullPartLength, troop.position.y - (32 + 20), 'emptyHealthBar');
            }

            //Update the health bar
            troop.fullHealthBar.width = fullPartLength;
            troop.fullHealthBar.visible = true;

            troop.emptyHealthBar.width = emptyPartLength;
            troop.emptyHealthBar.visible = true;

            //Make the health bar dissapear 
            setTimeout(() => {
                troop.fullHealthBar.visible = false;
                troop.emptyHealthBar.visible = false;
            }, 2000);
        }

        bullet.destroy();
    },
    killTroop: function (currentTroop) {
        if (currentTroop.fullHealthBar) {
            currentTroop.fullHealthBar.destroy();
            currentTroop.emptyHealthBar.destroy();
        }

        currentTroop.destroy();

        level1State.updateMoney(5, 'add');

        if (level1State.currentWave == level1State.troopsPerWave.length - 1 && level1State.enemyTroops.children.length == 0) {
            level1State.endGame('win');
        } else if (level1State.enemyTroops.children.length == 0) {
            level1State.prepareNewWave();
        }
    },
    endGame: function (state) {
        level1State.gameIsRunning = false;

        if (level1State.enemyTroops.children.length > 0) {
            level1State.enemyTroops.children.forEach(enemy => {
                enemy.body.velocity = 0;
            });
        }

        if (level1State.bulletsOnScreen.children.length > 0) {
            level1State.bulletsOnScreen.children.forEach(bullet => {
                bullet.kill();
            })
        }

        Game.camera.fade('#000000', 1500, true, 0.7);

        setTimeout(function () {
            Game.camera.resetFX();
            Game.world.removeAll();

            if (state == 'lose') {
                level1State.laodLoseScreen();
            } else if (state == 'win') {
                level1State.loadWinScreen();
            } else {
                console.log('wrong state');
            }
        }, "1500");
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
    loadWinScreen: function () {
        let background = Game.add.sprite(Game.width / 2, Game.height / 2, 'winBackground');
        background.anchor.setTo(0.5);
        Game.add.text(Game.width / 2 + 5, 256, 'You won!', { 'fontSize': 82, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 }).anchor.setTo(0.5);


        //See if the next level is avaliable
        let avaliableLevelsLength = levelsState.levels.length - 1;
        let currentLevel = Game.state.getCurrentState().key.replace('Level', '');

        if (currentLevel + 1 <= avaliableLevelsLength) {
            let nextLevelButton = Game.add.button(Game.width / 2, 590, 'buttonTemplate', () => {
                Game.state.start(Game.state.current);
            });
            nextLevelButton.width = 430;
            nextLevelButton.height = 120;
            nextLevelButton.anchor.setTo(0.5);

            Game.add.text(Game.width / 2 + 5, 590, 'Next Level', { 'fontSize': 35, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 12 }).anchor.setTo(0.5);
        } else {
            let nextLevelButton = Game.add.button(Game.width / 2, 590, 'buttonTemplate');
            nextLevelButton.width = 440;
            nextLevelButton.height = 120;
            nextLevelButton.anchor.setTo(0.5);
            nextLevelButton.inputEnabled = false;

            Game.add.text(Game.width / 2 + 5, 590, 'Yet to come', { 'fontSize': 35, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 12 }).anchor.setTo(0.5);
        }

        let levelsButton = Game.add.button(Game.width / 2, 750, 'buttonTemplate', () => Game.state.start('Levels'));
        levelsButton.width = 260;
        levelsButton.height = 80;
        levelsButton.anchor.setTo(0.5);

        Game.add.text(Game.width / 2 + 3, 750, 'Levels', { 'fontSize': 30, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#61461b', 'strokeThickness': 8 }).anchor.setTo(0.5);
    },
    updateMoney: function (amount, toDo) {
        if (toDo == 'add') {
            level1State.avaliableMoney += amount
        } else if (toDo == 'remove') {
            level1State.avaliableMoney -= amount;
        }

        level1State.moneyOnScreen.text = level1State.avaliableMoney;
        level1State.checkEveryBaseForTint();
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
    //Map is 14x21
    gameDirection: 'right',
    enemyTroopsSpeed: 1000,
    troopsPerWave: [5],
    turretsThisLevel: ['greenTowerBase', 'redTowerBase', 'bulletTowerBase', 'singleRocketTowerBase'],

}