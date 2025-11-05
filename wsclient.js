(function(global){
  function WSClient(url, opts){
    opts = opts || {};
    this.url = url;
    this.retryDelay = opts.retryDelay || 500;
    this.maxDelay = opts.maxDelay || 5000;
    this.onMessage = null;
    this.onStatusChange = null;
    this._ws = null;
    this._manualClose = false;
    this._currentDelay = this.retryDelay;
  }
  WSClient.prototype._setStatus = function(state){
    if(typeof this.onStatusChange === 'function') this.onStatusChange(state);
  };
  WSClient.prototype.start = function(){
    this._manualClose = false;
    this._connect();
  };
  WSClient.prototype._connect = function(){
    var self = this;
    self._setStatus('connecting');
    var ws = new WebSocket(self.url);
    self._ws = ws;
    ws.onopen = function(){
      self._currentDelay = self.retryDelay;
      self._setStatus('connected');
    };
    ws.onmessage = function(ev){
      if(typeof self.onMessage === 'function') self.onMessage(ev.data);
    };
    ws.onerror = function(){ };
    ws.onclose = function(){
      self._setStatus('disconnected');
      if(!self._manualClose){
        self._scheduleReconnect();
      }
    };
  };
  WSClient.prototype._scheduleReconnect = function(){
    var self = this;
    self._setStatus('connecting');
    var delay = self._currentDelay;
    self._currentDelay = Math.min(self._currentDelay * 2, self.maxDelay);
    setTimeout(function(){ self._connect(); }, delay);
  };
  WSClient.prototype.send = function(msg){
    if(this._ws && this._ws.readyState === WebSocket.OPEN){
      this._ws.send(msg);
      return true;
    }
    return false;
  };
  WSClient.prototype.close = function(){
    this._manualClose = true;
    if(this._ws){
      try{ this._ws.close(); }catch(e){}
    }
  };
  global.WSClient = WSClient;
})(window);
