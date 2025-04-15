const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendVerificationCode = async (phoneNumber, code) => {
  try {
    await client.messages.create({
      body: `Tu código de verificación KidsTube es: ${code}`,
      messagingServiceSid: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`Código enviado a ${phoneNumber}`);
  } catch (error) {
    console.error('Error enviando SMS:', error);
    throw new Error('Error al enviar el código SMS');
  }
};