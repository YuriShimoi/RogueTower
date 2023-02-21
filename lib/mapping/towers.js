class Tower {
    static TowerSettings = class {
        constructor(texture, bullet_texture, damage, range, delay, affect="enemy", amount=1, cooldown_amount=0, cooldown_delay=0) {
            this.emissor = new BulletEmissor(bullet_texture, damage, range, delay, amount, cooldown_amount, cooldown_delay);
            this.affect  = affect;
            this.texture = texture;
        }
    };

    static TEXTURE_PATH = "lib/mapping/icons/tower/";

    static CSSPath = {
        'basic': "icons/tower/basic.png",
        'magic': "icons/tower/magic.png",
        'miner': "icons/tower/miner.png"
    };

    static type = {
        'basic': [Tower.TEXTURE_PATH + "basic.png", Tower.TEXTURE_PATH + "basic_bullet.png", 5, 7, 2],
        'magic': [Tower.TEXTURE_PATH + "magic.png", Tower.TEXTURE_PATH + "magic_bullet.png", 15, 5, 5],
        'miner': [Tower.TEXTURE_PATH + "miner.png", Tower.TEXTURE_PATH + "miner_bullet.png", 1, 2, 1, "resource"]
    };

    static base_price = {
        'basic': 100,
        'magic':  50,
        'miner': 150
    };

    static base_currency = {
        'basic': "gold",
        'magic': "crystal",
        'miner': "gold"
    };

    constructor(type) {
        this.emissor = new Tower.TowerSettings(...Tower.type[type]);
        this.price   = Tower.base_price[type];
    }
}

class BulletEmissor {
    constructor(texture, damage=1, range=5, delay=1, amount=1, cooldown_amount=0, cooldown_delay=0) {
        this.texture = texture;

        this.damage = damage;
        this.delay  = delay;
        this.range  = range;
        this.amount = amount;

        this.cd_amount = cooldown_amount;
        this.cd_delay  = cooldown_delay;
    }
}