import nodemailer from "nodemailer";

async function sendMail(message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.PASSWORD,
    },
  });

  const mailOption = {
    from: process.env.GMAIL_USER,
    to: process.env.EMAIL,
    subject: process.env.EMAIL_SUBJECT,
    html: message,
  };

  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Message Sent Successfully!");
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

export default sendMail;
