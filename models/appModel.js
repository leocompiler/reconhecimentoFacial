'use strict';

var mongo = require('mongodb'),
    async = require('async'),
    monk = require('monk'),
    Promise = require('Promise'),
    cfg = require('../config').Config,
    db = monk(cfg.urlDataBase),
    tabUsuarios = db.get('tabUsuarios');

var modelo = module.exports = function (app) { };

modelo.cadastrarUsuario = function(idUsuario, nomeUsuario, fotoUsuario){
    return tabUsuarios.insert({idUsuario:idUsuario, nomeUsuario:nomeUsuario, fotoUsuario:fotoUsuario}, function (e, lista) {
		return Promise.resolve(lista);
	});
}

modelo.listarUsuarios = function(){
    return tabUsuarios.find({}, function (e, lista) {
		return Promise.resolve(lista);
	});
}

