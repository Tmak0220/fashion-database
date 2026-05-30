import type { NextConfig } from "next"

const nextConfig: NextConfig = {

  images: {

    remotePatterns: [
      {
        protocol: "https",

        hostname:
          "pub-cbac5457ba7f4798b615bfeb837627d3.r2.dev",
      },
    ],

  },

}

export default nextConfig