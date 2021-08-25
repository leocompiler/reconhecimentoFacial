var express = require('express'),
    load = require('express-load'),
    app = express(),
    favicon = require('serve-favicon'),
    cookieSession = require('cookie-session')
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    fileUpload = require('express-fileupload');

    var path = require('path');
    global.pathRootApp = path.resolve(__dirname);

    var Promise = require('promise-polyfill').default;
    var expressStaticGzip = require("express-static-gzip");
    
require('express-helpers')(app);
require("console-stamp")(console, { pattern: "dd/mm/yyyy HH:MM:ss.l" });

var cfg = require('./lib/config.js');
global.cfg = cfg;

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/reconhencimentofacial',expressStaticGzip(__dirname + '/public/reconhecimentofacial' ,  {
    enableBrotli: true,
    customCompressions: [{
        encodingName: 'deflate',
        fileExtension: 'zz'
    }],
    orderPreference: ['br']
}));
// app.use('/reconhencimentofacial', express.static(__dirname + '/public/reconhecimentofacial', { 'index': 'index.html' }));

//Controle de sessão via cookie-session
//var secretKey = 'c4ix4p0up3pl4netA'
var secretKey = 'l0t3ric@s3';
app.use(cookieSession({ name: 'authSession', keys: [secretKey] }));

app.use(bodyParser.json({
    limit: '1mb'
}));
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}));
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

app.use(fileUpload());

app.use(function(req, res, next) {
    var staticFilesRegex = /\.(css|js|jpg|png|html)$/i;

    //Cache da foto do usuário caso ja tenha definido
    if (req.url.indexOf("/user/foto") != -1 && req.session.profile) {
        var tempo = 60 * 60 * 10; //10min
        res.header('Cache-Control', 'max-age=' + tempo);

    } else if (!staticFilesRegex.test(req.url)) {
        //Não limpar cache de arquivos estáticos, apenas de urls de api
        res.header('Cache-Control', 'no-cache');
    }

    //res.locals.admin = (req && req.session && req.session.administrador) || false;
    res.locals.session = req && req.session || {};

    next();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function(req, res, next) {
    console.info(req.url);
    next();
});

load('models')
    .then('controllers')
    .then('routes')
    .into(app);

global.numeral = require('numeral');
global.numeral.register('locale', 'pt-br', {
            delimiters: {
                thousands: '.',
                decimal: ','
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal : function (number) {
                return number === 1 ? 'er' : 'ème';
            },
            currency: {
                symbol: 'R$ '
            }
        });

global.numeral.locale('pt-br');

app.use('/', express.static(__dirname + '/public/', { 'login': 'login.html' }));

var srv = app.listen(cfg.httpPort, function() {
    var now = new Date();
    var pjson = require('./package.json');
    console.info("###########################################");
    console.info("##          SERVIDOR INICIADO            ##");
    console.info("###########################################");
    console.info('Ambiente: ', cfg.env, '  -  ', pjson.version);
    console.info('Porta: ', cfg.httpPort);
    console.info("--------------------------------------------");
});

srv.timeout = 30 * 60 * 1000; //30min (Valor alto devido ao upload da planilha de resultados com mais de 9MB)

console.info("------------------------------------------------------------------------");
