const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendVerificationEmail = async (email, name, token) => {
    const verificationLink = `http://127.0.0.1:8080/verify.html?token=${token}`;


    const sendSmtpEmail = {
        to: [{ email, name }],
        sender: { name: 'TuApp', email: 'mjjm02112002@gmail.com' },
        subject: 'Verifica tu cuenta',
        htmlContent: `
            <h2>Hola ${name},</h2>
            <p>Gracias por registrarte. Verifica tu cuenta haciendo clic aquí:</p>
            <a href="${verificationLink}">Verificar cuenta</a>
        `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
};
