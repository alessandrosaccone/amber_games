const bcrypt = require('bcryptjs');

const PASSWORD_HASH = '$2b$10$OYRQ8DAkLZEdXfYZgvdTHu0VNvRJFYP/Z25A7IbNSyDJobAIZElZa';

const passwordToCheck = process.argv[2];

if (!passwordToCheck) {
    console.log('Per favore fornisci una password come argomento. Esempio: node checkPassword.js "tuapassword"');
    process.exit(1);
}

bcrypt.compare(passwordToCheck, PASSWORD_HASH).then(match => {
    if (match) {
        console.log('✅ PASSWORD CORRETTA! Questa password corrisponde all\'hash nel server.');
    } else {
        console.log('❌ PASSWORD ERRATA. Questa password NON corrisponde all\'hash nel server.');
    }
}).catch(err => {
    console.error('Errore:', err);
});
