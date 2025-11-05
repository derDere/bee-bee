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

    window.addEventListener('beforeunload', function(){ client.close(); });

    let bee = new Bee();
    let ele = bee.getEle();
    pageEl.appendChild(ele);

    client.start();
})();
