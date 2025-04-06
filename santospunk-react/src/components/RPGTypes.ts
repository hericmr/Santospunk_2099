export interface Stats {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
}

export interface PlayerStats extends Stats {
    level: number;
    experience: number;
    nextLevelExp: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    type: 'weapon' | 'armor' | 'consumable' | 'key';
    value: number;
    quantity?: number;
}

export interface BattleEnemy {
    id: string;
    name: string;
    sprite: string;
    stats: Stats;
    drops: {
        item: InventoryItem;
        chance: number;
    }[];
}

export interface MapData {
    id: string;
    name: string;
    tileset: string;
    width: number;
    height: number;
    layers: {
        ground: number[][];
        walls: number[][];
        objects: number[][];
    };
    enemies: {
        id: string;
        x: number;
        y: number;
        spawnChance: number;
    }[];
    items: {
        id: string;
        x: number;
        y: number;
    }[];
}

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'consumable';
    effect: {
        health?: number;
        attack?: number;
        defense?: number;
    };
    description: string;
} 