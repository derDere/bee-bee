(function(){
    const statusEl = document.getElementById('status');
    const pageEl = document.getElementById('page');
    const pageFrameEl = document.getElementById('page-frame');
    const coordsEl = document.getElementById('coords');

    // Dynamically choose ws / wss based on page protocol & host.
    // If you're serving the page over https you must use wss.
    const proto = (location.protocol === 'https:' ? 'wss' : 'ws');
    const port = 8765; // change if you mapped the server differently
    const host = location.hostname || 'localhost';
    const client = new WSClient(`${proto}://${host}:${port}`);

    let id = null;
    const others = {};

    const removeBee = function(oid, others, pageFrameEl) {
        let obee = others[oid];
        obee.moveTo(obee.x, -1000);
        setTimeout(() => {
            pageFrameEl.removeChild(obee.body);
        }, 1000);
        delete others[oid];
    };

    const beeCleanerInterval = 2000; // 2 seconds
    const beeTimeout = 2000; // 15 seconds
    const beeCleaner = function(others, pageFrameEl) {
        const now = Date.now();
        for (let oid in others) {
            let obee = others[oid];
            if (now - obee.lastUpdateTime > beeTimeout) {
                removeBee(oid, others, pageFrameEl);
            }
        }
    }.bind(this, others, pageFrameEl);
    setInterval(beeCleaner, beeCleanerInterval);

    client.onStatusChange = function(state){
        statusEl.className = state;
        statusEl.textContent = state;
        id = null;
        for (let oid in others) {
            removeBee(oid, others, pageFrameEl);
        }
        if (state === 'connected') {
            setTimeout(() => {
                client.send("who");
            }, 100);
        }
    };

    client.onMessage = function(msg){
        //console.log(msg);

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
                    pageFrameEl.appendChild(otherEle);
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

        if ("island" in msg) {
            // TOD: handle islands
        }
    };

    let trees = [
        [75, 20, -300]
    ];

    let ls = [300, 400, 500, 600, 700, 800, 1500, 3000];
    let ix = 300;
    for (let l of ls) {
        let cix = ix;
        ix += l + 100;

        let demoIsland = new Island(cix, 200, l, [25, 40], trees);
        let islandEle = demoIsland.getEle();
        pageFrameEl.appendChild(islandEle);
    }

    window.addEventListener('beforeunload', function() { client.close(); });

    let bee = new Bee();
    let ele = bee.getEle();
    pageFrameEl.appendChild(ele);

    bee.isPlayer = true;
    bee.pageFrameEl = pageFrameEl;

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

    document.bee = bee; // for debugging

    bee.onUpdate(data => {
        if (id !== null) {
            data["id"] = id;
            client.send(data);

            let coordStr = Math.round(bee.x) + ", " + Math.round(bee.y);
            coordsEl.textContent = coordStr;
        }
    });
    
    setTimeout(() => {
        bee.moveTo(0, 0);
        client.send("who");
    }, 1000);

    const cloudCount = 1000;
    for (let i = 0; i < cloudCount; i++) {
        addClound(pageFrameEl, true);
    }

    const sun = new Sun();
    const [sunEle, moonEle] = sun.getEle();
    pageEl.appendChild(sunEle);
    pageEl.appendChild(moonEle);
    sun.start();
})();
