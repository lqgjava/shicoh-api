/**
 * Vercel Serverless Function 入口
 * 将 Express 应用导出为 Vercel Function
 */
const app = require('../server');

// Vercel Serverless Function 需要导出 handler
module.exports = app;
