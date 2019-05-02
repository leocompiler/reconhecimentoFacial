var appT = angular.module('appjogo');


appT.service('usuario', function () {
    var usuario = [];

    this.setUsuario = function (user) {
        usuario = user
    };

    this.getUsuario = function () {
        return usuario;
    };
});

appT.service('pontosJogos', function () {
    var objpontosJogos = [];

    this.setPontosJogos = function (obj) {
        objpontosJogos = obj
    };

    this.getPontosJogos = function () {
        return objpontosJogos;
    };
});

