var cfg = require('./config');

module.exports = function(req, res, next) {
    console.log(global.process.env.HABILITA_LOGIN);
    if (global.process.env.DESABILITA_LOGIN=="true") {
        console.log('Controle de acesso desabilitado.');
        req.session.userData = cfg.defaultUserData;
        return next();
    }
    if (req.session && req.session.userData) {
        if (req.session.userData.cadastrado) {
            return next();
        } else {
            return res.redirect('/cadastro');
        }
    } else {
        return res.redirect('/login');
    }
};