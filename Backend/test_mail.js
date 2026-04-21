const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testMail() {
  console.log('--- Email Connection Test ---');
  console.log(`Using Email: ${process.env.EMAIL_USER}`);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SUCCESS: Connection to mail server established!');
    
    console.log('Sending test message...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Bird Nest SMTP Test',
      text: 'If you are reading this, your email system is working perfectly!',
    });
    console.log('✅ SUCCESS: Test email sent to yourself!');
  } catch (error) {
    console.error('❌ FAILED: Could not connect or send email.');
    console.error('--- Error Details ---');
    console.error(`Code: ${error.code}`);
    console.error(`Response: ${error.response}`);
    console.log('\nCommon Fixes:');
    console.log('1. Ensure you used a GMAIL APP PASSWORD, not your log in password.');
    console.log('2. Ensure 2-Step Verification is ENABLED on your Google Account.');
    console.log('3. Ensure you SAVED your .env file after editing.');
  }
}

testMail();
