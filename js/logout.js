  const btnLogout = document.getElementById('btnLogout');

  //evento de logout
btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser==null){
        console.log(firebaseUser);
        window.location.href = "login.html";
    }
})
