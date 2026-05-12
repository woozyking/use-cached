/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    options: {
      showPanel: true,
      storySort: {
        order: ["cached", "*"],
      },
    },
    docs: {
      codePanel: true,
    },
    controls: { disable: true },
    actions: { disable: true },
    interactions: { disable: true },
  },
};

export default preview;
