const nodemailer = require('nodemailer')
const pug = require('pug')

const htmlToText = require('html-to-text')
const nodemailerSendgrid = require('nodemailer-sendgrid')

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url
        this.from= `Dharmik Batra <${process.env.EMAIL_FROM}`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                host:process.env.BREVO_HOST,
                port:process.env.BREVO_PORT,
                auth:{
                    user:process.env.BREVO_USERNAME,
                    pass:process.env.BREVO_PASSWORD
                }
                // need to activate "less secure app" option
            })
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
            // need to activate "less secure app" option
        })
    }

    async send(template, subject){
        // send the actual mail
        // render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName:this.firstName,
            url:this.url,
            subject
        })

        // define email options
        const mailOptions = {
            from:this.from,
            to:this.to,
            subject,
            html
            // text:htmlToText.convert(html)
            // html:
            
        }
        console.log("hi2")
        console.log(process.env.NODE_ENV)
        await this.newTransport().sendMail(mailOptions)
        // create a transport and send email
    }

    async sendWelcome(){
        this.send('Welcome', 'Welcome to the family!!')
    }

    async sendPasswordReset(){
        await this.send(
            'passwordReset',
            'Your password reset token (valid for 10 minutes only)'
        )
    }
}


// const sendEmail = async options => {
    
//     // define options for email
    

//     // actually send the mail
//     await transporter.sendMail(mailOptions)
// }

// module.exports = Email