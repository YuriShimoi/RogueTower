var MAPPING = [];

function startGame() {
    document.getElementById("startMenu").setAttribute("hidden", true);

    setTimeout(() => {
        MAPPING = new TableMap(29, 15, document.getElementById("content"));
        MAPPING.plot();
    }, 200);
}