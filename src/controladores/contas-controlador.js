const fs = require('fs/promises');
const { format } = require('date-fns');
let { indexConta, existeConta, verificaSenhaConta, jsonParse } = require('../validadores');

 const listarContas = async (req, res) => {

    try{

      const jsonBanco = await jsonParse();

      res.status(200).json(jsonBanco.contas);

    }catch(erro){
      return res.json(erro)
    }

 }

 const criarConta = async (req, res) => {

    const { nome ,cpf, data_nascimento, telefone, email, senha } =  req.body;

    try{

      const lerBanco = await fs.readFile('./src/bancodedados.json');
      const jsonBanco = await JSON.parse(lerBanco)
   
      let qtdClientes  = jsonBanco.contas.length;
      // let idCliente = 1;
      let indexUltimaConta = jsonBanco.contas.length -1;
      let numero = 0;
      console.log(indexUltimaConta)

      if(qtdClientes <= 0){
         numero = 1;
      } else{
        numero = jsonBanco.contas[indexUltimaConta].numero + 1;
      }
   
      jsonBanco.contas.push({

         numero,
         saldo: 0,
         usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
         }

      })

      const strinfyBanco = JSON.stringify(jsonBanco, null, 2);

      await fs.writeFile('./src/bancodedados.json', strinfyBanco);

      res.status(201).json('Conta cadastrada');

    } catch(erro){
      return res.json(erro);
    }

 }

 const alterarConta = async (req, res) => {

   const { nome, cpf, data_nascimento, telefone, email, senha} = req.body
   const { numeroConta } = req.params;

   try{

      const index = await indexConta(numeroConta,req,res);
      const existe = await existeConta(numeroConta,req,res);

      
    
      const lerBanco = await fs.readFile('./src/bancodedados.json');
      const jsonBanco = await JSON.parse(lerBanco);

      if(existe){
            if(nome || cpf || data_nascimento || telefone || email || senha){

               nome !== '' ? jsonBanco.contas[index].usuario.nome = nome : '';
               cpf !== '' ? jsonBanco.contas[index].usuario.cpf = cpf : '';
               data_nascimento !== '' ? jsonBanco.contas[index].usuario.data_nascimento = data_nascimento : '';
               telefone !== '' ? jsonBanco.contas[index].usuario.telefone = telefone : '';
               email !== '' ? jsonBanco.contas[index].usuario.email = email : '';
               senha !== '' ? jsonBanco.contas[index].usuario.senha = senha : ''; 

               const sprifyBanco = JSON.stringify(jsonBanco, null, 2);

               await fs.writeFile('./src/bancodedados.json', sprifyBanco)

               res.status(200).json({mensagem:"Dados alterados com sucesso"})

            } else{
               return res.json({mensagem:"Nenhum valor identificado! Escolha algum dos seguintes campos para alterar: Nome, CPF, Data de nascimento, Telefone, E-mail ou Senha"});
         } 
      } else{
        return  res.status(404).json({mensagem:"Conta não encontrada"});
      }

   } catch(erro){
      return res.json(erro);
   }

 }

 const deletarConta = async (req, res) => {

      const { numeroConta } = req.params;

      const existe = await existeConta(numeroConta,req,res);
      if(!existe){
         return res.status(404).json({mensagem:"Conta não encontrada"})
      }
      const index = await indexConta(numeroConta, req, res);

      try{

         const lerBanco = await fs.readFile('./src/bancodedados.json');
         const jsonBanco = await JSON.parse(lerBanco);

         if(jsonBanco.contas[index].saldo <= 0){
            const deleteConta = jsonBanco.contas.filter((conta)=>{
               return conta.numero !== Number(numeroConta);
            });
   
            jsonBanco.contas = deleteConta;

            const sprifyBanco = JSON.stringify(jsonBanco, null, 2);
            await fs.writeFile('./src/bancodedados.json', sprifyBanco);
   
            return res.status(200).json({mensagem:"Conta excluída com sucesso!"});
         } else{
            return res.status(404).json({mensagem:"Sem possibilidade de apagar! Conta com saldo superior a R$ 0,00"});
         }

       }catch(erro){
         return res.json(erro);
       }
   
    }  

    const depositar = async (req, res)=>{

      const { numeroConta, valor } = req.body;

      try{
         const index = await indexConta(numeroConta, req, res);
         const lerBanco = await fs.readFile('./src/bancodedados.json');
         const jsonBanco = await JSON.parse(lerBanco);

         const existe = await existeConta(numeroConta,req,res);
         if(!existe){
         return res.status(404).json({mensagem:"Conta não encontrada"});
         }

         if(!numeroConta || !valor){
            return res.status(400).json({mensagem:"Ausência do número da conta ou valor, ambos campos devem ser preenchidos. Verifique novamente, por favor"});
         } 

         if(valor > 0){
            jsonBanco.contas[index].saldo += valor;
            const data = new Date();
            const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss");
            jsonBanco.depositos.push({
               data: dataFormatada,
               numeroConta,
               valor
            });
            const sprifyBanco = JSON.stringify(jsonBanco, null, 2);
            await fs.writeFile('./src/bancodedados.json', sprifyBanco);
            return res.status(200).json({mensagem:`Deposito de ${valor} realizado com sucesso`})
         }

      } catch(erro){
         return res.json(erro);
      }
    }


    const sacar = async (req, res) => {

      const { numeroConta, valor, senha } = req.body;

      try{

         const lerBanco = await fs.readFile('./src/bancodedados.json');
         const jsonBanco = await JSON.parse(lerBanco);
         const index = await indexConta(numeroConta, req, res);

         const existe = await existeConta(numeroConta,req,res);
         if(!existe){
         return res.status(404).json({mensagem:"Conta não encontrada"});
         }

         if(!numeroConta || !valor || !senha){
            return res.status(400).json({mensagem:"Ausência do número da conta, valor ou senha. Todos esses campos devem ser preenchidos. Verifique, por favor"});
         } 

            const verificaSenha = await verificaSenhaConta(numeroConta, senha, req, res);
            if(verificaSenha){
            if(jsonBanco.contas[index].saldo >= valor){
               jsonBanco.contas[index].saldo -= valor;
               const data = new Date();
               const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss");
               jsonBanco.saques.push({
                  data: dataFormatada,
                  numeroConta,
                  valor
               });
               const sprifyBanco = JSON.stringify(jsonBanco, null, 2);
               await fs.writeFile('./src/bancodedados.json', sprifyBanco);
               return res.status(200).json({mensagem:`Saque de ${valor} realizado com sucesso`});
            }else{
               return res.status(400).json({mensagem:`Valor do saque maior do que o valor do saldo.Saque não realizado`});
            }
         } else{
            return res.status(400).json({mensagem:`Senha incorreta`});
         }
         

      } catch(erro){
         return res.json(erro);
      }

    }

      const transferir = async (req, res) =>{

        
         const { numeroConta, senha, valor, numeroContaDestino } = req.body;

         if(!numeroConta || !senha || !valor || !numeroContaDestino){
            return res.status(400).json({mensagem:"Ausência de algum dos campos. Todos esses campos devem ser preenchidos. Verifique, por favor"});
         }

         try{
          
            const lerBanco = await fs.readFile('./src/bancodedados.json');
            const jsonBanco = await JSON.parse(lerBanco);
          
            const existe = await existeConta(numeroConta,req,res);
            const existeContaDestino = await existeConta(numeroContaDestino,req,res);
            const indexContaOrigem = await indexConta(numeroConta,req,res);
            const indexContaDestino = await indexConta(numeroContaDestino,req,res);


            if(!existe && !existeContaDestino){
               return res.status(404).json({mensagem:"Contas de origem e destino não encontradas"});
            } else if(!existe){
               return res.status(404).json({mensagem:"Conta de origem não encontrada"});
            } else if(!existeContaDestino){
               return res.status(404).json({mensagem:"Conta de destino não encontrada"});
            }  

            const verificaSenha = await verificaSenhaConta(numeroConta, senha, req, res);
            if(!verificaSenha){
               return res.status(404).json({mensagem:"Senha incorreta"})
            }

            if(jsonBanco.contas[indexContaOrigem].saldo < valor){
               return res.status(404).json({mensagem:"Saldo insuficiente para a transação"});
            } else{
               jsonBanco.contas[indexContaOrigem].saldo -= valor;
               jsonBanco.contas[indexContaDestino].saldo += valor;

               const dataOrigem = new Date();
               const dataFormatadaOrigem = format(dataOrigem, "yyyy-MM-dd HH:mm:ss");
               jsonBanco.transferencias.transferenciasEnviadas.push({
                  data: dataFormatadaOrigem,
                  numero_conta_origem: numeroConta,
                  numero_conta_destino: numeroContaDestino,
                  valor
               });

               const dataDestino = new Date();
               const dataFormatadaDestino = format(dataDestino, "yyyy-MM-dd HH:mm:ss");
               jsonBanco.transferencias.transferenciasRecebidas.push({
                  data: dataFormatadaDestino,
                  numero_conta_origem: numeroConta,
                  numero_conta_destino: numeroContaDestino,
                  valor
               });

               const sprifyBanco = JSON.stringify(jsonBanco, null, 2);
               await fs.writeFile('./src/bancodedados.json', sprifyBanco);
               return res.status(200).json({mensagem:`Transferência de ${valor} feita da conta ${numeroConta} para a conta ${numeroContaDestino}`});
            }

         }catch(erro){
            return res.json(erro);
         }

      }  

      const saldo = async (req, res) => {

         const { numero_conta, senha} = req.query;

         try{
             if(!numero_conta && !senha){
               return res.status(404).json({mensagem:"Digite o numero da conta e a senha"})
             } else if(!numero_conta){
               return res.status(404).json({mensagem:"Digite o numero da conta"})
             }else if(!senha){
               return res.status(404).json({mensagem:"Digite a senha"})
             }

            const existe = await existeConta(numero_conta,req,res);
            if(!existe){
            return res.status(404).json({mensagem:"Conta não encontrada"});
            }

            const index = await indexConta(numero_conta,req,res);

            const lerBanco = await fs.readFile('./src/bancodedados.json');
            const jsonBanco = await JSON.parse(lerBanco);

            const verificaSenha = await verificaSenhaConta(numero_conta, senha, req, res);
            if(!verificaSenha){
               return res.status(404).json({mensagem:"Senha incorreta"})
            } else{
               res.status(200).json(`Saldo: ${jsonBanco.contas[index].saldo}`)
            }

         } catch(erro){
            return res.json(erro);
         }

      }


      const extrato = async (req, res)=> {

         const { numero_conta, senha} = req.query;
      

         try{

            const lerBanco = await fs.readFile('./src/bancodedados.json');
            const jsonBanco = await JSON.parse(lerBanco);

             if(!numero_conta && !senha){
               return res.status(404).json({mensagem:"Digite o numero da conta e a senha"})
             } else if(!numero_conta){
               return res.status(404).json({mensagem:"Digite o numero da conta"})
             }else if(!senha){
               return res.status(404).json({mensagem:"Digite a senha"})
             }

         
            const existe = await existeConta(numero_conta,req,res);
            if(!existe){
            return res.status(404).json({mensagem:"Conta não encontrada"});
            }    

            const depositos = jsonBanco.depositos.filter(deposito =>{
               return deposito.numeroConta === 1;
            });

            const saques = jsonBanco.saques.filter(saque =>{
               return saque.numeroConta === 1;
            });

          

            const verificaSenha = await verificaSenhaConta(numero_conta, senha, req, res);
            if(!verificaSenha){
               return res.status(404).json({mensagem:"Senha incorreta"})
            } else{

               const depositos = jsonBanco.depositos.filter(deposito =>{
                  return deposito.numeroConta === Number(numero_conta);
               });
               const saques = jsonBanco.saques.filter(saque =>{
                  return saque.numeroConta === Number(numero_conta);
               });

               const transferenciasEnviadas = jsonBanco.transferencias.transferenciasEnviadas.filter(transferencia =>{
                  return transferencia.numero_conta_origem === Number(numero_conta);
               });

               const transferenciasRecebidas = jsonBanco.transferencias.transferenciasRecebidas.filter(transferencia =>{
                  return transferencia.numero_conta_destino === Number(numero_conta);
               });
            
               return res.status(200).json({depositos, saques, transferenciasEnviadas, transferenciasRecebidas});

            }
            
         } catch(erro){
            return res.json(erro);

         }
         
      } 


      

 module.exports = {
    listarContas,
    criarConta,
    alterarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato,
   
 }