// Initialize Firebase
var config = {
  apiKey: "AIzaSyAaiobOgYPey-2zhvXCt6XOyZutpBBpml4",
  authDomain: "appaguas-utfpr.firebaseapp.com",
  databaseURL: "https://appaguas-utfpr.firebaseio.com",
  projectId: "appaguas-utfpr",
  storageBucket: "",
  messagingSenderId: "7612106731"
};
firebase.initializeApp(config);

/********************************* resolvido_set *********************************/

function resolvido_set(id){
  firebase.database().ref().child("reports/cp/"+id).once("value", function(snapshot){
    resolvido_value = snapshot.child("resolvido").val();
    if(resolvido_value==true || resolvido_value =='true'){
      if(confirm("Você está mudando status do post para NÃO RESOLVIDO, tem certeza?")){
        firebase.database().ref('reports/cp/'+id).update({
          resolvido: 'false'
        });
      } else {
        $("#"+id).prop('checked', true);
      }
    }else{
      if(confirm("Você está mudando status do post para RESOLVIDO, tem certeza?")){
        firebase.database().ref('reports/cp/'+id).update({
          resolvido: 'true'
        });
      } else {
        $("#"+id).prop('checked', false);
      }
    }
  });
}

/********************************* timeConverter *********************************/

function timeConverter(UNIX_timestamp){
	var date_new = new Date(UNIX_timestamp);
	var months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
	var year = date_new.getFullYear();
	var month = months[date_new.getMonth()];
	var date = date_new.getDate();
	var hour = date_new.getHours();
	var min = date_new.getMinutes();
	if(min < 10){
		min = "0"+min;
	}
	var sec = date_new.getSeconds();
	if(sec < 10){
		sec = "0"+sec;
	}
	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	return time;
}

/********************************* Paginação *********************************/

// Referência à base
var reportsReferencia = firebase.database().ref().child("reports/cp");
// Última referência da página
var ultimaReferencia = null;
// Primeira referência da página
var primeiraReferencia = null;
// Flag auxiliar para encontrar primeira referência
var ehPrimeiro = true;
// Flag para voltar página
var avancou_pagina = false;
// Número da página (começa com página 1)
var numeroPagina = 1;
// Número de páginas do resultado da pesquisa
var totalPaginas = 1;
// Quantidade de reports por página
var reportsPorPagina = 8;
// Data de início do filtro
var data_ini;
// Data fim do filtro
var data_fim;
// Primeira query no banco
var pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
// Conta quantas páginas tem
reportsReferencia.orderByChild("data_invertida").on("value", function(snapshot) {
  totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
});
// Primeira recuperação dos valores
pageQuery.on('value', iteracao);

/********************************* setup_config *********************************/

function setup_config() {
  // Mostra loading
  $("#loading_content").removeClass("hide");
  numeroPagina = 1;
  // Filtro data
  let ini_data = $('#data_ini').val();
  let fim_data = $('#data_fim').val();
  // Data início
  if(ini_data){
    data_ini = (new Date(ini_data)).getTime() * -1;
  } else {
    data_ini = 0;
  }
  // Data término
  if(fim_data){
    let data_aux = new Date(fim_data);
    data_aux.setDate(data_aux.getDate() + 1);
    data_fim = data_aux.getTime() * -1;
  } else {
    data_fim = 0;
  }
  // Recupera valor do select
  reportsPorPagina = parseInt($('#opcoes_paginacao').find(":selected").val());
  // Executa novamente primeira query
  if(data_ini && data_fim){
    if(data_ini < data_fim){
      Materialize.toast('Data final é maior que inicial!', 4000)
    } else {
      // Conta quantas páginas tem
      reportsReferencia.orderByChild("data_invertida").startAt(data_fim).endAt(data_ini).on("value", function(snapshot) {
        totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
      });
      pageQuery = reportsReferencia.orderByChild("data_invertida").startAt(data_fim).endAt(data_ini).limitToFirst(reportsPorPagina);
    }
  } else if(data_ini){
    // Conta quantas páginas tem
    reportsReferencia.orderByChild("data_invertida").endAt(data_ini).on("value", function(snapshot) {
      totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
    });
    pageQuery = reportsReferencia.orderByChild("data_invertida").endAt(data_ini).limitToFirst(reportsPorPagina);
  } else if (data_fim) {
    // Conta quantas páginas tem
    reportsReferencia.orderByChild("data_invertida").startAt(data_fim).on("value", function(snapshot) {
      totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
    });
    pageQuery = reportsReferencia.orderByChild("data_invertida").startAt(data_fim).limitToFirst(reportsPorPagina);
  } else {
    // Conta quantas páginas tem
    reportsReferencia.orderByChild("data_invertida").on("value", function(snapshot) {
      totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
    });
    pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
  }
  pageQuery.on('value', iteracao);
}

/********************************* limpar filtros *********************************/

function limpar_filtros() {
  // Mostra loading
  $("#loading_content").removeClass("hide");
  numeroPagina = 1;
  // Datas
  $('#data_ini').val("");
  $('#data_fim').val("");
  // Paginação
  $('#opcoes_paginacao').prop('selectedIndex', 0);
  $('#opcoes_paginacao').material_select();
  reportsPorPagina = 8;
  // Resolução
  /*$('#opcoes_resolvido').prop('selectedIndex', 0);
  $('#opcoes_resolvido').material_select();*/
  // Executa novamente primeira query
  pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
  // Conta quantas páginas tem
  reportsReferencia.orderByChild("data_invertida").on("value", function(snapshot) {
    totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
  });
  pageQuery.on('value', iteracao);
}

/********************************* Próxima página *********************************/

function proximaPagina() {
  if(numeroPagina < totalPaginas){
    // Mostra loading
    $("#loading_content").removeClass("hide");
    // Atualizar flags
    ehPrimeiro = true;
    avancou_pagina = true;
    // Próxima query
  	pageQuery = reportsReferencia.orderByChild("data_invertida").startAt(ultimaReferencia+1).limitToFirst(reportsPorPagina);
    // Incrementa número da página
    numeroPagina++;
    // Executa nova query
    pageQuery.on('value', iteracao);
  }
}

/********************************* Página anterior *********************************/

function paginaAnterior() {
  if(numeroPagina > 1) {
    // Mostra loading
    $("#loading_content").removeClass("hide");
    // Atualizar flags
    ehPrimeiro = true;
    avancou_pagina = false;
    numeroPagina--;
    // Próxima query
    pageQuery = reportsReferencia.orderByChild("data_invertida").endAt(primeiraReferencia-1).limitToLast(reportsPorPagina);
    // Executa nova query
    pageQuery.on('value', iteracao);
  }
}

/********************************* Iteração dos reports *********************************/

function iteracao(snapshot) {
  var reports = "";
	snapshot.forEach(function(snapshot) {
    if(ehPrimeiro){
      primeiraReferencia = snapshot.child('data_invertida').val();
      ehPrimeiro = false;
    }
		// Atualiza última referência da página
		ultimaReferencia = snapshot.child('data_invertida').val();

		//pega valores de ponto push id
		var data_timestamp =  snapshot.child('data').val();

		var id = snapshot.key;
		var date_post = timeConverter(data_timestamp);
		var resolvido =  snapshot.child("resolvido").val();
		var texto = snapshot.child("texto").val();
		var img = snapshot.child("imagem").val();

		// template de card com dados
		var check;
		if(resolvido==true || resolvido=='true'){
		  check = checked="checked";
		}else{
		  check = "";
		}

		var div_card =
		 '<div class="card post">'+
		     '<div class="card-image img-card">'+
		        '<img class="post-image materialboxed" src="'+img+'">'+
		     '</div>'+
		     '<div class="card-content">'+
		     '   <span class="card-title activator grey-text text-darken-4 date-post">'+date_post+'<i class="material-icons right">menu</i></span>'+
		     '   <p><input type="checkbox" id="'+id+'" onclick="resolvido_set(this.id)" '+check+' /><label for="'+id+'">Resolvido</label>'+
		     '     </p>'+
		     '</div>'+
		     '<div class="card-reveal">'+
		     '   <span class="card-title grey-text text-darken-4 date-post">'+date_post+'<i class="material-icons right">close</i></span>'+
		     '   <p class="description-post">'+texto+'</p>'+
		     '</div>'+
		  '</div>';

		// Adiciona card ao elemento

    reports += div_card;

	});
  // Esconde loading

  $("#loading_content").addClass("hide");

  // Se snapshot tem algum dado
  if(snapshot.exists()){
    if(numeroPagina >= totalPaginas) {
      $("#avancar_pagina").removeClass("waves-effect").addClass("disabled");
    }
    if(numeroPagina === 1) {
      $("#voltar_pagina").removeClass("waves-effect").addClass("disabled");
    }
    if(numeroPagina > 1) {
      $("#voltar_pagina").removeClass("disabled").addClass("waves-effect");
    }
    if(numeroPagina < totalPaginas) {
      $("#avancar_pagina").removeClass("disabled").addClass("waves-effect");
    }
    // Adiciona cards à página
    $(".card_insert").html(reports);
    $('.materialboxed').materialbox();
  } else {
    $(".card_insert").html("");
  }
  // Atualiza número da página
  $("#numero_pagina").text(numeroPagina);
}
