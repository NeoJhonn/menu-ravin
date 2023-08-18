//////////////////////////////WebSocket////////////////////////
// Criar um servidor WebSocket para Mesa
let SOCKET_ON = false;
const SOCKET = new WebSocket("ws://localhost:3000");
SOCKET.onopen = (event) => {
  SOCKET_ON = true;
  console.log("Mesa Conectada");
};

setTimeout(function() {
  if (localStorage.getItem("tableName") !== null) {
  verificarNomeMesa();
  } else {
    alert("Cadaste uma Mesa Primeiro!")
  }

  SOCKET.onmessage = function(mensagem) {
    var dados = JSON.parse(mensagem.data);
    doSocketActions(JSON.parse(mensagem.data))
    console.log(dados);
    };
}, 500);



function doLoginTableSocket(tableName) {

  if (SOCKET_ON) {
      SOCKET.send(`{"action":"login","params":{"table":"table", "tableName": ${tableName}}}`)
  }
}

function doSocketActions(mensagem) {
  switch (mensagem.action) {
    case 'loginAnswer':
      alert("Mesa Online");
      break;
    case 'statusOrder':
      console.log("Item atualizado: "+ mensagem.params.item +" "+mensagem.params.status)
      showLastItemOrder(mensagem);
      alert("Status do Pedido atualizado")
      break;
  }
}

///////////////////////////////////////////////////////////////
const url = "https://64ba853e5e0670a501d65019.mockapi.io/ravin-menu/items"

fetch(url)
  .then((dados) => { return dados.json() })
  .then((data) =>  { montarHTML(data) })

function montarHTML(itensMenu) {
    const divInitial = document.getElementById("div-menuItens")
    var textHtml = ""

    itensMenu.map(function(item) {//usando map para percorrer o array de itens
        textHtml += 
        `<div class="col-4 itens-menu" data-category="${item.categoria}">
          <h3>${item.nome}</h3>
          <p>${item.descricao}</p>
          <div class="image-container rounded-lg" style="background-image: url(assets/${item.imagem});"></div>
          <div><p><strong>Valor: R$ ${item.valor.replace(".", ",")}</strong></p></div>
          <input type="number" name="qtd-${item.id}" class="form-control mb-2 w-50" min="1">
          <button class="btn btn-primary w-50" onclick='fazerPedido(${JSON.stringify(item)})'>Fazer Pedido</button>
        </div>`
    })

    //class="class="btn-abrirModal" data-toggle="modal" data-target="#modalPedido"

    // Exibir na página os items
    divInitial.innerHTML = textHtml
}

function fazerPedido(item) {
  const qtdItemByName = document.getElementsByName(`qtd-${item.id}`)
  const qtdItem = qtdItemByName[0].value

  
  if (qtdItem !== "" && Number(qtdItem) >= 1) {
    if (localStorage.getItem("tableName") !== null) {
      //cria um atributo quatidade 
      item['quantidade'] = qtdItem
      animacaoFazerPedido(true, qtdItemByName[0])

      const confirmado = confirm(`Confirmar! \n Pedido de ${qtdItemByName[0].value} ${item.nome}?`) //retorna um boolean

      // Se confirmar o pedido
      if (confirmado) {
        // enviar pedido via web
        SOCKET.send(`{"action":"newOrder","params":{"table":${localStorage.getItem('tableName')}, "item": "${item.nome}", "value": ${item.valor}, "quantity": ${item.quantidade}, "status": "Solicitado"}}`);
        //salvar o status do pedido
        localStorage.setItem("orderStatus", "Solicitado") 
        

        salvarUltimoPedido(item)
        salvarHistoricoPedidos(item)
        atualizarValorTotal(item)
        addItemsOrdeList(item)
        //limpar o campo quantidade
        qtdItemByName[0].value = ""
        animacaoFazerPedido(false, qtdItemByName[0])
      }

      //limpar o campo quantidade
      qtdItemByName[0].value = ""
    } else {
      alert("Não há mesa cadastrada, cadastre uma antes de fazer um pedido!")
    }
  } else {
    alert("Informe uma quantidade maior ou igual a 1 para fazer o pedido!")
  }
}

function animacaoFazerPedido(abriAnimacao, elementoInicial) {
  //animar dive do protudo que estamos fazendo o pedido
  const elementoChave = elementoInicial.parentNode;

  if(abriAnimacao) {
    // FadeIn
    elementoChave.classList.add("fade-in")
    elementoChave.classList.remove("fade-out")
  } else {
    // FadeOUt
    elementoChave.classList.add("fade-out")
    elementoChave.classList.remove("fade-in")
  }
}


function salvarUltimoPedido(pedido) {
  localStorage.setItem("lastOrder", JSON.stringify(pedido))

}

function salvarHistoricoPedidos(pedido) {
  //se o hitórico estiver vazio
  if (localStorage.getItem("orderHistory") === null){
    historicoPedidos = {items: []}
  } else {
    historicoPedidos = JSON.parse(localStorage.getItem("orderHistory"))
  }
  
  //adicionar o pedido no array
  historicoPedidos.items.push(pedido)

  // salvar no localStorage
  localStorage.setItem("orderHistory", JSON.stringify(historicoPedidos))

}

function filtrarItensMenu(elemento, categoria) {
  removerClasseAtivo(elemento) 
  const itensMenu = document.getElementsByClassName("itens-menu")

  for (itemMenu of itensMenu) {
    // remover as categorias que não são as que eu cliquei
    if (itemMenu.getAttribute("data-category") === categoria) {
      itemMenu.classList.remove("inactive")
    } else {
      itemMenu.classList.add("inactive")
    }
  }
  removerClasseAtivo(elemento) 
}

function selecionarTodosItems(elemento) {
  removerClasseAtivo(elemento) 
  const itensMenu = document.getElementsByClassName("itens-menu")

  for (itemMenu of itensMenu) {
    itemMenu.classList.remove("inactive")
  } 
  removerClasseAtivo(elemento) 
}

function removerClasseAtivo(elemento) {
  const elementosAtivos = document.getElementsByClassName("active")

  for (elementoAtivo of elementosAtivos) {
    elementoAtivo.classList.remove("active")
  }
  
  elemento.parentNode.classList.add("active")//pegar o elemento pai no caso o li adicionar a classe "active"
}

let pedidos ="";
function atualizarValorTotal(pedido) {
  const htmlValorTotal = document.getElementById("valor-total");
  
  var valorTotal = 0;
  
  if (htmlValorTotal.textContent !== "") {
    valorTotal = Number(htmlValorTotal.textContent.replace(",", "."));
  }

  htmlValorTotal.textContent = (valorTotal + (pedido.quantidade * pedido.valor)).toFixed(2).replace(".", ",")
}

function addItemsOrdeList(pedido) {
  let valor = (pedido.valor * 1).toFixed(2).replace(".", ",");
  
  pedidos = `<p style="font-size: 18px; margin-left: 10px;" id="itens-pedidos-Comanda">Pedido: ${pedido.nome} - QTD: ${pedido.quantidade} - Valor Unitário: ${valor}</p>`;
  const htmlListaPedidos = document.getElementById("lista-pedidos");
  htmlListaPedidos.innerHTML += pedidos
}

function cadastrarMesa() {
  const nomeMesa = document.getElementById("input-mesa").value
  localStorage.setItem("tableName", JSON.stringify(nomeMesa))

  verificarNomeMesa()
}

function gerenciarMesa(nomeMesa) {
  // escoder input e botão da mesa
  const elementosParaEsconder = document.getElementsByClassName("add-mesa")
  for (elemento of elementosParaEsconder) {
    elemento.classList.add("inactive")
  } 

  const textoNomeMesa = document.getElementById("nomeMesa")
  textoNomeMesa.textContent = JSON.parse(nomeMesa);
}

function verificarNomeMesa() {
  const nomeMesaCadastrada = localStorage.getItem('tableName')

  if (nomeMesaCadastrada !== undefined && nomeMesaCadastrada !== null && nomeMesaCadastrada !== "null") {
    doLoginTableSocket(nomeMesaCadastrada)

    const textoNomeMesa = document.getElementById("nomeMesa")
    textoNomeMesa.textContent = nomeMesaCadastrada.replaceAll('"','');
    gerenciarMesa(nomeMesaCadastrada)
  }
}

let textoModalItem = "";
function showLastItemOrder(mensagem) {
  // // Abrir Modal
  // var modalPedido = document.getElementById('modalPedido');
  // // Adicionar o evento 'shown.bs.modal' e sua função de callback
  // modalPedido.addEventListener('shown.bs.modal', function() {
  //   // Selecione o botão com a classe 'btn-abrirModal'
  //   var btnAbrirModal = document.querySelector('.btn-abrirModal');
  
  //   // Dispare o evento de foco no botão
  //   btnAbrirModal.focus();
  // });
  ///////////////////////////

  textoModalItem += `<p clas="lead" style="font-size: 17px;">Pedido: ${mensagem.params.item} - QTD: ${mensagem.params.quantity} - Status: ${mensagem.params.status}</p>`;

  document.getElementById("itens-pedidos").innerHTML = textoModalItem;
}


function refazerPedido() {
  const ultimoPedido = JSON.parse(localStorage.getItem("lastOrder"))

}

function fecharComanda() {
  // Limpar a api de orders do mockApi
  const url= "https://64ba853e5e0670a501d65019.mockapi.io/ravin-menu/orders";
  fetch(url)
  .then((dados) => { return dados.json() })
  .then((data) =>  { connectToAPI(data) })

  // Limpar Modal Comandas
  const htmlListaPedidos = document.getElementById("lista-pedidos");
  const htmlValorTotal = document.getElementById("valor-total");
  htmlListaPedidos.innerHTML = null;
  htmlValorTotal.textContent = "";

  // Limpar localStorage
  localStorage.clear();

  alert("Comanda fechada com sucesso!")
}

async function connectToAPI(itemsToDelete) {

  itemsToDelete.map(await function(item) {//usando map para percorrer os itens
  // Limpar a api de orders do mockApi
   const url= "https://64ba853e5e0670a501d65019.mockapi.io/ravin-menu/orders";
    fetch(`${url}/${item.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  })
  .catch(error => {
    console.error('Error deleting items:', error);
  });
  })
}

