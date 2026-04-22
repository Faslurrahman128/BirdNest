const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send credentials to a newly registered or existing staff member
 * @param {Object} staff - Staff object from DB
 * @param {string} rawPassword - The plain text password to send
 */
const sendCredentialEmail = async (staff, rawPassword) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/StaffLogin`;
  
  const mailOptions = {
    from: `"Bird Nest Admin" <${process.env.EMAIL_USER}>`,
    to: staff.email,
    subject: `Welcome to Bird Nest - Your Staff Credentials`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e7ef; border-radius: 12px; background-color: #fcfdfe;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #1a237e; margin-bottom: 5px;">Bird Nest</h1>
          <p style="color: #4b79a1; font-weight: 600; margin: 0;">Access Control Management</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="color: #232946; font-size: 1.25rem; margin-top: 0;">Welcome, ${staff.name}!</h2>
          <p style="color: #4a5568; line-height: 1.6;">Your staff account has been successfully created by the administrator. You can now log in to the High-Performance Staff Portal using the following credentials:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a237e;">
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Official Email Address</p>
            <p style="margin: 4px 0 12px 0; color: #1a237e; font-weight: 600;">${staff.email}</p>
            
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Temporary Access Pass</p>
            <p style="margin: 4px 0 0 0; color: #1a237e; font-weight: 600; font-family: monospace; letter-spacing: 1px;">${rawPassword}</p>
          </div>

          <div style="margin: 25px 0; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
            <h3 style="color: #232946; font-size: 1rem; margin-top: 0;">Quick Start Guide:</h3>
            <ul style="color: #4a5568; font-size: 0.9rem; padding-left: 20px; line-height: 1.5;">
              <li>Log in using the button below.</li>
              <li>Manage property requests in your personalized dashboard.</li>
              <li>Access real-time property statistics.</li>
              <li>Always log out securely after your session.</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="background-color: #1a237e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: 700; display: inline-block; transition: background 0.3s ease;">Secure Portal Login</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 25px; color: #8898aa; font-size: 0.8rem;">
          <p>For security reasons, please change your password after your first login.</p>
          <p>&copy; ${new Date().getFullYear()} Bird Nest Management. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Credentials sent to ${staff.email} successfully.`);
    return true;
  } catch (error) {
    console.error(`[MAILER ERROR] Failed to send email to ${staff.email}:`);
    console.error(`- Response: ${error.response}`);
    console.error(`- Code: ${error.code}`);
    console.error(`- Command: ${error.command}`);
    return false;
  }
};

module.exports = { sendCredentialEmail };
