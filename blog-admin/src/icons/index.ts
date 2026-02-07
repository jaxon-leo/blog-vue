// 导入所有 svg 图标
const importAll = (requireContext: __WebpackModuleApi.RequireContext) => {
  return requireContext.keys().map(requireContext)
}

try {
  // 导入 svg 目录下的所有 .svg 文件
  const req = require.context('./svg', false, /\.svg$/)
  importAll(req)
} catch {
  // 开发环境下可在此输出图标加载错误
}
