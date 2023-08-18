// Colocar Coziha Online

// Criar um servidor WebSocket
let SOCKET_KITCHEN_ON = false;
const SOCKET_KITCHEN = new WebSocket("ws://localhost:3000");
SOCKET_KITCHEN.onopen = (event) => {
  SOCKET_KITCHEN_ON = true;
  console.log("Cozinha Conectada");
};

setTimeout(function() {
  doLoginKitchenSocket()

  SOCKET_KITCHEN.onmessage = function(mensagem) {
    var dados = JSON.parse(mensagem.data);
    doSocketActions(JSON.parse(mensagem.data))
    console.log(dados);
  };
}, 500);




function doLoginKitchenSocket() {
  if (SOCKET_KITCHEN_ON) {
    SOCKET_KITCHEN.send(`{"action":"login","params":{"table":"kitchen"}}`)
  }
}

function doSocketActions(mensagem) {
  const order = null;
  switch (mensagem.action) {
    case 'loginAnswer':
      alert("Cozinha Online");
      break;
    case 'newOrder':
      document.getElementById("order-list").innerHTML +=
        `<li class="lead text-light mb-4"><span>${mensagem.params.table}</span> | Item: <span>${mensagem.params.item}</span> | QTD: <span>${mensagem.params.quantity}</span> 
        <button class="btn btn-primary" onclick="updateStatus(this.parentElement, this.value)" value="Preparando">Preparando</button> 
        <button class="btn btn-success" onclick="updateStatus(this.parentElement, this.value)" value="Pronto">Pronto</button>
        <button class="btn btn-danger" onclick="updateStatus(this.parentElement, this.value)" value="Cancelado">Cancelar</button></li>`
      ;
      alert("Novo Pedido Recebido")
      break;
  }
}

// Atualizar status do pedido
function updateStatus(element, status) {
  const childElements = element.children
  const tableName = childElements[0].textContent;
  const itemName = childElements[1].textContent;
  const quantity = childElements[2].textContent;

  SOCKET_KITCHEN.send(`{"action":"statusOrder","params":{"tableName": "${tableName}", "item": "${itemName}", "status": "${status}", "quantity": "${quantity}"}}`);

  if (status === "Cancelado") {
    element.remove();
  }
}