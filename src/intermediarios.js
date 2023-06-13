const express = require('express');
const fs = require('fs/promises');

const validaSenhaBanco = (req, res, next) => {

    const { senha_banco } = req.query;

    if(senha_banco !== 'Cubos123Bank'){
        return res.status(401).json({mensagem: "Senha incorreta, digite novamente"}) 
    }else{
        next();
    }
    
}

const verificaEmailECpfRepetido = async (req, res, next) => {

    const { cpf, email } =  req.body;

    try{

        const lerBanco = await fs.readFile('./src/bancodedados.json');
        const jsonBanco = await JSON.parse(lerBanco);
    
        const procuraCpf = jsonBanco.contas.filter((conta)=>{
          return conta.usuario.cpf === cpf;
  
        });

        const procuraEmail = jsonBanco.contas.filter((conta)=>{
          return conta.usuario.email === email;

        });
  
        if(procuraCpf.length !== 0 && procuraEmail.length !== 0){
          return res.status(400).json({mensagem:"O CPF e o e-mail já possuem cadastro."});
        } else if(procuraCpf.length !== 0){
          return res.status(400).json({mensagem:"O CPF já possui cadastro."});
        } else if(procuraEmail.length !== 0){
          return res.status(400).json({mensagem:"O e-mail já possui cadastro."});
        } else{
            next();
        }
  
      }catch(erro){
        return res.json(erro)
      }
  
   }  

module.exports = {

    validaSenhaBanco,
    verificaEmailECpfRepetido
}