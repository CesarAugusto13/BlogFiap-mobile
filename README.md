EducaOn Mobile - Aplicação de Blogging Dinâmico
Descrição

EducaOn Mobile é a versão mobile da aplicação de blogging dinâmico voltada para professores e estudantes, desenvolvida como parte do Tech Challenge do curso. O aplicativo permite criar, editar, visualizar e administrar postagens, além de realizar autenticação exclusiva para professores. A navegação é totalmente adaptada para dispositivos móveis, oferecendo uma experiência fluida e moderna.

Funcionalidades

Listagem de posts com busca por palavras-chave (título, conteúdo e autor)

Visualização detalhada de posts

Cadastro e login de professores com autenticação JWT

Criação, edição e exclusão de postagens via área administrativa

Listagem, edição e remoção de professores

Drawer Navigation com exibição do nome do professor logado

Atualização automática das telas ao retornar (focus effect)

Interface adaptada 100% para dispositivos móveis

Tecnologias Utilizadas

Mobile: React Native (Expo), TypeScript

Navegação: React Navigation (Stack Navigator + Drawer Navigator)

Back-end: Node.js (API REST já implementada)

Comunicação: Axios para chamadas HTTP

Autenticação: JWT (JSON Web Tokens)

Armazenamento: AsyncStorage para token e dados do usuário

Outros: Animated API para animações, ActivityIndicator para carregamento

Estrutura do Projeto
/educaon-mobile
├── /src
│   ├── /screens
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── PostScreen.tsx
│   │   ├── AdminPostsScreen.tsx
│   │   ├── ProfessoresListScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── EditPostScreen.tsx
│   │   └── CreateProfessorScreen.tsx
│   ├── /components
│   │   └── AnimatedPostCard.tsx
│   ├── /navigation
│   │   ├── AppNavigator.tsx
│   │   └── DrawerNavigator.tsx
│   ├── /api
│   │   └── apiClient.ts
│   └── App.tsx
├── package.json
├── app.json
└── README.md

Como Rodar o Projeto Localmente
Pré-requisitos

Node.js (versão 18 ou superior recomendada)

Expo CLI instalado globalmente:

npm install -g expo


Back-end Node.js rodando com os endpoints REST disponíveis (verificar repositório do back-end: https://github.com/CesarAugusto13/BlogFiap
)

Passos

Clone o repositório:

git clone https://github.com/CesarAugusto13/educaon-mobile.git
cd educaon-mobile


Instale as dependências:

npm install
# ou
yarn install


Configure a URL base da API em:

src/api/apiClient.ts


Inicie o app:

npx expo start


Abra no dispositivo:

App Expo Go (Android/iOS)

Emulador Android

iOS Simulator (macOS)

Arquitetura da Aplicação

O app utiliza Stack Navigation para fluxo principal e Drawer Navigation para menu lateral.

Após o login, o nome e email do professor são exibidos no Drawer.

Todas as requisições autenticadas enviam o token JWT via header.

A barra de busca da Home faz filtro inteligente por título, conteúdo e autor.

Telas administrativas só ficam disponíveis após login.

A UI é atualizada automaticamente quando a tela volta ao foco (useFocusEffect).

Guia de Uso
Login

Professores realizam autenticação com email e senha.
Após sucesso:

Token JWT é salvo no AsyncStorage

Drawer é atualizado

Usuário é redirecionado para a Home

Home

Exibe todos os posts

Barra de pesquisa dinâmica

Cards animados com resumo do conteúdo

Post Detalhado

Exibe título, conteúdo, autor e data formatada

Administração

Apenas para professores logados:

Criar post

Editar post

Excluir post

Listar professores

Criar professor

Editar professor

Remover professor

Desafios e Experiências

Integração completa entre mobile e API em Node.js

Navegação avançada com Drawer sincronizado com autenticação

Busca dinâmica otimizada com debounce

Tratamento de erros em tempo real com feedback visual

Implementação de autenticação persistente com AsyncStorage

Tornar toda experiência fluida e responsiva em dispositivos móveis

Contato

Para dúvidas ou sugestões, entre em contato:

Nome: César Augusto de Oliveira Santos

Email: cesiha13@gmail.com

GitHub: https://github.com/CesarAugusto13
