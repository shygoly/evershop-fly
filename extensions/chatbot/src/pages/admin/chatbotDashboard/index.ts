import { setContextValue } from "@evershop/evershop/graphql/services";

export default (request: any, response: any) => {
  setContextValue(request, "pageInfo", {
    title: "Chatbot Dashboard",
    description: "AI Customer Service Dashboard",
  });
};

