const fs = require('fs/promises');


const verificaEmailECpfRepetido = async (cpf, email, req, res) => {

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
      }


    }catch(erro){
      return res.json(erro)
    }

 }  

 const indexConta = async (numeroConta, req, res) => {

    try{

      const lerBanco = await fs.readFile('./src/bancodedados.json');
      const jsonBanco = await JSON.parse(lerBanco);

      const procuraIndexConta = jsonBanco.contas.findIndex((conta)=>{

        return conta.numero === Number(numeroConta);

      });


      return procuraIndexConta

    } catch(erro){
      return console.log(erro);
    }
   
 }

 const existeConta = async (numeroConta, req, res) => {

  try{

    const lerBanco = await fs.readFile('./src/bancodedados.json');
    const jsonBanco = await JSON.parse(lerBanco);

    const existeConta = await jsonBanco.contas.filter((conta)=>{

      return conta.numero === Number(numeroConta);

    });

    if(existeConta <= 0)
      return false;
    else{
      return true;
    }

  } catch(erro){
    return res.json(erro);
  }
}

  const verificaSenhaConta = async (numeroConta, senha, req, res)=>{

    const lerBanco = await fs.readFile('./src/bancodedados.json');
    const jsonBanco = await JSON.parse(lerBanco);

    const index = await indexConta(numeroConta, req, res);

    if(jsonBanco.contas[index].usuario.senha !== senha){
      return false
    } else{
      return true
    }

  }


  const jsonParse = async () =>{

    try{
      
      const lerBanco = await fs.readFile('./src/bancodedados.json');
      const jsonBanco = await JSON.parse(lerBanco);

      return jsonBanco;


    }catch(erro){
      return res.json(erro);
    }

  }

    module.exports = {

      verificaEmailECpfRepetido,
      indexConta,
      existeConta,
      verificaSenhaConta,
      jsonParse,
    
    }