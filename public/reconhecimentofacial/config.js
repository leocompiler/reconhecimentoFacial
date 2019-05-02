var connectApp =
  {

    protocol: "",
    host: "",
    port: "",
    hostWebsocket: "",

    toUrlApp: function () {
      if (this.protocol)
        return this.protocol + "://" + this.host + ':' + this.port + '/reconhecimentofacial';
      else
        return "http://" + this.host + ':' + this.port + '/reconhecimentofacial';
    },

    toUrlAppAdm: function () {
      if (this.protocol)
        return this.protocol + "://" + this.host + ':' + this.port + '/reconhecimentofacial';
      else
        return "http://" + this.host + ':' + this.port + '/reconhecimentofacial';
    },

    toUrl: function () {
      if (this.protocol)
        return this.protocol + "://" + this.host + ':' + this.port + '/reconhecimentofacial';
      else
        return "http://" + this.host + ':' + this.port + '/reconhecimentofacial';
    },

    toUrlAdm: function () {
      if (this.protocol)
        return this.protocol + "://" + this.host + ':' + this.port + '/adm';
      else
        return "http://" + this.host + ':' + this.port + '/adm';
    },

    toUrlWebsocket: function () {
      return (this.protocol == 'https' ? 'wss://' : "ws://") + this.hostWebsocket;
    }
  };
