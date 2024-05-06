const nodemailer = require('nodemailer')

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
        // need to activate "less secure app" option
    })
    // define options for email
    const mailOptions = {
        from:'Dharmik Batra <batradharmik@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:
    }

    // actually send the mail
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail