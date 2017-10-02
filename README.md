## 简介

一个基于[webpack](http://webpack.js.org)的开发脚手架，帮助快速构建工程。你可以用它来**开发一个web网站**。  


## 功能

考虑到开发工程时所需要的各种功能，本工具提供：

1. 基于webpack的强大模块化工程；
2. [babel](http://babeljs.io)实时编译，随时随地**ES2015 and beyond**；
3. 集成`webpack-dev-middleware`+`webpack-hot-middleware`，实现本地http服务，开发实时预览、热加载；
4. 样式文件独立提取打包；
5. 文件打包压缩；
6. 可选的sourcemap；
7. 集成mock与proxy功能；
...


## 命令

### 开发

```shell
npm run dev
```

### 打包

```shell
npm run build
```

文件将被打包到`dist`目录下。


## 配置

配置文件为`build/setting.js`，分`dev`与`build`以及**公共配置**三部分内容：

```javascript
{
  alias: {},
  build: {
    vendor: [],
    publicPath: './',
    sourceMap: true
  },
  dev: {
    proxyTable: {},
    mockTable: {}
  }
}
```

### build

打包相关的配置：

选项 | 含义
---- | ----
vendor | 公共模块提炼打包，如`jQuery`、`lodash`等
publicPath | 资源的发布路径，如cdn
sourceMap | 是否生成sourceMap


### dev

开发相关的配置：

选项 | 含义
---- | ----
port | http服务端口号
nativeNotifier | 桌面错误提示
proxyTable | 代理配置
mockTable | 假数据配置

**proxyTable**演示：

```javascript
var url = require('url')
var proxyTable = {
  '/h5': url.parse('https://appweb.lizhi.fm/h5')
}
```

配置完毕，重启服务，试着访问[http://localhost:8080/h5/getH5SubscribeList?pageNum=1](http://localhost:8080/h5/getH5SubscribeList?pageNum=1)：

```json
{
  "rcode": 6,
  "msg": "no login",
  "ret": null,
  "opt": null
}
```

> 参考：[proxy-middleware](https://github.com/gonzalocasas/node-proxy-middleware)


**mockTable**演示：

```javascript
var mockTable = {
  '/mock': (req, res) => {
    res.json(succ({
      id: 10086,
      name: 'Jack'
    }))
  }
}

function succ(data, msg = 'ok', status = 0) {
  return {
    status, data, msg
  }
}

function fail(data, msg = 'error', status = 1) {
  return {
    status, data, msg
  }
}
```

配置完毕，重启服务，试着访问[http://localhost:8080/mock](http://localhost:8080/mock)：

```json
{
  "status": 0,
  "data": {
    "id": 10086,
    "name": "Jack"
  },
  "msg": "ok"
}
```

> 更完整的内容参考：[expressjs](http://www.expressjs.com.cn/4x/api.html#app.use)


### 公共配置

选项 | 含义
---- | ----
resolve | 解析模块请求的选项，参考[webpack configuration](https://webpack.js.org/configuration/resolve/)


### 其他

除了`build/setting.js`之外，开发者还可以手动对webpack的配置进行修改，比如添加`loader`、`plugin`等等，配置文件为`build/config.js`。


## 参考文献

- [webpack官方文档](http://webpack.js.org/)
- 设计上部分借鉴了[vuejs-templates/webpack](https://github.com/vuejs-templates/webpack)




