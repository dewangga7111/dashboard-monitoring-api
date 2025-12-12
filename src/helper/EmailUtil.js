const nodeMailer = require('nodemailer')

const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    }
})

const SendEmail = async (to, subject, body, isHtml = false) => {    
    const emailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,        
    }
    if(isHtml) {
        emailOptions.html = body
    } else {
        emailOptions.text = body
    }
        
    const result = await transporter.sendMail(emailOptions)
    // console.log(result)
}

module.exports = { SendEmail }