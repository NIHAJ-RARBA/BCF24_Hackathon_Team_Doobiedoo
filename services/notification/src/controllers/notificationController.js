// const nodemailer = require('nodemailer');

// const sendEmail = async (req, res) => {
//   const { email, subject, message } = req.body;

//   // Create a Nodemailer transporter using Gmail's SMTP server
//   let transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_SECURE === 'true', // Use true for 465, false for 587
//     auth: {
//       user: process.env.EMAIL_USER, // Your real email address
//       pass: process.env.EMAIL_PASS  // Your email password or App Password
//     }
//   });

//   // Email options
//   let mailOptions = {
//     from: process.env.EMAIL_USER,  // Sender address
//     to: email,                     // Recipient address
//     subject: subject,              // Subject line
//     text: message                  // Plain text body
//   };

//   // Send email
//   transporter.sendMail(mailOptions, (error, info) => {

//     console.log('email', email);
//     console.log('subject', subject);
//     console.log('message', message);

//     if (error) {
//       console.error(error);
//       return res.status(500).send('Error sending email');
//     }
//     console.log(`Email sent: ${info.response}`);
//     res.status(200).send('Email sent successfully');
//   });
// };

// module.exports = { sendEmail };



const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  const { email, subject, message } = req.body;

  // Create a Nodemailer transporter using 'streamTransport' to mock email sending
  let transporter = nodemailer.createTransport({
    streamTransport: true, // No actual emails will be sent
    buffer: true           // Emails will be buffered and logged instead
  });

  // Email options
  let mailOptions = {
    from: 'test@example.com',  // You can keep this static since it's a test
    to: email,
    subject: subject,
    text: message
  };

  // Send email (actually logs it instead of sending)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error processing email');
    }
    console.log(info.message.toString());  // Log the email message details
    res.status(200).send('Email processed successfully');
  });
};

module.exports = { sendEmail };
