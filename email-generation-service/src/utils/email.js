const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(email) {
        this.fromEmail = `Email generator <email-generation@mail.com>`;
        this.toEmail = email;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 587,
            auth: {
                user: "3641f9f28488d4",
                pass: "8c455efa196dbc"
            }
        });
    }

    // Send the actual email
    async send(template, subject, bindingObject) {

        const html = pug.renderFile(`${__dirname}/../templates/${template}.pug`, {
            firstName: this.toEmail,
            ...bindingObject
        });

        const mailOptions = {
            from: this.fromEmail,
            to: this.toEmail,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendLeaveRequest(leaveRequestDetails) {
        await this.send('leave-request', 'Leave request', leaveRequestDetails);
    }

    async sendConfirmation(confirmationDetails) {
        await this.send('confirmation', 'Leave request response', confirmationDetails);
    }
};

module.exports = { Email };