var appT = angular.module('appjogo', ['ngMaterial', 'ngLocale']);

appT.controller('appController', function ($scope, $http, $timeout, pontosJogos, $location) {

	$scope.$location = $location;

	var me = this;
	me.qtdPessoasVideo = null;
	me.streamingVideo = false;
	me.contador = 0;

	me.localCam = null;
	me.id = null;
	me.idUsuario = null;
	me.mostraCarregandoHome = true;

	me.mostraSucessoEnvio = false;
	me.mostraLogin = true;
	me.fotoFrontal = null;
	me.fotoDireita = null;
	me.fotoEsquerda = null;

	me.ctx = null;
	me.enviaFotos = false;
	me.mostraAutenticar = false;
	me.usuarioLogado = null;

	me.fotoAtual = 1;
	me.intervalo = null;

	me.mostraBotoesBottom = true;
	me.mostraBotoesHome = true;

	me.intervaloAuth = null;

	me.webcamStream = null;
	me.itemCarregado = 0;
	me.totalCarregar = 4;
	me.reconhecendo = false;

	var tempoAutenticacao = null;

	const MODEL_URL = 'https://lab.sicoobnet.com.br/reconhecimentofacial/models'

	$('.caixaAlerta').css({ 'margin-top': -100 });
	$('.caixaAlerta').css({ 'opacity': 0 });
	$('.telaIniciar').show();
	$('.localFotoFrente').hide();
	$('.localFotoEsq').hide();
	$('.localFotoDir').hide();
	$('.localVideo').hide();
	$('.efeitoFoto').css({ 'opacity': 0 });
	$('.localVideoAutenticar').hide();

	$('.botoesFotoFrente').hide();

	// buscarDefinicoes();

	function buscarDefinicoes() {
		connectApp.protocol = $location.protocol();
		connectApp.host = $location.host();
		connectApp.port = $location.port();
	}

	me.inicializaLoaders = async function () {
		setTimeout(async function () {
			me.itemCarregado = 0;
			me.totalCarregar = 4;

			await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
			me.itemCarregado = 1;
			$scope.$apply();

			await faceapi.loadFaceLandmarkModel(MODEL_URL);
			me.itemCarregado = 2;
			$scope.$apply();

			await faceapi.loadFaceRecognitionModel(MODEL_URL);
			me.itemCarregado = 3;
			$scope.$apply();

			await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
			me.itemCarregado = 4;
			$scope.$apply();

			me.mostraCarregandoHome = false;

			$('.carregandoApp').hide();

			$scope.$apply();
		})
	}

	me.fechaAlerta = function () {
		$('.caixaAlerta').animate({ 'margin-top': -100 }, function () {
			$('.caixaAlerta').css({ 'opacity': 0 });
		});
	}

	me.mostraAlerta = function (texto) {
		$('.caixaAlerta').css({ 'opacity': 1 });
		me.textoAlerta = texto;
		$('.caixaAlerta').animate({ 'margin-top': 0 });
	}

	me.cadastrar = function () {
		me.mostraCadastro = true;
		me.mostraLogin = false;
		me.mostraBotoesHome = true;

		me.fechaAlerta();
	}

	me.entrarLogin = function () {
		var enc = false;
		for (var t = 0; t < me.usuarios.length; t++) {
			if (String(me.usuarios[t].idUsuario).toLowerCase() == String(me.idUsuario).toLowerCase()) {
				me.usuarioLogado = me.usuarios[t];
				enc = true;
			}
		}

		if (!enc) {
			me.mostraAlerta("Usuário não encontrado");
		}
		else {
			me.mostraLogin = false;
			me.mostraCadastro = false;

			me.autenticar();
		}
	}

	me.mostrarLogin = function () {
		var rest = {
			method: 'GET',
			url: connectApp.toUrl() + "/listarUsuarios/",
			headers: { 'Content-Type': 'application/json' }
		}

		$http(rest).then(function (e) {
			me.usuarios = e.data.resultado;
		});
	}

	me.inicializaLoaders();

	me.enviarFotos = function () {

		if (me.id == "" || !me.id) {
			me.mostraAlerta('Informe o id');
			return;
		}

		if (me.nome == "" || !me.nome) {
			me.mostraAlerta('Informe o nome');
			return;
		}

		me.fechaAlerta();

		me.mostraCarregandoHome = true;

		navigator.mediaDevices.getUserMedia({ video: true }).then(onGetUserMedia, onGetUserMediaError);

		function onGetUserMedia(stream) {
			$('#videoCadastrar')[0].srcObject = stream;

			me.webcamStream = stream;

			me.enviaFotos = true;
			me.mostraBotoesHome = false;
			me.mostraBotoesEnviar = true;

			me.mostrarVideo();

			$scope.$apply();
		}

		function onGetUserMediaError(err) {
			console.error(err)
		}
	}

	me.mostrarVideo = function () {
		me.podeTirarFoto = false;
		me.mostraCarregandoHome = false;

		$('.localVideo').css({ 'display': 'flex' });
		$('.localFotoFrente').hide();
		$('.localFotoEsq').hide();
		$('.localFotoDir').hide();
		$('.textoContador').hide();

		$('.botaoTirarFoto').show();

		setTimeout(function () {
			me.reconheceFaceCadastro();
		}, 500);
	}

	me.proximoEsq = function () {
		me.fotoAtual = 2;

		$('.localFotoEsq').css({ 'display': 'flex' });
		$('.botoesFotoEsq').hide();
		$('.iamgemIcone2').show();
		$('.botaoTirarFotoEsq').show();
		$('.textoOlhe').show();
		$('.localFotoFrente').hide();
	}

	me.proximoDir = function () {
		me.fotoAtual = 2;

		$('.localFotoDir').css({ 'display': 'flex' });
		$('.localFotoEsq').hide();
		$('.botoesFotoDir').hide();
		$('.iamgemIcone2').show();
		$('.botaoTirarFotoDir').show();
		$('.textoOlhe').show();
		$('.localFotoFrente').hide();
	}

	me.someBotoesBottom = function () {
		me.mostraBotoesHome = false;
		me.mostraBotoesEnviar = false;
		me.mostraBotoesAutenticar = false;
	}

	me.voltarHome = function () {
		me.enviaFotos = false;
		me.mostraAutenticar = false;
		me.someBotoesBottom();
		me.mostraBotoesHome = true;
	}

	me.autenticar = function () {
		me.voltarHome();
		me.someBotoesBottom();

		me.mostraBotoesAutenticar = true;
		me.verificandoFoto = false;
		me.mostraAutenticar = true;
		me.contadorTentativa = 0;

		me.iniciarAutenticar();
	}

	me.tirarFoto1 = async function (id, foto) {

		function enviandoFotos() {
			var rest = {
				method: 'POST',
				url: "https://lab.sicoobnet.com.br/facial/facial_base",
				headers: { 'Content-Type': 'application/json' },
				data: { id: String(me.id), name_image: 'foto_' + me.contFoto, image: foto }
			};

			$http(rest).then(function (e) {

				if (me.contFoto == 0) {
					var rest = {
						method: 'POST',
						url: "https://lab.sicoobnet.com.br/facial/facial_matrix/" + String(me.id),
						headers: { 'Content-Type': 'application/json' }
					}

					$http(rest).then(function (e) {
						me.mostraSucessoEnvio = true;
						me.mostrarLogin();
					});
				}
				else {
					me.contFoto++;
					enviandoFotos();
				}
			});
		}

		me.contFoto = 0;
		enviandoFotos();
	}

	me.tirarFoto = async function () {
		me.enviaFoto = true;

		me.mostraCadastro = false;
		me.mostraCarregandoHome = true;

		$('.textoContador').show();
		$('.botaoTirarFoto').hide();

		me.fotoCadastrar = me.fotoCadastro.toDataURL('image/jpeg', '1.0');

		var rest = {
			method: 'POST',
			url: connectApp.toUrl() + "/cadastrarUsuario/",
			headers: { 'Content-Type': 'application/json' },
			data: { idUsuario: me.id, nomeUsuario: me.nome, fotoUsuario: me.fotoCadastrar }
		}

		$http(rest).then(function (e) {
			me.tirarFoto1(Number(me.id), me.fotoCadastrar);

			me.mostraSucessoCadastrado = true;
			me.mostraBotoesBottom = true;
			me.mostraBotoesHome = false;
			me.mostraBotoesEnviar = false;
			me.mostraBotoesAutenticar = false;
			me.mostraCadastro = false;
			me.mostraCarregandoHome = false;
			me.enviaFotos = false;

			$('.botaoTirarFotoFrente').hide();
			$('.localFotoFrente').css({ 'display': 'flex' });
			$('.botoesFotoFrente').show();
			$('.iamgemIcone1').hide();
			$('.textoOlhe').hide();

			me.mostraCarregandoHome = false;
		});

		$('.localVideo').hide();
	}


	me.tirarFotoFrente = async function () {
		me.mostrarVideo();
	}

	me.reconheceFaceCadastro = async function () {
		me.mostraCarregandoHome = false;

		var x = $('.localBolasFoto')[0].offsetLeft;
		var y = $('.localBolasFoto')[0].offsetTop;
		var wid = $('.localBolasFoto')[0].clientWidth;
		var hei = $('.localBolasFoto')[0].clientHeight;

		me.tamVideoH = $('#videoCadastrar')[0].offsetHeight;
		me.tamVideoW = $('#videoCadastrar')[0].offsetWidth;

		$('.bolaFundoVideo').css({ 'height': $('#videoCadastrar')[0].offsetHeight });
		$('.bolaFundoVideo').css({ 'width': $('#videoCadastrar')[0].offsetWidth });

		me.fotoCadastro = $('.fotoCadastro')[0];
		me.ctx = me.fotoCadastro.getContext('2d');
		me.fotoCadastro.width = me.tamVideoW;
		me.fotoCadastro.height = me.tamVideoH;

		if (me.tamVideoH > 0) {
			me.ctx.drawImage($('#videoCadastrar')[0], 0, 0, me.tamVideoW, me.tamVideoH);

			const result = await faceapi.detectAllFaces(me.fotoCadastro, new faceapi.TinyFaceDetectorOptions(512, 0.5));

			me.qtdPessoasVideo = result.length;

			if (result.length > 1) {
				me.podeTirarFoto = false;
			}
			else if (result.length == 1) {
				me.podeTirarFoto = true;
				clearTimeout(tempoAutenticacao);
			}
			else if (result.length == 0) {
				me.podeTirarFoto = false;
			}

			$scope.$apply();
			tempoAutenticacao = setTimeout(function () {
				me.reconheceFaceCadastro();
			}, 10);
		}
	}

	me.reconheceFaceAutenticacao = async function () {
		me.mostraCarregandoHome = false;

		var x = $('.localBolasFotoAuth')[0].offsetLeft;
		var y = $('.localBolasFotoAuth')[0].offsetTop;
		var wid = $('.localBolasFotoAuth')[0].clientWidth;
		var hei = $('.localBolasFotoAuth')[0].clientHeight;

		me.tamVideoHE = $('#videoAutenticar')[0].offsetHeight;
		me.tamVideoWE = $('#videoAutenticar')[0].offsetWidth;

		me.imgFotoEnviar = $('.imgFotoEnviarAuth')[0]
		me.ctx = me.imgFotoEnviar.getContext('2d');
		me.imgFotoEnviar.width = me.tamVideoWE;
		me.imgFotoEnviar.height = me.tamVideoHE;

		me.ctx.drawImage($('#videoAutenticar')[0], x, y, 300, 300);

		$('.bolaFundoVideo').css({ 'height': $('#videoAutenticar')[0].offsetHeight });
		$('.bolaFundoVideo').css({ 'width': $('#videoAutenticar')[0].offsetWidth });

		me.ctx.drawImage($('#videoAutenticar')[0], 0, 0, me.tamVideoWE, me.tamVideoHE);

		const result = await faceapi.detectAllFaces(me.imgFotoEnviar, new faceapi.TinyFaceDetectorOptions(512, 0.5));

		me.qtdPessoasVideo = result.length;


		if (result.length > 1) {
			//drawDetections(videoEl, $('#overlayAuth').get(0), [result]);
			me.podeAutenticar = false;

			tempoAutenticacao = setTimeout(function () {
				me.reconheceFaceAutenticacao();
			}, 1000);
		}
		else if (result.length == 1) {
			//drawDetections(videoEl, $('#overlayAuth').get(0), [result[0]]);
			me.podeAutenticar = true;

			var x = $('.localBolasFoto')[0].offsetLeft;
			var y = $('.localBolasFoto')[0].offsetTop;
			var wid = $('.localBolasFoto')[0].clientWidth;
			var hei = $('.localBolasFoto')[0].clientHeight;

			me.tamVideoH = $('#videoAutenticar')[0].offsetHeight;
			me.tamVideoW = $('#videoAutenticar')[0].offsetWidth;

			me.fotoValidar = $('.imgFotoValidar')[0]
			me.ctx = me.fotoValidar.getContext('2d');
			me.fotoValidar.width = me.tamVideoW;
			me.fotoValidar.height = me.tamVideoH;

			me.ctx.drawImage($('#videoAutenticar')[0], 0, 0);

			clearTimeout(tempoAutenticacao);
			me.tirarFotoEnviar();
			//me.iniciaAutenticacao(me.usuarioLogado);
		}
		else if (result.length == 0) {
			me.podeAutenticar = false;

			$scope.$apply();

			tempoAutenticacao = setTimeout(function () {
				me.reconheceFaceAutenticacao();
			}, 1000);
		}


	}

	var fotoUsuario;

	me.reconheceFaceAuto = async function () {
		me.mostraCarregandoHome = false;

		const videoEl = $('#videoAuto').get(0);
		const result = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions(512, 0.5));

		me.qtdPessoasVideo = result.length;


		if (result.length > 1) {
			me.podeAutenticar = false;

			tempoAutenticacao = setTimeout(function () {
				me.reconheceFaceAuto();
			}, 1000);
		}
		else if (result.length == 1) {
			me.podeAutenticar = true;

			me.fotoAuto = $('.imgFotoAuto')[0]
			me.ctx = me.fotoAuto.getContext('2d');
			me.fotoAuto.width = me.tamVideoW;;
			me.fotoAuto.height = me.tamVideoH;
			me.ctx.drawImage($('.videoAuto')[0], 0, 0);

			fotoUsuario = await faceapi.detectSingleFace(me.fotoAuto, new faceapi.TinyFaceDetectorOptions(512, 0.5)).withFaceLandmarks().withFaceDescriptor();

			clearTimeout(tempoAutenticacao);
			me.iniciaAuto();
		}
		else if (result.length == 0) {
			me.podeAutenticar = false;

			tempoAutenticacao = setTimeout(function () {
				me.reconheceFaceAuto();
			}, 1000);
		}

		$scope.$apply();
	}

	me.onPlay = async function () {

	}

	me.startaCamera = async function () {
		me.mostraCarregandoHome = true;
	}

	me.enviaFoto = function () {
		var rest = {
			method: 'POST',
			url: "https://lab.sicoobnet.com.br/facial/facial_base",
			headers: { 'Content-Type': 'application/json' },
			data: { id: String(me.id), name_image: 'foto' + me.fotoAtual, image: me.data1 }
		}

		$http(rest).then(function (e) {

		});

	}

	me.tirarFotoEsq = function () {
		me.fotoAtual = 2;
		me.mostrarVideo();

		me.startaCamera();
	}


	me.tirarFotoDir = function () {
		me.fotoAtual = 3;
		me.mostrarVideo();

		me.startaCamera();
	}


	me.iniciar = function () {
		me.listaImgs = [];

		$('.telaIniciar').hide();
	}

	me.iniciarAutenticar = function () {
		$('.telaIniciarAuth').hide();
		$('.localVideoAutenticar').show();

		me.mostraCarregandoHome = true;

		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight || e.clientHeight || g.clientHeight;

		navigator.mediaDevices.getUserMedia(
			{ video: true }).then(function (localMediaStream) {
				me.mostraCarregandoHome = false;
				me.podeAutenticar = false;

				$scope.$apply();

				me.localCamAuth = $('#videoAutenticar');
				me.localCamAuth[0].srcObject = localMediaStream;;
				me.webcamStream = localMediaStream;
				me.contadorTentativa = 0;

				setTimeout(function () {
					me.reconheceFaceAutenticacao();
				}, 500);
			}).catch(function (err) {
				console.log("The following error occured: " + err);
			}
			)
	}

	me.b64toBlob = function (dataURI) {

		var byteString = atob(dataURI);
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ab], { type: 'image/png' });
	}

	me.limparBase = function () {
		localStorage.setItem('usuarios', []);
		me.usuarios = [];
	}

	me.voltarLogin = function () {
		me.mostraLogin = true;
		me.mostraCadastro = false;
		me.erroAutenticacao = false;
		me.mostraSucessoCadastrado = false;
		me.mostraBemVindoAuto = false;
		me.mostraBemVindo = false;
		me.mostraAutenticar = false;
		me.mostraAuto = false;
		me.mostraBotoesBottom = false;
	}

	let fotoSalva = null;
	var users;
	var fotoUser;
	var urlBlob;
	var img;

	var indAuto = 0;
	me.iniciaAuto = async function () {
		users = localStorage.getItem('usuarios');

		if (!users) {
			users = [];
		}
		else {
			users = JSON.parse(users);
		}

		indAuto = 0;
		me.verificaUserAuto()
	}

	var fotoUser;

	me.verificaUserAuto = async function () {
		fotoUser = users[indAuto].foto;

		blob = me.b64toBlob(fotoUser);

		urlBlob = URL.createObjectURL(blob);
		img = await faceapi.fetchImage(urlBlob);
		$('.imgFotoBemVindoAuto')[0].src = urlBlob;

		fotoSalva = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions(512, 0.5)).withFaceLandmarks().withFaceDescriptor();

		const faceMatcher = new faceapi.FaceMatcher(fotoUsuario);

		const results = faceMatcher.findBestMatch(fotoSalva.descriptor);

		if (results) {
			if (results._label != 'unknown') {
				if (me.webcamStream)
					me.webcamStream.stop();

				me.mostraLogin = false;
				me.mostraBemVindoAuto = true;
				me.mostraBemVindo = false;
				me.mostraAutenticar = false;
				me.mostraAuto = false;
				me.mostraBotoesBottom = false;

				$('.localBemVindo').css({ 'margin-top': '100vh' });
				$('.localBemVindo').animate({ 'margin-top': '0' });

				$scope.$apply();
			}
			else {
				indAuto++;
				if (indAuto > users.length) {
					alert("usuario nao encontrado");
				} else
					me.verificaUserAuto();
			}
		}
	}

	me.iniciaAutenticacao = async function (usuarios) {
		if (me.contadorTentativa == 3) {
			alert("Não reconhecido após 3 tentativas")
			return;
		}

		if (me.contadorTentativa == 1) {
			users = usuarios;

			fotoUser = users.foto;

			blob = me.b64toBlob(fotoUser);

			urlBlob = URL.createObjectURL(blob);
			img = await faceapi.fetchImage(urlBlob);
			$('.imgFotoBemVindo')[0].src = urlBlob;

			fotoSalva = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions(512, 0.5)).withFaceLandmarks().withFaceDescriptor();
		}

		const fullFaceDescription = await faceapi.detectSingleFace(me.fotoValidar, new faceapi.TinyFaceDetectorOptions(512, 0.5)).withFaceLandmarks().withFaceDescriptor();

		const faceDescriptors = [fullFaceDescription.descriptor]
		var labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors('Marcelo', faceDescriptors)

		const maxDescriptorDistance = 0.6
		const faceMatcher = new faceapi.FaceMatcher(fotoSalva);

		const results = faceMatcher.findBestMatch(fullFaceDescription.descriptor);

		if (results) {
			if (results._label != 'unknown') {
				if (me.webcamStream)
					me.webcamStream.stop();

				me.mostraBemVindo = true;

				$('.localBemVindo').css({ 'margin-top': '100vh' });
				$('.localBemVindo').animate({ 'margin-top': '0' });

				me.mostraAutenticar = false;
				me.mostraBotoesBottom = false;
				$scope.$apply();
			}
			else {
				me.contadorTentativa++;
				me.iniciaAutenticacao(users);
			}
		}

	}

	me.mostraErroAutenticacao = function () {
		me.erroAutenticacao = true;

		me.mostraLogin = false;
		me.mostraBemVindoAuto = false;
		me.mostraBemVindo = false;
		me.mostraAutenticar = false;
		me.mostraAuto = false;
		me.mostraBotoesBottom = true;

	}

	me.tirarFotoEnviar = function () {
		if (me.verificandoFoto)
			return;

		me.verificandoFoto = true;

		me.dataEnv = me.imgFotoEnviar.toDataURL('image/jpeg', '1.0');
		me.valData = me.dataEnv;
		me.verificandoFoto = true;

		var rest = {
			method: 'POST',
			url: "https://lab.sicoobnet.com.br/facial/facial_auth",
			headers: { 'Content-Type': 'application/json' },
			data: { id: String(me.idUsuario), name_image: 'fotoEnviar', image: me.valData }
		}

		$http(rest).then(function (e) {
			me.verificandoFoto = false;

			var result = e.data;
			if (result.match == "yes") {
				setTimeout(function () {
					if (me.webcamStream)
						me.webcamStream.getTracks()[0].stop();

					me.mostraLogin = false;
					me.mostraBemVindoAuto = false;
					me.erroAutenticacao = false;
					me.mostraBemVindo = true;
					me.mostraAutenticar = false;
					me.mostraAuto = false;
					me.mostraBotoesBottom = true;

					$('.localBemVindo').css({ 'margin-top': '100vh' });
					$('.localBemVindo').animate({ 'margin-top': '0' });

					$scope.$apply();
				}, 200)
			}
			else {
				me.contadorTentativa++;

				if (me.contadorTentativa == 3) {
					me.mostraErroAutenticacao();
				}
				else {
					me.reconheceFaceAutenticacao();
				}
			}
		});
	}

	me.mostrarLogin();
});
