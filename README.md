# FATEC-SP-IES-300

Esta aplicação foi desenvolvida visando aprimorar meus conhecimentos sobre a plataforma Firebase, aproveitando um tema proposto nas aulas de Engenharia de Software III da Faculdade de Tecnologia de São Paulo (FATEC-SP).

## Objetivo

Construir um jogo de dominó online multijogador, que deverá possuir:

- [x] Autenticação de usuários
- [x] Perfis de usuários (apelido, preferências, etc.)
- [x] Capacidade de personalização através de um “super usuário”
- [x] Recursos monetizáveis
- [ ] Funcionalidade básica do jogo
- [ ] (Extra) Chat entre jogadores de uma mesma partida

## Arquitetura

Talvez a funcionalidade mais interessante do Firebase seja o [Cloud Firestore](https://youtu.be/QcsAb2RR52c): com ele é possível criar ouvintes de consultas ou documentos (“listeners”) que recebem, automaticamente (através de WebSockets) os dados mais atualizados (“snapshots”).

As bibliotecas disponíveis permitem que esses recursos sejam consumidos diretamente pelo front-end, sem necessidade de uma API ou camada intermediária. Em especial, a versão 9 do SDK do Firestore ajuda a deixar o código enxuto e ao mesmo tempo simples e limpo.

### Sobre múltiplos listeners

A escolha pelo Firebase foi feita levando-se em conta os requisitos relativamente simples do projeto e os limites recomendados da plataforma: em uma partida de dominó, poucos jogadores estão envolvidos e o tabuleiro, bem como as regras do jogo, são simples. Assim, optou-se pela criação dos seguintes listeners globais:

* Jogos que o usuário particia
* Compras realizadas pelo usuário
* Temas disponíveis na loja
* Perfil do usuário
* Autenticação do usuário

Ao entrar em um jogo, são criados os seguintes listeners locais:

* Jogadas
* Peças do jogador
* Perfis dos jogadores na partida

A criação de vários listeners, embora deva ser usada com cuidado, é uma prática incentivada na arquitetura Firebase. Os principais limites do Cloud Firestore são:

* 100 listeners ativos por aplicação
* Taxa de push inferior a 1 documento ou 10 kilibytes por segundo
* No máximo uma atualização por segundo em cada documento

Em todos os casos, um simples jogo de dominó não irá atingir estas taxas.

## Tecnologias

Stack utilizada:

* React
* Firebase Authentication e Cloud Firestore

Ferramentas utilizadas no desenvolvimento:

* Visual Studio Code
* Git

Bibliotecas:

* React Router
* Firebase
* Material UI
* Material UI Icons
