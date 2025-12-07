📱 EducaOn Mobile – Aplicativo Mobile de Blogging Educacional
📝 Descrição

EducaOn Mobile é a versão mobile do sistema educacional de blogging desenvolvido para professores e estudantes. Esta aplicação permite visualizar posts, pesquisar conteúdos, gerenciar publicações e administrar professores, tudo pelo smartphone.
Faz parte do Tech Challenge da FIAP, integrando React Native com uma API Node.js.

🚀 Funcionalidades
📚 Para Usuários

Exibição de posts com pesquisa por:

título

conteúdo

autor

Visualização completa de cada post

Listagem atualizada em tempo real

Interface simples, fluida e responsiva

🧑‍🏫 Para Professores (área autenticada)

Login e autenticação com JWT

Criação de posts

Edição de posts

Exclusão de posts

Administração de professores

Pesquisa de professores por nome e email

Drawer com o nome do professor autenticado

⚙️ Funcionalidades Gerais

Persistência de sessão com AsyncStorage

Navegação dinâmica com React Navigation

Tratamento completo de erros nas requisições

Animações suaves nas listas

Telas seguras com verificação automática de login

🛠️ Tecnologias Utilizadas
Mobile

React Native (Expo)

React Navigation (Stack + Drawer)

TypeScript

Axios (chamadas HTTP)

AsyncStorage (persistência local)

Animated API para efeitos visuais

Back-end

Node.js + Express

API REST já desenvolvida (professores + posts)

Autenticação com JWT

MongoDB com Mongoose

📁 Estrutura do Projeto
/educaon-mobile
├── /src
│   ├── /screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PostScreen.tsx
│   │   ├── AdminPostsScreen.tsx
│   │   ├── ProfessoresListScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── EditPostScreen.tsx
│   │   └── CreateProfessorScreen.tsx
│   ├── /navigation
│   │   ├── AppNavigator.tsx
│   │   └── DrawerNavigator.tsx
│   ├── /api
│   │   └── apiClient.ts
│   ├── /components
│   │   └── AnimatedPostCard.tsx
│   ├── /utils
│   │   └── auth.ts
│   └── App.tsx
├── package.json
└── README.md

▶️ Como Rodar o Projeto Mobile
Pré-requisitos

Node.js (18+ recomendado)

Expo CLI instalado globalmente:

npm install -g expo


API Node.js rodando localmente (porta padrão exemplo: http://192.168.x.x:3000)

1. Clone o Repositório
git clone https://github.com/CesarAugusto13/educaon-mobile.git
cd educaon-mobile

2. Instale as Dependências
npm install
# ou
yarn

3. Configure a URL da API

No arquivo:

src/api/apiClient.ts


Ajustar:

baseURL: "http://SEU-IP-LOCAL:3000/api",

4. Inicie o App
npx expo start


Você pode abrir no:

Celular (app Expo Go)

Emulador Android

Emulador iOS (no Mac)

🧱 Arquitetura da Aplicação

React Navigation (Stack + Drawer): organização completa de telas

AuthEvents: atualização dinâmica do Drawer após login

AsyncStorage: guarda token, nome e email do professor

Axios: todas as chamadas HTTP com interceptadores opcionais

Busca dinâmica: filtros em tempo real por título, conteúdo, autor e nome do professor

Fluxo protegido: telas administrativas só abrem autenticadas

🧭 Guia de Uso
🔑 Login

Professores entram com email e senha.
Se válido → app recarrega navegação e mostra menu com nome do professor.

📝 Home

Mostra posts

Busca por título, conteúdo e autor

📄 Detalhes do Post

Visualização completa

Atualizações em tempo real

🧑‍🏫 Administração

Criar, editar e excluir posts

Listar e pesquisar professores

Excluir professores

🧩 Desafios & Experiências do Projeto

Integração de app mobile com API Node.js real

Implementação de autenticação JWT no mobile

Manutenção de sessão com AsyncStorage

Criação de Drawer baseado em estado global

Tratamento de erros e feedback visual ao usuário

Animações e UX responsiva

Padronização de telas usando componentes reutilizáveis

Gestão de buscas complexas em listas

📬 Contato

Nome: César Augusto de Oliveira Santos
Email: cesiha13@gmail.com

GitHub: https://github.com/CesarAugusto13

LinkedIn: [(Linkedin)](https://www.linkedin.com/in/c%C3%A9sar-augusto-de-oliveira-santos/)