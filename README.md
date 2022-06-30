# daodao-talk

TypeScript + MongoDB 增删改查.

开发环境使用根目录 `.env` 配置的环境变量, 格式如下, 注意 MongoDB 的连接字符串中需要包含密码和数据库名

```
DB_CONN_STRING=mongodb+srv://rikka:<password>@cluster0.fznke.mongodb.net/<DB_NAME>?retryWrites=true&w=majority
COLLECTION_NAME=collection
ALLOW_DOMAIN=http://localhost:8080
PORT=5000
```

生产环境为了方便部署在 vercel 上, 不使用文件配置, 而是直接读取系统环境变量

开发时本地测试
```bash
npm run dev 
```

编译

```bash
npm run build
```

生产环境运行
```bash
npm start
```



api

1. GET 所有文档
https://daodao-talk.vercel.app/api/posts 
2. GET 某 id
https://daodao-talk.vercel.app/api/posts/:id
3. POST 增加新文档
https://daodao-talk.vercel.app/api/posts
4. PUT 修改某文档
https://daodao-talk.vercel.app/api/posts/:id
5. DELETE 删除文档
https://daodao-talk.vercel.app/api/posts/:id



由于在 tsconfig.json 中定义了路径别名('src' 与 '@') 来消除相对路径的 import, 而 vercel 是无法识别的, 所以更改为部署编译后的 js 代码(之前 vercel 上直接部署 ts: https://github.com/ayasa520/daodao-talk/tree/0050e1e188bfb799036c1417fc4b17e1f28051ce). tsc 编译不会将 tsconfig.json 定义的路径别名翻译成实际的路径, 所以使用 webpack 打包转换自定义的根目录前缀. 然而还是有点问题, 如果要这样写 vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    },
    { "src": "dist/app.js", "use": "@vercel/node" }
  ],
  "routes": [{ "src": "/(.*)", "dest": "dist/app.js" }]
}

```

只能是 `npm run build` 后, 再手动 `vercel --prod` 部署才能成功. vercel 自动去 Github 拉代码然后 build 虽然可以成功编译 ts 文件, 但是服务启动是失败的(404).

每次更改完代码都要自己手动部署很麻烦, 所以使用 Github Action 来完成这件事
