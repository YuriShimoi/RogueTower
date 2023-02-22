var MAPPING  = null;
var TOWERS   = [];
var CONTROL  = null;
var scoreGUI = null;

const TABLE   = document.getElementById("content");
var CONTAINER = null;

const SCORE = {
    'population'    : {'icon': "lib/mapping/icons/castle.png", 'value': 0},
    'population_max': {'value': 0},
    
    'gold'   : {'icon': "lib/mapping/icons/gold.png", 'value': 0},
    'crystal': {'icon': "lib/mapping/icons/crystals.png", 'value': 0}
};

function startGame() {
    document.getElementById("startMenu").setAttribute("hidden", true);

    setTimeout(() => {
        MAPPING = new TableMap(29, 15, TABLE);
        CONTROL = new RaidControl(MAPPING);
        MAPPING.plot().then(() => {
            CONTAINER = TABLE.querySelector(TableMap.DICTIONARY.container);
            startGUI();
            bindCastleGUI();
            bindTowerPlaces();
        });


        // call raids
        let amount = 50;
        let summon_interval = setInterval(() => {
            if(!amount--) clearInterval(summon_interval);
            CONTROL.nextWave();            
        }, 3000);
    }, 200);
}

function startGUI() {
    const iconWithValue = (value, icon_path) => {
        let containerHTML = document.createElement("SPAN");
        containerHTML.style = "display: flex; gap: 5px;";

        let spanIcon = document.createElement("IMG");
        spanIcon.src = icon_path;
        containerHTML.appendChild(spanIcon);
        
        let spanValue = document.createElement("SPAN");
        spanValue.innerHTML = value;
        containerHTML.appendChild(spanValue);
        
        return containerHTML;
    };
    let content = document.createElement("DIV");
    content.style = "display: flex; gap: 15px;";
    content.appendChild(iconWithValue(SCORE.crystal.value, SCORE.crystal.icon));
    content.appendChild(iconWithValue(SCORE.gold.value, SCORE.gold.icon));
    content.appendChild(iconWithValue(`${SCORE.population.value}/${SCORE.population_max.value}`, SCORE.population.icon));

    scoreGUI = new StaticGUI(content, "", "bottomleft", CONTAINER);
    scoreGUI.open();
}

function updateScoreGUI() {
    const iconWithValue = (value, icon_path) => {
        let containerHTML = document.createElement("SPAN");
        containerHTML.style = "display: flex; gap: 5px;";

        let spanIcon = document.createElement("IMG");
        spanIcon.src = icon_path;
        containerHTML.appendChild(spanIcon);
        
        let spanValue = document.createElement("SPAN");
        spanValue.innerHTML = value;
        containerHTML.appendChild(spanValue);
        
        return containerHTML;
    };
    let content = document.createElement("DIV");
    content.style = "display: flex; gap: 15px;";
    content.appendChild(iconWithValue(SCORE.crystal.value, SCORE.crystal.icon));
    content.appendChild(iconWithValue(SCORE.gold.value, SCORE.gold.icon));
    content.appendChild(iconWithValue(`${SCORE.population.value}/${SCORE.population_max.value}`, SCORE.population.icon));

    scoreGUI.update(content);
}

function bindCastleGUI() {
    let castle = TABLE.querySelector(TableMap.DICTIONARY.castle);
    castle.onclick = (e) => {
        let castleGUI = new FloatingGUI(e.target, JSON.stringify(SCORE), "Castle", false);
        castleGUI.open(CONTAINER);
    }
}

function bindTowerPlaces() {
    let towers = TABLE.querySelectorAll(TableMap.DICTIONARY.tower);
    towers.forEach(tower => tower.onclick = ((e) => {
        let tower_element = e.target;
        let t_coord = [tower_element.getAttribute('x'), tower_element.getAttribute('y')];

        let towerContent = hasTower(...t_coord)? mountTowerUpgrades(...t_coord): mountTowerChoice(...t_coord);

        let towerGUI = new FloatingGUI(tower_element, towerContent, "Tower", false);
        towerGUI.open(CONTAINER);
        towerGUI.whenClose = () => {
            tower_element.removeAttribute("selected");
        };
        
        tower_element.setAttribute("selected", true);
    }));
}

function mountTowerSlot(type, price, currency="gold", onclick=null) {
    let slotframeHTML = document.createElement("SPAN");
    slotframeHTML.classList.add("GUI-slotframe");
    if(onclick !== null) slotframeHTML.onclick = onclick;

    let imageHTML = document.createElement("IMG");
    imageHTML.classList.add("GUI-slotframe-img");
    imageHTML.src = Tower.types[type][0];
    slotframeHTML.appendChild(imageHTML);

    let currHTML = document.createElement("LABEL");
    let currIcon = document.createElement("IMG");
    currIcon.src = SCORE[currency].icon;
    currHTML.appendChild(currIcon);
    currHTML.append(price);
    slotframeHTML.appendChild(currHTML);
    
    return slotframeHTML;
}

function mountTowerUpgrades(_x, _y) {
    let content = document.createElement("DIV");
    content.classList.add("GUI-slotlist");
    let stower = TOWERS.find(t => t.x == _x && t.y == _y);
    content.appendChild(mountTowerSlot(stower.type, stower.upgrade_price, stower.currency, () => setTower(_x, _y, stower.type, stower.level+1)));
    return content;
}

function mountTowerChoice(_x, _y) {
    let content = document.createElement("DIV");
    content.classList.add("GUI-slotlist");
    for(let ttype of Object.keys(Tower.types)) {
        content.appendChild(mountTowerSlot(ttype, Tower.base_price[ttype], Tower.base_currency[ttype], () => setTower(_x, _y, ttype)));
    }
    return content;
}

function hasTower(_x, _y) {
    return Boolean(TOWERS.find(t => t.x == _x && t.y == _y));
}

function setTower(_x, _y, type=null, level=1) {
    let exist_tower = TOWERS.find(t => t.x == _x && t.y == _y);
    if(exist_tower) {
        exist_tower.level = level;
    }
    else {
        TOWERS.push(new Tower(type, _x, _y, level));
    }

    if(type) {
        let tileHTML = CONTAINER.querySelector(`.tbm-tile[x="${_x}"][y="${_y}"][active]`);
        if(tileHTML) {
            tileHTML.classList.add("tbm-tile-tower");
            tileHTML.style.setProperty("--image", `url(${Tower.CSSPath[type]})`);
        }
    }
    
    FloatingGUI.closeFloats(CONTAINER);
}