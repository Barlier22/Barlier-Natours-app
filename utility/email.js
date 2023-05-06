const nodemailer = require('nodemailer'); //  nodemailer package
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Barlier  Mumpoyi <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV.trim() === 'productio') {
      // some logique
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // activate in gmail less secure app option
    });
  }

  async send(template, subject) {
    // some logique send the actual email
    //1  render HTML Based on the Pug
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2  define some email options

    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    await this.newTransport().sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send('welcome', 'wecome to the notours familly! ');
  }

  async sendResetToken() {
    await this.send('passwordReset', 'Your password token (valid for 10min)');
  }
};

// const sendEmail = async function (options) {
//   // 1 create a transporter
//   const transporter = nodemailer.createTransport({
//     // service: 'Gmail',
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // activate in gmail less secure app option
//   });
//   // 2 define the email options
//   const mailOption = {
//     from: `Barlier Mumpoyi <JsBo@mail.io>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//   };
//   //3 actually send the email
//   await transporter.sendMail(mailOption);
// };
// module.exports = sendEmail;
