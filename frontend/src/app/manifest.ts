import type { MetadataRoute } from 'next'

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
    return {
      name: "Substring Tiler",
      short_name: "SubstringTiler",
      description:
        "A tool for comparing two texts and highlighting their similarities/differences.",
      start_url: "index",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "rgb(25, 118, 210)",
      file_handlers: [
        {
          action: "openFile",
          accept: {
            "application/octet-stream": [".tile"],
          },
        },
      ],
      icons: [
        {
          src: "icon.svg",
          sizes: "any",
          type: "image/svg+xml",
        },
      ],
    };
}