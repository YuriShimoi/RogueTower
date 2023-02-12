var MAPPING = null;
var CONTROL = null;
const TABLE = document.getElementById("content");
const SCORE = {
    'population'    : {'icon': "lib/mapping/icons/castle.png", 'value': 0},
    'population_max': {'icon': "lib/mapping/icons/castle.png", 'value': 0},
    
    'gold'      : {'icon': "lib/mapping/icons/gold.png", 'value': 0},
    'crystal'   : {'icon': "lib/mapping/icons/crystals.png", 'value': 0}
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
    s= new StaticGUI("content", "title", "bottomleft");
    s.open(TABLE.querySelector(TableMap.DICTIONARY.container));
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
        let towerGUI = new FloatingGUI(e.target, "Content", "Tower", false);
        towerGUI.open(TABLE.querySelector(TableMap.DICTIONARY.container));
        towerGUI.whenClose = () => {
            e.target.removeAttribute("selected");
        };
        
        e.target.setAttribute("selected", true);
    }));
}