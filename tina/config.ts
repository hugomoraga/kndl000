import { defineConfig } from "tinacms";
import type { Collection, Template } from "tinacms";

// Configuración base
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

// Campos comunes reutilizables - usando 'as const' para preservar tipos literales
const commonFields = {
  title: {
    type: "string" as const,
    name: "title",
    label: "Title",
    isTitle: true,
    required: true,
  },
  image: {
    type: "image" as const,
    name: "image",
    label: "Image",
  },
  date: {
    type: "datetime" as const,
    name: "date",
    label: "Date",
  },
  body: {
    type: "rich-text" as const,
    name: "body",
    label: "Body",
    isBody: true,
  },
} as const;

// Helper para crear campos comunes
function createCommonFields(fields: Array<keyof typeof commonFields>) {
  return fields.map(field => ({ ...commonFields[field] }));
}

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },
  media: {
    tina: {
      mediaRoot: "assets/media/images",
      publicFolder: "./",
    },
  },
  
  schema: {
    collections: [
      {
        name: "diario",
        label: "✶ Diario",
        path: "content/collections/_posts",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
          },
          ...createCommonFields(["title", "image", "body"]),
          {
            type: "datetime" as const,
            name: "date",
            label: "Publish Date",
            required: true,
          },
        ],
      },
      {
        name: "poemas",
        label: "ↂ Poemas",
        path: "content/collections/_poems",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["poems"],
          },
          ...createCommonFields(["title", "image", "date", "body"]),
          {
            type: "string" as const,
            name: "series",
            label: "Series",
          },
        ],
      },
      {
        name: "melange_reports",
        label: "☽ Melange Reports",
        path: "content/collections/_melange_reports",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["poems", "default"],
          },
          ...createCommonFields(["title", "image", "date", "body"]),
          {
            type: "string" as const,
            name: "series",
            label: "Series",
          },
        ],
      },
      {
        name: "vestigios",
        label: "⚱ Vestigios",
        path: "content/collections/_vestigios",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
          },
          ...createCommonFields(["title", "image", "date", "body"]),
        ],
      },
      {
        name: "imagenes",
        label: "◉ Imágenes",
        path: "content/collections/_images",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["imagen"],
          },
          { ...commonFields.title },
          {
            type: "image" as const,
            name: "image",
            label: "Image",
            required: true,
          },
          {
            type: "string" as const,
            name: "caption",
            label: "Caption",
          },
          {
            type: "string" as const,
            name: "alt",
            label: "Alt Text",
          },
          { ...commonFields.body },
        ],
      },
      {
        name: "fragmentos",
        label: "☍ Fragmentos",
        path: "content/collections/_fragmentos",
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              // Generar automáticamente el nombre basado en fecha/hora
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const day = String(now.getDate()).padStart(2, '0');
              const hour = String(now.getHours()).padStart(2, '0');
              const minute = String(now.getMinutes()).padStart(2, '0');
              const second = String(now.getSeconds()).padStart(2, '0');
              
              // Formato: fragmento-YYYYMMDD-HHMMSS (se ordena cronológicamente)
              return `fragmento-${year}${month}${day}-${hour}${minute}${second}`;
            },
          },
        },
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
            required: false,
            ui: {
              component: "hidden",
            },
          },
          {
            type: "object" as const,
            name: "lineas",
            label: "Líneas del Fragmento",
            list: true,
            fields: [
              {
                type: "string" as const,
                name: "linea",
                label: "Línea",
              },
            ],
            ui: {
              itemProps: (item) => {
                return { label: item?.linea || "Nueva línea" };
              },
              defaultItem: {
                linea: "",
              },
            },
          },
          {
            type: "datetime" as const,
            name: "date",
            label: "Fecha",
            required: false,
            ui: {
              component: "hidden",
            },
          },
        ],
      },
      {
        name: "spotify_playlists",
        label: "🎵 Spotify Playlists",
        path: "content/collections/_spotify_playlists",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
            required: false,
            ui: {
              component: "hidden",
            },
          },
          {
            type: "string" as const,
            name: "title",
            label: "Título de la Playlist",
            required: true,
          },
          {
            type: "string" as const,
            name: "description",
            label: "Descripción",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string" as const,
            name: "spotify_id",
            label: "Spotify Playlist ID",
            description: "ID de la playlist de Spotify (ej: 2W7MsN6moBf3dRoVzEFGCd)",
            required: true,
          },
          {
            type: "string" as const,
            name: "genre",
            label: "Género/Tags",
            description: "Ej: Dark Disco / Tribal Techno / EBM",
          },
          {
            type: "datetime" as const,
            name: "date",
            label: "Fecha",
            required: false,
            ui: {
              component: "hidden",
            },
          },
        ],
      },
      {
        name: "youtube_setlists",
        label: "🎛️ YouTube Setlists",
        path: "content/collections/_youtube_setlists",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
            required: false,
            ui: {
              component: "hidden",
            },
          },
          {
            type: "string" as const,
            name: "title",
            label: "Título del Set",
            required: true,
          },
          {
            type: "string" as const,
            name: "artist",
            label: "Artista/DJ",
          },
          {
            type: "string" as const,
            name: "youtube_id",
            label: "YouTube Video ID",
            description: "ID del video de YouTube (ej: QNS9RGB1GWg)",
            required: true,
          },
          {
            type: "string" as const,
            name: "event",
            label: "Evento/Lugar",
            description: "Ej: Live at Fabric 2023",
          },
          {
            type: "datetime" as const,
            name: "date",
            label: "Fecha",
            required: false,
            ui: {
              component: "hidden",
            },
          },
        ],
      },
      {
        name: "personal_music",
        label: "🎧 Música Personal",
        path: "content/collections/_personal_music",
        format: "md",
        fields: [
          {
            type: "string" as const,
            name: "layout",
            label: "Layout",
            options: ["default"],
            required: false,
            ui: {
              component: "hidden",
            },
          },
          {
            type: "string" as const,
            name: "title",
            label: "Título del Track",
            required: true,
          },
          {
            type: "string" as const,
            name: "artist",
            label: "Artista",
          },
          {
            type: "string" as const,
            name: "spotify_url",
            label: "URL de Spotify",
            description: "URL completa del track en Spotify",
          },
          {
            type: "string" as const,
            name: "youtube_url",
            label: "URL de YouTube",
            description: "URL completa del video en YouTube",
          },
          {
            type: "string" as const,
            name: "type",
            label: "Tipo",
            options: ["track", "videoclip"],
            default: "track",
          },
          {
            type: "datetime" as const,
            name: "date",
            label: "Fecha",
            required: false,
            ui: {
              component: "hidden",
            },
          },
        ],
      },
    ],
  },
});
