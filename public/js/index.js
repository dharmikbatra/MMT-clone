import { login, logout } from "./login"
import '@babel/polyfill'
import { displayMap } from "./mapbox"

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logOutButton = document.querySelector('.nav__el--logout')

if (mapBox){
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations)
}

if(loginForm){
    loginForm.addEventListener('submit', async e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        await login(email,password)
    })
}

if(logOutButton){
    logOutButton.addEventListener("click", logout)
}