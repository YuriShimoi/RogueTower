var MAPPING = null;
var CONTROL = null;

function startGame() {
    document.getElementById("startMenu").setAttribute("hidden", true);

    setTimeout(() => {
        MAPPING = new TableMap(29, 15, document.getElementById("content"));
        CONTROL = new RaidControl(MAPPING);
        MAPPING.plot();
    }, 200);
}