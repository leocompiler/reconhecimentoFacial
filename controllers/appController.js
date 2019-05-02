'use strict';

var appModel = require("../models/appModel.js");

module.exports = function (app) {
	var appController = {
		cadastrarUsuario: function (req, res) {
			var idUsuario = req.body.idUsuario;
			var nomeUsuario = req.body.nomeUsuario;
			var fotoUsuario = req.body.fotoUsuario;

			appModel.cadastrarUsuario(idUsuario, nomeUsuario, fotoUsuario).then(function (cad) {
				res.send({'ok': cad})
			});
		},

		listarUsuarios: function (req, res) {
			appModel.listarUsuarios().then(function (lst) {
				res.send({'resultado': lst})
			});
		}
	}

	return appController;
}

