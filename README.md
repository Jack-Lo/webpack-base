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
8. 多页面配置；

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
  entries: {
    index: ['./src/index.js']
  },
  resolve: {
    alias: {
      '@': rsv('../src'),
      '@a': rsv('../src/assets')
    },
    extensions: [
      '.js', '.json', '.css'
    ],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  build: {
    pages: {},
    vendor: [],
    publicPath: './',
    sourceMap: true
  },
  dev: {
    pages: {},
    port: 8080,
    nativeNotifier: true,
    proxyTable: {},
    mockTable: {}
  }
}
```

### build

打包相关的配置：

选项 | 含义
---- | ----
pages | 支持配置多个页面
vendor | 公共模块提炼打包，如`jQuery`、`lodash`等
publicPath | 资源的发布路径，如cdn
sourceMap | 是否生成sourceMap


### dev

开发相关的配置：

选项 | 含义
---- | ----
pages | 支持配置多个页面
port | http服务端口号
hmr | 模块热更新
nativeNotifier | 桌面错误提示
proxyTable | 代理配置
mockTable | 假数据配置


> **hmr**默认为`true`，即默认开启，启用此功能时，源码会注入`./build/client.js`文件，而这个文件包含了实现热更新所需要的`websocket`功能，对于不支持`websocket`的客户端（如ie8）来说，此项功能会导致页面报错，从而无法正常进行调试，为了解决这个问题，我们将这个功能提取到配置项当中，并建议在低版本浏览器下调试的时候关闭此功能，以确保开发工作正常进行，当然，这样一来你可能需要在修改了代码之后，手动刷新页面。


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


**pages**的配置：

多页面功能的实现依赖于插件[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)，所以配置也跟该插件的配置项对齐：

```javascript
{
  pages: {
    index: { // 以下配置与html-webpack-plugin对齐
      filename: 'index.html',
      template: 'index.html',
      chunks: ['runtime', 'vendor', 'index'],
      inject: true,
      title: 'index'
    }
  }
}
```

稍微有一点不同的是，由于**html-webpack-plugin**与**html-loader**两者同时存在时，出现的一些相互影响，导致前者不能正常使用模板功能，如title的设置，以上的配置项`title`其实不会生效。

针对这一问题，我们对其做了一些功能扩展，使得该模板功能重新生效，为此我们修改了title的传入方式，使用**tplArgs**这一配置项，来包含所有需要注入的参数：

```javascript
{
  pages: {
    index: { // 以下配置与html-webpack-plugin对齐
      filename: 'index.html',
      template: 'index.html',
      chunks: ['runtime', 'vendor', 'index'],
      inject: true,
      tplArgs: {
        title: 'index'
      }
    }
  }
}
```

在页面上我们可以这样来使用：

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  ...
</body>
</html>
```

模板引擎使用的是[lodash](https://lodash.com)。

另外， 你可能注意到我们显式地指明了`chunks`，这也是为了更好地支持多页面的复杂需求。

- **runtime**是webpack的运行时
- **vendor**是公共包
- **index**是当前页面对应的入口

这里面我们做了一些分离，目的是为了更好的性能体现。


### 公共配置

选项 | 含义
---- | ----
entries | 入口配置，相当于[entry](https://webpack.js.org/configuration/entry-context/#entry)
resolve | 解析模块请求的选项，参考[resolve](https://webpack.js.org/configuration/resolve/)


### 其他

除了`build/setting.js`之外，开发者还可以手动对webpack的配置进行修改，比如添加`loader`、`plugin`等等，配置文件为`build/config.js`。

由于webpack本身并不（特地）对低版本浏览器做兼容，如果需要开发兼容ie8的项目，还需要做一些配置上的工作，请参考[ie8适配指南](doc/ie8.md)。


## 参考文献

- [webpack官方文档](http://webpack.js.org/)



