export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu_bg', '/assets/menu.png');
    }

    create() {
        console.log('MenuScene created');
        
        // Add background
        const bg = this.add.image(400, 300, 'menu_bg');
        bg.setDisplaySize(800, 600);

        // Add title
        const title = this.add.text(400, 200, 'SANTOSPUNK 2099', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add start button
        const startButton = this.add.text(400, 400, 'INICIAR', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => startButton.setStyle({ color: '#ff0000' }))
        .on('pointerout', () => startButton.setStyle({ color: '#ffffff' }))
        .on('pointerdown', () => {
            console.log('Starting game...');
            this.scene.start('MainScene');
        });
    }
} 