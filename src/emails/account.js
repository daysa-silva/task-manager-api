const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function sendWelcomeEmail(email, name) {
    sgMail.send({
        to: email,
        from: 'daysa.silva@ibm.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

function sendCancelationEmail(email, name) {
    sgMail.send({
        to: email,
        from: 'daysa.silva@ibm.com',
        subject: `Goodbye,  ${name}`,
        text: `We're are sad to know that you're leaving. Let me know why you didn't using Task Manager API anymore.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}