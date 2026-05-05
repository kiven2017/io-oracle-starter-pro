# AIOracle 项目总览

## 1. 这份文档的作用

这份文档用于统一说明当前仓库的项目背景、页面逻辑、预售交互实现、官方钱包地址，以及新增的 Wert 卡支付后端链路。

它综合了两部分内容：

- `read_file/aioracle_gitbook_final/zh-TW` 中的 AIOracle 中文 GitBook / 白皮书资料
- 当前仓库已经完成的 React 前端与 Flask 支付接入实现

## 2. AIOracle 是什么

根据 GitBook，AIOracle 的定位不是普通的数据搬运型预言机，而是把现实世界设备状态、环境信息和行为数据转换为链上可信事实的基础设施网络。

它关注的不是“把数据上传到链上”这么简单，而是让这些数据能被验证、被协议调用、被金融产品定价和被企业系统使用。

从项目表述上看，AIOracle 想连接的是这条路径：

- 设备 / 传感器
- 边缘网关
- 验证节点
- AI 推理服务
- Oracle / 执行节点
- 智能合约、RWA 协议、企业业务系统

## 3. GitBook 里的核心方向

从 `aioracle_gitbook_final` 可以提炼出几个关键方向：

- 优先落地的行业是农业、物流、新能源等高频数据且高价值的场景
- 多链方向以 EVM 为主，后续扩展到 Solana 和 BNB Chain
- `$AIO` 不只是交易代币，还承担节点质押、奖励结算、治理和生态协同功能
- 节点体系围绕可信数据、可验证工作量和多层安全机制展开
- 路线图强调从真实设备接入，到节点网络、协议收入，再到资本市场准备

## 4. 当前仓库实现了什么

当前仓库不是白皮书本体，而是一个官网 + 预售前端实现。

技术栈：

- `React`
- `Vite`
- `TailwindCSS`

已经实现的前端能力：

- 官网首页与品牌内容
- Hero 预售卡片
- 钱包选择弹窗
- 钱包二维码弹窗
- 购买确认弹窗
- 价格阶段弹窗
- Exit Intent 弹窗
- FAQ / 页脚 / 官方钱包地址展示
- Wert 卡支付前端交互

## 5. 页面结构

核心页面结构由这些部分组成：

- `src/App.jsx`
  页面总入口与全局弹窗调度
- `src/components/sections/HeroSection.jsx`
  首屏内容与预售卡片入口
- `src/components/PresaleConsole.jsx`
  预售主卡片、金额输入、钱包流程、快捷图标、卡支付入口
- `src/components/WalletConnectModal.jsx`
  钱包选择弹窗
- `src/components/WalletProviderQrModal.jsx`
  二维码钱包弹窗
- `src/components/ConfirmPurchaseModal.jsx`
  购买确认弹窗
- `src/components/CardCheckoutModal.jsx`
  卡支付弹窗
- `src/components/PriceTableModal.jsx`
  阶段价格表弹窗
- `src/components/sections/EcosystemSections.jsx`
  生态内容、FAQ、页脚、官方钱包地址展示

## 6. 当前预售卡片逻辑

当前预售卡片已经是可交互实现，不是静态 UI。

核心逻辑来源：

- `src/data/presaleConfig.js`
- `src/hooks/usePresaleCalculator.js`

当前前端参数：

- `15` 个阶段
- 起始价 `0.0035`
- 每阶段加价 `10%`
- 最低购买额 `100 USDT`
- 支持 `BSC / Ethereum / Solana`
- 支持 `USDT / USDC / ETH / SOL`
- 当前页面口径为 `15% at TGE + 12-Month Linear`

当前前端流程：

1. 输入金额
2. 自动计算美元等值
3. 自动计算预计获得的 `AIO`
4. 自动计算 `TGE Unlock` 和每月线性释放
5. 可进入钱包连接流程
6. 可进入卡支付流程
7. 可在确认弹窗里查看购买摘要

## 7. 当前仍然不是链上生产交易

虽然页面交互比较完整，但这仍然不等于已经接入了真实链上购买。

当前没有接入的部分包括：

- 真实 EVM 钱包 SDK
- 真实 Solana 钱包 SDK
- 智能合约读写
- 真实链上签名
- `approve / buy / claim`
- 完整的后端订单持久化

补充说明：

- 左侧 EVM 扫码钱包现在已经开始接真实 `WalletConnect` 会话二维码
- 要让这些二维码在本地真正可用，需要配置前端环境变量：
  - `VITE_WALLETCONNECT_PROJECT_ID`
- 本地 EVM 闭环配置文件已经生成为：
  - `public/config/evm.local.json`
- 本地 EVM 合约工程位于：
  - `master_project/evm`
- 当前这台 WSL 的本地 EVM RPC 使用：
  - `http://127.0.0.1:8546`
  - 原因是 `8545` 在此环境里被异常代理占用并返回 `502`
- EVM 公共测试网当前已新增：
  - `Sepolia` 测试部署
  - `BNB Smart Chain Testnet` 测试部署
  - 配置文件位于 `public/config/evm.ethereum.sepolia.json`
  - 配置文件位于 `public/config/evm.bsc.testnet.json`
  - 相关测试地址见 `master_project/evm/DEPLOYMENT.md`

因此当前更准确的定义是：

**官网展示 + 预售前端交互原型 + 支付链路接入示例**

## 8. GitBook 与当前前端参数的差异

这一点必须单独说明。

GitBook / 白皮书中的预售口径偏融资轮次表达，常见写法是：

- Seed / Private / Public 不同价格层
- `15% at TGE`
- `12-Month Linear`

而当前前端实现为了页面展示和交互统一，已经采用：

- 15 阶段价格表
- 动态阶段与进度展示
- `15% at TGE + 12-Month Linear`

所以要把两者分开理解：

- `read_file/aioracle_gitbook_final/zh-TW`
  代表白皮书 / 融资口径
- 当前 `src/` 下的实现
  代表现阶段网站展示和前端交互口径

如果后续要进入正式募资或链上销售，必须重新统一：

- 官网口径
- 白皮书口径
- 销售口径
- 合约参数

## 9. 官方钱包地址

当前项目已经把官方收款钱包地址展示到页面里，数据来源：

- `src/data/siteContent.js`
- `src/components/sections/EcosystemSections.jsx`

当前展示的地址是：

- `BNB Chain (BEP20)`
  `0x1FcCAc591Cc2B9Ae03c7763e21E3366814431330`
- `Multi-chain Wallet`
  `0x4A7819eAaBB7bd6BC2C519E3aBD2856087442BCf`
- `Solana Wallet`
  `BEw54UDHbNhZgjPYLG7oSyQLEzQPCvnmSgW7XStG7Kuk`

### 9.1 重要说明：正式地址和测试地址必须分开

上面这 3 组地址是老板提供的正式展示地址，属于 `OFFICIAL / PRODUCTION`。

它们用于：

- 官网正式展示
- 对外公开说明
- 正式业务收款口径

它们**不应该**被替换成本地测试地址，也**不应该**在本地或 devnet 联调时混用。

Solana 的测试地址、devnet 程序地址、本地生成的钱包地址，统一记录在：

- `master_project/solana/TESTING.md`

后续联调时请遵守这个边界：

- 页面展示给外部看的官方地址
  只用正式地址
- 合约开发、钱包连接、devnet 交易测试
  只用测试地址

## 10. Solana 合约开发现状

当前仓库已经新增：

- `master_project/solana/`

这是基于 `Anchor` 的 Solana 预售合约工程，当前已落地：

- `initialize_presale`
- `update_presale`
- `buy_with_spl`
- `deposit_aio_tokens`
- `claim_tokens`

当前可用测试环境：

- `devnet`

当前 `localnet` 在这台 WSL 上启动 `solana-test-validator` 后，RPC 会返回 `502 Bad Gateway`，因此暂时不作为可用联调环境。

Solana 的测试程序地址、升级权限地址、测试钱包地址，都单独记录在：

- `master_project/solana/TESTING.md`

前端当前也已经补上：

- `Production / Devnet Test` 环境切换
- `Solana` 路径下的真钱包连接
- `buy_with_spl` 的 devnet 链上调用
- `claim_tokens` 的 devnet 链上调用

也就是说，当前这套前端已经不只是展示原型，而是可以在 `devnet` 下跑真实的 Solana 测试闭环。

## 11. Wert 卡支付后端接入

当前仓库已经新增 `master_project/python/` 作为 Wert 法币入金的 Flask 示例服务。

它的作用不是替代前端弹窗，而是给前端提供正式的 `session-based` 支付链路。

### 11.1 前端到后端的支付流程

1. 用户点击 `Buy With Card / Visa / Mastercard / Apple Pay / Google Pay`
2. `src/components/CardCheckoutModal.jsx` 调用 `src/lib/wertCheckout.js`
3. `src/lib/wertCheckout.js` 向 Flask 后端 `POST /api/wert/session`
4. Flask 后端使用 `WERT_API_KEY` 调 Wert 官方接口创建 `session`
5. 前端拿到 `session_id + partner_id + widget_origin` 后，用 `@wert-io/widget-initializer` 打开 Wert 官方 Widget

### 11.2 前端相关文件

- `src/components/CardCheckoutModal.jsx`
  卡支付弹窗，负责展示金额、支付方式和错误提示
- `src/lib/wertCheckout.js`
  负责请求 Flask 后端并打开 Wert Widget
- `src/components/PresaleConsole.jsx`
  管理卡支付弹窗的金额、网络和支付方式入口
- `src/data/presaleConfig.js`
  定义卡支付路由默认资产映射，`BSC / Ethereum -> USDT`，`Solana -> USDC`

### 11.3 后端相关文件

- `master_project/python/app.py`
  Flask 入口，提供 `/health`、`/api/wert/session`、`/api/wert/orders`、`/api/wert/webhook`
- `master_project/python/config.py`
  环境变量和默认配置
- `master_project/python/services/wert_client.py`
  Wert API 客户端
- `master_project/python/services/checkout_resolver.py`
  网络、资产、支付方式、钱包地址映射
- `master_project/python/.env.example`
  配置模板
- `master_project/python/README.md`
  完整安装和使用说明

### 11.4 当前默认钱包映射

后端默认已经内置这 3 个官方收款钱包，所以你拿到 Wert 账号后，优先只需要补：

- `WERT_API_KEY`
- `WERT_PARTNER_ID`

默认钱包如下：

- `BSC`: `0x1FcCAc591Cc2B9Ae03c7763e21E3366814431330`
- `Ethereum`: `0x4A7819eAaBB7bd6BC2C519E3aBD2856087442BCf`
- `Solana`: `BEw54UDHbNhZgjPYLG7oSyQLEzQPCvnmSgW7XStG7Kuk`

### 10.5 Sandbox 和 Production 的差异

Wert 官方在不同环境里支持的资产不同，因此代码里已经做了自动映射：

- `sandbox`
  - `bsc -> TT on bsc`
  - `ethereum -> TT on sepolia`
  - `solana -> TT on solana`
- `production`
  - `bsc -> USDT on bsc`
  - `ethereum -> USDT on ethereum`
  - `solana -> USDC on solana`

这意味着：

- `Visa / Mastercard` 在 Wert 里都会映射到 `card`
- `Solana` 正式环境下不会走 `USDT`，而是自动改为 `USDC`

### 10.6 本地联调方式

本地联调时需要同时启动两套服务：

1. React/Vite 前端
2. `master_project/python` 下的 Flask 后端

前端默认请求：

- `https://www.tds-hub.com/api/wert/session`

如果需要覆盖默认地址，可以在前端环境变量里设置：

```env
VITE_WERT_BACKEND_URL=https://www.tds-hub.com
```

后端的详细启动步骤和 API 示例见：

- [master_project/python/README.md](./master_project/python/README.md)

## 11. 当前建议的阅读顺序

如果你要继续推进这个项目，建议按这个顺序看：

1. `read_file/aioracle_gitbook_final/zh-TW`
   理解 AIOracle 项目背景、代币模型、治理和路线图
2. `src/data/presaleConfig.js` 与 `src/data/siteContent.js`
   理解当前网站展示参数和官方钱包地址
3. `src/components/PresaleConsole.jsx`
   理解预售主流程
4. `src/components/CardCheckoutModal.jsx` 与 `src/lib/wertCheckout.js`
   理解前端卡支付链路
5. `master_project/python/`
   理解 Wert 后端接入和后续可扩展点

## 12. 一句话总结

AIOracle 的核心是把现实世界数据变成链上可信事实；而当前这个仓库，则是它的官网与预售前端实现，并且已经新增了一个可配置的 Wert Flask 后端示例，用于把 Visa / Mastercard / Apple Pay / Google Pay 这条卡支付流程接到正式的后端 session 链路上。
