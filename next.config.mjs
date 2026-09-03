/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivado: en desarrollo, StrictMode monta cada componente dos veces,
  // y eso hace que el reconciliador de react-konva adjunte/desadjunte nodos
  // y rompa el arrastre y el Transformer. No afecta a producción.
  reactStrictMode: false,
};

export default nextConfig;
