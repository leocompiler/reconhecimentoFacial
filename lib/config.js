var development = {
    env: global.process.env.APP_NODE_ENV || 'development',
    conString: global.process.env.APP_POSTGRES_PATH || "postgres://caixauser:caixauser@jeitocaixadev.cyyi8bveyyam.us-west-2.rds.amazonaws.com/jeitocaixa",
    carga: process.env.CARGA,
    useHttps: false,
    httpPort: process.env.PORT || 8000,
    httpHost: global.process.env.APP_HTTP_HOST || 'localhost',
    defaultUserData: {
        cnpj: "29560166000144",
        codCaixa: "190033070",
        nome: "Jogo Certo",
        jogos: "B",
        negocios: "B",
        tipo: "LOTERICA",
        cadastrado: true
    }
};

var production = {
    env: global.process.env.APP_NODE_ENV || 'production',
    conString: global.process.env.APP_POSTGRES_PATH,
    carga: process.env.CARGA,
    useHttps: false,
    httpPort: process.env.PORT || 8000,
    httpHost: global.process.env.APP_HTTP_HOST || '127.0.0.1',
   
    //Colocar true para facilitar o desenvolvimento com o nodemon
    //Quando true, modifica a logica do autenticador.js para 
    //logar automaticamente com os dados do defaultUserData
    disableAuthentication: false
};

module.exports = global.process.env.APP_NODE_ENV === 'production' ? production : development;