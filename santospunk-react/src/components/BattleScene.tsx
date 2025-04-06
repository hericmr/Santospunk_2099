import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BattleEnemy, PlayerStats } from './RPGTypes';

export default class BattleScene extends Phaser.Scene {
    private playerStats!: PlayerStats;
    private enemy!: BattleEnemy;
    private currentEnemyHealth!: number;
    private battleMenu!: Phaser.GameObjects.Container;
    private battleText!: Phaser.GameObjects.Text;
    private playerSprite!: Phaser.GameObjects.Sprite;
    private enemySprite!: Phaser.GameObjects.Sprite;
    private playerHealthBar!: Phaser.GameObjects.Graphics;
    private enemyHealthBar!: Phaser.GameObjects.Graphics;
    private isPlayerTurn: boolean = true;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: { playerStats: PlayerStats; enemy: BattleEnemy }) {
        this.playerStats = data.playerStats;
        this.enemy = data.enemy;
        this.currentEnemyHealth = this.enemy.stats.health;
    }

    create() {
        // Criar fundo da batalha
        this.add.rectangle(0, 0, 800, 600, 0x000000).setOrigin(0);

        // Criar sprites do jogador e inimigo
        this.playerSprite = this.add.sprite(200, 300, 'player');
        this.enemySprite = this.add.sprite(600, 300, this.enemy.sprite);

        // Criar barras de vida
        this.createHealthBars();

        // Criar menu de batalha
        this.createBattleMenu();

        // Criar texto de batalha
        this.battleText = this.add.text(400, 50, 'Um ' + this.enemy.name + ' apareceu!', {
            fontSize: '24px',
            color: '#ffcc00'
        }).setOrigin(0.5);
    }

    createHealthBars() {
        // Barra de vida do jogador
        this.playerHealthBar = this.add.graphics();
        this.updatePlayerHealthBar();

        // Barra de vida do inimigo
        this.enemyHealthBar = this.add.graphics();
        this.updateEnemyHealthBar();
    }

    updatePlayerHealthBar() {
        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0x000000);
        this.playerHealthBar.fillRect(100, 200, 200, 20);
        this.playerHealthBar.fillStyle(0x00ff00);
        this.playerHealthBar.fillRect(100, 200, (this.playerStats.health / this.playerStats.maxHealth) * 200, 20);
    }

    updateEnemyHealthBar() {
        this.enemyHealthBar.clear();
        this.enemyHealthBar.fillStyle(0x000000);
        this.enemyHealthBar.fillRect(500, 200, 200, 20);
        this.enemyHealthBar.fillStyle(0xff0000);
        this.enemyHealthBar.fillRect(500, 200, (this.currentEnemyHealth / this.enemy.stats.health) * 200, 20);
    }

    createBattleMenu() {
        this.battleMenu = this.add.container(400, 500);

        const menuOptions = ['Atacar', 'Defender', 'Itens', 'Fugir'];
        const buttonHeight = 40;
        const buttonWidth = 150;
        const buttonSpacing = 10;

        menuOptions.forEach((option, index) => {
            const button = this.add.rectangle(0, (buttonHeight + buttonSpacing) * index, buttonWidth, buttonHeight, 0x333333)
                .setInteractive()
                .on('pointerdown', () => this.handleAction(option));

            const text = this.add.text(0, (buttonHeight + buttonSpacing) * index, option, {
                fontSize: '20px',
                color: '#ffcc00'
            }).setOrigin(0.5);

            this.battleMenu.add([button, text]);
        });
    }

    handleAction(action: string) {
        if (!this.isPlayerTurn) return;

        switch (action) {
            case 'Atacar':
                this.playerAttack();
                break;
            case 'Defender':
                this.playerDefend();
                break;
            case 'Itens':
                // TODO: Implementar sistema de itens
                break;
            case 'Fugir':
                this.escapeBattle();
                break;
        }
    }

    playerAttack() {
        const damage = Math.max(1, this.playerStats.attack - this.enemy.stats.defense);
        this.currentEnemyHealth = Math.max(0, this.currentEnemyHealth - damage);
        this.updateEnemyHealthBar();

        this.battleText.setText('Você causou ' + damage + ' de dano!');
        this.isPlayerTurn = false;

        // Verificar se o inimigo foi derrotado
        if (this.currentEnemyHealth <= 0) {
            this.endBattle(true);
            return;
        }

        // Iniciar turno do inimigo após um pequeno delay
        this.time.delayedCall(1000, () => this.enemyTurn());
    }

    playerDefend() {
        this.playerStats.defense *= 2;
        this.battleText.setText('Você se defendeu!');
        this.isPlayerTurn = false;

        this.time.delayedCall(1000, () => this.enemyTurn());
    }

    enemyTurn() {
        const damage = Math.max(1, this.enemy.stats.attack - this.playerStats.defense);
        this.playerStats.health = Math.max(0, this.playerStats.health - damage);
        this.updatePlayerHealthBar();

        this.battleText.setText('O ' + this.enemy.name + ' causou ' + damage + ' de dano!');

        // Verificar se o jogador foi derrotado
        if (this.playerStats.health <= 0) {
            this.endBattle(false);
            return;
        }

        // Resetar defesa do jogador
        this.playerStats.defense = Math.floor(this.playerStats.defense / 2);
        this.isPlayerTurn = true;
    }

    escapeBattle() {
        const escapeChance = 0.5;
        if (Math.random() < escapeChance) {
            this.battleText.setText('Você fugiu com sucesso!');
            this.time.delayedCall(1000, () => this.scene.start('RPGScene', { playerStats: this.playerStats }));
        } else {
            this.battleText.setText('Falha ao tentar fugir!');
            this.isPlayerTurn = false;
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    endBattle(playerWon: boolean) {
        if (playerWon) {
            this.battleText.setText('Você venceu a batalha!');
            // TODO: Implementar sistema de experiência e drops
        } else {
            this.battleText.setText('Você foi derrotado...');
        }

        this.time.delayedCall(2000, () => {
            this.scene.start('RPGScene', { playerStats: this.playerStats });
        });
    }
}

interface BattleGameProps {
    playerStats: PlayerStats;
    enemy: BattleEnemy;
    onBattleComplete?: () => void;
}

const BattleGame: React.FC<BattleGameProps> = ({ playerStats, enemy, onBattleComplete }) => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: '100%',
            height: '100%',
            scene: [BattleScene],
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

export { BattleGame }; 