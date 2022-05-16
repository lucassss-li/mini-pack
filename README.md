# webpack主流程
## 一、启动流程
## 1、运行webpack/bin/webpack.js
- 判断是否安装脚手架工具
- 运行对应的脚手架工具
## 2、运行webpack-cli/bin/cli.js
- 获取\处理命令行参数,生成编译选项options
- 创建compiler对象
- 调用compiler.run开始打包

