const express = require('express');
const { listarContas, criarConta, alterarConta, deletarConta, depositar, sacar, transferir, saldo, extrato } = require('./controladores/contas-controlador');
const { validaSenhaBanco, verificaEmailECpfRepetido } = require('../src/intermediarios')
const router = express.Router();

router.get('/contas', validaSenhaBanco, listarContas);
router.post('/contas', verificaEmailECpfRepetido, criarConta);
router.put('/contas/:numeroConta/usuario', verificaEmailECpfRepetido, alterarConta);
router.delete('/contas/:numeroConta', deletarConta);
router.post('/transacoes/depositar', depositar);
router.post('/transacoes/sacar', sacar);
router.post('/transacoes/transferir', transferir);
router.get('/conta/saldo', saldo);
router.get('/contas/extrato', extrato);




module.exports = router;