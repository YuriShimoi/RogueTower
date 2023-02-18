var MAPPING  = null;
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
        let towerContent = mountTowerChoice();

        let towerGUI = new FloatingGUI(e.target, towerContent, "Tower", false);
        towerGUI.open(TABLE.querySelector(TableMap.DICTIONARY.container));
        towerGUI.whenClose = () => {
            e.target.removeAttribute("selected");
        };
        
        e.target.setAttribute("selected", true);
    }));
}

function mountTowerChoice() {
    const towerOption = (type, price, currency="gold") => {
        let slotframeHTML = document.createElement("SPAN");
        slotframeHTML.classList.add("GUI-slotframe");

        let imageHTML = document.createElement("IMG");
        imageHTML.src = Tower.type[type][0];
        slotframeHTML.appendChild(imageHTML);

        let currHTML = document.createElement("IMG");
        currHTML.src = SCORE[currency].icon;
        slotframeHTML.appendChild(currHTML);
        slotframeHTML.append(price);

        return slotframeHTML;
    };
    
    let content = document.createElement("DIV");
    content.appendChild(towerOption('basic', 100));
    content.appendChild(towerOption('magic',  50, "crystal"));
    content.appendChild(towerOption('miner', 150));

    return content;
}