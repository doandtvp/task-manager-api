const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'doandtvp@gmail.com',
        subject: 'Thanks for joining in!',
        text: 'Welcome to the app, ' + name +'. Let me know more about you.'
    }

    sgMail.send(msg).then(() => {
        console.log('Sending Email!')
    }).catch((e) => {
        console.log(e.response.body)
    })
}

const sendCancelationEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'doandtvp@gmail.com',
        subject: 'Sorry to see go!',
        text: 'Goodbye, ' + name + '. I hope to see you back sometime soon!'
    }

    sgMail.send(msg).then(() => {
        console.log('Succed!')
    }).catch((e) => {
        console.log(e.response.body)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
