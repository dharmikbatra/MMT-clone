import { login, logout } from "./login"
import '@babel/polyfill'
import { displayMap } from "./mapbox"
import { updateSettings } from "./updateSettings"
import { bookTour } from "./stripe"

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutButton = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')

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
        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])

        console.log(form)

        await updateSettings(form, 'data')
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

if(bookBtn){
    bookBtn.addEventListener('click', async e => {
        e.target.textContent = 'Processing...'
        const tourId = e.target.dataset.tourId // data-tour-id banaya hai html mein, it converts to dataset.tourId
        await bookTour(tourId)
        e.target.textContent = 'Book Tour Now!'
    })
}


