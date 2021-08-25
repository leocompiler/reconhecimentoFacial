var path = require('path');
global.pathRootApp = path.resolve(__dirname);

var variaveis = require(pathRootApp + '/var.properties.js');

var development = {
	env : global.process.env.NODE_ENV || 'development',
	httpPort : 8080,
	httpHost : '127.0.0.1',
	portWebsocket : 4000,
	urlDataBase : 'localhost:27017/reconhecimento-facial',
	APP_MULT_THREADS : true,
};


var production = {
	env : global.process.env.NODE_ENV || 'development',
	httpPort : 8080,
	httpHost : 'sicoob-chat-ti.homologacao.com.br',
	portWebsocket : 4000,
	urlDataBase : variaveis.MONGODB_ATENDIMENTO_DIGITAL_URL,
	APP_MULT_THREADS : true,

};

exports.Config = global.process.env.NODE_ENV === 'production' ? production : development;
