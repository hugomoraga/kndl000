import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },
  media: {
    tina: {
      mediaRoot: "assets/images",
      publicFolder: "./",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "diario",
        label: "✶ Diario",
        path: "_posts",
        format: "md",
        fields: [
          {
            type: "string",
            name: "layout",
            label: "Layout",
            default: "default",
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
          },
          {
            type: "datetime",
            name: "date",
            label: "Publish Date",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "poemas",
        label: "ↂ Poemas",
        path: "_poems",
        format: "md",
        fields: [
          {
            type: "string",
            name: "layout",
            label: "Layout",
            default: "poems",
            options: ["poems", "default"],
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
          },
          {
            type: "string",
            name: "series",
            label: "Series",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "vestigios",
        label: "⚱ Vestigios",
        path: "_vestigios",
        format: "md",
        fields: [
          {
            type: "string",
            name: "layout",
            label: "Layout",
            default: "default",
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "imagenes",
        label: "◉ Imágenes",
        path: "_images",
        format: "md",
        fields: [
          {
            type: "string",
            name: "layout",
            label: "Layout",
            default: "imagen",
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
            required: true,
          },
          {
            type: "string",
            name: "caption",
            label: "Caption",
          },
          {
            type: "string",
            name: "alt",
            label: "Alt Text",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
