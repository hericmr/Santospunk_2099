export const RPGConfig = {
    // Configurações do jogador
    player: {
        speed: 200,
        sprite: {
            width: 32,
            height: 32,
            frameRate: 10
        }
    },
    
    // Configurações do mapa
    map: {
        tileSize: 32,
        layers: {
            ground: 'Ground',
            walls: 'Walls'
        }
    },
    
    // Configurações de física
    physics: {
        gravity: { y: 0 },
        debug: false
    },
    
    // Configurações da câmera
    camera: {
        zoom: 1,
        followOffset: { x: 0, y: 0 }
    }
}; 