import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Image;
    private title!: Phaser.GameObjects.Image;
    private titleGlitch!: Phaser.GameObjects.RenderTexture;
    private button!: Phaser.GameObjects.Image;
    private menuMusic!: Phaser.Sound.BaseSound;
    private scanline!: Phaser.GameObjects.Rectangle;
    private startText!: Phaser.GameObjects.Text;
    private character!: Phaser.GameObjects.Image;
    private xumbro!: Phaser.GameObjects.Image;
    private glitchTimer!: Phaser.Time.TimerEvent;
    private yearCounter!: Phaser.GameObjects.Text;
    private yearValue: number = 0;

    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/menu.png');
        this.load.image('title', 'assets/titulo.svg');
        this.load.image('button', 'assets/4ee904e3ad6d32fc11b994d0f026bec2.png');
        this.load.audio('menuMusic', 'assets/msc.wav');
        this.load.image('character', 'assets/character.png');
        this.load.image('xumbro', 'assets/xumbro.png');
    }

    create() {
        // Start music immediately
        this.menuMusic = this.sound.add('menuMusic', { volume: 0.3, loop: true });
        this.menuMusic.play();

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Create background with proper scaling
        this.background = this.add.image(screenWidth / 2, screenHeight / 2, 'background');
        this.background.setDisplaySize(screenWidth, screenHeight);

        // Create scanline effect
        this.scanline = this.add.rectangle(0, 0, screenWidth, 2, 0x00ff00, 0.3);
        this.scanline.setOrigin(0, 0);
        
        // Add neon glow to scanline
        const scanlineGlow = this.add.rectangle(0, 0, screenWidth, 4, 0x00ff00, 0.2);
        scanlineGlow.setOrigin(0, 0);
        
        // Add scanline animation with enhanced effect
        this.tweens.add({
            targets: [this.scanline, scanlineGlow],
            y: screenHeight,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
            onUpdate: () => {
                const flicker = Math.random() * 0.1 + 0.25;
                this.scanline.setAlpha(0.3 + flicker);
                scanlineGlow.setAlpha(0.2 + flicker);
            }
        });

        // Create title with initial alpha 0
        this.title = this.add.image(screenWidth / 2, screenHeight * 0.10, 'title');
        this.title.setScale(2.8);
        this.title.setAlpha(0);
        this.title.setDepth(10);

        // Create year counter with cyberpunk style
        this.yearCounter = this.add.text(screenWidth / 2, screenHeight * 0.25, '0000', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#00ff77'
        });
        this.yearCounter.setOrigin(0.5);
        this.yearCounter.setAlpha(0);
        this.yearCounter.setDepth(9);

        // Create glitch effect for title
        this.titleGlitch = this.add.renderTexture(0, 0, screenWidth, screenHeight);
        this.titleGlitch.setVisible(false);
        this.titleGlitch.setDepth(10);

        // Create character with initial position off-screen
        this.character = this.add.image(-300, screenHeight * 0.85, 'character');
        this.character.setScale(2.3);

        // Create xumbro with initial position off-screen
        this.xumbro = this.add.image(screenWidth + 300, screenHeight * 0.85, 'xumbro');
        this.xumbro.setScale(2.3);

        // Animate character entry
        this.tweens.add({
            targets: this.character,
            x: screenWidth * 0.15,
            duration: 1000,
            ease: 'Power2'
        });

        // Animate xumbro entry after delay
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: this.xumbro,
                x: screenWidth * 0.85,
                duration: 1000,
                ease: 'Power2'
            });
        });

        // Show title with glitch animation
        this.time.delayedCall(1000, () => {
            this.titleGlitch.setVisible(true);
            this.title.setAlpha(1);
            
            // Start glitch effect
            this.glitchTimer = this.time.addEvent({
                delay: 100,
                callback: this.applyGlitchEffect,
                callbackScope: this,
                loop: true
            });

            // Start year counter animation after title appears
            this.time.delayedCall(500, () => {
                this.yearCounter.setAlpha(1);
                this.animateYearCounter();
            });

            // Create and show button after counter finishes
            this.time.delayedCall(2500, () => {
                this.createButton();
            });
        });
    }

    applyGlitchEffect() {
        if (!this.title || !this.titleGlitch) return;

        const fixedScale = 1.8;
        this.title.setScale(fixedScale);

        const glitchIntensity = Math.random();
        
        if (glitchIntensity > 0.8) {
            const offsetX = Math.random() * 8 - 4;
            const offsetY = Math.random() * 3 - 1.5;
            
            this.titleGlitch.clear();
            
            // Red channel
            this.titleGlitch.draw(this.title, this.title.x + offsetX, this.title.y + offsetY)
                .setTint(0xff0000)
                .setAlpha(0.6);
            
            // Green channel
            this.titleGlitch.draw(this.title, this.title.x - offsetX/2, this.title.y - offsetY/2)
                .setTint(0x00ff00)
                .setAlpha(0.6);
            
            // Blue channel
            this.titleGlitch.draw(this.title, this.title.x - offsetX, this.title.y - offsetY)
                .setTint(0x0000ff)
                .setAlpha(0.6);
        } else if (glitchIntensity > 0.5) {
            this.titleGlitch.clear();
            
            for (let i = 3; i >= 1; i--) {
                const alpha = 0.08 / i;
                this.titleGlitch.draw(this.title, this.title.x, this.title.y)
                    .setTint(0x00ff77)
                    .setAlpha(alpha)
                    .setScale(fixedScale + (i * 0.01));
            }
            
            this.titleGlitch.draw(this.title, this.title.x, this.title.y)
                .setTint(0xffffff)
                .setAlpha(1)
                .setScale(fixedScale);
        } else {
            this.titleGlitch.clear();
            this.titleGlitch.draw(this.title, this.title.x, this.title.y);
            
            for (let i = 0; i < 6; i++) {
                const noiseX = Math.random() * this.title.width - this.title.width/2;
                const noiseY = Math.random() * this.title.height - this.title.height/2;
                const noiseWidth = Math.random() * 15 + 3;
                const noiseHeight = Math.random() * 2 + 1;
                
                this.titleGlitch.draw(
                    this.add.rectangle(
                        this.title.x + noiseX,
                        this.title.y + noiseY,
                        noiseWidth,
                        noiseHeight,
                        0x00ff77
                    ).setAlpha(0.2)
                );
            }
        }

        if (glitchIntensity > 0.95) {
            this.cameras.main.shake(30, 0.0005);
        }

        this.time.delayedCall(Math.random() * 150 + 100, this.applyGlitchEffect, [], this);
    }

    createButton() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.button = this.add.image(screenWidth / 2, screenHeight * 0.85, 'button');
        this.button.setScale(1.5);
        this.button.setAlpha(0);
        this.button.setInteractive();
        
        const buttonGlow = this.add.graphics();
        buttonGlow.lineStyle(4, 0x00ff00, 0.3);
        buttonGlow.strokeRoundedRect(
            this.button.x - (this.button.displayWidth / 2) - 10,
            this.button.y - (this.button.displayHeight / 2) - 10,
            this.button.displayWidth + 20,
            this.button.displayHeight + 20,
            16
        );
        buttonGlow.setAlpha(0);
        
        this.button.on('pointerover', () => {
            this.tweens.add({
                targets: [this.button, buttonGlow],
                scaleX: 1.6,
                scaleY: 1.6,
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        this.button.on('pointerout', () => {
            this.tweens.add({
                targets: [this.button, buttonGlow],
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: { value: 0.8, duration: 300 },
                duration: 200,
                ease: 'Power2'
            });
        });

        this.button.on('pointerdown', () => {
            this.cameras.main.flash(500, 0, 255, 0);
            
            const glitchDuration = 500;
            const glitchSteps = 5;
            for (let i = 0; i < glitchSteps; i++) {
                this.time.delayedCall(i * (glitchDuration / glitchSteps), () => {
                    this.button.setPosition(
                        screenWidth / 2 + (Math.random() - 0.5) * 10,
                        screenHeight * 0.85 + (Math.random() - 0.5) * 10
                    );
                });
            }
            
            this.tweens.add({
                targets: [this.background, this.title, this.button, this.startText, this.character, this.xumbro],
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.menuMusic.stop();
                    this.scene.start('VideoScene');
                }
            });
        });

        this.startText = this.add.text(screenWidth / 2, screenHeight * 0.95, '< APERTE QUALQUER TECLA PARA COMEÇAR >', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4,
            padding: { x: 20, y: 10 },
            backgroundColor: '#00000066'
        });
        this.startText.setOrigin(0.5);
        this.startText.setAlpha(0);
        
        this.tweens.add({
            targets: [this.button, buttonGlow, this.startText],
            alpha: 0.8,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: buttonGlow,
                    alpha: { from: 0.3, to: 0.8 },
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        this.tweens.add({
            targets: this.startText,
            alpha: { from: 1, to: 0.6 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });

        this.scale.on('resize', this.handleResize, this);
    }

    handleResize() {
        const newWidth = this.cameras.main.width;
        const newHeight = this.cameras.main.height;
        
        this.background.setPosition(newWidth / 2, newHeight / 2);
        this.background.setDisplaySize(newWidth, newHeight);
        
        this.title.setPosition(newWidth / 2, newHeight * 0.15);
        
        if (this.yearCounter) {
            this.yearCounter.setPosition(newWidth / 2, newHeight * 0.25);
        }
        
        if (this.character && this.xumbro) {
            this.character.setPosition(newWidth * 0.15, newHeight * 0.85);
            this.xumbro.setPosition(newWidth * 0.85, newHeight * 0.85);
        }
        
        if (this.button) {
            this.button.setPosition(newWidth / 2, newHeight * 0.85);
        }
        
        if (this.startText) {
            this.startText.setPosition(newWidth / 2, newHeight * 0.95);
        }
        
        this.scanline.width = newWidth;
        const scanlineGlow = this.children.list.find(
            child => child instanceof Phaser.GameObjects.Rectangle && child !== this.scanline
        ) as Phaser.GameObjects.Rectangle;
        if (scanlineGlow) {
            scanlineGlow.width = newWidth;
        }
    }

    private animateYearCounter() {
        const targetYear = 2099;
        const duration = 2000;
        const steps = 50;
        const stepDuration = duration / steps;
        let currentStep = 0;

        const updateCounter = () => {
            currentStep++;
            const progress = currentStep / steps;
            this.yearValue = Math.floor(progress * targetYear);
            this.yearCounter.setText(this.yearValue.toString().padStart(4, '0'));

            if (Math.random() > 0.7) {
                this.yearCounter.setTint(0xff00ff);
                this.time.delayedCall(50, () => {
                    this.yearCounter.clearTint();
                });
            }

            if (currentStep < steps) {
                this.time.delayedCall(stepDuration, updateCounter);
            } else {
                this.cameras.main.shake(100, 0.005);
                this.yearCounter.setTint(0x00ff77);
                this.time.delayedCall(100, () => {
                    this.yearCounter.clearTint();
                });
            }
        };

        updateCounter();
    }
}

class VideoScene extends Phaser.Scene {
    private video!: Phaser.GameObjects.Video;

    constructor() {
        super('VideoScene');
    }

    preload() {
        this.load.video('introVideo', 'assets/1003.mp4');
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Create video
        this.video = this.add.video(screenWidth / 2, screenHeight / 2, 'introVideo');
        this.video.setOrigin(0.5);

        // Calculate dimensions to maintain aspect ratio and fit screen
        const videoRatio = this.video.width / this.video.height;
        const screenRatio = screenWidth / screenHeight;
        
        if (videoRatio > screenRatio) {
            // Se o vídeo é mais largo que a tela, ajusta pela largura
            const width = screenWidth * 0.8; // 80% da largura da tela
            const height = width / videoRatio;
            this.video.setDisplaySize(width, height);
        } else {
            // Se o vídeo é mais alto que a tela, ajusta pela altura
            const height = screenHeight * 0.7; // 70% da altura da tela
            const width = height * videoRatio;
            this.video.setDisplaySize(width, height);
        }

        // Add skip text with cyberpunk style
        const skipText = this.add.text(screenWidth / 2, screenHeight * 0.9, '< CLICK TO SKIP >', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4,
            padding: { x: 20, y: 10 },
            backgroundColor: '#00000066'
        });
        skipText.setOrigin(0.5);
        skipText.setAlpha(0.8);
        
        // Add text glow effect
        this.tweens.add({
            targets: skipText,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Start video with fade in
        this.video.setAlpha(0);
        this.tweens.add({
            targets: this.video,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        this.video.play();

        // Handle click to skip
        this.input.on('pointerdown', () => {
            this.cameras.main.flash(500, 0, 255, 0);
            this.tweens.add({
                targets: [this.video, skipText],
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.video.stop();
                    this.scene.start('MenuScene');
                }
            });
        });

        // Handle video complete
        this.video.on('complete', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('MenuScene');
            });
        });

        // Handle resize
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const width = gameSize.width;
            const height = gameSize.height;
            
            this.video.setPosition(width / 2, height / 2);
            skipText.setPosition(width / 2, height * 0.9);
            
            const newVideoRatio = this.video.width / this.video.height;
            const newScreenRatio = width / height;
            
            if (newVideoRatio > newScreenRatio) {
                const newWidth = width * 0.8;
                const newHeight = newWidth / newVideoRatio;
                this.video.setDisplaySize(newWidth, newHeight);
            } else {
                const newHeight = height * 0.7;
                const newWidth = newHeight * newVideoRatio;
                this.video.setDisplaySize(newWidth, newHeight);
            }
        });
    }
}

const Game: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);
    const orientationMessageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        orientationMessageRef.current = document.createElement('div');
        orientationMessageRef.current.style.position = 'fixed';
        orientationMessageRef.current.style.top = '0';
        orientationMessageRef.current.style.left = '0';
        orientationMessageRef.current.style.width = '100%';
        orientationMessageRef.current.style.height = '100%';
        orientationMessageRef.current.style.backgroundColor = '#000000';
        orientationMessageRef.current.style.color = '#00ff00';
        orientationMessageRef.current.style.display = 'none';
        orientationMessageRef.current.style.justifyContent = 'center';
        orientationMessageRef.current.style.alignItems = 'center';
        orientationMessageRef.current.style.fontSize = '24px';
        orientationMessageRef.current.style.fontFamily = 'monospace';
        orientationMessageRef.current.style.textAlign = 'center';
        orientationMessageRef.current.style.padding = '20px';
        orientationMessageRef.current.style.zIndex = '1000';
        orientationMessageRef.current.innerHTML = '⟳<br>Por favor, gire o dispositivo<br>para modo paisagem';
        document.body.appendChild(orientationMessageRef.current);

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameRef.current,
            scene: [MenuScene, VideoScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1920,
                height: 1080,
                min: {
                    width: 480,
                    height: 320
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            render: {
                pixelArt: false,
                antialias: true
            },
            autoFocus: true
        };

        gameInstanceRef.current = new Phaser.Game(config);

        const handleResize = () => {
            if (gameInstanceRef.current && orientationMessageRef.current) {
                const isPortrait = window.innerHeight > window.innerWidth;
                orientationMessageRef.current.style.display = isPortrait ? 'flex' : 'none';
                
                if (!isPortrait) {
                    const canvas = gameRef.current?.querySelector('canvas');
                    if (canvas) {
                        canvas.style.width = '100%';
                        canvas.style.height = '100%';
                        canvas.style.objectFit = 'contain';
                    }
                }
            }
        };

        const viewport = document.querySelector('meta[name=viewport]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
            }
            if (orientationMessageRef.current) {
                document.body.removeChild(orientationMessageRef.current);
            }
        };
    }, []);

    return (
        <div 
            ref={gameRef} 
            style={{ 
                width: '100%', 
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#000000',
                position: 'fixed',
                top: 0,
                left: 0
            }} 
        />
    );
};

export default Game; 