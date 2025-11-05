(function(){
    const statusEl = document.getElementById('status');
    const pageEl = document.getElementById('page');

    const client = new WSClient('ws://localhost:8765');

    client.onStatusChange = function(state){
        statusEl.className = state;
        statusEl.textContent = state;
    };

    client.onMessage = function(msg){
        console.log(msg);
    };

    window.addEventListener('beforeunload', function() { client.close(); });

    let bee = new Bee();
    let ele = bee.getEle();
    pageEl.appendChild(ele);

    client.start();

    triggerWingTick();

    let lazerOn = false;
    document.addEventListener('mousedown', function(event) {
        lazerOn = true;
        bee.laserAt(event.clientX, event.clientY);
    });
    document.addEventListener('mouseup', function(event) {
        lazerOn = false;
        bee.laserStop();
    });
    document.addEventListener('mousemove', function(event) {
        if (lazerOn) {
            bee.laserAt(event.clientX, event.clientY);
        }
    });

    bee.control();
})();
