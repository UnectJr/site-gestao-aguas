// Initialize Firebase
var config = {
  apiKey: "AIzaSyDQFQ59lMT5wk4lFaJ0bUR0UnP0jVZ3IgQ",
  authDomain: "testewebchat-1a3fa.firebaseapp.com",
  databaseURL: "https://testewebchat-1a3fa.firebaseio.com",
  projectId: "testewebchat-1a3fa",
  storageBucket: "testewebchat-1a3fa.appspot.com",
  messagingSenderId: "128075295986"
};
firebase.initializeApp(config);
var db = firebase.database().ref("reports/cp").once("value", function (snapshot){//recupera ponto de push ids
   var numero_post = snapshot.numChildren();
   console.log(numero_post);
});
function return_num_pages(numero_post, num_per_page){
   return (numero_post/num_per_page);
}

//falta fazer a ordenaçao(se retornar negativo -1*(timestamp) ele ordena automatico) -- feito ou fazendo por flavio
db = firebase.database().ref().child("reports/cp").orderByChild("data").once("value", function (snapshot) {//recupera ponto de push ids
    snapshot.forEach(function(snapshot) {//roda todos ids
      var data_timestamp =  snapshot.child("data").val();//pega valores de ponto push id


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
      var id = snapshot.key;
      var date_post = timeConverter(data_timestamp);
      var resolvido =  snapshot.child("resolvido").val(); //cliar um on click em algum lugar verifica status e compara com boolean que chegar
      var texto = snapshot.child("texto").val();
      var img = snapshot.child("imagem").val();


      /*template de card com dados*/
      var check;
      if(resolvido){//muda o check para resolvidos, fazer a funcção de onclic para mudar dado reoslvido no banco
          check = '<input type="checkbox" id="'+id+'" checked="checked"  />'
      }else{
          check = '<input type="checkbox" id="'+id+'"  />'
      }
      var div_card =
         '<div class="card post">'+
             '<div class="card-image waves-effect waves-block waves-light img-card">'+
                '<img class="activator post-image" src="'+img+'">'+
             '</div>'+
             '<div class="card-content">'+
             '   <span class="card-title activator grey-text text-darken-4 date-post">'+date_post+'<i class="material-icons right">menu</i></span>'+
             '   <p>'+check+'<label for="'+id+'">Resolvido</label>'+
             '     </p>'+
             '</div>'+
             '<div class="card-reveal">'+
             '   <span class="card-title grey-text text-darken-4 date-post">'+date_post+'<i class="material-icons right">close</i></span>'+
             '   <p class="description-post">'+texto+'</p>'+
             '</div>'+
          '</div>';

          $(document).ready(function(){//insere template do card com dados, tratar para receber de parametro quantos cards
          //entra com parametro de quantos cards por pagina - falta tratar isso
               $(".card_insert").append(div_card);

          });

     });
});
