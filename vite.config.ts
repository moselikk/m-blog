import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import presets from './presets/presets';

// eslint-disable-next-line no-control-regex
const INVALID_CHAR_REGEX = /[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

// https://vitejs.dev/config/
export default defineConfig((env) => {
  // env 环境变量
  const viteEnv = loadEnv(env.mode, process.cwd());

  return {
    base: viteEnv.VITE_BASE,
    // 插件
    plugins: [presets(env)],
    // 别名设置
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'), // 把 @ 指向到 src 目录去
      },
    },
    // 服务设置
    server: {
      host: true, // host设置为true才可以使用network的形式，以ip访问项目
      port: 2500, // 端口号
      open: true, // 自动打开浏览器
      cors: true, // 跨域设置允许
      strictPort: true, // 如果端口已占用直接退出
      // 接口代理
      proxy: {
        '/api': {
          // 本地 8000 前端代码的接口 代理到 8888 的服务端口
          target: 'http://localhost:8888/',
          changeOrigin: true, // 允许跨域
          rewrite: (path) => path.replace('/api/', '/'),
        },
      },
    },
    build: {
      // 禁用 gzip 压缩大小报告，提高构建性能
      reportCompressedSize: false,
      // 规定触发警告的 chunk 为 2000kbs
      chunkSizeWarningLimit: 2000,
      // 指定混淆器为 Esbuild
      minify: 'esbuild',
      // 指定生成静态资源的存放路径
      assetsDir: 'static/assets',
      rollupOptions: {
        output: {
          // 打包后文件名去除 _ 解决 Gitpags 404
          sanitizeFileName(fileName) {
            const match = DRIVE_LETTER_REGEX.exec(fileName);
            const driveLetter = match ? match[0] : '';
            return driveLetter + fileName.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '');
          },
          // 静态资源打包到dist下的不同目录
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        // 全局引入了 scss 的文件
        scss: {
          additionalData: `
          @import "@/assets/styles/variables.scss";
        `,
          javascriptEnabled: true,
        },
      },
    },
  };
});
