import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class VideoScene extends Phaser.Scene {
    private video!: Phaser.GameObjects.Video;
    private glitchEffect!: Phaser.GameObjects.RenderTexture;
    private scanline!: Phaser.GameObjects.Rectangle;
    private glitchTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super('VideoScene');
    }

    preload() {
        this.load.video('introVideo', 'assets/1003.mp4');
    }

    create() {
        // Create glitch effect
        this.glitchEffect = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Create scanline effect
        this.scanline = this.add.rectangle(0, 0, this.cameras.main.width, 2, 0x00ff00, 0.3);
        this.scanline.setOrigin(0, 0);
        
        // Add neon glow to scanline
        const scanlineGlow = this.add.rectangle(0, 0, this.cameras.main.width, 4, 0x00ff00, 0.2);
        scanlineGlow.setOrigin(0, 0);
        
        // Create video with glitch effect
        this.video = this.add.video(0, 0, 'introVideo');
        this.video.setOrigin(0, 0);
        this.video.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Add glitch effect timer
        this.glitchTimer = this.time.addEvent({
            delay: 100,
            callback: this.applyGlitchEffect,
            callbackScope: this,
            loop: true
        });

        // Add scanline animation with enhanced effect
        this.tweens.add({
            targets: [this.scanline, scanlineGlow],
            y: this.cameras.main.height,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
            onUpdate: () => {
                // Adiciona variação na opacidade para efeito de cintilação
                const flicker = Math.random() * 0.1 + 0.25;
                this.scanline.setAlpha(0.3 + flicker);
                scanlineGlow.setAlpha(0.2 + flicker);
            }
        });

        this.video.play();

        // Add cyberpunk-style transition
        this.video.on('complete', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('IntroScene');
            });
        });

        // Skip with cyberpunk effect
        this.input.on('pointerdown', () => {
            this.cameras.main.flash(0xff00ff, 500);
            this.time.delayedCall(500, () => {
                this.scene.start('IntroScene');
            });
        });
    }

    applyGlitchEffect() {
        // Random chance to trigger a glitch
        if (Math.random() > 0.9) {
            // Create multiple glitch effects
            const numGlitches = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numGlitches; i++) {
                // Random position and size for each glitch
                const x = Math.random() * this.cameras.main.width;
                const y = Math.random() * this.cameras.main.height;
                const width = Math.random() * 100 + 50;
                const height = Math.random() * 100 + 50;
                
                // Random glitch type
                const glitchType = Math.floor(Math.random() * 3);
                
                switch (glitchType) {
                    case 0: // Color shift glitch
                        this.glitchEffect.clear();
                        this.glitchEffect.draw(this.video, x, y);
                        this.glitchEffect.setTint(0xff00ff);
                        this.time.delayedCall(50, () => {
                            this.glitchEffect.clear();
                        });
                        break;
                        
                    case 1: // Horizontal line glitch
                        const lineHeight = Math.random() * 20 + 5;
                        this.glitchEffect.clear();
                        this.glitchEffect.draw(this.video, 0, y, this.cameras.main.width, lineHeight);
                        this.glitchEffect.setTint(0x00ffff);
                        this.time.delayedCall(30, () => {
                            this.glitchEffect.clear();
                        });
                        break;
                        
                    case 2: // Block glitch
                        this.glitchEffect.clear();
                        this.glitchEffect.draw(this.video, x, y, width, height);
                        this.glitchEffect.setTint(0xffff00);
                        this.time.delayedCall(70, () => {
                            this.glitchEffect.clear();
                        });
                        break;
                }
            }
            
            // Add screen shake effect occasionally
            if (Math.random() > 0.7) {
                this.cameras.main.shake(100, 0.005);
            }
        }
    }
}

class CityVideoScene extends Phaser.Scene {
    private video!: Phaser.GameObjects.Video;
    private neonText!: Phaser.GameObjects.Text;
    private overlay!: Phaser.GameObjects.Graphics;
    private scanline!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('CityVideoScene');
    }

    preload() {
        this.load.video('cityVideo', 'assets/1003.mp4');
    }

    create() {
        // Get screen dimensions
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Create dark overlay
        this.overlay = this.add.graphics();
        this.overlay.fillStyle(0x000000, 0.3);
        this.overlay.fillRect(0, 0, screenWidth, screenHeight);
        this.overlay.setDepth(1);
        
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
                // Adiciona variação na opacidade para efeito de cintilação
                const flicker = Math.random() * 0.1 + 0.25;
                this.scanline.setAlpha(0.3 + flicker);
                scanlineGlow.setAlpha(0.2 + flicker);
            }
        });
        
        // Create video
        this.video = this.add.video(screenWidth / 2, screenHeight / 2, 'cityVideo');
        this.video.setOrigin(0.5);

        // Calculate dimensions to maintain aspect ratio and fit screen
        const videoRatio = this.video.width / this.video.height;
        const screenRatio = screenWidth / screenHeight;
        
        if (videoRatio > screenRatio) {
            const height = screenHeight * 0.7; // Reduced to 70% for better fit
            const width = height * videoRatio;
            this.video.setDisplaySize(width, height);
        } else {
            const width = screenWidth * 0.7; // Reduced to 70% for better fit
            const height = width / videoRatio;
            this.video.setDisplaySize(width, height);
        }

        // Add cyberpunk-style text
        this.neonText = this.add.text(screenWidth / 2, screenHeight - 50, '< CLICK TO SKIP >', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4,
            padding: { x: 20, y: 10 },
            backgroundColor: '#00000066'
        });
        this.neonText.setOrigin(0.5);
        this.neonText.setDepth(3);
        
        // Add text glow effect
        this.tweens.add({
            targets: this.neonText,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fade in video
        this.video.setAlpha(0);
        this.tweens.add({
            targets: this.video,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        this.video.play();

        // Add smooth transition on complete
        this.video.on('complete', () => {
            this.cameras.main.fade(1500, 0, 0, 0);
            this.time.delayedCall(1500, () => {
                this.scene.start('MenuScene');
            });
        });

        // Skip with smooth transition
        this.input.on('pointerdown', () => {
            this.cameras.main.fade(800, 0, 0, 0);
            this.tweens.add({
                targets: [this.video, this.neonText, this.overlay, this.scanline],
                alpha: 0,
                duration: 800,
                ease: 'Power2'
            });
            this.time.delayedCall(800, () => {
                this.scene.start('MenuScene');
            });
        });

        // Handle window resize
        this.scale.on('resize', () => {
            const newScreenWidth = this.cameras.main.width;
            const newScreenHeight = this.cameras.main.height;
            
            // Update overlay
            this.overlay.clear();
            this.overlay.fillStyle(0x000000, 0.3);
            this.overlay.fillRect(0, 0, newScreenWidth, newScreenHeight);
            
            // Recalculate video size
            const newVideoRatio = this.video.width / this.video.height;
            const newScreenRatio = newScreenWidth / newScreenHeight;
            
            if (newVideoRatio > newScreenRatio) {
                const height = newScreenHeight * 0.7;
                const width = height * newVideoRatio;
                this.video.setDisplaySize(width, height);
            } else {
                const width = newScreenWidth * 0.7;
                const height = width / newVideoRatio;
                this.video.setDisplaySize(width, height);
            }
            
            // Update positions
            this.video.setPosition(newScreenWidth / 2, newScreenHeight / 2);
            this.neonText.setPosition(newScreenWidth / 2, newScreenHeight - 50);
            this.scanline.width = newScreenWidth;
            const scanlineGlow = this.children.list.find(
                child => child instanceof Phaser.GameObjects.Rectangle && child !== this.scanline
            ) as Phaser.GameObjects.Rectangle;
            if (scanlineGlow) {
                scanlineGlow.width = newScreenWidth;
            }
        });
    }
}

class IntroScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Image;
    private characterCloseup!: Phaser.GameObjects.Image;
    private character!: Phaser.GameObjects.Sprite;
    private dialogueText!: Phaser.GameObjects.Text;
    private nameInput!: HTMLInputElement;
    private nameText!: Phaser.GameObjects.Text;
    private finalPosition!: Phaser.Math.Vector2;
    private ambientSound!: Phaser.Sound.BaseSound;
    private citySound!: Phaser.Sound.BaseSound;
    private nameSound!: Phaser.Sound.BaseSound;
    private typingEffect!: Phaser.Time.TimerEvent;

    constructor() {
        super('IntroScene');
    }

    preload() {
        this.load.image('background', 'assets/c6.png');
        this.load.image('character', 'assets/heric.png');
        this.load.image('characterCloseup', 'assets/WhatsApp Image 2025-04-03 at 12.29.58.jpeg');
        this.load.audio('ambient', 'assets/msc.wav');
        this.load.audio('city', 'assets/cidade.wav');
        this.load.audio('name', 'assets/nome-pygbag.mp3');
    }

    create() {
        // Initialize final position
        this.finalPosition = new Phaser.Math.Vector2(this.cameras.main.width * 0.4, this.cameras.main.height * 0.8);

        // Create background with rain effect
        this.background = this.add.image(0, 0, 'background');
        this.background.setOrigin(0, 0);
        this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Create character with neon outline
        this.character = this.add.sprite(-100, this.cameras.main.height * 0.8, 'character');
        this.character.setScale(1);
        this.character.setPipeline('Light2D');
        
        // Add neon glow to character
        const light = this.lights.addLight(0, 0, 200, 0x00ff00, 2);
        this.lights.enable();
        this.lights.setAmbientColor(0x555555);

        // Character close-up with cyberpunk style
        this.characterCloseup = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'characterCloseup');
        this.characterCloseup.setOrigin(0.5);
        this.characterCloseup.setDisplaySize(this.cameras.main.width * 0.8, this.cameras.main.height * 0.8);
        this.characterCloseup.setVisible(false);
        this.characterCloseup.setDepth(2);

        // Cyberpunk style dialogue box
        this.dialogueText = this.add.text(this.cameras.main.width * 0.1, this.cameras.main.height * 0.3, '', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#00ff00',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 15 },
            wordWrap: { width: this.cameras.main.width * 0.8 }
        });
        this.dialogueText.setDepth(3);
        
        // Stylish name input
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.top = '50%';
        this.nameInput.style.left = '50%';
        this.nameInput.style.transform = 'translate(-50%, -50%)';
        this.nameInput.style.background = 'rgba(0, 0, 0, 0.8)';
        this.nameInput.style.border = '2px solid #00ff00';
        this.nameInput.style.color = '#00ff00';
        this.nameInput.style.padding = '10px 20px';
        this.nameInput.style.fontSize = '24px';
        this.nameInput.style.fontFamily = 'monospace';
        this.nameInput.style.outline = 'none';
        this.nameInput.style.display = 'none';
        document.body.appendChild(this.nameInput);

        // Initialize sounds with proper volume levels
        try {
            this.ambientSound = this.sound.add('ambient', { volume: 0.3, loop: true });
            this.citySound = this.sound.add('city', { volume: 0.2 });
            this.nameSound = this.sound.add('name', { volume: 0.4 });
        } catch (error) {
            console.error('Error loading sounds:', error);
        }

        // Start the sequence
        this.startSequence();
    }

    async startSequence() {
        // Play ambient sound
        this.ambientSound.play();

        // Move character
        await this.moveCharacter(this.finalPosition, 3000);

        // Wait and show dialogue with close-up
        await this.wait(3000);
        
        // Show close-up with fade effect
        this.characterCloseup.setAlpha(0);
        this.characterCloseup.setVisible(true);
        this.tweens.add({
            targets: this.characterCloseup,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        this.showDialogue('Olá forasteiro', 6000);
        await this.wait(6000);

        // Hide close-up with fade effect
        this.tweens.add({
            targets: this.characterCloseup,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.characterCloseup.setVisible(false);
            }
        });

        // Increase character size
        await this.increaseSize(0.2, 5);

        // Ask for name
        await this.wait(500);
        this.showDialogue('Quem é você?', 1000);
        await this.wait(1000);
        this.nameInput.style.display = 'block';
        this.nameInput.focus();

        // Handle name input
        this.nameInput.onkeypress = async (e) => {
            if (e.key === 'Enter') {
                const name = this.nameInput.value.trim();
                if (name) {
                    this.nameInput.style.display = 'none';
                    await this.wait(3000);
                    this.showDialogue(`Heim? ${name}!?..`, 1000);
                    await this.wait(1000);
                    this.showDialogue('Que nome idiota!', 1000);
                    this.nameSound.play();
                    await this.wait(4000);
                    await this.increaseSize(0.4, 12);
                    this.showDialogue(`Bom... ${name}\naqui estamos...\nna cidade de Santos`, 2000);
                    this.citySound.play();
                    await this.wait(2000);
                    this.ambientSound.stop();
                    this.scene.start('CityVideoScene');
                } else {
                    this.showDialogue('Digite um nome!', 1000);
                    this.nameInput.focus();
                }
            }
        };
    }

    async moveCharacter(position: Phaser.Math.Vector2, duration: number) {
        return new Promise<void>((resolve) => {
            this.tweens.add({
                targets: this.character,
                x: position.x,
                y: position.y,
                duration: duration,
                onComplete: () => resolve()
            });
        });
    }

    async wait(ms: number) {
        return new Promise<void>((resolve) => {
            this.time.delayedCall(ms, () => resolve());
        });
    }

    showDialogue(text: string, duration: number) {
        // Clear any existing typing effect
        if (this.typingEffect) {
            this.typingEffect.remove();
        }
        
        // Reset text
        this.dialogueText.setText('');
        
        // Create typing effect
        let currentChar = 0;
        const chars = text.split('');
        
        this.typingEffect = this.time.addEvent({
            delay: 50,
            callback: () => {
                if (currentChar < chars.length) {
                    this.dialogueText.text += chars[currentChar];
                    currentChar++;
                }
            },
            repeat: chars.length - 1
        });

        // Clear text after duration
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: this.dialogueText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.dialogueText.setText('');
                    this.dialogueText.setAlpha(1);
                }
            });
        });
    }

    async increaseSize(factor: number, repetitions: number) {
        for (let i = 0; i < repetitions; i++) {
            this.character.setScale(this.character.scale * (1 + factor));
            await this.wait(500);
        }
    }
}

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
                // Adiciona variação na opacidade para efeito de cintilação
                const flicker = Math.random() * 0.1 + 0.25;
                this.scanline.setAlpha(0.3 + flicker);
                scanlineGlow.setAlpha(0.2 + flicker);
            }
        });

        // Create title with initial alpha 0
        this.title = this.add.image(screenWidth / 2, screenHeight * 0.15, 'title');
        this.title.setScale(1.8);
        this.title.setAlpha(0);

        // Create year counter with cyberpunk style
        this.yearCounter = this.add.text(screenWidth / 2, screenHeight * 0.25, '0000', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#00ff77'
        });
        this.yearCounter.setOrigin(0.5);
        this.yearCounter.setAlpha(0);

        // Create glitch effect for title
        this.titleGlitch = this.add.renderTexture(0, 0, screenWidth, screenHeight);
        this.titleGlitch.setVisible(false);

        // Create characters
        this.character = this.add.image(-200, screenHeight * 0.6, 'character');
        this.character.setScale(0.8);
        this.character.setFlipX(false);

        this.xumbro = this.add.image(screenWidth + 200, screenHeight * 0.6, 'xumbro');
        this.xumbro.setScale(0.8);
        this.xumbro.setFlipX(true);

        // Animate character entry first
        this.tweens.add({
            targets: this.character,
            x: screenWidth * 0.3,
            duration: 1500,
            ease: 'Power2',
            delay: 500,
            onComplete: () => {
                // Animate xumbro entry after 2 seconds
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.xumbro,
                        x: screenWidth * 0.7,
                        duration: 1500,
                        ease: 'Power2',
                        onComplete: () => {
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
                    });
                });
            }
        });
    }

    applyGlitchEffect() {
        if (!this.title || !this.titleGlitch) return;

        // Mantém o tamanho original do título
        const fixedScale = 1.8;
        this.title.setScale(fixedScale);

        // Cria efeito de glitch mais intenso
        const glitchIntensity = Math.random();
        
        if (glitchIntensity > 0.7) {
            // RGB Split effect
            const offsetX = Math.random() * 15 - 7;
            const offsetY = Math.random() * 6 - 3;
            
            this.titleGlitch.clear();
            
            // Red channel
            this.titleGlitch.draw(this.title, this.title.x + offsetX, this.title.y + offsetY)
                .setTint(0xff0000)
                .setAlpha(0.8);
            
            // Green channel
            this.titleGlitch.draw(this.title, this.title.x - offsetX/2, this.title.y - offsetY/2)
                .setTint(0x00ff00)
                .setAlpha(0.8);
            
            // Blue channel
            this.titleGlitch.draw(this.title, this.title.x - offsetX, this.title.y - offsetY)
                .setTint(0x0000ff)
                .setAlpha(0.8);
        } else if (glitchIntensity > 0.4) {
            // Neon glow effect
            this.titleGlitch.clear();
            
            // Outer glow
            for (let i = 4; i >= 1; i--) {
                const alpha = 0.1 / i;
                this.titleGlitch.draw(this.title, this.title.x, this.title.y)
                    .setTint(0x00ff77)
                    .setAlpha(alpha)
                    .setScale(fixedScale + (i * 0.02));
            }
            
            // Main title
            this.titleGlitch.draw(this.title, this.title.x, this.title.y)
                .setTint(0xffffff)
                .setAlpha(1)
                .setScale(fixedScale);
        } else {
            // Digital noise effect
            this.titleGlitch.clear();
            this.titleGlitch.draw(this.title, this.title.x, this.title.y);
            
            // Add noise
            for (let i = 0; i < 10; i++) {
                const noiseX = Math.random() * this.title.width - this.title.width/2;
                const noiseY = Math.random() * this.title.height - this.title.height/2;
                const noiseWidth = Math.random() * 20 + 5;
                const noiseHeight = Math.random() * 4 + 1;
                
                this.titleGlitch.draw(
                    this.add.rectangle(
                        this.title.x + noiseX,
                        this.title.y + noiseY,
                        noiseWidth,
                        noiseHeight,
                        0x00ff77
                    ).setAlpha(0.3)
                );
            }
        }

        // Aplica tremor na tela apenas durante glitches fortes
        if (glitchIntensity > 0.85) {
            const shake = 3;
            this.cameras.main.shake(50, 0.002);
        }

        // Define tempo aleatório para próximo glitch
        this.time.delayedCall(Math.random() * 100 + 50, this.applyGlitchEffect, [], this);
    }

    createButton() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Create start button with initial alpha 0
        this.button = this.add.image(screenWidth / 2, screenHeight * 0.85, 'button');
        this.button.setScale(1.5);
        this.button.setAlpha(0);
        this.button.setInteractive();
        
        // Add neon glow effect to button
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
        
        // Add hover effect to button with glow
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

        // Add click handler with enhanced cyberpunk effect
        this.button.on('pointerdown', () => {
            // Flash effect
            this.cameras.main.flash(500, 0, 255, 0);
            
            // Glitch effect on button
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
            
            // Final fade out with RGB split
            this.tweens.add({
                targets: [this.background, this.title, this.button, this.startText, this.character, this.xumbro],
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.menuMusic.stop();
                    this.scene.start('IntroScene');
                }
            });
        });

        // Add cyberpunk style text
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
        
        // Fade in button and text with cyberpunk effect
        this.tweens.add({
            targets: [this.button, buttonGlow, this.startText],
            alpha: 0.8,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Add continuous glow animation to button
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
        
        // Add text glow effect with RGB split
        this.tweens.add({
            targets: this.startText,
            alpha: { from: 1, to: 0.6 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });

        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize() {
        const newWidth = this.cameras.main.width;
        const newHeight = this.cameras.main.height;
        
        // Update background
        this.background.setPosition(newWidth / 2, newHeight / 2);
        this.background.setDisplaySize(newWidth, newHeight);
        
        // Update title
        this.title.setPosition(newWidth / 2, newHeight * 0.15);
        
        // Update year counter
        if (this.yearCounter) {
            this.yearCounter.setPosition(newWidth / 2, newHeight * 0.25);
        }
        
        // Update characters
        if (this.character && this.xumbro) {
            this.character.setPosition(newWidth * 0.3, newHeight * 0.6);
            this.xumbro.setPosition(newWidth * 0.7, newHeight * 0.6);
        }
        
        // Update button
        if (this.button) {
            this.button.setPosition(newWidth / 2, newHeight * 0.85);
        }
        
        // Update text
        if (this.startText) {
            this.startText.setPosition(newWidth / 2, newHeight * 0.95);
        }
        
        // Update scanlines
        this.scanline.width = newWidth;
        const scanlineGlow = this.children.list.find(
            child => child instanceof Phaser.GameObjects.Rectangle && child !== this.scanline
        ) as Phaser.GameObjects.Rectangle;
        if (scanlineGlow) {
            scanlineGlow.width = newWidth;
        }
    }

    // Add new method for year counter animation
    private animateYearCounter() {
        const targetYear = 2099;
        const duration = 2000; // 2 seconds
        const steps = 50; // Number of steps in the animation
        const stepDuration = duration / steps;
        let currentStep = 0;

        const updateCounter = () => {
            currentStep++;
            const progress = currentStep / steps;
            this.yearValue = Math.floor(progress * targetYear);
            this.yearCounter.setText(this.yearValue.toString().padStart(4, '0'));

            // Add glitch effect occasionally
            if (Math.random() > 0.7) {
                this.yearCounter.setTint(0xff00ff);
                this.time.delayedCall(50, () => {
                    this.yearCounter.clearTint();
                });
            }

            if (currentStep < steps) {
                this.time.delayedCall(stepDuration, updateCounter);
            } else {
                // Final glitch effect
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

const Game: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);
    const orientationMessageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        // Create orientation message element
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
            scene: [MenuScene, IntroScene, CityVideoScene],
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
                    // Atualiza o tamanho do canvas mantendo a proporção
                    const canvas = gameRef.current?.querySelector('canvas');
                    if (canvas) {
                        canvas.style.width = '100%';
                        canvas.style.height = '100%';
                        canvas.style.objectFit = 'contain';
                    }
                }
            }
        };

        // Configuração inicial do meta viewport para mobile
        const viewport = document.querySelector('meta[name=viewport]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
        }

        // Initial check
        handleResize();

        // Listen for resize and orientation changes
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