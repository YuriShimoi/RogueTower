class Tower {
    static TowerSettings = class {
        constructor(damage, delay, range, affect="enemy") {
            this.damage = damage;
            this.delay  = delay;
            this.range  = range;
            this.affect = affect;
        }
    };

    static type = {
        'basic': new Tower.TowerSettings(5, 2, 7),
        'magic': new Tower.TowerSettings(15, 5, 5),
        'miner': new Tower.TowerSettings(1, 1, 2, "resource")
    };

    constructor(type) {
        this.type = type;
    }
}