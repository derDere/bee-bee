(function(){
  const statusEl = document.getElementById('status');
  const logEl = document.getElementById('log');
  const inputEl = document.getElementById('text');
  const sendBtn = document.getElementById('sendBtn');

  function log(msg, cls){
    const p = document.createElement('p');
    p.className = 'msg' + (cls ? ' ' + cls : '');
    p.textContent = '[' + new Date().toLocaleTimeString() + '] ' + (typeof msg === 'string' ? msg : JSON.stringify(msg));
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
  }

  const client = new WSClient('ws://localhost:8765');
  client.onStatusChange = function(state){
    statusEl.className = state;
    statusEl.textContent = state;
    if(state === 'connected') log('connected','system');
    if(state === 'disconnected') log('disconnected','system');
    if(state === 'connecting') log('connecting','system');
  };
  client.onMessage = function(msg){
    log(msg,'');
  };

  function sendCurrent(){
    const text = inputEl.value.trim();
    if(!text) return;
    if(client.send(text)){
      log(text,'you');
      inputEl.value = '';
      inputEl.focus();
    } else {
      log('Cannot send: not connected','system');
    }
  }

  sendBtn.addEventListener('click', sendCurrent);
  inputEl.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendCurrent(); });
  window.addEventListener('beforeunload', function(){ client.close(); });

  client.start();
})();
