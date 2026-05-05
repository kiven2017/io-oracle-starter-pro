# 项目进度总表

最后更新时间：2026-03-16 20:29:17 CST

## 本轮新增进展

- 已确认并修复 `WalletConnect` 二维码在开发环境下持续变化的问题，根因是 React 开发态 `StrictMode` 放大了钱包会话初始化副作用；当前二维码在同一次弹窗生命周期内已稳定。
- 已补充二维码钱包连接等待态：
  - 点击 `WalletConnect / Binance / Trust / SafePal` 后，会先立即打开二维码弹窗
  - 弹窗内会显示明显的“正在加载钱包二维码 / 正在准备 WalletConnect 会话”提示
- 已把登录流与购买流 UI 拆开：
  - 登录模式只保留钱包选择，不再显示网络、支付币、金额、邀请码、预估领取
  - 购买模式才显示支付相关输入区
- 已统一首页 Hero 区域和顶部导航的钱包入口逻辑：
  - 未登录时点击 `JOIN PRESALE` 先走登录
  - 已登录后首页 Hero 的 `JOIN PRESALE` 按钮自动隐藏
- 已修复钱包取消授权时超长报错直接铺在页面上的问题，当前会统一归一化为短提示，不再撑坏布局。
- 已把根目录 `lint` 脚本收敛到当前前端工程，不再把 `master_project/evm`、`python/.venv` 等子工程与环境目录混进同一条质量门。
- 已调整环境判定规则：
  - `sale_env` URL 参数优先
  - `VITE_APP_ENV` 次优先
  - 本地已保存环境再次优先
  - 若都未指定，则默认进入 `devnet`
  - 只有显式指定 `production` 时才进入正式环境
- 当前前端根目录质量门已通过：
  - `npm run lint` 通过
  - `npm run build` 通过
- 当前合约验证状态已再次确认：
  - `master_project/solana` 下 `cargo test` 通过
  - `master_project/evm` 下 `npx hardhat compile` 通过
- 已统一网络与钱包生态联动逻辑：
  - 选择 `EVM` 钱包时，只允许 `Ethereum / BSC`
  - 选择 `Solana` 钱包时，只允许 `Solana`
  - 已避免 `MetaMask + Solana`、`Phantom + Ethereum` 这类错误组合
- 已将环境配置文件命名统一迁移到 `public/config/`：
  - `evm.ethereum.sepolia.json`
  - `evm.local.json`
  - `solana.devnet.json`
  - `evm.bsc.testnet.example.json`
- 已在正式环境下隐藏页面中的环境切换区，仅保留测试环境可见。

## 剩余工作总览

当前剩余工作已经从“主流程开发”收敛为“真机回归 + 正式部署准备 + 配置落地”三类：

1. 真机回归
   - 用真实手机钱包验证 `WalletConnect / Binance Wallet / Trust Wallet / SafePal`
   - 用真实手机钱包验证 `Phantom / Solflare`
   - 重点覆盖连接、购买、领取、取消授权、回调恢复
2. 正式环境部署准备
   - 确认正式 `treasury / admin / deployer` 地址
   - 准备正式主网 gas
   - 正式部署后回填 `EVM` 合约地址与 `Solana Program ID / PDA`
3. 配置补齐
   - 生成正式环境配置文件
   - 补齐 `BSC` 测试/正式配置
   - 最后一轮生产环境联调验收

当前已经不需要再大规模改前端主逻辑，后续重点是把不同钱包和不同环境逐项验完。

- 已在 `master_project/evm/.env` 写入测试网部署配置。
- 已校验测试部署私钥与当前钱包地址一致，部署钱包地址为 `0x977d3575422c2820531039f94b63f35D6Da7D3F3`。
- `Sepolia` 测试网余额已确认，当前约有 `0.049995443251989637 ETH`，具备继续部署测试合约的条件。
- 已完成一套新的 `Sepolia` 测试网 mock 预售合约部署，并已写入前端配置文件 `public/config/evm.ethereum.sepolia.json`。
- 本轮新的 `Sepolia` 地址如下：
  - `Presale`: `0xA5Ee1d0cFe24d13aE2f60a4fc3aA581dDab8AF95`
  - `Payment Token`: `0x6FFfDc6Eb2301E58795a179951595fE90f6C95C5`
  - `Sale Token`: `0x9c3F8b4f88Dc6aB72ff5425899ACBB07246dd74a`
  - `Admin/Buyer`: `0x977d3575422c2820531039f94b63f35D6Da7D3F3`
  - `Treasury`: `0x04683B35Ec581E863C1282Fe2f20fe0F42088809`
- 已在 `Sepolia` 上完成一次真实 `approve -> buy` 联调，交易哈希如下：
  - `approve`: `0x3485342a9ffaad403a3e4b8fd98fbe0eff3b496dfbf5434607a03bb019114bcf`
  - `buy`: `0x4b0d6dca1f45558c32e3173ce824b9aec60b49574a268c6204ae7f88990411c5`
- 当前链上买入结果已确认：
  - 最小买入额 `100000000`（6 位精度支付币）
  - 买入后 `Purchased` 已增加到 `100000000000000000000000`
  - `purchaseCount` 已增加到 `1`
- 当前 `claim` 静态校验被合约正确拒绝，原因是 `claimStartTs` 尚未到达，说明领取限制逻辑正常。
- 当前 `Sepolia` 合约已通过 `updatePresale` 更新为独立测试 `treasury`：
  - `Treasury`: `0x04683B35Ec581E863C1282Fe2f20fe0F42088809`
  - `updatePresale` 交易：`0xff9e3fdb90305efb8d8ae4f7ed54a1edae14f1def4238566e93660ec8445eb8f`
- 已完成一轮更真实的 `buy -> claim` 链上联调，结果如下：
  - `approve`: `0xc9d8e84cf360bf4b1197afc5b6600ada004059e32671b933f8611f2e6c6cd6d3`
  - `buy`: `0xe0ff5b5eb03f01d59a7763ab0c26b772146ad5eb0b2c5428192c1312abaf7f3f`
  - `claim`: `0xc2ab5d5161e0de7f7634cbd244a2c9fabc48895e0b358d9fa166859e5365bab8`
- 本轮联调已确认：
  - 买入后用户支付币余额从 `50000000000` 降到 `49900000000`
  - 独立 `treasury` 收到 `100000000`
  - 用户钱包成功收到已可领取的 `AIO`
  - `claimableAfter = 0`，领取后状态正确归零
- 钱包弹窗交互已补充：
  - 登录模式下不再被购买金额门槛阻塞
  - 检测到扩展的 EVM 二维码钱包会优先走扩展直连
  - 已接入真实 `VITE_WALLETCONNECT_PROJECT_ID`，二维码钱包现在可继续做真机联调
- 已完成一套新的 `BSC Testnet` mock 预售合约部署，并已写入前端配置文件 `public/config/evm.bsc.testnet.json`。
- 本轮新的 `BSC Testnet` 地址如下：
  - `Presale`: `0xDF75e38816F1cc621D6C3968b4c3fD93C88a3b57`
  - `Payment Token`: `0x382948bB75E085A72b258D42E1ea890D446a6CfD`
  - `Sale Token`: `0x1EB78d0C116e2bC7ef2e7f565092fb292469A8Ac`
  - `Admin/Buyer`: `0x977d3575422c2820531039f94b63f35D6Da7D3F3`
  - `Treasury`: `0x04683B35Ec581E863C1282Fe2f20fe0F42088809`
- `BSC` 现在已经不是纯钱包提示路由，而是真实可购买的测试网 EVM 路由。
- 当前 EVM 测试地址的统一读取入口：
  - 前端 live 配置看 `public/config/evm.ethereum.sepolia.json` 与 `public/config/evm.bsc.testnet.json`
  - 说明文档看 `master_project/evm/DEPLOYMENT.md`
  - 原始部署结果看 `master_project/evm/*-deploy-result.latest.json`
- 当前仍缺的外部条件：
  - `WalletConnect / Binance / Trust Wallet / SafePal` 仍需要逐个真钱包回归验证

## 文件用途

这是当前仓库的统一进度跟踪文件。

用途：

- 每次打开项目时，先快速了解当前整体状态
- 记录哪些模块已经可用
- 记录哪些模块仍然阻塞或只完成了一半
- 每次修改完成后，持续更新当前进展与下一步动作

## 当前项目整体状态

项目组成：

- React + Vite 预售前端
- Solana 预售合约工程
- EVM 预售合约工程
- Wert 法币支付 Flask 后端示例

当前仓库状态总结：

- 前端已经可以在 WSL 本地运行
- Solana devnet 合约代码和 Rust 测试通过
- EVM Sepolia 已完成真实部署与链上买入/领取验证
- 钱包登录、购买、扫码等交互界面已基本闭环
- 生产模式下的测试入口已经隐藏，当前主要剩正式配置与真机回归

## 本地运行环境说明

当前本地环境：

- 运行环境：`WSL2`
- 已在 WSL 内安装 Linux 版 Node.js
- 推荐前端启动方式：
  - `export NVM_DIR="$HOME/.nvm"`
  - `. "$NVM_DIR/nvm.sh"`
  - `npm run dev -- --host 0.0.0.0`

重要访问说明：

- 当前这台机器上，Windows 浏览器通过 `localhost:5173` 访问 WSL 服务不稳定
- 需要优先使用 WSL IP 访问，例如：
  - `http://192.168.0.102:5173`

## 各模块当前状态

### 1. 前端

状态：主体可用，剩真机与多钱包回归

已完成：

- 官网主页面可以渲染
- 预售主卡片 UI 已完成
- 钱包弹窗、二维码弹窗、确认购买弹窗、卡支付弹窗都已接入
- 前端开发服务器可以在本地运行
- 顶部钱包按钮已支持显示对应钱包图标
- 顶部钱包按钮已支持打开钱包详情弹窗
- 默认 EVM 网络已切到当前更稳定的 Ethereum 路线
- 其他 EVM 钱包已补上扩展检测优先、二维码回退的连接逻辑
- 登录流和购买流 UI 已拆分
- Hero 区域 `JOIN PRESALE` 已与顶部导航共用登录状态逻辑
- 二维码钱包等待态已补齐
- WalletConnect 二维码稳定性问题已修复

当前问题：

- 仍有部分历史测试/调试代码需要继续清理
- 钱包详情弹窗当前已读取项目相关真实余额，但尚未扩展为“全钱包资产总览”
- BSC 这条链的项目代币/预售配置仍未补齐，完整余额体验仍以 Ethereum Sepolia 更稳

### 2. JOIN PRESALE / 钱包登录

状态：主流程可用

已完成：

- 顶部导航可以拉起钱包弹窗
- 钱包选择 UI 已完成
- EVM 注入钱包连接链路已接入
- Solana 注入钱包连接链路已接入
- 纯登录流程已与最小购买金额校验解耦
- 登录模式不会再显示购买输入项
- 二维码登录现在具备明确等待态

当前问题：

- EVM 钱包安装跳转已修正为优先使用各自安装地址
- 二维码连接并不都是原生钱包完整闭环

### 3. Solana

状态：浏览器扩展 devnet 路径可用，手机二维码路径已补到交易闭环

已完成：

- `public/config/solana.devnet.json` 已存在
- 前端可读取 Solana devnet 配置
- 前端已接入买入和领取交易构造
- Rust 合约测试通过
- 合约已包含：
  - `initialize_presale`
  - `update_presale`
  - `buy_with_spl`
  - `deposit_aio_tokens`
  - `claim_tokens`

当前问题：

- 当前已补上扫码回调解析、解密、移动会话恢复
- 当前已补上手机钱包 `buy / claim` 交易 deeplink、回调恢复、签名结果提交/确认
- 当前移动端链路仍需要做真机回归，尤其是 `Phantom` 与 `Solflare` 返回字段差异
- 前端金额换算目前默认按 6 位精度处理

### 4. EVM

状态：核心代码链路已存在，Sepolia 已验证通过

已完成：

- EVM 配置加载器已完成
- 注入钱包买入和领取逻辑已完成
- 自动切链逻辑已完成
- 二维码钱包的 WalletConnect 会话生成逻辑已完成
- WalletConnect 二维码在开发环境下的会话抖动问题已修复
- 本地配置与 Sepolia 配置文件已存在
- Solidity 合约可以编译

当前问题：

- Hardhat 自动化测试执行目前没有产出稳定可信的 JS 回归结果
- 多个二维码钱包当前共用 WalletConnect 路径，而不是各钱包独立路由
- 真正可用还依赖 `VITE_WALLETCONNECT_PROJECT_ID`

### 5. Wert 卡支付

状态：已完成 Session 模式接入示例，但不是完整交付闭环

已完成：

- 前端会先调用 Flask 后端再打开 Wert Widget
- 后端已包含校验、路由映射、创建 Session 的逻辑
- 后端已提供健康检查和订单查询接口

当前问题：

- 必须配置有效的 Wert 账号参数并启动 Flask 服务
- 当前尚未接入最终配售交割、订单落库、内部发放逻辑

### 6. 生产可上线状态

状态：测试环境主链路已基本收口，正式上线仍需部署与验收

阻塞原因：

- 正式环境真实合约地址 / Program ID / PDA 尚未生成
- `BSC` 链配置尚未补齐
- 多钱包真机回归尚未全部完成
- 卡支付还没有和最终预售分发系统打通

## 最近一次巡检结论

巡检日期：

- 2026-03-16

高优先级问题：

1. 需要做 Solana 真机回归，确认 `Phantom / Solflare` 的回调字段与当前解析完全一致
2. 需要继续做 EVM 多钱包真机回归，重点验证 `WalletConnect / Binance / Trust / SafePal`

中优先级问题：

1. EVM 自动化测试结果仍需继续稳定
2. 仍需继续清理历史隐藏调试块和非活动逻辑
3. BSC testnet 仍缺可用 RPC 与部署/前端配置补齐

低优先级问题：

1. Solana 前端精度处理写死为 6 位

## 当前验证结果

2026-03-16 已验证：

- `master_project/solana` 下执行 `cargo test`：通过
- 仓库根目录执行 `npm run lint`：通过
- 仓库根目录执行 `npm run build`：通过
- `master_project/evm` 下执行 `npx hardhat compile`：通过
- `master_project/evm` 下执行 `npm test` / `hardhat test`：仍未得到稳定、完整的 JS 测试通过结果
- 前端本地开发服务器：已经可以在 WSL 内运行
- `Sepolia` 测试链路：真实 `approve -> buy -> claim` 已验证通过

## 建议下一步

### P0 级

1. 做 Solana 手机真机联调，覆盖 `Phantom / Solflare` 连接、购买、领取
2. 做 EVM 二维码钱包真机联调，覆盖 `WalletConnect / Binance / Trust / SafePal`
3. 生成正式环境配置文件模板，准备主网部署回填

### P1 级

1. 稳定 EVM 自动化测试执行
2. 补齐 `BSC` 的可用 RPC、部署与前端配置
3. 继续清理前端历史死分支，缩小实际维护面

### P2 级

1. 清理页面里剩余隐藏但仍保留的测试/调试 UI 代码
2. 优化 Solana/EVM 的状态展示区
3. 改善卡支付与链上交割之间的状态衔接

## 更新规则

以后每次完成有意义的修改，都要同步更新本文件：

1. 更新时间
2. 改了什么
3. 哪些功能已经变为可用
4. 还剩哪些阻塞项
5. 下一步建议动作

## 变更记录

### 2026-03-16

- 新建项目统一进度总表
- 记录前端、Solana、EVM、Wert 后端当前状态
- 修复 `JOIN PRESALE` 登录与最小购买额耦合问题
- 修复非测试环境误报“购买成功”的风险
- 恢复本地 / 测试环境切换入口
- 修复钱包安装跳转与页面白屏回归问题
- 补齐 Solana 手机钱包 deeplink 的连接恢复、购买、领取闭环
- 验证前端 `npm run build` 通过
- 新增顶部钱包详情弹窗，支持真实余额显示与断开连接
- 将钱包详情弹窗拆分为 Wallet Assets / Presale Position 两组
- 补充余额查询失败时的切网建议文案
- 将默认 EVM 网络改为 Ethereum
- 记录本地 WSL 运行说明
- 记录最新一轮代码巡检结论
- 明确当前项目暂不具备直接生产上线条件
- 已修复 JOIN PRESALE 登录被最小购买额卡住的问题
- 已去掉非测试环境下的模拟成功购买结果
- 已恢复本地/测试环境下可见的环境切换入口
- 已修复 EVM 钱包安装地址回退逻辑
- 已清理一批前端中的历史 `false` 死分支
- 已补 Solana mobile deeplink 的回调参数解析、解密和会话恢复
- 已在移动钱包恢复后禁止误走浏览器扩展交易确认路径
- 已修复 WalletConnect 二维码在开发环境下持续变化的问题
- 已补齐二维码钱包的等待态与加载过渡
- 已统一登录流与购买流的 UI 展示边界
- 已完成环境默认值、正式环境隐藏测试入口、配置文件命名统一等收口工作
