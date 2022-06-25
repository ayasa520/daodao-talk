# daodao-talk

TypeScript + MongoDB 增删改查.

开发环境使用根目录 `.env` 配置的环境变量, 格式如下

```
DB_CONN_STRING=mongodb+srv://rikka:<password>@cluster0.fznke.mongodb.net/?retryWrites=true&w=majority
DB_NAME=databse
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
