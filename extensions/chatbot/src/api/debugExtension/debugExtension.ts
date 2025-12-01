// @ts-nocheck
export default function debugExtension(request, response) {
  const routes = [];
  const extensionInfo = {
    name: 'chatbot',
    version: '1.0.0',
    loaded: true,
    routes: routes,
    message: 'Chatbot extension is loaded and running'
  };
  
  response.status(200);
  response.json(extensionInfo);
}

