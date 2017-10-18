## 前言

由于webpack本身并不（特地）对低版本浏览器做兼容，如果需要开发兼容ie8的项目，还需要做一些配置上的工作，本文的创作初衷来源于最近的一个需要兼容到ie8+的pc项目。

> 注意，请先关闭hmr功能，原因请回顾文档内容。


## es5->es3

原本的babel已经将我们的代码编译为es5代码，但是在ie8下，这还不够，因为es5代码中存在一些es3的保留字，导致页面报错，所以我们还需要将es5降级到es3，这里有两个选择，一个是使用loader（[es3ify-loader](https://www.npmjs.com/package/es3ify-loader)）的方式，一个是使用plugin（[es3ify-webpack-plugin](https://www.npmjs.com/package/es3ify-webpack-plugin)）的方式，我们采用后者：

```shell
npm install es3ify-webpack-plugin --save-dev
```

打开`build/config.js`文件：

```javascript
const Es3ifyPlugin = require('es3ify-webpack-plugin')

var plugins = [
  ...
  new Es3ifyPlugin()
]
```


## es5-shim & es5-sham

既然降级到es3，那么原本es5所支持的一些api在es3下有可能不支持，所以我们还需要做一下es3对es5的polyfill工作，这里需要两个插件，那就是`es5-shim`和`es5-sham`：

```shell
npm install es5-shim --save
```

补充到每个entry当中，并前置：

```javascript
entry = _.mapValues(entry, (o) => {
  o.unshift('es5-shim/es5-sham')
  o.unshift('es5-shim')
  return o
})
```

另一方面，既然提到polyfill，我们也顺便做一下babel的工作好了，同样的，babel是把es2015+的语法转换成es5，我们也需要polyfill一下：

```shell
npm install babel-polyfill --save
```

```javascript
entry = _.mapValues(entry, (o) => {
  o.unshift('es5-shim/es5-sham')
  o.unshift('es5-shim')
  o.unshift('babel-polyfill')
  return o
})
```

注意这两步的安装，我们都是`--save`，而不是`--save-dev`，因为polyfill是需要将自身打包到源码中去的，而不是只作为编译的工具。


## Loose

默认情况下，babel使用non-loose的模式来工作，而这个模式最终产生`Object.defineProperty`这一代码片段来实现某些功能（模块的import和export），但是：

> IE8中有自己实现的Object.defineProperty,它的行为和标准不同，且只能接受DOM对象，如果传入普通javascript对象会抛异常。详细说明在这里[Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。  —— 摘自《[react项目的一个ie8兼容性问题](http://www.aliued.com/?p=3240)》

解决这个问题的方式也很简单，直接修改babel-loader的配置就可以了：

```javascript
{
  loader: 'babel-loader',
  options: {
    presets: [
      [
        'env',
        {
          'loose': true
        }
      ]
    ]
  }
}
```

注意，这一配置是babel后来添加的，并不是原先就支持的，所以请留意你的babel版本（本文使用的是6.26.0）。


## Uglifyjs

走到这里，其实开发环境已经没有问题了，但是在打包环境下，还是会有问题。

由于我们使用了`uglifyjs-webpack-plugin`这个插件来压缩混淆代码，这会破坏我们前面做的一些工作，比如es3的保留字处理，原理就是把保留字原本的“暴露”方式变成字符串，好比`a.b`变成`a['b']`，但是`uglifyjs-webpack-plugin`默认情况下，会将这个方式逆转过来，也就是我们已经处理好了`a.b` -> `a['b']`，又给变成了`a['b']` -> `a.b`。。。

因为这样字数就会比较少了嘛。。。

我们通过配置一些参数，可以防止一些类似这样的操作，下面给出一个总的配置信息：

```javascript
new UglifyJSPlugin({
  compress: {
    properties: false,
    warnings: false
  },
  output: {
    // beautify: true,
    quote_keys: true
  },
  mangle: {
    screw_ie8: false
  },
  sourceMap: !!build.sourceMap
})
```

这样打包之后的代码也没有问题了。

以上就是全部的兼容工作了，下面给出一个完整的`build/config.js`内容：

```javascript
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const Es3ifyPlugin = require('es3ify-webpack-plugin')
const notifier = require('node-notifier')
const _ = require('lodash')

const setting = require('./setting.js')
const { dev, build } = setting

var entry = setting.entries
var ExtractText = new ExtractTextPlugin('assets/style/[name].css?[contenthash]')
var CommonExtractText = new ExtractTextPlugin('assets/style/common.css?[contenthash]')

module.exports = (env, argv) => {
  var { production: prod } = env

  if (prod && build.vendor && build.vendor.length > 0) {
    entry.vendor = build.vendor
  }

  if (!prod && dev.hmr) {
    entry = _.mapValues(entry, (o) => {
      o.unshift('./build/client.js')
      return o
    })
  }

  entry = _.mapValues(entry, (o) => {
    o.unshift('es5-shim/es5-sham')
    o.unshift('es5-shim')
    o.unshift('babel-polyfill')
    return o
  })

  var output = {
    filename: prod ? '[name].js?[chunkhash]' : '[name].js',
    path: rsv('../dist'),
    publicPath: prod ? build.publicPath : '/'
  }

  var cssRules = prod ? [
    {
      test: /\.css$/,
      exclude: /common\.css/,
      use: ExtractText.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        }
      })
    },
    {
      test: /common\.css$/,
      use: CommonExtractText.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        }
      })
    }
  ] : [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }
  ]

  var module = {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  'env',
                  {
                    'loose': true
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: rsv('../src')
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: prod ? '[path][name].[ext]?[hash]' : '[path][name].[ext]',
              context: rsv('../src')
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              interpolate: true
            }
          }
        ]
      }
    ].concat(cssRules)
  }

  var resolve = setting.resolve

  var devtool = prod ? (build.sourceMap ? 'source-map' : false) : 'cheap-module-source-map'

  var pages = _.map(prod ? build.pages : dev.pages, (o, k) => {
    if (!o.filename) {
      o.filename = /\.html$/.test(k) ? k : (k + '.html')
    }

    return new HtmlWebpackPlugin(o)
  })

  var plugins = prod ? [
    new CleanWebpackPlugin(['dist'], {
      root: rsv('..')
    })
  ].concat(pages, [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime'
    }),
    CommonExtractText,
    ExtractText,
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      compress: {
        properties: false,
        warnings: false
      },
      output: {
        // beautify: true,
        quote_keys: true
      },
      mangle: {
        screw_ie8: false
      },
      sourceMap: !!build.sourceMap
    }),
    new Es3ifyPlugin()
  ]) : pages.concat([
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here http://localhost:${dev.port}`]
      },
      onErrors: (severity, errors) => {
        if (!dev.nativeNotifier) {
          return
        }
        
        if (severity !== 'error') {
          return
        }

        const error = errors[0]

        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || ''
        })
      }
    }),
    new Es3ifyPlugin()
  ])

  if (!prod && dev.hmr) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  return {
    entry,
    output,
    module,
    resolve,
    devtool,
    plugins
  }
}

function rsv(pathName) {
  return path.resolve(__dirname, pathName)
}
```

如无特殊情况，全文替换即可。


## 免责声明

1. 本文查阅并实践了大量网上资料，文末附有相关的参考链接；
2. 本文基于webpack3.5.6讲解，旧版本是否适用请自行验证。。。
3. 作者使用macOS进行开发，windows请自行验证。。。

**最后，这一套配置的实践次数尚不够多，有些问题或许还没有被发现，如果你发现了问题，请务必通知我！**

**心怀敬意，无意抄袭，若有侵权，请第一时间联系我，感谢！**


## 参考文献

- [webpack-ie8-and-es6-modules](https://stackoverflow.com/questions/41247876/webpack-ie8-and-es6-modules)
- [xcatliu/react-ie8](https://github.com/xcatliu/react-ie8)
- [react项目的一个ie8兼容性问题](http://www.aliued.com/?p=3240)
- [煦涵说Webpack-IE低版本兼容指南](https://github.com/zuojj/fedlab/issues/5)
