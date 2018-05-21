const btnLogout = document.getElementById('btnLogout');
// Botão de logout para mobile
const btnLogout_mobile = document.getElementById('btnLogout_mobile');

// Evento de logout
btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
})

// Evento de logout
btnLogout_mobile.addEventListener('click', e => {
    firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser==null){
        //console.log(firebaseUser);
        window.location.href = "index.html";
    }
})
