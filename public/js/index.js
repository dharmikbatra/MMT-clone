import { login, logout } from "./login"
import '@babel/polyfill'
import { displayMap } from "./mapbox"
import { updateSettings } from "./updateSettings"

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutButton = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

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

if(userDataForm){
    userDataForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const name = document.getElementById('name').value
        await updateSettings({name, email}, 'data')
        window.setTimeout(() => {
            location.assign('/me')
        }, 300)
    })
}

if(userPasswordForm){
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        document.querySelector('.btn-save-password').innerHTML = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value
        const newPassword = document.getElementById('password').value
        const newPasswordConfirm = document.getElementById('password-confirm').value

        await updateSettings({
            passwordCurrent,
            newPassword,
            newPasswordConfirm
        }, 'password')
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
        document.querySelector('.btn-save-password').innerHTML = 'Save Password'

    })
}



