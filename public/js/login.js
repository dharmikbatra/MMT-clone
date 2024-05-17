import { showAlert } from "./alerts"

export const login = async (email,password) => {
    try{
        const res = await axios({
            method:'post',
            url:'http://localhost:3000/api/v1/users/login',
            data:{
                email,
                password
            }
        })
        // document.cookie = `jwt=${temp.data.token};max-age10080min`
        if(res.data.status === 'success'){
            showAlert('success', "Logged in successfully !!")
            window.setTimeout(() => {
                location.assign('/')
            }, 1000)
        }
    }catch(err){
        showAlert('error', err.response.data.message)
    }
}

export const logout = async () => {
    try{
        const res = await axios({
            method:'get',
            url:'http://localhost:3000/api/v1/users/logout'
        })
        if (res.data.status === 'success'){
            location.reload(true)
        }
    }catch(err){
        console.log(err)
    }
}