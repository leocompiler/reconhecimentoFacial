module.exports = function(app) {
	var appC = app.controllers.appController;

	app.post('/reconhecimentofacial/cadastrarUsuario', appC.cadastrarUsuario);
	app.get('/reconhecimentofacial/listarUsuarios', appC.listarUsuarios);
	
};
