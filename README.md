<h1 align="center"> Menu Ravin </h1>

<p align="center">
Aplicação Web que desenvolvi para disciplina de HTML/CSS/Javascript +Devs2Blu 2023.
</p>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licença">Licença</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=49AA26&labelColor=000000">
</p>

<br>
<p align="center">
   <img alt="Menu Ravin" src=""
  width="80%">
</p>

## 🚀 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- HTML/CSS
- Javascript
- Bootstrap 4.6

## 💻 Projeto

O Menu Ravin  Se trata de uma aplicação de menu de Restaurante, o Menu Ravin, onde o cliente registra a mesa que está sentado e em seguida pode efetuar os pedidos dos itens que deseja consumir. Ao fazer o pedido o item é mandado para a dashboard da cozinha onde o cozinheiro pode ir atualizando o status do pedido até o mesmo esteja pronto para o cliente consumir. Também é feita a gestão da comanda, calculando o valor total, até o cliente decidir fechar sua comanda e ir embora do restaurante.

A aplicação faz uso do Websocket, para manter um servidor e notificar os vários estados dentre os objetos. No caso desta aplicação eu identifiquei o servido websocket como sendo o sujeito, a página de pedidos e da dashboard da cozinha como sendo objetos. Tanto a página de pedidos e a dashboard da cozinha possuem uma instância do servidor websocket e precisam estar logadas no servidor para se comunicarem entre si. Quando é feito um novo pedido(observador), a página de pedido envia um evento para o servidor(sujeito) que possui o método de 
adicionar um novo pedido e o mesmo notifica a dashboard a cozinha e um novo pedido é criado. Da mesma forma quando o cozinheiro atualiza o status do pedido para pronto, por exemplo, a dashboard da cozinha(observador) envia um evento de atualização de status para o servidor(sujeito) e este por sua vez notifica a página de pedido(observador) fazendo a atualização do status do pedido para pronto para que o garçom leve o item para o cliente consumir.


##  Licença

Esse projeto está sob a licença MIT.

<p>
  Deploy: 
</p>
---

