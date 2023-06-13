const express = require('express');
const app = express();
const router = require('./rotas');
const port = 3000;

app.use(express.json());
app.use(router);


app.listen(port, ()=>{
    console.log(`Servidor iniciado na porta ${port}`);
});

