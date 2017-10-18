var config = {
    apiKey: "AIzaSyBiMgfyZ_izdFKLDl05vftWixxaS6xKIyM",
    authDomain: "app-agua-utfpr.firebaseapp.com",
    databaseURL: "https://app-agua-utfpr.firebaseio.com",
    projectId: "app-agua-utfpr",
    storageBucket: "app-agua-utfpr.appspot.com",
    messagingSenderId: "142712018169"
  };
  firebase.initializeApp(config);

// variaveis do login
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');

//evento de login no botao
btnLogin.addEventListener('click', e => {
    //pega email e password
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email,password);
    promise.catch(e => console.log(e.message));
    
    
})
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
        console.log(firebaseUser);
        window.location.href = "principal.html";
    }
    else{
        console.log("Não está logado");
    }
})