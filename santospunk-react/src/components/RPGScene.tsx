import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BattleEnemy, PlayerStats } from './RPGTypes';

export default class RPGScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private wallsLayer!: Phaser.Tilemaps.TilemapLayer;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private speed: number = 200;
    private playerStats: PlayerStats = {
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        speed: 10,
        level: 1,
        experience: 0,
        nextLevelExp: 100
    };
    private encounterChance: number = 0.01; // 1% de chance de encontro por frame
    private enemies: BattleEnemy[] = [
        {
            id: 'enemy1',
            name: 'Hacker',
            sprite: 'enemy1.png',
            stats: {
                health: 50,
                maxHealth: 50,
                attack: 8,
                defense: 3,
                speed: 5
            },
            drops: []
        },
        {
            id: 'enemy2',
            name: 'Vírus',
            sprite: 'enemy2.png',
            stats: {
                health: 30,
                maxHealth: 30,
                attack: 12,
                defense: 2,
                speed: 8
            },
            drops: []
        }
    ];

    constructor() {
        super('RPGScene');
    }

    preload() {
        // Carregar assets do jogo
        this.load.spritesheet('player', '/assets/character.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Carregar tileset temporário (será substituído por assets próprios)
        this.load.image('tiles', '/assets/menu.png');
    }

    create() {
        // Criar mapa básico
        this.map = this.make.tilemap({ key: 'tiles', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tiles');
        if (!tileset) {
            console.error('Failed to create tileset');
            return;
        }
        this.tileset = tileset;
        
        // Criar camadas do mapa
        const groundLayer = this.map.createLayer('Ground', this.tileset, 0, 0);
        const wallsLayer = this.map.createLayer('Walls', this.tileset, 0, 0);
        
        if (!groundLayer || !wallsLayer) {
            console.error('Failed to create map layers');
            return;
        }
        
        this.groundLayer = groundLayer;
        this.wallsLayer = wallsLayer;
        
        // Configurar colisões
        this.wallsLayer.setCollisionByProperty({ collides: true });
        
        // Criar jogador
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.physics.add.collider(this.player, this.wallsLayer);
        
        // Configurar controles
        const keyboard = this.input.keyboard;
        if (!keyboard) {
            console.error('Keyboard input not available');
            return;
        }
        this.cursors = keyboard.createCursorKeys();
        
        // Configurar câmera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        
        // Criar animações do jogador
        this.createPlayerAnimations();
    }

    createPlayerAnimations() {
        // Animação de andar para baixo
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Animação de andar para cima
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Animação de andar para os lados
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        if (!this.player || !this.cursors) return;

        // Resetar velocidade do jogador
        this.player.setVelocity(0);

        // Movimento horizontal
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.speed);
            this.player.anims.play('left', true);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.speed);
            this.player.anims.play('right', true);
            this.player.setFlipX(false);
        }

        // Movimento vertical
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.speed);
            this.player.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.speed);
            this.player.anims.play('down', true);
        }

        // Parar animação se não estiver se movendo
        if (this.player.body && this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
            this.player.anims.stop();
        }

        // Verificar encontro com inimigo
        if (this.player.body && (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0)) {
            if (Math.random() < this.encounterChance) {
                this.startBattle();
            }
        }
    }

    startBattle() {
        if (!this.player) return;

        // Pausar movimento do jogador
        this.player.setVelocity(0);
        this.player.anims.stop();

        // Selecionar inimigo aleatório
        const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];

        // Iniciar cena de batalha
        this.scene.start('BattleScene', {
            playerStats: this.playerStats,
            enemy: randomEnemy
        });
    }
}

interface RPGGameProps {
    onGameComplete?: () => void;
}

const RPGGame: React.FC<RPGGameProps> = ({ onGameComplete }) => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: '100%',
            height: '100%',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: RPGScene,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div 
            ref={gameRef} 
            style={{ 
                width: '100%', 
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                overflow: 'hidden'
            }} 
        />
    );
};

export { RPGGame }; 