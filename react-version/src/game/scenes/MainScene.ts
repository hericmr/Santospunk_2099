export default class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private dialogText!: Phaser.GameObjects.Text;
    private nameInput!: HTMLInputElement;
    private music!: Phaser.Sound.BaseSound;
    private citySound!: Phaser.Sound.BaseSound;
    private nameSound!: Phaser.Sound.BaseSound;
    private background!: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('heric', '/assets/heric.png');
        this.load.image('cidade', '/assets/c6.png');
        this.load.audio('ambient', '/assets/Skyline - Ambient Track (Bladerunner _ Cyberpunk 2077 Inspired Huge Ambient Music).mp3');
        this.load.audio('cidade', '/assets/cidade.wav');
        this.load.audio('nome', '/assets/nome-pygbag (online-audio-converter.com).mp3');
    }

    create() {
        console.log('MainScene created');
        
        // Add and configure background
        this.background = this.add.image(0, 0, 'cidade');
        this.background.setOrigin(0, 0);
        
        // Adjust background size
        this.adjustBackgroundSize();
        
        // Add background music
        this.music = this.sound.add('ambient', { loop: true });
        this.citySound = this.sound.add('cidade');
        this.nameSound = this.sound.add('nome');
        this.music.play();

        // Add player character starting from outside the screen
        this.player = this.add.sprite(-100, this.cameras.main.centerY + 150, 'heric')
            .setScale(0.5)
            .setOrigin(0.5);

        // Add dialog text with cyberpunk style
        this.dialogText = this.add.text(this.cameras.main.centerX, this.cameras.main.height * 0.75, '', {
            fontSize: '48px',
            color: '#00ff00',
            align: 'center',
            fontFamily: 'monospace',
            backgroundColor: '#000000aa',
            padding: { x: 30, y: 20 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#ff00ff',
                blur: 5,
                fill: true
            },
            stroke: '#ff00ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create name input with cyberpunk style
        this.createNameInput();

        // Start the opening sequence
        this.startOpeningSequence();

        // Listen for resize events
        this.scale.on('resize', this.resize, this);
    }

    private adjustBackgroundSize() {
        const scaleX = this.cameras.main.width / this.background.width;
        const scaleY = this.cameras.main.height / this.background.height;
        const scale = Math.max(scaleX, scaleY);
        
        this.background.setScale(scale);
        
        // Center the background if it's taller than the screen
        if (this.background.displayHeight > this.cameras.main.height) {
            const yOffset = (this.background.displayHeight - this.cameras.main.height) / 2;
            this.background.setY(-yOffset);
        }
    }

    private resize() {
        this.adjustBackgroundSize();
    }

    private createNameInput() {
        this.nameInput = document.createElement('input');
        Object.assign(this.nameInput.style, {
            position: 'absolute',
            left: '50%',
            top: '70%',
            transform: 'translate(-50%, -50%)',
            padding: '15px',
            fontSize: '32px',
            display: 'none',
            backgroundColor: '#000',
            color: '#00ff00',
            border: '3px solid #ff00ff',
            borderRadius: '10px',
            textAlign: 'center',
            width: '400px',
            fontFamily: 'monospace',
            boxShadow: '0 0 10px #ff00ff, inset 0 0 10px #ff00ff',
            textShadow: '0 0 5px #00ff00'
        });
        document.body.appendChild(this.nameInput);

        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameSubmission(this.nameInput.value);
            }
        });
    }

    private async startOpeningSequence() {
        console.log('Starting opening sequence');
        
        // 1. Move character from left to position
        const targetX = this.cameras.main.width * 0.7;
        const targetY = this.cameras.main.height * 0.6;
        await this.movePlayerTo(targetX, targetY);
        
        // 2. Wait before starting dialog
        await this.delay(3000);
        
        // 3. Show first dialog with glitch effect
        await this.showGlitchDialog('Olá forasteiro', 6000);
        
        // 4. Do the scaling animation
        await this.scaleUpAnimation(0.2, 5);
        
        // 5. Ask for name
        await this.delay(500);
        await this.showGlitchDialog('Quem é você?', 1000);
        this.nameInput.style.display = 'block';
        this.nameInput.focus();
    }

    private async showGlitchDialog(text: string, duration: number) {
        const glitchInterval = 100; // Glitch every 100ms
        const glitchDuration = 50; // Glitch lasts 50ms
        let elapsed = 0;
        
        return new Promise<void>((resolve) => {
            const glitchEffect = setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance of glitch
                    this.dialogText.setStyle({ 
                        color: '#ff00ff',
                        stroke: '#00ff00'
                    });
                    setTimeout(() => {
                        this.dialogText.setStyle({ 
                            color: '#00ff00',
                            stroke: '#ff00ff'
                        });
                    }, glitchDuration);
                }
            }, glitchInterval);

            this.dialogText.setText(text);
            
            this.time.delayedCall(duration, () => {
                clearInterval(glitchEffect);
                this.dialogText.setText('');
                resolve();
            });
        });
    }

    private async handleNameSubmission(name: string) {
        console.log('Handling name submission:', name);
        const cleanName = name.trim();
        if (cleanName !== '') {
            await this.delay(3000);
            await this.showGlitchDialog(`Heim? ${cleanName}!?..`, 2000);
            await this.delay(1000);
            await this.showGlitchDialog('Que nome idiota!', 2000);
            this.nameSound.play();
            this.nameInput.style.display = 'none';
            
            await this.delay(4000);
            await this.scaleUpAnimation(0.4, 12);
            
            await this.showGlitchDialog(
                `Bom... ${cleanName}\naqui estamos...\nna cidade de Santos`, 
                5000
            );
            this.citySound.play();
            
            await this.delay(5000);
            this.music.stop();
            
            // Change to menu scene
            this.scene.start('MenuScene');
        } else {
            await this.showGlitchDialog('Digite um nome!', 2000);
            this.nameInput.focus();
        }
    }

    private movePlayerTo(x: number, y: number): Promise<void> {
        console.log('Moving player to:', x, y);
        return new Promise((resolve) => {
            this.tweens.add({
                targets: this.player,
                x: x,
                y: y,
                duration: 3000,
                ease: 'Power1',
                onComplete: () => {
                    console.log('Player movement complete');
                    resolve();
                }
            });
        });
    }

    private async scaleUpAnimation(factor: number, repetitions: number) {
        console.log('Starting scale animation');
        for (let i = 0; i < repetitions; i++) {
            await new Promise<void>((resolve) => {
                this.tweens.add({
                    targets: this.player,
                    scaleX: this.player.scaleX * (1 + factor),
                    scaleY: this.player.scaleY * (1 + factor),
                    duration: 500,
                    ease: 'Power1',
                    onComplete: () => {
                        console.log('Scale step complete:', i + 1);
                        resolve();
                    }
                });
            });
            await this.delay(500);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            this.time.delayedCall(ms, resolve);
        });
    }

    override update() {
        // Game loop logic here
    }
} 