var config = {
    apiKey: "AIzaSyAaiobOgYPey-2zhvXCt6XOyZutpBBpml4",
    authDomain: "appaguas-utfpr.firebaseapp.com",
    databaseURL: "https://appaguas-utfpr.firebaseio.com",
    projectId: "appaguas-utfpr",
    storageBucket: "",
    messagingSenderId: "7612106731"
  };
  firebase.initializeApp(config);

// variaveis do login
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const persistentLogin = document.getElementById('persistentLogin')

//evento de login no botao
btnLogin.addEventListener('click', e => {
    //pega email e password
    const email = txtEmail.value;
    const password = txtPassword.value;
    console.log(persistentLogin.checked);

    if(persistentLogin.checked){
        // Caixa de verificação marcada (login persistente)
        const promise = firebase.auth().signInWithEmailAndPassword(email,password);
        promise.catch(error => {
            window.alert("Usuário ou senha incorretos.");
            console.log(error.message);  
        })  
    }
    else{
        // Caixa de verificação não marcada (login por sessão)
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function() {
        // Logout ao fechar a página
        return firebase.auth().signInWithEmailAndPassword(email, password);
        })
        .catch(function(error) {
            window.alert("Usuário ou senha incorretos.");
            console.log(error.message); 
        });
    }
})

// apertar enter para logar
document.addEventListener('keypress', function(enter){
    if(enter.which == 13){
       btnLogin.click();
    }
 }, false);
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
        console.log(firebaseUser);
        window.location.href = "principal.html";
    }
    else{
        console.log("Não está logado");
    }
})

