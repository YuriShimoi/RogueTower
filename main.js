var MAPPING = null;
var CONTROL = null;

function startGame() {
    document.getElementById("startMenu").setAttribute("hidden", true);

    setTimeout(() => {
        MAPPING = new TableMap(29, 15, document.getElementById("content"));
        CONTROL = new RaidControl(MAPPING);
        MAPPING.plot();

        let amount = 50;
        let summon_interval = setInterval(() => {
            if(!amount--) clearInterval(summon_interval);
            CONTROL.nextWave();            
        }, 3000);
    }, 200);
}