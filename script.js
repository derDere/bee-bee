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

    const otherCount = 2; //15;
    const others = [];

    for (let i = 0; i < otherCount; i++) {
        let otherBee = new Bee();
        otherBee.lastDir = Math.random() * 360;
        let otherEle = otherBee.getEle();
        pageEl.appendChild(otherEle);
        otherBee.moveTo(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight
        );
        others.push(otherBee);
    }

    setInterval(function() {
        others.forEach(function(otherBee) {
            let newAngle = otherBee.lastDir + (Math.random() - 0.5) * 60;
            otherBee.moveInDirection(newAngle);
            otherBee.lastDir = newAngle;
            /* check if is outside */
            if (otherBee.x < 0) otherBee.lastDir = 0;
            if (otherBee.x > window.innerWidth) otherBee.lastDir = 180;
            if (otherBee.y < 0) otherBee.lastDir = 90;
            if (otherBee.y > window.innerHeight) otherBee.lastDir = 270;
        });
    }, 100);

    const cloudCount = 10;
    for (let i = 0; i < cloudCount; i++) {
        addClound(pageEl);
    }
})();
