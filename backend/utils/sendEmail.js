const nodemailer = require("nodemailer");
const catchasyncerror = require("../middleware/catchasyncerror");
const Mailgen = require("mailgen");
exports.sendEmail = catchasyncerror(async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  var email = {
    body: {
      name: options.name,
      intro: `Welcome to Shopio! We're very excited to have you on board.\n\n ${options.message}`,
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });

  var emailBody = MailGenerator.generate(email);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    html: emailBody,
  };

  await transporter.sendMail(mailOptions);
});
