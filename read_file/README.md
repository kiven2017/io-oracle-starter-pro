# AIOracle Presale dApp Engineering Specification

本文档定义 AIOracle Presale dApp 的工程目标、业务规则、技术架构与 AI 开发任务。  
该文档用于指导 AI 工具（Codex / Claude Code / Cursor）自动生成项目代码。

本文件的目标是：

- 明确项目背景
- 固定业务规则
- 定义前端工程结构
- 定义合约接口层
- 定义交易状态机
- 提供 AI 开发 Prompt
- 当前DApp 是一个项目，钱包的交实现请参考同目录下的文档，以及示例aioracle-presale-dapp工程骨架，钱包涉及不同区块链网络的选择（参考）
  最后或者支付的钱包地址，然后用户进行对应网络支付，对于visa卡我们对接了第三方平台，也给用户另一种支付选择
  主要对接平台是 https://wert.io，然后项目的流程是参考https://deepsnitch.ai/，可以打开他们网址看一下 链接钱包时候的选择


本文件是 AIOracle Presale 项目的 **核心工程规范**。

--------------------------------------------------

# 1 项目概述

项目名称：AIOracle  
项目域名：AIOracle.link  

AIOracle 是一个 **Physical Oracle / RWA（Real World Assets）基础设施项目**。

核心目标：

将现实世界的数据可信地映射到区块链。

AIOracle 的 Oracle 网络用于：

- 验证现实世界数据
- 生成链上证明
- 为 RWA 应用提供可信数据

官网展示的示例应用：

Durian Cold Chain Verification（榴莲冷链溯源）

示例流程：

采摘 → 冷链运输 → 数据签名 → 上链验证

Presale dApp 的作用：

- 展示 AIOracle 项目
- 提供 Token Presale 参与入口
- 展示 Oracle 网络与 RWA 场景
- 建立用户信任

--------------------------------------------------

# 2 固定业务规则（不可修改）

以下规则必须严格遵守。

Presale 阶段：

15 stages

价格增长：

每阶段 +10%

第一阶段价格：

0.001 USDT

解锁模型：

Plan B

解锁规则：

- 30% 在 TGE 解锁
- 85% 在 6 个月内线性释放

最小购买：

100 USDT 等值

支持网络：

BSC  
Ethereum  
Solana

默认网络：

BSC

支持支付资产：

USDT  
USDC  
ETH  
SOL

重要限制：

BTC 已完全移除。

系统中 **不得出现任何 BTC 支付逻辑**。

--------------------------------------------------

# 3 技术架构

前端技术栈：

Next.js 14  
TypeScript  
TailwindCSS  
shadcn/ui  

区块链交互：

wagmi  
RainbowKit  
ethers  

Solana 支持：

@solana/web3.js  
@solana/wallet-adapter-react  

架构原则：

- App Router
- 组件化架构
- Service Layer
- Mock Contract Layer
- 强类型 TypeScript
- 配置驱动

--------------------------------------------------

# 4 项目结构

推荐项目结构：

/app  
/components  
/config  
/hooks  
/lib  
/services  
/types  
/docs  

关键文件结构：

components/

hero.tsx  
presale-console.tsx  
trust-stack.tsx  
durian-proof.tsx  
tokenomics.tsx  
footer.tsx  

components/modals/

confirm-purchase-modal.tsx  
price-table-modal.tsx  
safety-modal.tsx  

config/

networks.ts  
tokens.ts  
presale.ts  

services/

presaleService.ts  
quoteService.ts  

hooks/

usePresaleTx.ts  
usePresaleQuote.ts  
useWalletState.ts  

types/

tx-state.ts  
presale.ts  

--------------------------------------------------

# 5 Presale Console 功能

Presale 控制台必须包含以下信息：

当前阶段  
当前价格  
下一阶段价格  
已售数量  
剩余 Token  
倒计时  

用户交互：

网络选择  
Token 选择  
金额输入  
MAX 按钮  
预计获得 Token  

辅助信息：

支持网络  
支持 Token  
Launch checklist  
防诈骗提示  
用户购买统计

默认状态：

network = BSC  
token = USDT  

--------------------------------------------------

# 6 网络与 Token 规则

BSC：

USDT  
USDC  
ETH  

Ethereum：

USDT  
USDC  
ETH  

Solana：

USDT  
USDC  
SOL  

规则：

如果用户选择无效 Token 组合，系统自动修正。

例如：

Solana 网络不允许 ETH。

--------------------------------------------------

# 7 交易状态机

前端必须实现交易状态机。

状态：

idle  
wallet_not_connected  
wrong_network  
input_invalid  
awaiting_signature  
submitted  
confirmed  
failed  

典型流程：

idle → awaiting_signature → submitted → confirmed

错误流程：

idle → failed

交易状态机用于：

- UI 状态控制
- 错误提示
- 钱包签名流程

实现文件：

types/tx-state.ts  
hooks/usePresaleTx.ts  

--------------------------------------------------

# 8 合约接口层

由于 Presale 合约可能尚未部署，需要实现 **占位接口层**。

模块：

Presale Contract  
Vesting Contract  
Treasury Contract  

接口函数：

getCurrentStage()  
getCurrentPrice()  
getNextPrice()  
getUserAllocation(address)  
getClaimable(address)  
buyWithERC20(token, amount)  
buyWithNative(amount)  
claim()  

所有 ABI 先使用 placeholder。

未来再接入真实合约。

--------------------------------------------------

# 9 Codex 开发 Prompt

You are a senior full-stack Web3 engineer.

Build the first production-ready frontend engineering version of the AIOracle presale dApp.

Important rules:

Do not invent new business rules.  
Do not add BTC payment.  
Only implement what is specified.

Project

AIOracle  
AIOracle.link

Business rules

15 presale stages  
Stage price increases 10 percent  
Stage 1 price 0.001 USDT  

Unlock model

15 percent TGE  
85 percent linear vesting 12 months  

Minimum purchase

100 USDT equivalent  

Supported networks

BSC  
Ethereum  
Solana  

Supported tokens

USDT  
USDC  
ETH  
SOL  

BTC removed.

Tech stack

Next.js  
TypeScript  
Tailwind  
wagmi  
RainbowKit  
ethers  
solana web3  

Deliverables

1 runnable Next.js project  
2 presale console UI  
3 wallet connection  
4 transaction state machine  
5 mock contract service layer  
6 README documentation  

--------------------------------------------------

# 10 Claude Code Review Prompt

You are a senior Web3 product reviewer and frontend engineer.

Review the AIOracle presale dApp implementation.

Focus on:

copy clarity  
UX quality  
code structure  
transaction flow  
error handling  

Rules

Do not change business rules.  
Do not add BTC payment.  
Do not introduce financial promises.

Review areas

homepage copy  
presale console wording  
wallet UX  
risk disclosure  
anti scam text  
transaction messages  
modal wording  

Output sections

critical issues  
copy improvements  
UX improvements  
engineering improvements  

Tone

professional  
clear  
trustworthy  

--------------------------------------------------

# 11 推荐 AI 开发流程

推荐开发顺序：

第一阶段

Codex 生成项目骨架：

- presale console
- wallet provider
- transaction state machine
- mock service layer

第二阶段

接入 EVM：

BSC  
Ethereum  

第三阶段

接入 Solana。

第四阶段

使用 Claude Code 进行：

- 文案优化
- UX 审查
- 工程质量检查

--------------------------------------------------

# 文档结束