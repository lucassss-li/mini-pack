# webpack流程
## 一、启动流程
## 1、运行webpack/bin/webpack.js
- 判断是否安装脚手架工具
- 运行对应的脚手架工具
## 2、运行webpack-cli/bin/cli.js
- 获取\处理命令行参数,生成编译选项options
- 创建compiler对象
- 调用compiler.run开始打包

## 二、创建compiler对象
- 实例化compiler对象
- 挂载NodeEnvironmentPlugin，使compiler具备读写文件能力
- 挂载配置文件中的plugin至compiler
- 依据配置项挂载内置plugins至compiler