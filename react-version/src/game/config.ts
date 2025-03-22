import 'phaser';
import MainScene from './scenes/MainScene';
import MenuScene from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: '100%',
        height: '100%',
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    backgroundColor: '#000000',
    scene: [MainScene, MenuScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true
    }
};

export { config as gameConfig }; 