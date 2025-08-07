import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: 'amitnegi6341@gmail.com', // Replace with your verified sender
    subject,
    html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email sent:', response[0].statusCode);
  } catch (error) {
    console.error('Email send error:', error.response?.body || error.message);
    throw error;
  }
};
