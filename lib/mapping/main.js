class TableMap {
    constructor(size_x, size_y, _element) {
        this.size = {
            'x': size_x,
            'y': size_y
        };
        this.element = _element;

        this.mapping = null;
    }

    get wall() {
        return {
            'type': "wall",
            'element': "DIV",
            'tile': {
                'type': "wall",
                'classes': ["tbm-tile-wall"]
            },
            'object': null
        }
    }

    get path() {
        return {
            'type': "path",
            'element': "DIV",
            'tile': {
                'type': "path",
                'classes': ["tbm-tile-path"]
            },
            'object': null
        }
    }

    get castle() {
        return {
            'type': "castle",
            'element': "DIV",
            'tile': {
                'type': "path",
                'classes': ["tbm-tile-path"]
            },
            'object': {
                'classes': ["tbm-object-castle"]
            }
        }
    }



    plot(_element=this.element) {
        const isPath = _map => _map.tile.type === "path";
        const isWall = _map => _map.tile.type === "wall";
        const isValidPos = (_x, _y) => _y >= 0 && _y < this.size.y && _x >= 0 && _x < this.size.x;

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
                tileHTML.style.setProperty('--distance', _tile.distance);
                
                if(isPath(_tile)) {
                    if(_tile.spawn) {
                        tileHTML.classList.add("tbm-spawn");
                        tileHTML.style.setProperty('--direction', `to ${_tile.direction}`);
                    }

                    if(!isValidPos(_x, _y-1) || (isValidPos(_x, _y-1) && isPath(this.mapping[_y-1][_x]))) {
                        tileHTML.style.setProperty('--topright', 0);
                        tileHTML.style.setProperty('--topleft', 0);
                        tileHTML.style.setProperty('--road-top', '0px');
                    }
                    if(!isValidPos(_x, _y+1) || (isValidPos(_x, _y+1) && isPath(this.mapping[_y+1][_x]))) {
                        tileHTML.style.setProperty('--bottomright', 0);
                        tileHTML.style.setProperty('--bottomleft', 0);
                        tileHTML.style.setProperty('--road-bottom', '0px');
                    }
                    if(!isValidPos(_x-1, _y) || (isValidPos(_x-1, _y) && isPath(this.mapping[_y][_x-1]))) {
                        tileHTML.style.setProperty('--topleft', 0);
                        tileHTML.style.setProperty('--bottomleft', 0);
                        tileHTML.style.setProperty('--road-left', '0px');
                    }
                    if(!isValidPos(_x+1, _y) || (isValidPos(_x+1, _y) && isPath(this.mapping[_y][_x+1]))) {
                        tileHTML.style.setProperty('--topright', 0);
                        tileHTML.style.setProperty('--bottomright', 0);
                        tileHTML.style.setProperty('--road-right', '0px');
                    }
                }

                else if(isWall(_tile)) {
                    let active_wall = false;
                    if(isValidPos(_x+1, _y  ) && isPath(this.mapping[_y  ][_x+1])) active_wall = true;
                    if(isValidPos(_x+1, _y+1) && isPath(this.mapping[_y+1][_x+1])) active_wall = true;
                    if(isValidPos(_x+1, _y-1) && isPath(this.mapping[_y-1][_x+1])) active_wall = true;
                    if(isValidPos(_x-1, _y  ) && isPath(this.mapping[_y  ][_x-1])) active_wall = true;
                    if(isValidPos(_x-1, _y+1) && isPath(this.mapping[_y+1][_x-1])) active_wall = true;
                    if(isValidPos(_x-1, _y-1) && isPath(this.mapping[_y-1][_x-1])) active_wall = true;
                    if(isValidPos(_x  , _y+1) && isPath(this.mapping[_y+1][_x  ])) active_wall = true;
                    if(isValidPos(_x  , _y-1) && isPath(this.mapping[_y-1][_x  ])) active_wall = true;

                    if(active_wall) tileHTML.setAttribute("active", true);
                }
                
                tileHTML.classList.add("tbm-tile");
                if(_tile.object) {
                    tileHTML.classList.add("tbm-tile-container");

                    let objectHTML = document.createElement("LABEL");
                    objectHTML.classList.add("tbm-object");
                    objectHTML.classList.add(..._tile.object.classes);
                    tileHTML.appendChild(objectHTML);
                }
                else {
                    tileHTML.classList.add(..._tile.tile.classes);
                }
                tableHTML.appendChild(tileHTML);
            }
        }

        containerHTML.appendChild(tableHTML);
        _element.appendChild(containerHTML);
    }

    generateMap() {
        const direction = {
            'x': {'-1': "left", '1': "right"},
            'y': {'-1': "top", '1': "bottom"}
        };
        const direction_info = {
            'left': {
                'axis': "x",
                'move': {'x':-1,'y':0},
                'counter': {'x':1,'y':0},
                'xMoves': [-1],
                'yMoves': [1, -1]
            },
            'top': {
                'axis': "y",
                'move': {'x':0,'y':-1},
                'counter': {'x':0,'y':1},
                'xMoves': [1, -1],
                'yMoves': [-1]
            },
            'right': {
                'axis': "x",
                'move': {'x':1,'y':0},
                'counter': {'x':-1,'y': 0},
                'xMoves': [1],
                'yMoves': [1, -1]
            },
            'bottom': {
                'axis': "y",
                'move': {'x':0,'y':1},
                'counter': {'x':0,'y':-1},
                'xMoves': [1, -1],
                'yMoves': [1]
            }
        };

        const touchLimits = (_ref) => _ref.x == 0 || _ref.x == (this.size.x-1) || _ref.y == 0 || _ref.y == (this.size.y-1);
        const isValidPos = (_x, _y) => _y >= 0 && _y < this.size.y && _x >= 0 && _x < this.size.x;
        const setOnMap   = (_x, _y, _tile) => { if(isValidPos(_x, _y)) this.mapping[_y][_x] = _tile };
        const moveAnchor = (_anchor, _x, _y) => { _anchor.x += _x; _anchor.y += _y; };
        const moveAndSet = (_anchor, _direction, _tile, _distance=0) => {
            moveAnchor(_anchor, _direction.x, _direction.y);
            _tile.distance = _distance;
            setOnMap(_anchor.x, _anchor.y, _tile);
        };
        const pathJoin = (_anchor, _direction, _ignore_first=false) => {
            if(!_direction) return false;
            let has_path = false;
            for(let _x of direction_info[_direction].xMoves) {
                if(has_path) {
                    if(_ignore_first) _ignore_first = false;
                    else break;
                }
                if(isValidPos(_anchor.x+_x, _anchor.y)) {
                    has_path = this.mapping[_anchor.y][_anchor.x+_x].tile.type === "path";
                }
            }
            for(let _y of direction_info[_direction].yMoves) {
                if(has_path) {
                    if(_ignore_first) _ignore_first = false;
                    else break;
                }
                if(isValidPos(_anchor.x, _anchor.y+_y)) {
                    has_path = this.mapping[_anchor.y+_y][_anchor.x].tile.type === "path";
                }
            }
            return has_path;
        };
        const buildPath = (anchor, xMoves, yMoves, split_chance=0.8, distance=0) => {
            let last_move = "";
            let ignore_first = false;
            while(isValidPos(anchor.x, anchor.y) && !touchLimits(anchor) && !pathJoin(anchor, last_move, ignore_first)) {
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
                
                last_move = direction[moveOn][moveOn === 'x'? xMoves[0]: yMoves[0]];
                for(let m=0; m < Math.round(Math.random()*2 + 3); m++) {
                    distance++;
                    moveAndSet(anchor, _direction, this.path, distance);
                    if(!isValidPos(anchor.x, anchor.y) || pathJoin(anchor, last_move)) break;
                }
                if(!touchLimits(anchor) && (Math.random() < split_chance)) {
                    buildPath({'x': anchor.x, 'y': anchor.y}, direction_info[last_move].xMoves, direction_info[last_move].yMoves, split_chance-0.1, distance+1);
                    ignore_first = true;
                }
            }
            if((!isValidPos(anchor.x, anchor.y) || touchLimits(anchor)) && last_move) {
                let spawn_tile;
                if(isValidPos(anchor.x, anchor.y) && touchLimits(anchor))
                    spawn_tile = this.mapping[anchor.y][anchor.x];
                else
                    spawn_tile = this.mapping[anchor.y+direction_info[last_move].counter.y][anchor.x+direction_info[last_move].counter.x];
                
                spawn_tile.spawn = true;
                spawn_tile.direction = last_move;
            }
        };
        
        this.mapping = new Array(this.size.y).fill().map(_ => new Array(this.size.x).fill().map(_ => this.wall));

        let anchor    = {'x': Math.floor(this.size.x/2), 'y': Math.floor(this.size.y/2)};
        let newPath   = 1;
        let newChance = 1.2;
        while(newPath) {
            let _dir = ['x','y'][Math.round(Math.random())];
            let _mov = [1, -1][Math.round(Math.random())];
            buildPath({'x': anchor.x, 'y': anchor.y}, _dir === 'x'?[_mov]:[1,-1], _dir === 'y'?[_mov]:[1,-1]);

            newPath = Math.random() < (newChance -= 0.2);
        }
        
        this.mapping[Math.floor(this.size.y/2)][Math.floor(this.size.x/2)] = this.castle;
    }
}