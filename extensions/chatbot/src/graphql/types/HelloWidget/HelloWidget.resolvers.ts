export default {
  Query: {
    helloWidget(_, { settings }) {
      return {
        text: settings?.text || "Hello, world!",
        className: settings?.className || "",
      };
    },
  },
};
