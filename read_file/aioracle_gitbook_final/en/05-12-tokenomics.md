---
title: 12. Tokenomics
sidebar_position: 5
---

# 12. Tokenomics

## 12.1 Basic Parameters
Token Name: AIOracle Token
Token Symbol: $AIO
Total Supply: 10,000,000,000
Decimals: 9

## 12.2 Allocation
- Node Rewards: 40%
- Ecosystem & Treasury: 15%
- Team: 15%
- Presale: 10%
- Liquidity: 10%
- Market & Advisors: 10%

## 12.3 Release Framework
The Node Rewards pool follows a halving-style emission curve every 24 months; Ecosystem & Treasury vests linearly over 48 months; Team has a 12-month cliff followed by 36 months linear vesting; Presale unlocks 15% at TGE and vests the remainder over 12 months; Liquidity is 100% available at TGE; Market & Advisors unlocks 10% at TGE and vests the remainder over 24 months.

## 12.4 TGE Framework
The estimated effective circulating supply at TGE is expected to be around 10%, subject to liquidity deployment, market support arrangements, and the actual unlock structure.

## 12.5 Node Incentive Formula

R_{node,i}=rac{W_i \cdot S_i \cdot Q_i}{\sum_j (W_j \cdot S_j \cdot Q_j)} \cdot R_{total}

Where $W_i$ is workload, $S_i$ is staking weight, $Q_i$ is quality score, and $R_{total}$ is total epoch reward.

## 12.6 Quality Factor
The further a node output deviates from the consensus value, the faster its quality score decays. Severe deviation may trigger downgrade or slashing.

## 12.7 Anti-Cheating Framework
AIOracle combines ZKP / computation proofs, TEE-based execution, and random audits with a Fisherman mechanism as a layered anti-cheating framework.

## 12.8 Revenue Transition
The long-term objective is to move node income gradually from protocol emissions toward AI request fees, trusted data service fees, and scenario-based revenue.
