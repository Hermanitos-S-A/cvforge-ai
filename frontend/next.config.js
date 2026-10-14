/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [{source: "/api/:path*", destination: `${process.env.INTERNAL_API_ORIGIN || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "http://backend:8000")}/api/:path*`}];
  },
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    // Next 14 emits inline hydration scripts; use nonce-based CSP in the next
    // hardening increment before removing 'unsafe-inline' from script-src.
    const csp = [
      "default-src 'self'", "object-src 'none'", "frame-ancestors 'none'",
      "base-uri 'self'", "form-action 'self'", "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
      "connect-src 'self'", `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    ].join("; ");
    return [{source: "/:path*", headers: [
      {key: "Content-Security-Policy", value: csp},
      {key: "X-Content-Type-Options", value: "nosniff"},
      {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
      {key: "X-Frame-Options", value: "DENY"},
      {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()"},
      ...(dev ? [] : [{key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains"}]),
    ]}];
  },
};
module.exports = nextConfig;
