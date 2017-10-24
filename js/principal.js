// Initialize Firebase
var config = {
    apiKey: "AIzaSyBiMgfyZ_izdFKLDl05vftWixxaS6xKIyM",
    authDomain: "app-agua-utfpr.firebaseapp.com",
    databaseURL: "https://app-agua-utfpr.firebaseio.com",
    projectId: "app-agua-utfpr",
    storageBucket: "app-agua-utfpr.appspot.com",
    messagingSenderId: "142712018169"
  };
firebase.initializeApp(config);

/*function return_num_pages(numero_post, num_per_page){
   return (numero_post/num_per_page);
}*/

/********************************* resolvido_set *********************************/

function resolvido_set(id){//falta tratar o dom para quando nao aceita no cofirm dialog, esta mudando o checked do input
   var rec_resolvido = firebase.database().ref().child("reports/cp/"+id).once("value", function(snapshot){
      resolvido_value = snapshot.child("resolvido").val();
      console.log("resolvido post: "+resolvido_value);
      if(resolvido_value==true || resolvido_value =='true'){
         if(confirm("Você está mundando status do post para NÃO RESOLVIDO, tem certeza?")){
            firebase.database().ref('reports/cp/'+id).update({
               resolvido: 'false'

            });
         }
      }else{
         if(confirm("Você está mundando status do post para RESOLVIDO, tem certeza?")){
            firebase.database().ref('reports/cp/'+id).update({
               resolvido: 'true'
            });
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
// Referência da última página
var novosValores = false;
// Flag para voltar página
var avancou_pagina = false;
// Número da página (começa com página 1)
var numeroPagina = 1;
// Quantidade de reports por página
var reportsPorPagina = 6;
// Primeira query no banco
var pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
// Primeira recuperação dos valores
pageQuery.on('value', iteracao);

/********************************* setup_config *********************************/

function setup_config() {
  // Mostra loading
  $("#loading_content").removeClass("hide");
  numeroPagina = 1;
  // Recupera valor do select
  reportsPorPagina = parseInt($('#opcoes_paginacao').find(":selected").val());
  // Executa novamente primeira query
  pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
  pageQuery.on('value', iteracao);
}

/********************************* Próxima página *********************************/

function proximaPagina() {
  // Mostra loading
  $("#loading_content").removeClass("hide");
  // Atualizar flags
  ehPrimeiro = true;
  avancou_pagina = true;
  // Próxima query
	pageQuery = reportsReferencia.orderByChild("data_invertida").startAt(ultimaReferencia+1).limitToFirst(reportsPorPagina);
	// Executa nova query
  pageQuery.on('value', iteracao);
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
  if(numeroPagina === 1) {
    $("#voltar_pagina").removeClass("waves-effect").addClass("disabled");
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
		//console.log(ultimaReferencia);

		//pega valores de ponto push id
		var data_timestamp =  snapshot.child('data').val();
		
		var id = snapshot.key;
		var date_post = timeConverter(data_timestamp);
		var resolvido =  snapshot.child("resolvido").val(); //cliar um on click em algum lugar verifica status e compara com boolean que chegar
		var texto = snapshot.child("texto").val();
		var img = snapshot.child("imagem").val();

		// template de card com dados
		var check;
		if(resolvido==true || resolvido=='true'){//muda o check para resolvidos, fazer a funcção de onclic para mudar dado reoslvido no banco
		  check = checked="checked";
		}else{
		  check = "";
		}
		
		var div_card =
		 '<div class="card post">'+
		     '<div class="card-image waves-effect waves-block waves-light img-card">'+
		        '<img class="activator post-image" src="'+img+'">'+
		     '</div>'+
		     '<div class="card-content">'+
		     '   <span class="card-title activator grey-text text-darken-4 date-post">'+date_post+'<i class="material-icons right">menu</i></span>'+
		     '   <p><input type="checkbox" id="'+id+'"'+check+' onclick="resolvido_set(this.id)"  /><label for="'+id+'">Resolvido</label>'+
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
  // Se snapshot tem algum dado
  if(snapshot.exists()){
    // Adiciona cards à página
    $(".card_insert").html(reports);
    // Esconde loading
    $("#loading_content").addClass("hide");
    // Verifica se há novos reports
    if(novosValores){
      if(avancou_pagina){
        avancou_pagina = false;
        // Incrementa número da página
        numeroPagina++;
        // Altera css
        $("#voltar_pagina").removeClass("disabled").addClass("waves-effect");
      }
    }
    // Atualiza flag
    novosValores = true;
  } else {
    // Atualiza flag
    novosValores = false;
  }
  // Atualiza número da página
  $("#numero_pagina").text(numeroPagina);
}