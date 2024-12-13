const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const stompClient = new Client({
  brokerURL: 'ws://localhost:8080/chat',
  webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

stompClient.onConnect = () => {
  console.log('Conectado ao servidor WebSocket.');

  stompClient.subscribe('/topic/messages', message => {
    console.log('Mensagem recebida:', message.body);
  });

  const promptUser = () => {
    rl.question('Digite uma mensagem para enviar: ', input => {
      if (input.toLowerCase() === 'sair') {
        console.log('Encerrando conexão...');
        stompClient.deactivate();
        rl.close();
      } else {
        stompClient.publish({
          destination: '/app/sendMessage',
          body: input,
        });
        console.log('Mensagem enviada:', input);
        promptUser();
      }
    });
  };

  promptUser();
};

stompClient.onStompError = frame => {
  console.error('Erro STOMP:', frame.headers['message']);
  console.error('Detalhes:', frame.body);
};

stompClient.activate();
