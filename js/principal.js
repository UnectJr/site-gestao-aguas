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
function adm_set(id){
  firebase.database().ref("/users/cp/"+id).once('value', function(snapshot){
    let adm_value = snapshot.child("administrador").val();
    if(adm_value==true || adm_value =='true'){
      if(confirm("Você está mudando privilégios do usuário para NÃO ADMINISTRADOR, tem certeza?")){
        firebase.database().ref('/users/cp/'+id).update({
          administrador: false
        });
      } else {
        $("#"+id).prop('checked', true);
      }
    }else{
      if(confirm("Você está mudando privilégios do usuário para ADMINISTRADOR, tem certeza?")){
        firebase.database().ref('/users/cp/'+id).update({
          administrador: true
        });
      } else {
        $("#"+id).prop('checked', false);
      }
    }
  });
}

function resolvido_set(id){
  firebase.database().ref().child("reports/cp/"+id).once("value", function(snapshot){
    resolvido_value = snapshot.child("resolvido").val();
    if(resolvido_value==true || resolvido_value =='true'){
      if(confirm("Você está mudando status do post para NÃO RESOLVIDO, tem certeza?")){
        firebase.database().ref('reports/cp/'+id).update({
          resolvido: false
        });
      } else {
        $("#"+id).prop('checked', true);
      }
    }else{
      if(confirm("Você está mudando status do post para RESOLVIDO, tem certeza?")){
        firebase.database().ref('reports/cp/'+id).update({
          resolvido: true
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

var referenciaPaginaAnterior = [,,0];
// Flag auxiliar para encontrar primeira referência
var ehPrimeiro = true;
// Flag para voltar página
var avancou_pagina = true;
// Número da página (começa com página 1)
var numeroPagina = 1;
// Número de páginas do resultado da pesquisa
var totalPaginas = 1;
// Quantidade de reports por página
var reportsPorPagina = 8;
// Filtrar por local
var localShow = "todos";
var opcoes_resolvido = "all";
// Data de início do filtro
var data_ini;
// Data fim do filtro
var data_fim;

var reports="";
var users="";
var snapshotDB,contador,contador_pag;

// Conta quantas páginas tem
reportsReferencia.orderByChild("data_invertida").on("value", function(snapshot) {
  totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
  snapshotDB = snapshot;
  let cont = true;
  snapshot.forEach(function (snap){
    if (cont) referenciaPaginaAnterior[numeroPagina] = snap.child('data_invertida').val();
    let update = {
      andar: snap.child("andar").val(),
      data: snap.child("data").val(),
      data_invertida: -1*parseInt(snap.child("data").val()),
      imagem: snap.child("imagem").val(),
      local:  snap.child("local").val(),
      resolvido: snap.child("resolvido").val(),
      texto: snap.child("texto").val(),
      uid: snap.child("uid").val(),
      resolvido_local: snap.child("resolvido").val()+"_"+snap.child("local").val()
    };
    reportsReferencia.child(snap.key).set(update);
    cont = false;
  })
});

// Primeira query no banco
var pageQuery = reportsReferencia.orderByChild("data_invertida").limitToFirst(reportsPorPagina);
// Primeira recuperação dos valores
pageQuery.on('value', iteracao);

/********************************* setup_config *********************************/

function setup_config() {
  // Mostra loading
  $("#loading_content").removeClass("hide");
  numeroPagina = 1;
  // Filtro data
  var ini_data = $('#data_ini').val();
  var fim_data = $('#data_fim').val();
  // Data início
  if(ini_data){
    data_ini = (new Date(ini_data)).getTime() * -1;
  } else {
    data_ini = 0;
  }
  // Data término
  if(fim_data){
    let data_aux = new Date(fim_data);
    data_aux.setDate(data_aux.getDate()+1);
    data_fim = data_aux.getTime() * -1;
  } else {
    data_fim = 0;
  }
  // Recupera valor do select
  reportsPorPagina = parseInt($('#opcoes_paginacao').find(":selected").val());
  // Executa novamente primeira query
 /* if(data_ini && data_fim){
 
    if(data_ini <= data_fim){
      console.log(data_ini);
      console.log(data_fim);
      Materialize.toast('Data inicial está depois da data final!', 4000)
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
*/
  /********************************* Filtro Por Local *********************************/

// Recupera valor do select
  localShow = ($('#opcoes_local').find(":selected").val());
  /*if(localShow!="todos"){
    reportsReferencia.orderByChild("local").equalTo(localShow).on("value", function(snapshot) {
      totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
    });
    pageQuery = reportsReferencia.orderByChild("local").equalTo(localShow).limitToFirst(reportsPorPagina);
  }*/


/********************************* Filtro Por Status *********************************/

// Recupera valor do select
  opcoes_resolvido = ($('#opcoes_resolvido').find(":selected").val());
  /*if (opcoes_resolvido != "all"){
    // Se quiser somente resolvidos
    if (opcoes_resolvido == "true"){
      reportsReferencia.orderByChild("resolvido").equalTo(true).on("value", function(snapshot) {
        totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
      });
      pageQuery = reportsReferencia.orderByChild("resolvido").equalTo(true).limitToFirst(reportsPorPagina);
    }
    // Se quiser somente não resolvidos
    else{
      reportsReferencia.orderByChild("resolvido").equalTo(false).on("value", function(snapshot) {
        totalPaginas = Math.ceil(snapshot.numChildren() / reportsPorPagina);
      });
      pageQuery = reportsReferencia.orderByChild("resolvido").equalTo(false).limitToFirst(reportsPorPagina);      
    }
  }
  pageQuery.on('value', iteracao);*/
  iteracao(snapshotDB);
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
  $('#opcoes_local').prop('selectedIndex', 0);
  $('#opcoes_local').material_select();
  $('#opcoes_resolvido').prop('selectedIndex', 0);
  $('#opcoes_resolvido').material_select();
  reportsPorPagina = 8;
  localShow = "todos";
  opcoes_resolvido = "all";
  referenciaPaginaAnterior = [,0];
  data_ini = 0;
  data_fim = 0;
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
  //iteracao(snapshotDB);
}

/********************************* Próxima página *********************************/

function proximaPagina() {
  if(numeroPagina < totalPaginas && !($("#avancar_pagina").hasClass("disabled"))){
    // Mostra loading
    $("#loading_content").removeClass("hide");
    // Atualizar flags
    //ehPrimeiro = true;
    avancou_pagina = true;
    // Próxima query
  //pageQuery = reportsReferencia.orderByChild("data_invertida").startAt(ultimaReferencia+1).limitToFirst(reportsPorPagina);
    // Incrementa número da página
    // Executa nova query
    numeroPagina++;
    console.log("Array de referências: "+ referenciaPaginaAnterior);
    iteracao(snapshotDB,"proxima");
    
    
    //pageQuery.on('value', iteracao);
  }
}

/********************************* Página anterior *********************************/

function paginaAnterior() {
  if(numeroPagina > 1) {
    // Mostra loading
    $("#loading_content").removeClass("hide");
    // Atualizar flags
    //ehPrimeiro = true;
    avancou_pagina = false;
    
    // Próxima query
    //pageQuery = reportsReferencia.orderByChild("data_invertida").endAt(primeiraReferencia-1).limitToLast(reportsPorPagina);
    // Executa nova query
    numeroPagina--;
    iteracao(snapshotDB, "anterior");
    
    //pageQuery.on('value', iteracao);
  }
}

/********************************* Iteração dos reports *********************************/
function makeHTML(snapshot){
  if(contador < reportsPorPagina && snapshot.child('resolvido_local').toJSON().includes(opcoes_resolvido+"_"+localShow)){
    if(contador == 0) ehPrimeiro = true;
    if(ehPrimeiro){
      primeiraReferencia = snapshot.child('data_invertida').val();
      ehPrimeiro = false;
      if(referenciaPaginaAnterior[numeroPagina]==0) {
        referenciaPaginaAnterior[numeroPagina] = [primeiraReferencia]
        referenciaPaginaAnterior.push(0);
      }
    } 
    // Atualiza última referência da página
      ultimaReferencia = snapshot.child('data_invertida').val();
      //pega valores de ponto push id
      var data_timestamp =  snapshot.child('data').val();
      var id = snapshot.key;
      var date_post = timeConverter(data_timestamp);
      var resolvido =  snapshot.child("resolvido").val();
      var texto = snapshot.child("texto").val();
      var andar = snapshot.child("andar").val();
      var local = snapshot.child("local").val();
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
           '   <p class="description-post"><b>Local:</b> '+local+'</p>'+
           '   <p class="description-post"><b>Andar:</b> '+andar+'</p>'+
           '   <p class="description-post"><b>Descrição:</b> '+texto+'</p>'+
           
           '</div>'+
        '</div>';
  
      // Adiciona card ao elemento
      reports += div_card;
      contador++;
  }
  contador_pag++;
  
}

function filtroData(snapshot){
  if(localShow=="todos") localShow = "";
  if(opcoes_resolvido=="all") opcoes_resolvido = "";
  if(data_ini && data_fim){  
    if(data_ini <= data_fim){
      Materialize.toast('Data inicial está depois da data final!', 4000)
    } else {         
      if(snapshot.child('data_invertida').val()>data_fim && snapshot.child('data_invertida').val()<=data_ini)
        makeHTML(snapshot);
      }
  } else if(data_ini){
      if(snapshot.child('data_invertida').val()<=data_ini)
        makeHTML(snapshot);
        console.log("Contador: "+contador);
    } else if (data_fim) {
        if(snapshot.child('data_invertida').val()>=data_fim)
          makeHTML(snapshot);
      } else {
        makeHTML(snapshot);
      }

  // verifica a paginação
  if(contador<reportsPorPagina){
    $("#avancar_pagina").removeClass("waves-effect").addClass("disabled");
  }
  else if(contador_pag>reportsPorPagina || contador>=reportsPorPagina){
      $("#avancar_pagina").removeClass("disabled").addClass("waves-effect");
    } 
}

function iteracao(snapshot, referencia) {
  reports = "";
  contador = 0;
  contador_pag = 0;
	snapshot.forEach(function(snapshot) {
    //console.log("Referencia: "+referencia);
    //console.log("Primeira: "+primeiraReferencia+"\nUltima: "+ultimaReferencia);
    
    if (referencia == "proxima" && snapshot.child('data').val()<-1*ultimaReferencia) {
      filtroData(snapshot);
    }

    else if(referencia == "anterior" 
            && snapshot.child('data').val()>-1*referenciaPaginaAnterior[numeroPagina+1]
            && snapshot.child('data').val()<=-1*referenciaPaginaAnterior[numeroPagina]){
              filtroData(snapshot);
    }
     // filtroData(snapshot);
    else if (primeiraReferencia<=ultimaReferencia && numeroPagina==1) filtroData(snapshot);      
   // console.log("Numero "+i+": "+snapshot.child('data').val()+"\nUltima referencia: "+-1*ultimaReferencia+"\nPrimeira referencia: "+-1*primeiraReferencia);

	});
  // Esconde loading

  $("#loading_content").addClass("hide");

  // Se snapshot tem algum dado
  if(snapshot.exists()){
   // if(numeroPagina >= totalPaginas) {
   //   $("#avancar_pagina").removeClass("waves-effect").addClass("disabled");
  //  }
    if(numeroPagina === 1) {
      $("#voltar_pagina").removeClass("waves-effect").addClass("disabled");
    }
    if(numeroPagina > 1) {
      $("#voltar_pagina").removeClass("disabled").addClass("waves-effect");
    }
    //if(numeroPagina < totalPaginas) {
   //   $("#avancar_pagina").removeClass("disabled").addClass("waves-effect");
   // }
    // Adiciona cards à página
    $(".card_insert").html(reports);
    $('.materialboxed').materialbox();
  } else {
    $(".card_insert").html("");
  }
  // Atualiza número da página
  $("#numero_pagina").text(numeroPagina);
}

function show_users(){
  contador =0;
  users="";
  firebase.database().ref("/users/cp/").once("value", function (snapshot){
      snapshot.forEach(function(snapshot){
           //pega valores de ponto push id
          var firstname =  snapshot.child('firstName').val();
          var uid = snapshot.child('uid').val() ;
          var lastname = snapshot.child('lastName').val();
          var administrador =  snapshot.child("administrador").val();
          var ra = snapshot.child("ra").val();
          var email = snapshot.child("email").val();
          
          // template de card com dados
          var check;
          if(administrador==true){
          check = checked="checked";
          }else{
          check = "";
          }
      
          var div_card =
          '<div class="card post">'+
             '<div class="card-image img-card">'+
                 '<img class="post-image materialboxed" src="img/face.png">'+
              '</div>'+
              '<div class="card-content">'+
              '   <span class="card-title activator grey-text text-darken-4 date-post">'+firstname+" "+lastname+'<i class="material-icons right">menu</i></span>'+
              '   <p><input type="checkbox" id="'+uid+'" onclick="adm_set(this.id)" '+check+' /><label for="'+uid+'">Administrador</label>'+
              '     </p>'+
              '</div>'+
              '<div class="card-reveal">'+
              '   <span class="card-title grey-text text-darken-4 date-post">'+firstname+" "+lastname+'<i class="material-icons right">close</i></span>'+
              '   <p class="description-post"><b>Email:</b> '+email+'</p>'+
              '   <p class="description-post"><b>RA:</b> '+ra+'</p>'+
              '   <p class="description-post"><b>UID:</b> '+uid+'</p>'+
              
              '</div>'+
          '</div>';
      
          // Adiciona card ao elemento
          users += div_card;
          contador++;

          $(".card_insert").html(users);
          $('.materialboxed').materialbox();
      });     
  });
  $("#avancar_pagina").removeClass("waves-effect").addClass("disabled");
}
