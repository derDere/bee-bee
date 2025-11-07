(function(){
    const statusEl = document.getElementById('status');
    const pageEl = document.getElementById('page');

    // Dynamically choose ws / wss based on page protocol & host.
    // If you're serving the page over https you must use wss.
    const proto = (location.protocol === 'https:' ? 'wss' : 'ws');
    const port = 8765; // change if you mapped the server differently
    const host = location.hostname || 'localhost';
    const client = new WSClient(`${proto}://${host}:${port}`);

    let id = null;
    const others = {};

    const removeBee = function(oid, others, pageEl) {
        let obee = others[oid];
        obee.moveTo(obee.x, -1000);
        setTimeout(() => {
            pageEl.removeChild(obee.body);
        }, 1000);
        delete others[oid];
    };

    const beeCleanerInterval = 2000; // 2 seconds
    const beeTimeout = 2000; // 15 seconds
    const beeCleaner = function(others, pageEl) {
        const now = Date.now();
        for (let oid in others) {
            let obee = others[oid];
            if (now - obee.lastUpdateTime > beeTimeout) {
                removeBee(oid, others, pageEl);
            }
        }
    }.bind(this, others, pageEl);
    setInterval(beeCleaner, beeCleanerInterval);

    client.onStatusChange = function(state){
        statusEl.className = state;
        statusEl.textContent = state;
        id = null;
        for (let oid in others) {
            removeBee(oid, others, pageEl);
        }
        if (state === 'connected') {
            setTimeout(() => {
                client.send("who");
            }, 100);
        }
    };

    client.onMessage = function(msg){
        console.log(msg);

        if ("me" in msg) {
            id = msg["me"];
        }

        if ("id" in msg) {
            let oid = msg["id"];
            if (oid != id) {
                let obee;
                if (!(oid in others)) {
                    obee = new Bee();
                    let otherEle = obee.getEle();
                    pageEl.appendChild(otherEle);
                    others[oid] = obee;
                }
                else {
                    obee = others[oid];
                }
                obee.updateTime();
                let x = msg["x"];
                let y = msg["y"];
                obee.moveTo(x, y);
                let laser_on = msg["laser_on"];
                if (laser_on) {
                    let laser_x = msg["laser_x"];
                    let laser_y = msg["laser_y"];
                    obee.laserAt(laser_x, laser_y);
                } else {
                    obee.laserStop();
                }
            }
        }
    };

    window.addEventListener('beforeunload', function() { client.close(); });

    let bee = new Bee();
    let ele = bee.getEle();
    pageEl.appendChild(ele);

    let selfHosted = true;
    if (location.hostname.indexOf('github') !== -1) {
        selfHosted = false;
    }

    if (selfHosted) {
        client.start();
    } else {
        statusEl.className = 'connected';
        statusEl.textContent = 'Demo';
    }

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

    bee.onUpdate(data => {
        if (id !== null) {
            data["id"] = id;
            client.send(data);
        }
    });
    
    setTimeout(() => {
        bee.moveTo(
            window.innerWidth / 2,
            window.innerHeight / 2
        );
        client.send("who");
    }, 1000);

    //const otherCount = 2; //15;
    //const others = [];
    //
    //for (let i = 0; i < otherCount; i++) {
    //    let otherBee = new Bee();
    //    otherBee.lastDir = Math.random() * 360;
    //    let otherEle = otherBee.getEle();
    //    pageEl.appendChild(otherEle);
    //    setTimeout(() => {
    //        otherBee.moveTo(
    //            Math.random() * window.innerWidth,
    //            Math.random() * window.innerHeight
    //        );
    //    }, 100);
    //    others.push(otherBee);
    //}
    //
    //setInterval(function() {
    //    others.forEach(function(otherBee) {
    //        let newAngle = otherBee.lastDir + (Math.random() - 0.5) * 60;
    //        otherBee.moveInDirection(newAngle);
    //        otherBee.lastDir = newAngle;
    //        /* check if is outside */
    //        if (otherBee.x < 0) otherBee.lastDir = 0;
    //        if (otherBee.x > window.innerWidth) otherBee.lastDir = 180;
    //        if (otherBee.y < 0) otherBee.lastDir = 90;
    //        if (otherBee.y > window.innerHeight) otherBee.lastDir = 270;
    //    });
    //}, 100);

    const cloudCount = 10;
    for (let i = 0; i < cloudCount; i++) {
        addClound(pageEl);
    }

    const sun = new Sun();
    const sunEle = sun.getEle();
    pageEl.appendChild(sunEle);
    sun.start();
})();
