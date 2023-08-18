#!/usr/bin/env node


/*Iniciando o WebSocket*/
// no gitbash execulte o comando: node ravinWebSocketServer.js
//const webSocket = new WebSocket("ws://localhost:3000")---> no console do navegador

/*webSocket.onmessage = function(mensagem) {
  var dados = JSON.parse(mensagem.data);
  console.log(dados);
  }; */

// faça o login
//websocket.send('{"action":"login","params":{"table":"kitchen"}}') ---> na  cozinha
//websocket.send('{"action":"login","params":{"table":"table"}}') ---> na mesa(em dois consoles)
//websocket.send('{"action":"statusOrder","params":{"table":"${('tableName')}", "item": "${item.id}", "status": "${item.status}"}}')


// pra fazer um pedido
///websocket.send('{"action":"newOrder","params":{"table":"${('tableName')}", "item": "${item.id}", "value": "${item.valor}", "quantity": "${item.quantidade}"}}')


//const websocket = new WebSocket("ws://localhost:3000", "kitchen")---> segunda parâmetro vc escolha o cliente


// npm i websocket / npm i http / node ravinWebSocketServer(para iniciar o servidor)
var WebSocketServer = require('websocket').server;
var http = require('http');
//var fetch = import("node-fetch");

//var clientsConnected = [];
var tablesConnected = [];
var kitchenConnected = {};
var orders = [];

//Cria o server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Recebida requisição para ' + request.url);
    response.writeHead(404);
    response.end();
});

//Inicia o server
server.listen(3000, function() {
    console.log((new Date()) + ' WebSocket Server rodando na porta 3000');
});

//Monta o objeto do tipo WebSocketServer
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//Criptografa a requisição e faz o handshake (sinceramente não sei como esse método funciona)
wsServer.on('upgrade', function (req, socket) {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.end('HTTP/1.1 400 Bad Request');
        return;
    }
    const acceptKey = req.headers['sec-websocket-key'];
    const hash = generateAcceptValue(acceptKey);
    const responseHeaders = [ 'HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}` ];

    const protocol = req.headers['sec-websocket-protocol'];
    const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());
    if (protocols.includes('json')) {
        responseHeaders.push(`Sec-WebSocket-Protocol: json`);
    }

    socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
});

//Leitura das requests para o websocket
wsServer.on('request', function(request) {

    var connection = request.accept();
    tablesConnected.push(connection);

    //Quando recebe mensagem
    connection.on('message', function(message) {

        if (message.type === 'utf8') {
            try {
                var data = JSON.parse(message.utf8Data);
            } catch (e) {
                message = formatMessage("erro", 'Formato da mensagem inválido, as mensagens devem ser no formato JSON e devem seguir o padrão de formatação, exemplo: {"action":"nomeDoMetodo","params":{"parametro":"1"}}');
                connection.sendUTF(message);
                console.log('Formato da mensagem inválido, as mensagens devem ser no formato JSON e devem seguir o padrão de formatação, exemplo: {"action":"nomeDoMetodo","params":{"parametro":"1"}}');
                return;
            }

            const action = data.action;
            switch(action) {
                case "login":
                    doLogin(data.params, connection);
                    answerMessage = formatMessage("loginAnswer", 'success');
                    console.log(answerMessage)
                    connection.sendUTF(answerMessage);
                    break;
                case "helloKitchen":
                    message = formatMessage("helloKitchen", {"table": data.params.table, "message": "Hello Kitchen"});
                    kitchenConnected.sendUTF(message);
                    console.log("Mensagem enviada para a COZINHA, pela MESA " + data.params.table);
                    break;
                case "helloClient":
                    const tableConnection = getConnectionByTable(data.params.tableName);
                    message = formatMessage("helloClient", {"message": "Hello Client"});
                    tableConnection.sendUTF(message);
                    console.log("Mensagem enviada para a MESA "+ data.params.table +", pela COZINHA");
                    break;
                case "newOrder":
                    const resultRequest = sendRequestOrder(data.params);
                    resultRequest
                        .then(() => {
                            
                            addNewTableOrder(data.params);
                            console.log(data)
                            message = formatMessage("newOrder",{"table": data.params.table, "item": data.params.item, "value": data.params.value, "quantity": data.params.quantity, "status": data.params.status});
                            console.log(message)
                            //console.log(kitchenConnected)
                            kitchenConnected.sendUTF(message);
                            console.log("Pedido da " + data.params.table + " enviado a COZINHA");
                        })
                        .catch((error) => {
                            const messagem = formatMessage("rollBackOrder", data.params.item);
                           // connection.send(mesagem);
                            console.log(error);
                            console.log(messagem);
                        });
                        break;
                case "statusOrder":
                    const tableConnectionStatus = getConnectionByTable(data.params.tableName);
                    message = formatMessage("statusOrder", {"tableName": data.params.tableName, "item": data.params.item, "status": data.params.status, "quantity": data.params.quantity});
                    tableConnectionStatus.sendUTF(message);
                    console.log("Alterando status pedido para "+ data.params.status);
                    break;
            }
        }
    });
});

function getIndexByConnection(connection) {
  let index;
  tablesConnected.forEach(function(valor, chave) {
    if (connection == valor) {
      index = chave;
    }
  });

  return index;
}



function getConnectionByTable(tableName) {
    let index = 0
    for (table of tablesConnected) {
        
        if (table['table'] === tableName) {
            return table;
        }
        index ++
    }
}

async function sendRequestOrder(order) {
    console.log(order)
    const urlAPI = "https://64ba853e5e0670a501d65019.mockapi.io/ravin-menu/orders";
    const request = await fetch(urlAPI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order)
    })
    
    return request.json();
}

function addNewTableOrder(order) {
    orders[order.table] = [order.id];
    orders[order.table][order.id] = order;
}

function doLogin(table, connection) {
    var index = getIndexByConnection(connection);
    if (index === false) {
        let mensagem = formatMessage("erro", "Erro ao efetuar login");
        connection.sendUTF(mensagem);
        console.log('Erro ao efetuar login, MESA ' + table);
    } else {
        if (table.table === "kitchen") {
            kitchenConnected = connection;
            console.log("Cozinha online")
        } else {
            if (table.table === "table"){
            tablesConnected[index]['table'] = table.tableName;
            console.log(table.tableName + " online");
            } 
        }

        
    }
}

function 
formatMessage(action, data) {
	
    let mensagem;

    switch(action) {
        case 'erro':
            //
        case 'loginAnswer':
            mensagem = {"action":action,"params":{"msg":data}};
            break;
        case 'helloKitchen':
            //
        case 'helloClient':
            mensagem = {"action": action, "params": {"table": data.table, "msg": data.message}}
            break;
        case 'newOrder':
            mensagem = {"action": action, "params": data};
            break;
        case 'statusOrder':
            mensagem = {"action": action, "params": {"tableName": data.tableName, "item": data.item, "status": data.status, "quantity": data.quantity}};
            break;
        case 'rollBackOrder':
            mensagem = {"action": action, "params": {"item": data}};
            break;
    }

    return JSON.stringify(mensagem);
}




