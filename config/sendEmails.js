const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, template) => {
    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const source = fs.readFileSync(path.resolve(__dirname, template)).toString('utf8');
        const compiledTemplate = handlebars.compile(source, { noEscape: true });
        const options = {
            from: `"MyStoryBook" ${process.env.EMAIL_USERNAME}`,
            to: email,
            subject,
            html: compiledTemplate(payload),
        };
  
        // Send email
        transporter.sendMail(options);
    } catch (error) {
        return error;
    }
};

module.exports = sendEmail;