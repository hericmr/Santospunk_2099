import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import RPGGame from './RPGScene';
import BattleScene from './BattleScene';

class MenuScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Image;
    private title!: Phaser.GameObjects.Image;
    private titleGlitch: Phaser.GameObjects.RenderTexture | null = null;
    private playButton!: Phaser.GameObjects.Image;
    private optionsButton!: Phaser.GameObjects.Image;
    private creditsButton!: Phaser.GameObjects.Image;
    private exitButton!: Phaser.GameObjects.Image;
    private menuMusic!: Phaser.Sound.BaseSound;
    private scanline!: Phaser.GameObjects.Rectangle;
    private startText!: Phaser.GameObjects.Text;
    private character!: Phaser.GameObjects.Image;
    private xumbro!: Phaser.GameObjects.Image;
    private glitchTimer: Phaser.Time.TimerEvent | null = null;
    private continuousGlitchTimer: Phaser.Time.TimerEvent | null = null;
    private yearCounter!: Phaser.GameObjects.Text;
    private yearValue: number = 0;
    private buttons: Phaser.GameObjects.Image[] = [];
    private buttonTexts: Phaser.GameObjects.Text[] = [];
    private startContinuousGlitch!: () => void;

    constructor() {
        super('MenuScene');
    }

    preload() {
        console.log('Preloading assets...');
        
        // Load images with error handling
        this.load.on('loaderror', (fileObj: any) => {
            console.error('Error loading file:', fileObj.key, fileObj.url);
        });

        this.load.on('filecomplete', (key: string) => {
            console.log('File loaded successfully:', key);
        });

        // Try loading with different paths
        const basePath = process.env.PUBLIC_URL || '';
        console.log('Base path:', basePath);

        // Log each asset path before loading
        const assets = {
            background: `${basePath}/assets/menu.png`,
            title: `${basePath}/assets/titulo.svg`,
            button: `${basePath}/assets/4ee904e3ad6d32fc11b994d0f026bec2.png`,
            character: `${basePath}/assets/character.png`,
            xumbro: `${basePath}/assets/xumbro.png`
        };

        console.log('Loading assets with paths:', assets);

        this.load.image('background', assets.background);
        this.load.image('title', assets.title);
        this.load.image('button', assets.button);
        this.load.image('character', assets.character);
        this.load.image('xumbro', assets.xumbro);

        // Try loading audio with fallback
        try {
            const audioPaths = [
                `${basePath}/assets/msc.wav`,
                `${basePath}/assets/nome-pygbag.mp3`
            ];
            console.log('Loading audio with paths:', audioPaths);
            this.load.audio('menuMusic', audioPaths);
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }

    create() {
        console.log('Creating scene...');
        
        // Garantir que a câmera esteja disponível
        if (!this.cameras || !this.cameras.main) {
            console.error('Camera not available');
            return;
        }
        
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        console.log('Screen dimensions:', { width: screenWidth, height: screenHeight });

        // Create background with proper scaling
        try {
            this.background = this.add.image(screenWidth / 2, screenHeight / 2, 'background');
            console.log('Background created:', this.background);
            this.background.setDisplaySize(screenWidth, screenHeight);
        } catch (error) {
            console.error('Error creating background:', error);
        }

        // Try to create and play music
        try {
            this.menuMusic = this.sound.add('menuMusic', { volume: 0.3, loop: true });
            if (this.menuMusic) {
                this.menuMusic.play();
            }
        } catch (error) {
            console.error('Error playing music:', error);
        }

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
        this.yearCounter = this.add.text(screenWidth / 2.04, screenHeight * 0.30, '0000', {
            fontSize: '64px',
            fontFamily: 'Digital-7, "Courier New", monospace',
            color: '#cc4400',
            padding: { x: 20, y: 10 },
            align: 'center',
            fixedWidth: 200,
            fixedHeight: 80,
            letterSpacing: 2
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
            if (this.titleGlitch) {
                this.titleGlitch.setVisible(true);
            }
            this.title.setAlpha(1);
            
            // Efeito de malcontato no título - fase inicial intensa
            let glitchCount = 0;
            const glitchInterval = this.time.addEvent({
                delay: 100,
                callback: () => {
                    // Efeito de malcontato - deslocamento aleatório
                    const offsetX = 5;
                    const offsetY = 2;
                    const rotation = Math.random() * 0.1 - 0.05;
                    
                    this.title.setPosition(
                        screenWidth / 2 + offsetX, 
                        screenHeight * 0.10 + offsetY
                    );
                    this.title.setRotation(rotation);
                    
                    // Efeito de distorção de cores
                    if (Math.random() > 0.7) {
                        this.title.setTint(0xff0000);
                    } else if (Math.random() > 0.5) {
                        this.title.setTint(0x00ff00);
                    } else {
                        this.title.clearTint();
                    }
                    
                    // Efeito de flicker
                    if (Math.random() > 0.8) {
                        this.title.setAlpha(1);
                    } else {
                        this.title.setAlpha(1);
                    }
                    
                    glitchCount++;
                    
                    // Após várias variações, estabiliza parcialmente o título
                    if (glitchCount >= 15) {
                        glitchInterval.destroy();
                        
                        // Configurar o título para um estado mais estável
                        this.title.setScale(2.5);
                        
                        // Iniciar efeito de malcontato contínuo (mais estável)
                        this.startContinuousGlitch();
                        
                        // Start year counter animation after title appears
                        this.time.delayedCall(500, () => {
                            this.yearCounter.setAlpha(1);
                            this.animateYearCounter();
                        });
                        
                        // Create and show button after counter finishes
                        this.time.delayedCall(2500, () => {
                            this.createMenuButtons();
                        });
                    }
                },
                repeat: 14
            });
        });
        
        // Método para iniciar o efeito de malcontato contínuo (mais estável)
        this.startContinuousGlitch = () => {
            // Efeito de malcontato contínuo (mais estável)
            this.continuousGlitchTimer = this.time.addEvent({
                delay: 300, // Intervalo maior para ser mais estável
                callback: () => {
                    // Deslocamento menor para ser mais estável
                    const offsetX = 5;
                    const offsetY = 2;
                    const rotation = Math.random() * 0.03 - 0.015;
                    
                    this.title.setPosition(
                        screenWidth / 2 + offsetX, 
                        screenHeight * 0.10 + offsetY
                    );
                    this.title.setRotation(rotation);
                    
                    // Efeito de distorção de cores (menos frequente)
                    if (Math.random() > 0.9) {
                        this.title.setTint(0xff0000);
                        this.time.delayedCall(50, () => {
                            this.title.clearTint();
                        });
                    } else if (Math.random() > 0.95) {
                        this.title.setTint(0x00ff00);
                        this.time.delayedCall(50, () => {
                            this.title.clearTint();
                        });
                    }
                    
                    // Efeito de flicker (menos frequente)
                    if (Math.random() > 0.95) {
                        this.title.setAlpha(1);
                        this.time.delayedCall(50, () => {
                            this.title.setAlpha(1);
                        });
                    }
                },
                loop: true
            });
        };
    }

    applyGlitchEffect() {
        if (!this.title || !this.titleGlitch || !this.glitchTimer) return;

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
    }

    createMenuButtons() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const buttonSpacing = 130;
        const startY = screenHeight * 0.7;
        
        // Configuração dos botões com suas posições
        const buttonConfigs = [
            { 
                key: 'play', 
                text: '>_ INICIAR MISSÃO', 
                subtext: '// ACESSE SISTEMA PRINCIPAL...',
                y: startY,
                x: screenWidth * 0.2 // Lado esquerdo
            },
            { 
                key: 'options', 
                text: '>_ CONFIGURAÇÕES', 
                subtext: '// AJUSTAR PARÂMETROS...',
                y: startY + buttonSpacing,
                x: screenWidth * 0.2 // Lado esquerdo
            },
            { 
                key: 'credits', 
                text: '>_ HISTÓRICO', 
                subtext: '// CARREGAR DADOS HISTÓRICOS...',
                y: startY,
                x: screenWidth * 0.8 // Lado direito
            },
            { 
                key: 'exit', 
                text: '>_ ENCERRAR SESSÃO', 
                subtext: '// DESCONECTAR...',
                y: startY + buttonSpacing,
                x: screenWidth * 0.8 // Lado direito
            }
        ];

        buttonConfigs.forEach((config, index) => {
            // Create button container
            const buttonContainer = this.add.container(config.x, config.y);
            buttonContainer.setAlpha(0);
            buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-250, -60, 500, 120), Phaser.Geom.Rectangle.Contains);

            // Create button background
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x000000, 0.95);
            buttonBg.fillRoundedRect(-250, -60, 500, 120, 16);
            buttonBg.lineStyle(2, 0xffcc00, 0.8);
            buttonBg.strokeRoundedRect(-250, -60, 500, 120, 16);
            buttonContainer.add(buttonBg);

            // Create main text with hacker style
            const mainText = this.add.text(0, -35, config.text, {
                fontSize: '32px',
                fontFamily: 'monospace',
                color: '#ffcc00',
                padding: { x: 20, y: 10 },
                backgroundColor: '#00000066'
            });
            mainText.setOrigin(0.5);
            buttonContainer.add(mainText);

            // Create subtext with hacker style
            const subText = this.add.text(0, 25, config.subtext, {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#ffdd00',
                letterSpacing: 1
            });
            subText.setOrigin(0.5);
            buttonContainer.add(subText);

            // Add hover effects
            buttonContainer.on('pointerover', () => {
                this.tweens.add({
                    targets: [buttonContainer, buttonBg],
                    scaleX: 1.1,
                    scaleY: 1.1,
                    alpha: 1,
                    duration: 200,
                    ease: 'Power2'
                });
                mainText.setStyle({ color: '#ffdd00' });
                subText.setStyle({ color: '#ffff00' });
            });

            buttonContainer.on('pointerout', () => {
                this.tweens.add({
                    targets: [buttonContainer, buttonBg],
                    scaleX: 1,
                    scaleY: 1,
                    alpha: 0.95,
                    duration: 200,
                    ease: 'Power2'
                });
                mainText.setStyle({ color: '#ffcc00' });
                subText.setStyle({ color: '#ffdd00' });
            });

            // Add click effects
            buttonContainer.on('pointerdown', () => {
                this.cameras.main.flash(500, 255, 255, 0);
                
                const glitchDuration = 500;
                const glitchSteps = 5;
                for (let i = 0; i < glitchSteps; i++) {
                    this.time.delayedCall(i * (glitchDuration / glitchSteps), () => {
                        buttonContainer.setPosition(
                            config.x + (Math.random() - 0.5) * 10,
                            config.y + (Math.random() - 0.5) * 10
                        );
                    });
                }

                // Handle button actions
                switch (config.key) {
                    case 'play':
                        this.startGame();
                        break;
                    case 'options':
                        this.showOptions();
                        break;
                    case 'credits':
                        this.showCredits();
                        break;
                    case 'exit':
                        this.exitGame();
                        break;
                }
            });

            // Animate buttons appearance with staggered delay based on position
            const delayMultiplier = (index % 2) * 2 + Math.floor(index / 2); // Cria um efeito de aparecimento alternado
            
            // Efeito de TV ligando para os botões
            buttonContainer.setAlpha(0);
            
            // Efeito de flicker
            this.time.delayedCall(2500 + (delayMultiplier * 200), () => {
                // Flash inicial
                this.cameras.main.flash(100, 255, 255, 255);
                
                // Aparecimento abrupto com flicker
                buttonContainer.setAlpha(1);
                
                // Efeito de flicker após aparecer
                let flickerCount = 0;
                const flickerInterval = this.time.addEvent({
                    delay: 50,
                    callback: () => {
                        buttonContainer.setAlpha(flickerCount % 2 === 0 ? 1 : 0.3);
                        flickerCount++;
                        
                        if (flickerCount >= 6) {
                            flickerInterval.destroy();
                            buttonContainer.setAlpha(0.95);
                        }
                    },
                    repeat: 5
                });
            });
        });
    }

    startGame() {
        this.tweens.add({
            targets: [...this.buttons, ...this.buttonTexts, this.background, this.title],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.menuMusic.stop();
                this.scene.start('VideoScene');
            }
        });
    }

    showOptions() {
        this.scene.start('SettingsScene');
    }

    showCredits() {
        // TODO: Implement credits screen
        console.log('Credits screen will be implemented');
    }

    exitGame() {
        // TODO: Implement exit confirmation
        console.log('Exit confirmation will be implemented');
    }

    animateYearCounter() {
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
                this.yearCounter.setTint(0xcc5500);
                this.time.delayedCall(50, () => {
                    this.yearCounter.clearTint();
                });
            }

            if (currentStep < steps) {
                this.time.delayedCall(stepDuration, updateCounter);
            } else {
                this.yearCounter.setTint(0xcc4400);
                this.time.delayedCall(100, () => {
                    this.yearCounter.clearTint();
                });
            }
        };

        updateCounter();
    }

    handleResize() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const isLandscape = screenWidth > screenHeight;

        // Ajustar background
        if (this.background) {
            this.background.setDisplaySize(screenWidth, screenHeight);
            this.background.setPosition(screenWidth / 2, screenHeight / 2);
        }

        // Ajustar título
        if (this.title) {
            if (isLandscape) {
                this.title.setPosition(screenWidth * 0.25, screenHeight * 0.15);
                this.title.setScale(2.0);
            } else {
                this.title.setPosition(screenWidth / 2, screenHeight * 0.10);
                this.title.setScale(2.8);
            }
        }

        // Ajustar contador
        if (this.yearCounter) {
            if (isLandscape) {
                this.yearCounter.setPosition(screenWidth * 0.25, screenHeight * 0.30);
                this.yearCounter.setFontSize('64px');
            } else {
                this.yearCounter.setPosition(screenWidth / 2.04, screenHeight * 0.30);
                this.yearCounter.setFontSize('64px');
            }
        }

        // Ajustar personagens
        if (this.character) {
            if (isLandscape) {
                this.character.setPosition(screenWidth * 0.1, screenHeight * 0.7);
                this.character.setScale(1.8);
            } else {
                this.character.setPosition(screenWidth * 0.15, screenHeight * 0.85);
                this.character.setScale(2.3);
            }
        }
        if (this.xumbro) {
            if (isLandscape) {
                this.xumbro.setPosition(screenWidth * 0.4, screenHeight * 0.7);
                this.xumbro.setScale(1.8);
            } else {
                this.xumbro.setPosition(screenWidth * 0.85, screenHeight * 0.85);
                this.xumbro.setScale(2.3);
            }
        }

        // Ajustar botões
        if (this.buttons) {
            if (isLandscape) {
                // Em paisagem, botões ficam à direita em duas colunas
                const startX = screenWidth * 0.6;
                const startY = screenHeight * 0.2;
                const buttonSpacing = 100;
                const columnSpacing = 200;

                this.buttons.forEach((button: any, index: number) => {
                    const column = Math.floor(index / 2);
                    const row = index % 2;
                    const x = startX + (column * columnSpacing);
                    const y = startY + (row * buttonSpacing);
                    button.setPosition(x, y);
                });
            } else {
                // Em retrato, botões ficam em duas colunas nas laterais
                const startY = screenHeight * 0.7;
                const buttonSpacing = 130;
                this.buttons.forEach((button: any, index: number) => {
                    const y = startY + (Math.floor(index / 2) * buttonSpacing);
                    const x = index % 2 === 0 ? screenWidth * 0.2 : screenWidth * 0.8;
                    button.setPosition(x, y);
                });
            }
        }
    }
}

class VideoScene extends Phaser.Scene {
    private video!: Phaser.GameObjects.Video;

    constructor() {
        super('VideoScene');
    }

    preload() {
        const basePath = process.env.PUBLIC_URL || '';
        console.log('Loading video from:', `${basePath}/assets/1003.mp4`);
        
        this.load.on('loaderror', (fileObj: any) => {
            console.error('Error loading video:', fileObj);
        });
        
        this.load.video('introVideo', `${basePath}/assets/1003.mp4`);
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        console.log('Creating video with dimensions:', { width: screenWidth, height: screenHeight });

        // Create video
        try {
            this.video = this.add.video(screenWidth / 2, screenHeight / 2, 'introVideo');
            console.log('Video created successfully');
        } catch (error) {
            console.error('Error creating video:', error);
            this.scene.start('MenuScene');
            return;
        }

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
        const skipText = this.add.text(screenWidth / 1, screenHeight * 0.1, '< CLIQUE PARA PULAR A INTRODUÇÃO >', {
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
                    this.scene.start('RPGScene');
                }
            });
        });

        // Handle video complete
        this.video.on('complete', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('RPGScene');
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

class SettingsScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Image;
    private title!: Phaser.GameObjects.Text;
    private backButton!: Phaser.GameObjects.Container;
    private volumeSlider!: Phaser.GameObjects.Container;
    private qualitySelector!: Phaser.GameObjects.Container;
    private languageSelector!: Phaser.GameObjects.Container;
    private controlsButton!: Phaser.GameObjects.Container;
    private scanline!: Phaser.GameObjects.Rectangle;
    private currentVolume: number = 0.5;
    private currentQuality: string = 'high';
    private currentLanguage: string = 'pt';

    constructor() {
        super('SettingsScene');
    }

    preload() {
        this.load.image('background', '/assets/menu.png');
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Create background
        this.background = this.add.image(screenWidth / 2, screenHeight / 2, 'background');
        this.background.setDisplaySize(screenWidth, screenHeight);

        // Create scanline effect
        this.scanline = this.add.rectangle(0, 0, screenWidth, 2, 0x00ff00, 0.3);
        this.scanline.setOrigin(0, 0);
        
        // Add scanline animation
        this.tweens.add({
            targets: this.scanline,
            y: screenHeight,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Create title
        this.title = this.add.text(screenWidth / 2, screenHeight * 0.15, 'CONFIGURAÇÕES DO SISTEMA', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4
        });
        this.title.setOrigin(0.5);

        // Create back button
        this.createBackButton();

        // Create settings options
        this.createVolumeSlider();
        this.createQualitySelector();
        this.createLanguageSelector();
        this.createControlsButton();
    }

    createBackButton() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.backButton = this.add.container(screenWidth * 0.1, screenHeight * 0.1);
        
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x000000, 0.7);
        buttonBg.fillRoundedRect(-60, -20, 120, 40, 8);
        buttonBg.lineStyle(2, 0x00ff00, 0.3);
        buttonBg.strokeRoundedRect(-60, -20, 120, 40, 8);
        this.backButton.add(buttonBg);

        const backText = this.add.text(0, 0, '< VOLTAR', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        backText.setOrigin(0.5);
        this.backButton.add(backText);

        this.backButton.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);

        this.backButton.on('pointerover', () => {
            this.tweens.add({
                targets: [this.backButton, buttonBg],
                scaleX: 1.1,
                scaleY: 1.1,
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });
            backText.setStyle({ color: '#00ff77' });
        });

        this.backButton.on('pointerout', () => {
            this.tweens.add({
                targets: [this.backButton, buttonBg],
                scaleX: 1,
                scaleY: 1,
                alpha: 0.8,
                duration: 200,
                ease: 'Power2'
            });
            backText.setStyle({ color: '#00ff00' });
        });

        this.backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    createVolumeSlider() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.volumeSlider = this.add.container(screenWidth * 0.3, screenHeight * 0.3);
        
        const label = this.add.text(-100, 0, 'VOLUME:', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        this.volumeSlider.add(label);

        const sliderBg = this.add.graphics();
        sliderBg.fillStyle(0x000000, 0.7);
        sliderBg.fillRoundedRect(0, -10, 200, 20, 10);
        sliderBg.lineStyle(2, 0x00ff00, 0.3);
        sliderBg.strokeRoundedRect(0, -10, 200, 20, 10);
        this.volumeSlider.add(sliderBg);

        const sliderFill = this.add.graphics();
        sliderFill.fillStyle(0x00ff00, 0.5);
        sliderFill.fillRoundedRect(0, -10, this.currentVolume * 200, 20, 10);
        this.volumeSlider.add(sliderFill);

        const sliderHandle = this.add.graphics();
        sliderHandle.fillStyle(0x00ff00, 1);
        sliderHandle.fillCircle(this.currentVolume * 200, 0, 10);
        this.volumeSlider.add(sliderHandle);

        this.volumeSlider.setInteractive(new Phaser.Geom.Rectangle(0, -10, 200, 20), Phaser.Geom.Rectangle.Contains);

        this.volumeSlider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.updateVolume(pointer.x - this.volumeSlider.x);
        });

        this.volumeSlider.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                this.updateVolume(pointer.x - this.volumeSlider.x);
            }
        });
    }

    updateVolume(x: number) {
        this.currentVolume = Phaser.Math.Clamp(x / 200, 0, 1);
        
        const sliderFill = this.volumeSlider.list[2] as Phaser.GameObjects.Graphics;
        const sliderHandle = this.volumeSlider.list[3] as Phaser.GameObjects.Graphics;
        
        sliderFill.clear();
        sliderFill.fillStyle(0x00ff00, 0.5);
        sliderFill.fillRoundedRect(0, -10, this.currentVolume * 200, 20, 10);
        
        sliderHandle.clear();
        sliderHandle.fillStyle(0x00ff00, 1);
        sliderHandle.fillCircle(this.currentVolume * 200, 0, 10);
    }

    createQualitySelector() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.qualitySelector = this.add.container(screenWidth * 0.3, screenHeight * 0.4);
        
        const label = this.add.text(-100, 0, 'QUALIDADE:', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        this.qualitySelector.add(label);

        const qualities = ['low', 'medium', 'high'];
        const buttonWidth = 60;
        const spacing = 10;

        qualities.forEach((quality, index) => {
            const button = this.add.graphics();
            button.fillStyle(0x000000, 0.7);
            button.fillRoundedRect(index * (buttonWidth + spacing), -15, buttonWidth, 30, 5);
            button.lineStyle(2, quality === this.currentQuality ? 0x00ff00 : 0x003300, 0.3);
            button.strokeRoundedRect(index * (buttonWidth + spacing), -15, buttonWidth, 30, 5);
            this.qualitySelector.add(button);

            const text = this.add.text(index * (buttonWidth + spacing) + buttonWidth/2, 0, quality.toUpperCase(), {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: quality === this.currentQuality ? '#00ff00' : '#003300'
            });
            text.setOrigin(0.5);
            this.qualitySelector.add(text);

            const buttonArea = this.add.zone(index * (buttonWidth + spacing), -15, buttonWidth, 30);
            buttonArea.setInteractive();
            this.qualitySelector.add(buttonArea);

            buttonArea.on('pointerdown', () => {
                this.currentQuality = quality;
                this.updateQualitySelector();
            });
        });
    }

    updateQualitySelector() {
        const qualities = ['low', 'medium', 'high'];
        let buttonIndex = 0;
        
        this.qualitySelector.list.forEach((item, index) => {
            if (item instanceof Phaser.GameObjects.Graphics) {
                const quality = qualities[buttonIndex];
                item.clear();
                item.fillStyle(0x000000, 0.7);
                item.fillRoundedRect(buttonIndex * 70, -15, 60, 30, 5);
                item.lineStyle(2, quality === this.currentQuality ? 0x00ff00 : 0x003300, 0.3);
                item.strokeRoundedRect(buttonIndex * 70, -15, 60, 30, 5);
                buttonIndex++;
            } else if (item instanceof Phaser.GameObjects.Text) {
                const quality = qualities[Math.floor(index / 2)];
                item.setStyle({ color: quality === this.currentQuality ? '#00ff00' : '#003300' });
            }
        });
    }

    createLanguageSelector() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.languageSelector = this.add.container(screenWidth * 0.3, screenHeight * 0.5);
        
        const label = this.add.text(-100, 0, 'IDIOMA:', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        this.languageSelector.add(label);

        const languages = ['pt', 'en', 'es'];
        const buttonWidth = 60;
        const spacing = 10;

        languages.forEach((lang, index) => {
            const button = this.add.graphics();
            button.fillStyle(0x000000, 0.7);
            button.fillRoundedRect(index * (buttonWidth + spacing), -15, buttonWidth, 30, 5);
            button.lineStyle(2, lang === this.currentLanguage ? 0x00ff00 : 0x003300, 0.3);
            button.strokeRoundedRect(index * (buttonWidth + spacing), -15, buttonWidth, 30, 5);
            this.languageSelector.add(button);

            const text = this.add.text(index * (buttonWidth + spacing) + buttonWidth/2, 0, lang.toUpperCase(), {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: lang === this.currentLanguage ? '#00ff00' : '#003300'
            });
            text.setOrigin(0.5);
            this.languageSelector.add(text);

            const buttonArea = this.add.zone(index * (buttonWidth + spacing), -15, buttonWidth, 30);
            buttonArea.setInteractive();
            this.languageSelector.add(buttonArea);

            buttonArea.on('pointerdown', () => {
                this.currentLanguage = lang;
                this.updateLanguageSelector();
            });
        });
    }

    updateLanguageSelector() {
        const languages = ['pt', 'en', 'es'];
        let buttonIndex = 0;
        
        this.languageSelector.list.forEach((item, index) => {
            if (item instanceof Phaser.GameObjects.Graphics) {
                const lang = languages[buttonIndex];
                item.clear();
                item.fillStyle(0x000000, 0.7);
                item.fillRoundedRect(buttonIndex * 70, -15, 60, 30, 5);
                item.lineStyle(2, lang === this.currentLanguage ? 0x00ff00 : 0x003300, 0.3);
                item.strokeRoundedRect(buttonIndex * 70, -15, 60, 30, 5);
                buttonIndex++;
            } else if (item instanceof Phaser.GameObjects.Text) {
                const lang = languages[Math.floor(index / 2)];
                item.setStyle({ color: lang === this.currentLanguage ? '#00ff00' : '#003300' });
            }
        });
    }

    createControlsButton() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.controlsButton = this.add.container(screenWidth * 0.3, screenHeight * 0.6);
        
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x000000, 0.7);
        buttonBg.fillRoundedRect(-150, -20, 300, 40, 8);
        buttonBg.lineStyle(2, 0x00ff00, 0.3);
        buttonBg.strokeRoundedRect(-150, -20, 300, 40, 8);
        this.controlsButton.add(buttonBg);

        const buttonText = this.add.text(0, 0, 'CONFIGURAR CONTROLES', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        buttonText.setOrigin(0.5);
        this.controlsButton.add(buttonText);

        this.controlsButton.setInteractive(new Phaser.Geom.Rectangle(-150, -20, 300, 40), Phaser.Geom.Rectangle.Contains);

        this.controlsButton.on('pointerover', () => {
            this.tweens.add({
                targets: [this.controlsButton, buttonBg],
                scaleX: 1.1,
                scaleY: 1.1,
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });
            buttonText.setStyle({ color: '#00ff77' });
        });

        this.controlsButton.on('pointerout', () => {
            this.tweens.add({
                targets: [this.controlsButton, buttonBg],
                scaleX: 1,
                scaleY: 1,
                alpha: 0.8,
                duration: 200,
                ease: 'Power2'
            });
            buttonText.setStyle({ color: '#00ff00' });
        });

        this.controlsButton.on('pointerdown', () => {
            // TODO: Implement controls configuration
            console.log('Controls configuration will be implemented');
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
            scene: [MenuScene, VideoScene, SettingsScene, RPGGame, BattleScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                width: '100%',
                height: '100%',
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 800,
                    height: 400
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            input: {
                touch: {
                    capture: true
                }
            },
            render: {
                pixelArt: true,
                antialias: false
            }
        };

        console.log('Initializing game with config:', config);
        const game = new Phaser.Game(config);
        gameInstanceRef.current = game;

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

                    // Chamar o método de redimensionamento da cena atual
                    const game = gameInstanceRef.current;
                    if (game.scene.scenes.length > 0) {
                        const currentScene = game.scene.scenes[0] as MenuScene;
                        if (currentScene && typeof currentScene.handleResize === 'function') {
                            currentScene.handleResize();
                        }
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
                width: '100vw', 
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#000000',
                position: 'fixed',
                top: 0,
                left: 0,
                touchAction: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} 
        />
    );
};

export default Game; 