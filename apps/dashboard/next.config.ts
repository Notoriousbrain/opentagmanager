/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@otm/api", "@otm/ui", "@otm/*", "@osstag/*"],
};

module.exports = nextConfig;
