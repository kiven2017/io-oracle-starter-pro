---
title: 12. Tokenomics｜代幣經濟模型
sidebar_position: 5
---

# 12. Tokenomics｜代幣經濟模型

## 12.1 基本參數
Token Name：AIOracle Token
Token Symbol：$AIO
Total Supply：10,000,000,000
Decimals：9

## 12.2 分配結構
- 節點獎勵：40%
- 生態與國庫：15%
- 團隊：15%
- 預售：10%
- 流動性：10%
- 市場與顧問：10%

## 12.3 釋放框架
節點獎勵池採用每 24 個月一次的減半式排放曲線；生態與國庫 48 個月線性；團隊 12 個月 Cliff 後 36 個月線性；預售 TGE 解鎖 15%，剩餘 12 個月線性；流動性 TGE 100%；市場與顧問 TGE 10%，剩餘 24 個月線性。

## 12.4 TGE 口徑
預計 TGE 初始有效流通約 10% 左右，具體取決於流動性部署、市場支持安排及實際解鎖結構。

## 12.5 節點激勵數學模型

R_{node,i}=rac{W_i \cdot S_i \cdot Q_i}{\sum_j (W_j \cdot S_j \cdot Q_j)} \cdot R_{total}

其中，$W_i$ 表示工作量，$S_i$ 表示質押權重，$Q_i$ 表示質量評分，$R_{total}$ 表示該週期總獎勵。

## 12.6 Quality Factor
節點輸出偏離共識值越大，質量分數將以衰減函數下降；超過治理閾值時，可能觸發降級或 Slashing。

## 12.7 防作弊框架
AIOracle 採用 ZKP / 計算證明、TEE 可信執行環境，以及隨機抽檢與 Fisherman 舉報機制作為多層防作弊結構。

## 12.8 收入切換邏輯
長期目標是讓節點收入由協議排放逐步過渡到由 AI 調用費、資料服務費與場景收入驅動。
