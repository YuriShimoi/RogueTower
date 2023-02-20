var MAPPING  = null;
var TOWERS   = [];
var CONTROL  = null;
var scoreGUI = null;

const TABLE = document.getElementById("content");
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

    scoreGUI = new StaticGUI(content, "", "bottomleft", TABLE.querySelector(TableMap.DICTIONARY.container));
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
        castleGUI.open(TABLE.querySelector(TableMap.DICTIONARY.container));
    }
}

function bindTowerPlaces() {
    let towers = TABLE.querySelectorAll(TableMap.DICTIONARY.tower);
    towers.forEach(tower => tower.onclick = ((e) => {
        let tower_element = e.target;
        let t_coord = [tower_element.getAttribute('x'), tower_element.getAttribute('y')];

        let towerContent = hasTower(...t_coord)? mountTowerUpgrades(...t_coord): mountTowerChoice(...t_coord);

        let towerGUI = new FloatingGUI(tower_element, towerContent, "Tower", false);
        towerGUI.open(TABLE.querySelector(TableMap.DICTIONARY.container));
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
    imageHTML.src = Tower.type[type][0];
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
    content.appendChild(mountTowerSlot('basic', 150, "gold", () => setTower(_x, _y, 'basic', 2)));

    return content;
}

function mountTowerChoice(_x, _y) {
    let content = document.createElement("DIV");
    content.classList.add("GUI-slotlist");
    content.appendChild(mountTowerSlot('basic', 100, "gold", () => setTower(_x, _y, 'basic')));
    content.appendChild(mountTowerSlot('magic',  50, "crystal", () => setTower(_x, _y, 'magic')));
    content.appendChild(mountTowerSlot('miner', 150, "gold", () => setTower(_x, _y, 'miner')));

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
        TOWERS.push({'x': _x, 'y': _y, 'type': type, 'level': level});
    }
}