var MAPPING = null;
var CONTROL = null;
const TABLE = document.getElementById("content");

function startGame() {
    document.getElementById("startMenu").setAttribute("hidden", true);

    setTimeout(() => {
        MAPPING = new TableMap(29, 15, TABLE);
        CONTROL = new RaidControl(MAPPING);
        MAPPING.plot().then(bindTowerPlaces);

        let amount = 50;
        let summon_interval = setInterval(() => {
            if(!amount--) clearInterval(summon_interval);
            CONTROL.nextWave();            
        }, 3000);
    }, 200);
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