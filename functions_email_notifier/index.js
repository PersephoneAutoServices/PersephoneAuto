const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// const { onRequest } = require("firebase-functions/v2/https");
// const { logger } = require("firebase-functions");

admin.initializeApp();

// Use Firebase Functions config for secure credentials
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

exports.notifyShop = functions.firestore
  .document("serviceRequests/{docId}")
  .onCreate((snap, context) => {
    const data = snap.data();

    // Safe defaults to prevent undefined errors
    const {
      name = 'N/A',
      email = 'N/A',
      phone = 'N/A',
      serviceType = 'N/A',
      description = 'N/A',
      vinImageUrl = 'None'
    } = data;

    const mailOptions = {
      from: `Persephone Automotive <${gmailEmail}>`,
      to: gmailEmail,
      subject: `New Service Request: ${serviceType}`,
      html: `
        <h2>New Service Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>VIN Image:</strong> 
          ${vinImageUrl !== 'None' ? `<a href="${vinImageUrl}" target="_blank">View Image</a>` : 'None'}
        </p>
      `
    };

    return transporter.sendMail(mailOptions)
      .then(() => console.log("📨 Email sent to shop"))
      .catch((error) => console.error("❌ Error sending email:", error));
  });