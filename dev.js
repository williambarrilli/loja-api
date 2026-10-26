// Para rodar localmente: npm run dev
const app = require("./src/app");
const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`Loja API em http://localhost:${porta}`));
