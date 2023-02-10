class RaidControl {
    static ICON_PATH = "lib/mapping/icons/enemy/";

    /**
     * @param {TableMap} table 
     */
    constructor(table) {
        this.tableMap = table;
        this.wave = 0;

        this.enemies = [];
    }

    static RaidEnemy = class {
        constructor(name, img_path, speed=10, life=100, strength=1) {
            this.name     = name;
            this.img_path = img_path;

            this.speed    = speed;
            this.life     = life;
            this.strength = strength;

            this.path = null;
        }

        move() {
            if(this.path === null) this.trackPath(this.spawner);

            // set out of table to start paths
            let spw_instance  = this.tableMap.findInstance(this.spawner.x, this.spawner.y);
            let spw_direction = spw_instance.style.getPropertyValue('--direction');

            let _size = spw_instance.offsetWidth;
            let _move = MAPPING.Helper.direction_info[spw_direction].move;
            
            // set first move
            this.tableMap.containerElement.prepend(this.element);
            this.element.style.setProperty( '--start-top',  (this.path[0].top  + _move.y * _size)  + "px");
            this.element.style.setProperty( '--start-left', (this.path[0].left + _move.x * _size) + "px");

            this.element.style.setProperty( '--end-top',  this.path[0].top  + "px");
            this.element.style.setProperty( '--end-left', this.path[0].left + "px");

            // interval for movements
            let path_index   = 0;
            const BASE_DELAY = 150;
            let speed_delay  = BASE_DELAY * (100 / this.speed);
            this.element.style.setProperty('--speed-delay', speed_delay);
            this.element.setAttribute("active", true);
            let move_interval = setInterval(() => {
                if(path_index >= this.path.length) {
                    this.element.removeAttribute("active");
                    clearInterval(move_interval);
                }
                else if(this.element.getAttribute("active")) {
                    this.element.style.top  = this.path[path_index].top  + "px";
                    this.element.style.left = this.path[path_index].left + "px";
                    path_index++;
                }
            }, speed_delay);
        }

        trackPath(startPosition, bestPath=true) {
            const tileCartesian = (_tile) => ({'x': Number(_tile.getAttribute('x')), 'y': Number(_tile.getAttribute('y'))});
            const tileCoord = (_x, _y) => {
                let tileElement = this.tableMap.findInstance(_x, _y);
                let _top  = tileElement.offsetTop;
                let _left = tileElement.offsetLeft;
                return {'top': _top, 'left': _left};
            };
            const pathIsCastle = (_path) => {
                let cartesian = tileCartesian(_path);
                return this.tableMap.Helper.isCastle(this.tableMap.mapping[cartesian.y][cartesian.x]);
            };
            const get_paths = (_anchor, _last_path=null) => {
                let possible_paths = {
                    'top'   : this.tableMap.findInstance(_anchor.x, _anchor.y+1),
                    'right' : this.tableMap.findInstance(_anchor.x+1, _anchor.y),
                    'bottom': this.tableMap.findInstance(_anchor.x, _anchor.y-1),
                    'left'  : this.tableMap.findInstance(_anchor.x-1, _anchor.y)
                };
                
                let valid_paths = {};
                for(let path of Object.keys(possible_paths)) {
                    if(possible_paths[path]) {
                        let cartesian = tileCartesian(possible_paths[path]);
                        let is_path = this.tableMap.Helper.isPath(this.tableMap.mapping[cartesian.y][cartesian.x]);
                        if(pathIsCastle(possible_paths[path])) {
                            valid_paths[path] = possible_paths[path];
                            break;
                        }
                        else if(is_path && (_last_path === null || _last_path !== path)) {
                            valid_paths[path] = possible_paths[path];
                        }
                    }
                }
                return valid_paths;
            };
            const counter_side = {
                'top'   : "bottom",
                'right' : "left",
                'bottom': "top",
                'left'  : "right"
            };

            this.path = [];
            this.path.push(tileCoord(startPosition.x, startPosition.y));

            if(bestPath) {
                if(!this.spawner.best_path) {
                    const trackBest = (_x, _y, last_path=null, distance=0, tracked=[]) => {
                        if(distance > 999) {
                            return {'path': null, 'distance': distance};
                        }
                        if(new Set(tracked).size !== tracked.length) {
                            return {'path': null, 'distance': distance+1};
                        }
                        if(this.tableMap.Helper.isCastle(this.tableMap.mapping[_y][_x])) {
                            return {'path': -1, 'distance': distance-1};
                        }
    
                        let _anchor = {'x': _x, 'y': _y};
                        let valid_paths = get_paths(_anchor, last_path);

                        let closest = {
                            'path'     : null,
                            'distance' : null,
                            'direction': null
                        };
                        for(let path of Object.keys(valid_paths)) {
                            let _path_cart  = tileCartesian(valid_paths[path]);
                            let new_tracked = [...tracked, Object.values(tileCoord(_path_cart.x, _path_cart.y)).toString()];
                            let track_next  = trackBest(_path_cart.x, _path_cart.y, counter_side[path], distance+1, new_tracked);
                            if(track_next.path !== null) {
                                if(closest.distance === null || track_next.distance < closest.distance) {
                                    closest.path      = track_next.path;
                                    closest.distance  = track_next.distance;
                                    closest.direction = path;
                                }
                            }
                        }

                        if(closest.path === null) {
                            return {'path': null, 'distance': distance+1};
                        }
                        else if(!isNaN(parseInt(closest.path))) {
                            let negatives = Number(closest.path);
                            if(negatives >= 0) {
                                let cartesian = tileCartesian(valid_paths[closest.direction]);
                                return {'path': [tileCoord(cartesian.x, cartesian.y)], 'distance': closest.distance};
                            }
                            else {
                                return {'path': negatives+1, 'distance': closest.distance};
                            }
                        }

                        let cartesian = tileCartesian(valid_paths[closest.direction]);
                        return {'path': [tileCoord(cartesian.x, cartesian.y), ...closest.path], 'distance': closest.distance};
                    };
    
                    this.spawner.best_path = [...this.path, ...trackBest(startPosition.x, startPosition.y).path];
                }
                if(this.spawner.best_path.includes(null))
                    this.trackPath(startPosition, false);
                else
                    this.path = this.spawner.best_path;
            }
            // Random Path
            else {
                let anchor = {'x': startPosition.x, 'y': startPosition.y};
                let castle_side = false;
                let last_path   = null;
                let iter_limit  = 2000;
                while(!castle_side && iter_limit--) {
                    let valid_paths = get_paths(anchor, last_path);
                    
                    let valid_dir = Object.keys(valid_paths);
                    let direction = valid_dir[Math.round(Math.random()*(valid_dir.length-1))];
                    
                    if(direction) {
                        last_path = counter_side[direction];
                        anchor    = tileCartesian(valid_paths[direction]);
                        
                        //check if on castle side
                        if(this.tableMap.Helper.isCastle(this.tableMap.mapping[anchor.y][anchor.x])) {
                            castle_side = true;
                        }
                        else {
                            this.path.push(tileCoord(anchor.x, anchor.y));
                        }
                    }
                    else {
                        last_path = null;
                    }
                }
            }
        }
    };

    get goblin() {
        return new RaidControl.RaidEnemy("Goblin", RaidControl.ICON_PATH+"goblin.png");
    }
    get orc() {
        return new RaidControl.RaidEnemy("Orc", RaidControl.ICON_PATH+"orc.png", 3, 500, 5);
    }
    get wolf() {
        return new RaidControl.RaidEnemy("Wolf", RaidControl.ICON_PATH+"wolf.png", 12, 80, 2);
    }
    get bat() {
        return new RaidControl.RaidEnemy("Bat", RaidControl.ICON_PATH+"bat.png", 8, 80);
    }

    nextWave() {
        const getRandomSpawner = () => this.tableMap.spawners[Math.round(Math.random()*(this.tableMap.spawners.length-1))];

        this.wave++;

        let spawnAmount = 2;
        for(let spawned=0; spawned < spawnAmount; spawned++) {
            this.summonEnemy([this.goblin, this.wolf, this.orc, this.bat][Math.floor(Math.random()*4)], getRandomSpawner(), spawned);
        }
    }

    summonEnemy(enemy, spawner, delay=0) {
        const instantiate = (img_src) => {
            let enemyHTML = document.createElement("LABEL");
            enemyHTML.classList.add("tbm-enemy");
            enemyHTML.style.backgroundImage = `url('${img_src}')`;
            return enemyHTML;
        };

        setTimeout(() => {
            enemy.element = instantiate(enemy.img_path);
            enemy.spawner = spawner;
            enemy.tableMap = this.tableMap;
            enemy.move();
            this.enemies.push(enemy);
        }, delay*1000);
    }
}