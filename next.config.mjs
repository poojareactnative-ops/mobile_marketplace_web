/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gpvyatfnnkrsrckarxbh.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdnlhdGZubmtyc3Jja2FyeGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTEyNzIsImV4cCI6MjEwODg2NzI3Mn0.1v5HSfsgDA-rWVKb6ftLO-fjQg6Cp2y4wtsNp9H9j9A',
  },
};

export default nextConfig;

