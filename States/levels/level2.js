'use strict'

const level2State = {
    preload: function () {
        //Load map
        Game.load.tilemap('game-map', '../Maps/Level2/map.json', null, Phaser.Tilemap.TILED_JSON);
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
            level2State.newWaveText.destroy();
            level2State.waveNumberText.destroy();

            //Set game as running
            level2State.gameIsRunning = true;

            // Create and spawn enemy troops
            level2State.enemyTroops = Game.add.group();

            for (let i = 0; i < level2State.troopsPerWave[level2State.currentWave]; i++) {
                let troopsStartingHeight = level2State.troopsStartingHeight;
                let troopsStartingWidth = level2State.troopsStartingWidth;

                if (level2State.gameDirection == 'left') {
                    level2State.createEnemyTroop(21 * 64 + i * 90, troopsStartingHeight * 64 - 32, 270);
                } else if (level2State.gameDirection == 'right') {
                    level2State.createEnemyTroop(-1 * 64 - i * 90, troopsStartingHeight * 64 - 32, 90);
                } else if (level2State.gameDirection == 'up') {
                    level2State.createEnemyTroop(troopsStartingWidth * 64 - 32, 14 * 64 + i * 90, 0);
                } else if (level2State.gameDirection == 'down') {
                    level2State.createEnemyTroop(troopsStartingWidth * 64 - 32, -1 * 64 - i * 90, 180);
                } else {
                    console.log('unexisting direction');
                }
            }

            //Add lives
            level2State.lives = Game.add.group();

            for (let i = 0; i < 3; i++) {
                level2State.createHeart(i * 64, 0, 'full');
            }

            //Add money
            level2State.avaliableMoney = 20;
            level2State.createMoney();

            //Create turrets bases
            level2State.turretsBases = Game.add.group();

            for (let i = 0; i < level2State.turretsThisLevel.length; i++) {
                let currentRow = 5 + i;

                level2State.createTurretBases(32, currentRow, level2State.turretsThisLevel[i]);
            }

            //Create turrets group
            level2State.activeTurrets = Game.add.group();

            //Create pause and start buttons
            level2State.createPausePlayButton('pauseButton');

            //Create bullets group
            level2State.bulletsOnScreen = Game.add.group();

            Game.input.onDown.add(level2State.checkIfTurretShouldBePlaced);
        }, 3000)

    },

    //Functions for create
    createMap: function () {
        this.map = Game.add.tilemap('game-map');
        this.map.addTilesetImage('map-tilesheet', 'map-tileset');
        this.map.createLayer('path');
        this.map.setCollisionByExclusion([]);

        level2State.pathOutlinesLayer = this.map.createLayer('pathOutlines');
        this.map.createLayer('decoration');

        this.turretsLayer = this.map.createLayer('turrets');

    },
    createNewWaveText: function (waveNumber) {
        let newWaveText = Game.add.text(Game.width / 2 + 5, 256, `Upcoming wave`, { 'fontSize': 82, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 });
        let waveNumberText = Game.add.text(Game.width / 2 + 5, 370, `${waveNumber + 1} of ${level2State.troopsPerWave.length}`, { 'fontSize': 60, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#104726', 'strokeThickness': 18 });

        newWaveText.anchor.setTo(0.5);
        waveNumberText.anchor.setTo(0.5);

        level2State.newWaveText = newWaveText;
        level2State.waveNumberText = waveNumberText;
    },
    createEnemyTroop: function (Xpositions, Yposition, angle) {
        let troop = level2State.enemyTroops.create(Xpositions, Yposition, 'enemy-troop-1');
        troop.anchor.setTo(0.5);
        troop.width = 64;
        troop.height = 64;
        troop.angle = angle;
        troop.health = 100;

        troop.direction = this.gameDirection;
        Game.physics.enable(troop);

        if (level2State.gameDirection == 'left') {
            troop.body.velocity.x = -level2State.enemyTroopsSpeed;
        } else if (level2State.gameDirection == 'right') {
            troop.body.velocity.x = level2State.enemyTroopsSpeed;
        } else if (level2State.gameDirection == 'up') {
            troop.body.velocity.y = -level2State.enemyTroopsSpeed;
        } else if (level2State.gameDirection == 'down') {
            troop.body.velocity.y = level2State.enemyTroopsSpeed;
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
        currentBase.price = level2State.determineTurretCost(currentBase.key);
        level2State.checkIfShouldBeTinted(currentBase);

        currentBase.priceTag = Game.add.text(64, startingTileHeightNumber * 64 - 38, currentBase.price, { 'fontSize': 12, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#000000', 'strokeThickness': 2 });
        currentBase.coinSymbol = Game.add.sprite(64 + 25, startingTileHeightNumber * 64 - 38, 'coin');
        currentBase.coinSymbol.width = 15;
        currentBase.coinSymbol.height = 13;

        level2State.turretsBases.add(currentBase);
    },
    checkIfShouldBeTinted: function (base) {
        if (level2State.avaliableMoney >= base.price) {
            base.tint = 0xffffff;
        } else {
            base.tint = 0x5e6464;
        }
    },
    checkEveryBaseForTint: function () {
        level2State.turretsBases.children.forEach((base) => {
            level2State.checkIfShouldBeTinted(base);
        });
    },
    createTurret: function () {
        if (level2State.avaliableMoney >= this.price) {
            let upcomingTurretKey = this.key.replace('Base', '');
            let turretShouldBeCreated = true;

            if (level2State.draggingTurret) {
                if (level2State.draggingTurret.currentlyDragging) {
                    //Cancel the turret
                    if (level2State.draggingTurret.key == upcomingTurretKey) {
                        turretShouldBeCreated = false;
                    }

                    level2State.draggingTurret.destroy();
                    level2State.draggingTurret = null;
                }
            }

            if (turretShouldBeCreated) {
                let currentTurret = level2State.draggingTurret = Game.add.sprite(Game.input.x, Game.input.y, upcomingTurretKey);
                currentTurret.width = 64;
                currentTurret.height = 64;
                currentTurret.anchor.setTo(0.5);

                if (upcomingTurretKey == 'redTower' || upcomingTurretKey == 'greenTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level2State.gameIsRunning) {
                            if (!Game.paused && !level2State.interWavesState) {
                                level2State.spawnBullet(turret);
                            }

                            setTimeout(turret.shootBullet, 3000, turret);
                        }
                    };
                } else if (upcomingTurretKey == 'bulletTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level2State.gameIsRunning) {
                            if (!Game.paused && !level2State.interWavesState) {
                                level2State.spawnBullet(turret);
                            }

                            setTimeout(turret.shootBullet, 800, turret);
                        }
                    };
                } else if (upcomingTurretKey == 'singleRocketTower') {
                    currentTurret.shootBullet = function (turret) {
                        if (level2State.gameIsRunning) {
                            if (!Game.paused && !level2State.interWavesState) {
                                level2State.spawnBullet(turret);
                            }
                        }
                    };
                }

                currentTurret.currentlyDragging = true;
                currentTurret.activeBullets = Game.add.group();

                level2State.activeTurrets.add(currentTurret);
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
            let rawAngle = Game.physics.arcade.angleBetween(turret, level2State.enemyTroops.children[0])

            let [spawnX, spawnY] = calculateBasicBulletDifference(turretPlusBallRadius, rawAngle)

            let currentBullet = level2State.bulletsOnScreen.create(turretX + spawnX, turretY + spawnY, currentBulletType);
            currentBullet.anchor.setTo(0.5);
            Game.physics.enable(currentBullet);

            level2State.bulletsOnScreen.add(currentBullet);
        } else if (turretType == 'redTower') {
            let currentBulletType = 'basicBullet';
            let turretPlusBallRadius = 32 + 6;
            let angleDifferenceForTwoBullets = 0.22;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level2State.enemyTroops.children[0]);
            let firstAngle = rawAngle + angleDifferenceForTwoBullets;
            let secondAngle = rawAngle - angleDifferenceForTwoBullets;;

            if (rawAngle + angleDifferenceForTwoBullets > Math.PI) {
                firstAngle = -Math.PI + (angleDifferenceForTwoBullets - (Math.PI - rawAngle));
            } else if (rawAngle - angleDifferenceForTwoBullets < -Math.PI) {
                secondAngle = Math.PI - (angleDifferenceForTwoBullets - (Math.PI + rawAngle));
            }

            let [firstBallSpawnX, firstBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, firstAngle);
            let [secondBallSpawnX, secondBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, secondAngle);

            let firstBullet = level2State.bulletsOnScreen.create(turretX + firstBallSpawnX, turretY + firstBallSpawnY, currentBulletType);
            firstBullet.anchor.setTo(0.5);
            Game.physics.enable(firstBullet);

            let secondBullet = level2State.bulletsOnScreen.create(turretX + secondBallSpawnX, turretY + secondBallSpawnY, currentBulletType);
            secondBullet.anchor.setTo(0.5);
            Game.physics.enable(secondBullet);

            level2State.bulletsOnScreen.add(firstBullet);
            level2State.bulletsOnScreen.add(secondBullet);
        } else if (turretType == 'bulletTower') {
            let currentBulletType = 'smallBullet';
            let turretPlusBallRadius = 32 + 3.6;
            let angleDifferenceForTwoBullets = 0.19;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level2State.enemyTroops.children[0]);
            let firstAngle = rawAngle + angleDifferenceForTwoBullets;
            let secondAngle = rawAngle - angleDifferenceForTwoBullets;;

            if (rawAngle + angleDifferenceForTwoBullets > Math.PI) {
                firstAngle = -Math.PI + (angleDifferenceForTwoBullets - (Math.PI - rawAngle));
            } else if (rawAngle - angleDifferenceForTwoBullets < -Math.PI) {
                secondAngle = Math.PI - (angleDifferenceForTwoBullets - (Math.PI + rawAngle));
            }

            let [firstBallSpawnX, firstBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, firstAngle);
            let [secondBallSpawnX, secondBallSpawnY] = calculateBasicBulletDifference(turretPlusBallRadius, secondAngle);

            let firstBullet = level2State.bulletsOnScreen.create(turretX + firstBallSpawnX, turretY + firstBallSpawnY, currentBulletType);
            firstBullet.anchor.setTo(0.5);
            firstBullet.scale.setTo(0.6);
            Game.physics.enable(firstBullet);

            let secondBullet = level2State.bulletsOnScreen.create(turretX + secondBallSpawnX, turretY + secondBallSpawnY, currentBulletType);
            secondBullet.anchor.setTo(0.5);
            secondBullet.scale.setTo(0.6);
            Game.physics.enable(secondBullet);

            level2State.bulletsOnScreen.add(firstBullet);
            level2State.bulletsOnScreen.add(secondBullet);
        } else if (turretType == 'singleRocketTower') {
            let currentBulletType = 'rocketBullet';
            let turretPlusBallRadius = 32 + 10;
            let rawAngle = Game.physics.arcade.angleBetween(turret, level2State.enemyTroops.children[0])

            let [spawnX, spawnY] = calculateBasicBulletDifference(turretPlusBallRadius, rawAngle)

            let currentBullet = level2State.bulletsOnScreen.create(turretX + spawnX, turretY + spawnY, currentBulletType);
            currentBullet.anchor.setTo(0.5);
            currentBullet.rotation = Game.physics.arcade.angleBetween(turret, level2State.enemyTroops.children[0]) + (Math.PI / 2);
            Game.physics.enable(currentBullet);

            currentBullet.parentTurret = turret;

            level2State.bulletsOnScreen.add(currentBullet);
        } else {
            console.log('unexisting type of turret');
        }
    },
    createPausePlayButton: function (type) {
        level2State.pauseButton = Game.add.button(20 * 64 + 32, 32, type, level2State.onPauseButtonClick);
        level2State.pauseButton.anchor.setTo(0.5);
        level2State.pauseButton.width = 56;
        level2State.pauseButton.height = 56
    },
    createMoney: function () {
        //Add the money number
        level2State.moneyOnScreen = Game.add.text(1 * 64 + 29, 64 + 32, level2State.avaliableMoney, { 'fontSize': 25, 'font': 'Press Start 2P', 'fill': 'white', 'stroke': '#000000', 'strokeThickness': 5 });
        level2State.moneyOnScreen.anchor.setTo(0.5);

        //Add the money icon
        let moneyIcon = Game.add.sprite(0 * 64 + 32, 64 + 32, 'coin');
        moneyIcon.anchor.setTo(0.5, 0.65);
        moneyIcon.width = 59;
        moneyIcon.height = 50;
    },

    update: function () {
        if (level2State.gameIsRunning && !level2State.interWavesState) {
            //Check if the furthest enemy is in the world
            level2State.ifEnemyInWorld();

            //Make enemy troops collide with the map
            Game.physics.arcade.collide(level2State.enemyTroops, level2State.pathOutlinesLayer, level2State.changeDirection);

            //Make the healthbar follow the former target
            if (level2State.enemyTroops.children[0]) {
                if (level2State.enemyTroops.children[0].fullHealthBar) {
                    if (level2State.enemyTroops.children[0].fullHealthBar.visible) {
                        let formerTarger = level2State.enemyTroops.children[0];
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
            if (level2State.activeTurrets.children.length > 0) {
                if (level2State.enemyTroops.children.length > 0) {
                    level2State.activeTurrets.forEach((turret) => {

                        if (!turret.currentlyDragging) {
                            let formerTarget = level2State.enemyTroops.children[0];
                            turret.rotation = Game.physics.arcade.angleBetween(turret, formerTarget) + (Math.PI / 2);
                        }
                    });
                }
            }

            //Make the bullets follow the former target and collide with the former target
            if (level2State.bulletsOnScreen.children.length > 0) {
                if (level2State.enemyTroops.children.length > 0) {
                    let formerTarget = level2State.enemyTroops.children[0];

                    level2State.bulletsOnScreen.children.forEach((bullet) => {
                        if (bullet.key == 'rocketBullet') {
                            bullet.rotation = Game.physics.arcade.angleBetween(bullet, formerTarget) + (Math.PI / 2);
                            Game.physics.arcade.moveToObject(bullet, formerTarget, 110);
                        } else if (bullet.key == 'basicBullet' || bullet == 'smallBullet') {
                            Game.physics.arcade.moveToObject(bullet, formerTarget, 200, 200);
                        }
                    });

                    Game.physics.arcade.overlap(level2State.bulletsOnScreen, formerTarget, level2State.onBulletCollision);
                }
            }

            //Check for dragging turret
            if (level2State.draggingTurret) {
                if (level2State.draggingTurret.currentlyDragging) {
                    level2State.dragDropTurret();
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
        let layer = level2State.collidingLayerData;

        if (direction == 'left' || direction == 'right') {
            currentTroop.body.velocity.x = 0;

            //Check if there is path down or up
            if (!level2State.checkIfInCollidingLayer(troopX, troopY - 70, layer)) {
                currentTroop.body.velocity.y = -level2State.enemyTroopsSpeed;
                currentTroop.direction = 'up';
                currentTroop.angle = 0;
            } else if (!level2State.checkIfInCollidingLayer(troopX, troopY + 70, layer)) {
                currentTroop.body.velocity.y = level2State.enemyTroopsSpeed;
                currentTroop.direction = 'down';
                currentTroop.angle = 180;
            } else {
                console.log('error with previous direction left or right');
            }
        } else if (direction == 'up' || direction == 'down') {
            currentTroop.body.velocity.y = 0;

            //Check if there is path to the left or to the right
            if (!level2State.checkIfInCollidingLayer(troopX - 70, troopY, layer)) {
                currentTroop.body.velocity.x = -level2State.enemyTroopsSpeed;
                currentTroop.direction = 'left';
                currentTroop.angle = 270;
            } else if (!level2State.checkIfInCollidingLayer(troopX + 70, troopY, layer)) {
                currentTroop.body.velocity.x = level2State.enemyTroopsSpeed;
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
        let furthestEnemy = level2State.enemyTroops.children[0];

        if (furthestEnemy) {
            let furthestEnemyX = furthestEnemy.position.x;
            let furthestEnemyY = furthestEnemy.position.y;

            if (level2State.gameDirection == 'right') {
                if (furthestEnemyX - 55 >= Game.width) {
                    level2State.removeLive();

                    if (level2State.gameIsRunning) {
                        level2State.killTroop(furthestEnemy);
                    }
                }
            } else if (level2State.gameDirection == 'left') {
                if (furthestEnemyX + 64 <= 0) {
                    level2State.removeLive();

                    if (level2State.gameIsRunning) {
                        level2State.killTroop(furthestEnemy);
                    }
                }
            } else if (level2State.gameDirection == 'up') {
                if (furthestEnemyY + 64 <= 0) {
                    level2State.removeLive();

                    if (level2State.gameIsRunning) {
                        level2State.killTroop(furthestEnemy);
                    }
                }
            } else if (level2State.gameDirection == 'down') {
                if (furthestEnemyY - 64 >= Game.height) {
                    level2State.removeLive();

                    if (level2State.gameIsRunning) {
                        level2State.killTroop(furthestEnemy);
                    }
                }

            }
        }
    },
    removeLive: function () {
        let lives = level2State.lives;
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
        level2State.createHeart(fullLiveX, fullLiveY, 'empty');

        if (lastLive) {
            level2State.endGame('lose');
        }
    },
    prepareNewWave: function () {
        if (level2State.bulletsOnScreen.children.length > 0) {
            level2State.bulletsOnScreen.children.forEach(bullet => {
                bullet.kill();
            })
        }

        level2State.disableOrEnableBases('disable');

        this.interWavesState = true;
        this.currentWave++;
        this.createNewWaveText(level2State.currentWave);

        setTimeout(function () {
            level2State.newWaveText.destroy();
            level2State.waveNumberText.destroy();

            for (let i = 0; i < level2State.troopsPerWave[level2State.currentWave]; i++) {
                let troopsStartingHeight = level2State.troopsStartingHeight;
                let troopsStartingWidth = level2State.troopsStartingWidth;

                if (level2State.gameDirection == 'left') {
                    level2State.createEnemyTroop(21 * 64 + i * 90, troopsStartingHeight * 64 - 32, 270);
                } else if (level2State.gameDirection == 'right') {
                    level2State.createEnemyTroop(-1 * 64 - i * 90, troopsStartingHeight * 64 - 32, 90);
                } else if (level2State.gameDirection == 'up') {
                    level2State.createEnemyTroop(troopsStartingWidth * 64 - 32, 14 * 64 + i * 90, 0);
                } else if (level2State.gameDirection == 'down') {
                    level2State.createEnemyTroop(troopsStartingWidth * 64 - 32, -1 * 64 - i * 90, 180);
                } else {
                    console.log('unexisting direction');
                }
            }

            level2State.disableOrEnableBases('enable');
            level2State.interWavesState = false;

            level2State.activeTurrets.children.forEach((turret) => {
                if(turret.key == 'singleRocketTower') {
                    turret.shootBullet(turret);
                }
            });
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

        if (level2State.checkIfInCollidingLayer(pointerX, pointerY, level2State.turretLayerData)) {
            if (level2State.draggingTurret) {
                if (level2State.draggingTurret.currentlyDragging) {
                    level2State.draggingTurret.position.x = (pointerX - (pointerX % 64) + 32);
                    level2State.draggingTurret.position.y = (pointerY - (pointerY % 64) + 32);

                    level2State.draggingTurret.currentlyDragging = false;
                    level2State.draggingTurret.shootBullet(level2State.draggingTurret);
                    level2State.updateMoney(level2State.determineTurretCost(level2State.draggingTurret.key), 'remove');
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
        level2State.pauseButton.destroy();

        if (level2State.draggingTurret) {
            if (level2State.draggingTurret.currentlyDragging) {
                level2State.draggingTurret.destroy();
            }
        }

        if (currentTypeOfButton == 'pauseButton') {
            level2State.disableOrEnableBases('disable');

            level2State.createPausePlayButton('playButton');
            Game.paused = true;
        } else if (currentTypeOfButton == 'playButton') {
            level2State.disableOrEnableBases('enable');

            level2State.createPausePlayButton('pauseButton');
            Game.paused = false;
        }
    },
    disableOrEnableBases: function (toDo) {
        if (toDo == 'enable') {
            level2State.turretsBases.children.forEach(base => {
                base.inputEnabled = true;
            });
        } else if (toDo == 'disable') {
            level2State.turretsBases.children.forEach(base => {
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
            level2State.killTroop(troop);
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

        level2State.updateMoney(5, 'add');

        if (level2State.currentWave == level2State.troopsPerWave.length - 1 && level2State.enemyTroops.children.length == 0) {
            level2State.endGame('win');
        } else if (level2State.enemyTroops.children.length == 0) {
            level2State.prepareNewWave();
        }
    },
    endGame: function (state) {
        level2State.gameIsRunning = false;

        if (level2State.enemyTroops.children.length > 0) {
            level2State.enemyTroops.children.forEach(enemy => {
                enemy.body.velocity = 0;
            });
        }

        if (level2State.bulletsOnScreen.children.length > 0) {
            level2State.bulletsOnScreen.children.forEach(bullet => {
                bullet.kill();
            })
        }

        Game.camera.fade('#000000', 1500, true, 0.7);

        setTimeout(function () {
            Game.camera.resetFX();
            Game.world.removeAll();

            if (state == 'lose') {
                level2State.laodLoseScreen();
            } else if (state == 'win') {
                level2State.loadWinScreen();
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

        if (Number(currentLevel) + 1 <= Number(avaliableLevelsLength)) {
            let nextLevel = `Level${Number(currentLevel)+1}State`;

            let nextLevelButton = Game.add.button(Game.width / 2, 590, 'buttonTemplate', () => {
                Game.state.start(nextLevel);
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
            level2State.avaliableMoney += amount
        } else if (toDo == 'remove') {
            level2State.avaliableMoney -= amount;
        }

        level2State.moneyOnScreen.text = level2State.avaliableMoney;
        level2State.checkEveryBaseForTint();
    },


    //Variables
    collidingLayerData: {
        "data": [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120,
            120, 120, 120, 120, 120, 120, 70, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 72, 120,
            120, 120, 120, 120, 120, 120, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 120,
            120, 120, 120, 70, 71, 71, 97, 0, 73, 117, 117, 117, 117, 117, 117, 117, 117, 74, 0, 95, 120,
            120, 120, 120, 93, 0, 0, 0, 0, 95, 120, 120, 120, 120, 120, 120, 120, 120, 93, 0, 95, 120,
            120, 120, 120, 93, 0, 73, 117, 117, 118, 120, 120, 120, 120, 120, 120, 120, 120, 93, 0, 95, 120,
            120, 120, 120, 93, 0, 96, 71, 71, 71, 71, 71, 71, 71, 71, 72, 120, 120, 93, 0, 95, 120,
            120, 120, 120, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 120, 120, 93, 0, 95, 120,
            120, 120, 120, 116, 117, 117, 117, 117, 117, 117, 117, 117, 74, 0, 95, 120, 120, 93, 0, 95, 120,
            71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 97, 0, 95, 120, 120, 93, 0, 95, 120,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 120, 120, 93, 0, 96, 71,
            117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 118, 120, 120, 93, 0, 0, 0,
            120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 116, 117, 117, 117,
            120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120],
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
        "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0],
        "height": 14,
        "id": 4,
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
    enemyTroopsSpeed: 100,
    troopsPerWave: [1],
    troopsStartingHeight: 11,
    troopsStartingWidth: -1,
    turretsThisLevel: ['greenTowerBase', 'redTowerBase', 'bulletTowerBase', 'singleRocketTowerBase'],
}