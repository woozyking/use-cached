/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: "@storybook/react-vite",
  addons: ["@storybook/addon-docs"],
  core: {
    disableTelemetry: true,
  },
};
export default config;
