---
title: 20. Node Reward and Security Flow Appendix
sidebar_position: 13
---

# 20. Node Reward and Security Flow Appendix

For AIOracle, node incentives are not designed to reward raw compute alone. They are designed to reward effective work that is verifiable and accepted by the network. Workload, stake, quality scores, and penalty logic must therefore function together rather than relying on task count alone.

Node security also cannot depend on one mechanism in isolation. AIOracle combines consensus-based result comparison, random audits, quality-score decay, recomputation, TEE execution, and proof-oriented verification to make low-cost opportunistic cheating structurally unattractive over time.

## 20.1 Reward and Security Flow

Figure 20-1. Request processing, consensus, reward, and security flow

## 20.2 Quality-Factor Decay Curve

Figure 20-2. Illustrative quality-score decay under consensus deviation

## 20.3 Additional Notes

In production, the calculation of Qᵢ may vary by task class, data distribution, model type, and scenario risk. Deterministic tasks can use tighter thresholds, while predictive tasks may require wider tolerance bands and heavier historical-performance weighting.
