# AIOracle Thailand Frontend

## 文档入口

建议按这个顺序阅读：

1. [READ.md](./READ.md)
   当前项目最完整的总览文档，包含 GitBook 理解、页面逻辑、官方钱包地址、Wert 卡支付链路
2. [master_project/python/README.md](./master_project/python/README.md)
   Wert Flask 后端接入、`.env` 配置、Sandbox/Production 映射、API 示例
3. [master_project/solana/TESTING.md](./master_project/solana/TESTING.md)
   Solana 测试环境、devnet 程序地址、本地测试钱包地址，以及正式地址和测试地址的区分说明
4. [master_project/evm/README.md](./master_project/evm/README.md)
   EVM presale 合约骨架、Hardhat 工程、buy/claim 口径说明
5. [master_project/evm/DEPLOYMENT.md](./master_project/evm/DEPLOYMENT.md)
   EVM 本地部署状态、当前本地地址，以及公开测试网尚缺的配置项
6. `read_file/aioracle_gitbook_final/zh-TW`
   AIOracle 中文 GitBook / 白皮书参考资料
7. `read_file/aioracle-presale-dapp`
   早期预售 DApp 参考结构

## 当前仓库定位

这是一个基于 `React + Vite + TailwindCSS` 的 AIOracle 官网与预售前端项目，当前已经包含：

- 官网首页和品牌内容区块
- Hero 预售卡片
- 钱包连接、二维码、确认购买、价格表、Exit Intent 弹窗
- 官方钱包地址展示
- Wert 卡支付前端交互
- Solana `Production / Devnet Test` 环境切换
- Solana devnet 真实钱包购买与 claim 测试链路
- EVM WalletConnect 真实二维码会话接入骨架

其中卡支付已经不是静态跳转，而是：

1. 前端弹窗调用 Flask 后端创建 Wert Session
2. 后端用你的 Wert 账号信息请求官方接口
3. 前端再打开 Wert 官方 Widget

## 目录说明

- `src/`
  当前前端页面、组件、数据配置与 hooks
- `master_project/python/`
  Wert 卡支付 Flask 后端示例
- `master_project/solana/`
  Solana Presale 合约工程与测试环境说明
- `master_project/evm/`
  EVM Presale 合约工程
- `public/`
  静态资源
- `read_file/`
  参考资料目录，不建议直接删除
