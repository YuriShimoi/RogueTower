class TableMap {
    constructor(size_x, size_y, _element) {
        this.size = {
            'x': size_x,
            'y': size_y
        };
        this.element = _element;

        this.mapping  = null;
        this.spawners = [];
    }

    static DICTIONARY = {
        "container": ".tbm-container",
        "tower"    : ".tbm-tile.tbm-tile-wall[active]",
        "wall"     : ".tbm-tile.tbm-tile-wall",
        "path"     : ".tbm-tile.tbm-tile-path",
        "spawn"    : ".tbm-tile.tbm-tile-path.tbm-spawn",
        "resource" : ".tbm-tile.tbm-tile-wall.tbm-tile-container",
        "enemy"    : ".tbm-tile.tbm-tile-wall[active]"
    }

    static MapTile = class {
        constructor(type, element, tile, object=null, distance=0) {
            this.type     = type;
            this.element  = element;
            this.tile     = tile;
            this.distance = distance;
            this.object   = object;
        }
    };

    get wall() {
        return new TableMap.MapTile("wall", "DIV", {
            'type': "wall",
            'classes': ["tbm-tile-wall"]
        });
    }
    get path() {
        return new TableMap.MapTile("path", "DIV", {
            'type': "path",
            'classes': ["tbm-tile-path"]
        });
    }
    get castle() {
        return new TableMap.MapTile("castle", "DIV", {
            'type': "path",
            'classes': ["tbm-tile-path"]
        }, {
            'type': "castle",
            'classes': ["tbm-object-castle"]
        }, 0);
    }
    get crystals() {
        return new TableMap.MapTile("crystals", "DIV", {
            'type': "wall",
            'classes': ["tbm-tile-wall"]
        }, {
            'type': "crystals",
            'classes': ["tbm-object-crystals"]
        });
    }
    get gold() {
        return {
            'type': "gold",
            'element': "DIV",
            'tile': {
                'type': "wall",
                'classes': ["tbm-tile-wall"]
            },
            'object': {
                'type': "gold",
                'classes': ["tbm-object-gold"]
            }
        }
    }



    get containerElement() {
        return this.element.getElementsByClassName("tbm-container")[0];
    }
    get tableElement() {
        return this.element.getElementsByClassName("tbm-table")[0];
    }

    Helper = {
        direction: {
            'x': {'-1': "left", '1': "right"},
            'y': {'-1': "top", '1': "bottom"}
        },
        direction_info: {
            'left': {
                'axis'    : "x",
                'sideAxis': "y",
                'sides'   : "yMoves",
                'move'    : {'x':-1,'y':0},
                'counter' : {'x':1,'y':0},
                'xMoves'  : [-1],
                'yMoves'  : [1, -1]
            },
            'top': {
                'axis'    : "y",
                'sideAxis': "x",
                'sides'   : "xMoves",
                'move'    : {'x':0,'y':-1},
                'counter' : {'x':0,'y':1},
                'xMoves'  : [1, -1],
                'yMoves'  : [-1]
            },
            'right': {
                'axis'    : "x",
                'sideAxis': "y",
                'sides'   : "yMoves",
                'move'    : {'x':1,'y':0},
                'counter' : {'x':-1,'y': 0},
                'xMoves'  : [1],
                'yMoves'  : [1, -1]
            },
            'bottom': {
                'axis'    : "y",
                'sideAxis': "x",
                'sides'   : "xMoves",
                'move'    : {'x':0,'y':1},
                'counter' : {'x':0,'y':-1},
                'xMoves'  : [1, -1],
                'yMoves'  : [1]
            }
        },
        hasTile  : _map => 'tile' in _map,
        hasObject: _map => 'object' in _map && _map.object !== null,
        isPath   : _map => this.Helper.hasTile(_map) && (_map.tile.type === "path"),
        isWall   : _map => this.Helper.hasTile(_map) && (_map.tile.type === "wall"),
        isCastle : _map => this.Helper.hasObject(_map) && (_map.type === "castle"),
        touchLimits: (_ref) => _ref.x == 0 || _ref.x == (this.size.x-1) || _ref.y == 0 || _ref.y == (this.size.y-1),
        isValidPos : (_x, _y) => _y >= 0 && _y < this.size.y && _x >= 0 && _x < this.size.x,
        setOnMap   : (_x, _y, _tile) => {
            if(this.Helper.isValidPos(_x, _y)) {
                this.mapping[_y][_x] = _tile;
                if(this.Helper.isPath(this.mapping[_y][_x])) {
                    this.pathAmount++;
                }
            }
        },
        closeToPath: (_x, _y) => {
            return this.Helper.validateAround({'x': _x, 'y': _y}, 1, (x, y) => this.Helper.isPath(this.mapping[y][x]));
        },
        moveAnchor    : (_anchor, _x, _y) => { _anchor.x += _x; _anchor.y += _y; },
        validateAround: (_anchor, _distance, validator) => {
            let _found = 0;
            for(let _y=-_distance; _y <= _distance; _y++) {
                for(let _x=-_distance; _x <= _distance; _x++) {
                    if(!(_y === 0 && _x === 0)
                    && this.Helper.isValidPos(_anchor.x + _x, _anchor.y + _y)
                    && validator(_anchor.x + _x, _anchor.y + _y)) {
                        _found++;
                    }
                }
            }
            return _found;
        }
    };



    findInstance(_x, _y) {
        return this.Helper.isValidPos(_x, _y)? this.element.querySelector(`div[x="${_x}"][y="${_y}"]`): null;
    }

    plot(_element=this.element) {
        return new Promise((promiseResolve) => {
            if(this.mapping === null) this.generateMap();
    
            let containerHTML = document.createElement("DIV");
            containerHTML.classList.add("tbm-container");
    
            let tableHTML = document.createElement("DIV");
            tableHTML.classList.add("tbm-table");
            tableHTML.style.setProperty('--rows', this.size.x);
            for(let _y in this.mapping) {
                _y = Number(_y);
                for(let _x in this.mapping[_y]) {
                    _x = Number(_x);
    
                    let _tile = this.mapping[_y][_x];
                    let tileHTML = document.createElement(_tile.element);
                    tileHTML.setAttribute('x', _x);
                    tileHTML.setAttribute('y', _y);
                    
                    if(this.Helper.hasTile(_tile)) {
                        tileHTML.classList.add("tbm-tile");
                        tileHTML.classList.add(..._tile.tile.classes);
                    }
                    
                    if(this.Helper.isPath(_tile)) {
                        tileHTML.style.setProperty('--distance', _tile.distance);
    
                        if(_tile.spawn) {
                            tileHTML.classList.add("tbm-spawn");
                            tileHTML.style.setProperty('--direction', `${_tile.direction}`);
                        }
    
                        if(!this.Helper.isValidPos(_x, _y-1) || this.Helper.isPath(this.mapping[_y-1][_x])) {
                            tileHTML.style.setProperty('--topright', 0);
                            tileHTML.style.setProperty('--topleft', 0);
                            tileHTML.style.setProperty('--road-top', '0px');
                        }
                        if(!this.Helper.isValidPos(_x, _y+1) || this.Helper.isPath(this.mapping[_y+1][_x])) {
                            tileHTML.style.setProperty('--bottomright', 0);
                            tileHTML.style.setProperty('--bottomleft', 0);
                            tileHTML.style.setProperty('--road-bottom', '0px');
                        }
                        if(!this.Helper.isValidPos(_x-1, _y) || this.Helper.isPath(this.mapping[_y][_x-1])) {
                            tileHTML.style.setProperty('--topleft', 0);
                            tileHTML.style.setProperty('--bottomleft', 0);
                            tileHTML.style.setProperty('--road-left', '0px');
                        }
                        if(!this.Helper.isValidPos(_x+1, _y) || this.Helper.isPath(this.mapping[_y][_x+1])) {
                            tileHTML.style.setProperty('--topright', 0);
                            tileHTML.style.setProperty('--bottomright', 0);
                            tileHTML.style.setProperty('--road-right', '0px');
                        }
                    }
                    else if(this.Helper.isWall(_tile) && this.Helper.closeToPath(_x, _y)) {
                        tileHTML.setAttribute("active", true);
                    }
    
                    if(this.Helper.hasObject(_tile)) {
                        tileHTML.classList.add("tbm-tile-container");
    
                        let objectHTML = document.createElement("LABEL");
                        objectHTML.classList.add("tbm-object");
                        objectHTML.classList.add(..._tile.object.classes);

                        tileHTML.setAttribute("object", _tile.object.type);
                        tileHTML.appendChild(objectHTML);
                    }
    
                    tableHTML.appendChild(tileHTML);
                }
            }
    
            containerHTML.appendChild(tableHTML);
            _element.appendChild(containerHTML);

            promiseResolve();
        });
    }

    generateMap(min_density=0.2) {
        const checkFourClump = (_anchor, _move) => {
            let _direction = this.Helper.direction_info[_move];
            for(let side of _direction[_direction.sides]) {
                let side_anchor = {'x': _anchor.x, 'y': _anchor.y};
                side_anchor[_direction.sideAxis] += side;
                if(this.Helper.isPath(this.mapping[side_anchor.y][side_anchor.x])
                && this.Helper.isPath(this.mapping[side_anchor.y+_direction.move.y][side_anchor.x+_direction.move.x])) {
                    return true;
                }
            }
            return false;
        };
        const moveAndSet = (_anchor, _direction, _tile, _distance=0) => {
            this.Helper.moveAnchor(_anchor, _direction.x, _direction.y);
            _tile.distance = _distance;
            this.Helper.setOnMap(_anchor.x, _anchor.y, _tile);
        };
        const pathJoin = (_anchor, _direction, _ignore_first=false) => {
            if(!_direction) return false;
            let has_path = false;
            for(let _x of this.Helper.direction_info[_direction].xMoves) {
                if(has_path) {
                    if(_ignore_first) _ignore_first = false;
                    else break;
                }
                if(this.Helper.isValidPos(_anchor.x+_x, _anchor.y)) {
                    has_path = this.mapping[_anchor.y][_anchor.x+_x].tile.type === "path";
                }
            }
            for(let _y of this.Helper.direction_info[_direction].yMoves) {
                if(has_path) {
                    if(_ignore_first) _ignore_first = false;
                    else break;
                }
                if(this.Helper.isValidPos(_anchor.x, _anchor.y+_y)) {
                    has_path = this.mapping[_anchor.y+_y][_anchor.x].tile.type === "path";
                }
            }
            return has_path;
        };
        const buildPath = (anchor, xMoves, yMoves, split_chance=0.8, distance=0) => {
            let last_move = "";
            let ignore_first = false;
            let iter_limit = 200;
            while(this.Helper.isValidPos(anchor.x, anchor.y) && !this.Helper.touchLimits(anchor) && !pathJoin(anchor, last_move, ignore_first) && iter_limit--) {
                ignore_first = false;
                let moveOn = "";
                let _direction = {'x': 0, 'y': 0};
                
                moveOn = ['x', 'y'][Math.round(Math.random())];
                if(moveOn === 'x') {
                    xMoves = [xMoves[Math.round(Math.random()*(xMoves.length-1))]];
                }
                else if(moveOn === 'y') {
                    yMoves = [yMoves[Math.round(Math.random()*(yMoves.length-1))]];
                }
                if(moveOn === 'x') _direction.x = xMoves[0];
                if(moveOn === 'y') _direction.y = yMoves[0];
                
                last_move = this.Helper.direction[moveOn][moveOn === 'x'? xMoves[0]: yMoves[0]];
                for(let m=0; m < Math.round(Math.random()*2 + 3); m++) {
                    distance++;
                    if(checkFourClump(anchor, last_move)) break;
                    moveAndSet(anchor, _direction, this.path, distance);
                    if(!this.Helper.isValidPos(anchor.x, anchor.y) || pathJoin(anchor, last_move)) break;
                }
                if(!this.Helper.touchLimits(anchor) && (Math.random() < split_chance)) {
                    buildPath({'x': anchor.x, 'y': anchor.y}, this.Helper.direction_info[last_move].xMoves, this.Helper.direction_info[last_move].yMoves, split_chance-0.1, distance+1);
                    ignore_first = true;
                }
            }
            if((!this.Helper.isValidPos(anchor.x, anchor.y) || this.Helper.touchLimits(anchor)) && last_move) {
                let _x, _y;
                if(this.Helper.isValidPos(anchor.x, anchor.y) && this.Helper.touchLimits(anchor)) {
                    _x = anchor.x;
                    _y = anchor.y;
                }
                else {
                    _y = anchor.y+this.Helper.direction_info[last_move].counter.y;
                    _x = anchor.x+this.Helper.direction_info[last_move].counter.x;
                }
                
                let spawn_tile = this.mapping[_y][_x];

                this.spawners.push({'x': _x, 'y': _y});
                spawn_tile.spawn = true;
                spawn_tile.direction = last_move;
            }
        };
        
        // initialize empty mapping
        this.mapping = new Array(this.size.y).fill().map(_ => new Array(this.size.x).fill().map(_ => this.wall));

        //#region [ Generate Paths ]
        this.pathAmount = 0;

        let anchor     = {'x': Math.floor(this.size.x/2), 'y': Math.floor(this.size.y/2)};
        let newPath    = 1;
        let newChance  = 1.2;
        let iter_limit = 200;
        while((newPath || (this.pathAmount / (this.size.x*this.size.y)) <= min_density) && iter_limit--) {
            let _dir = ['x','y'][Math.round(Math.random())];
            let _mov = [1, -1][Math.round(Math.random())];
            buildPath({'x': anchor.x, 'y': anchor.y}, _dir === 'x'?[_mov]:[1,-1], _dir === 'y'?[_mov]:[1,-1]);

            newPath = !newPath? false: Math.random() < (newChance -= 0.2);
        }
        //#endregion
        
        //#region [ Generate Resources ]
        const MIN_DIST_TO_PATH = 2;
        const MIN_DIST_BETWEEN = 3;

        let gold_spots = Math.round(Math.random()*3 + 2);
        let gold_iter_limit = 200;
        while(gold_spots && gold_iter_limit--) {
            let _x = Math.round(Math.random() * this.size.x);
            let _y = Math.round(Math.random() * this.size.y);

            if( this.Helper.isValidPos(_x, _y)
            &&  this.Helper.isWall(this.mapping[_y][_x])
            && !this.Helper.closeToPath(_x, _y)
            &&  this.Helper.validateAround({'x': _x, 'y': _y}, MIN_DIST_TO_PATH, (x, y) => this.Helper.isPath(this.mapping[y][x]))
            && !this.Helper.validateAround({'x': _x, 'y': _y}, MIN_DIST_BETWEEN, (x, y) => this.Helper.hasObject(this.mapping[y][x]))
            && !this.Helper.hasObject(this.mapping[_y][_x])) {
                this.mapping[_y][_x] = this.gold;
                gold_spots--;
            }
        }
        
        let crytals_spots = Math.round(Math.random()*2 + 1);
        let crytals_iter_limit = 200;
        while(crytals_spots && crytals_iter_limit--) {
            let _x = Math.round(Math.random() * this.size.x);
            let _y = Math.round(Math.random() * this.size.y);

            if( this.Helper.isValidPos(_x, _y)
            &&  this.Helper.isWall(this.mapping[_y][_x])
            && !this.Helper.closeToPath(_x, _y)
            &&  this.Helper.validateAround({'x': _x, 'y': _y}, MIN_DIST_TO_PATH, (x, y) => this.Helper.isPath(this.mapping[y][x]))
            && !this.Helper.validateAround({'x': _x, 'y': _y}, MIN_DIST_BETWEEN, (x, y) => this.Helper.hasObject(this.mapping[y][x]))
            && !this.Helper.hasObject(this.mapping[_y][_x])) {
                this.mapping[_y][_x] = this.crystals;
                crytals_spots--;
            }
        }
        //#endregion
        
        // set Castle on center
        this.mapping[Math.floor(this.size.y/2)][Math.floor(this.size.x/2)] = this.castle;
    }
}