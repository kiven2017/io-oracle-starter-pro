# Wert Solana Handoff

## Goal

This document is the handoff package for `Wert + Solana smart contract checkout`.

It covers:

- what we should send to Wert
- what we need Wert to send back
- the current Solana sandbox contract details
- the exact env values we still need before end-to-end testing
- an English message template ready to send

## Our Integration Model

We are integrating `Solana smart contract checkout`, not the plain wallet onramp flow.

Our Solana program now supports:

- `payer = Wert side wallet`
- `beneficiary = end-user Solana wallet`
- purchase allocation recorded to the `beneficiary`
- later claim performed by the same `beneficiary`

That means our contract flow is compatible with:

- Wert paying with a SPL token account
- the user receiving the presale allocation without signing the purchase transaction

## Current Sandbox Contract Details

Current sandbox-style test setup in repo:

- Program ID: `2bFdEAeUTwavEKDD8ZN8jeqQE1jzN4cVCZ6GEMj14JSN`
- Presale Config PDA: `HLNBwUdHBAZT4QocLgMWK1W49xNo2pcTWYMAtMTUGy32`
- Payment Mint: `AZKvuGpNziXj4SvqdnmVU8qxhejERRtoLyDfhewYbWYe`
- AIO Mint: `F7hoxQ5xLZVofhniijJoWUEnsKfqJKDsS8trxVWTwrGQ`
- Treasury Owner: `54FmBeXamvtiN7KH42rVBrahu7jrNdS1qG5kW3b6BEpu`
- Treasury Payment Account: `qDi7pT8tyjBJ2DogGfR8mVpGhkqJcg9na1Znf4Zmgye`

Source:

- `public/config/solana.devnet.json`

## What We Need From Wert

Please ask Wert to provide or confirm the following for `sandbox` first:

1. `Partner ID`
2. `Smart Contract Signer private key`
3. `Solana payer wallet address`
4. `Solana payer SPL token account`
5. Which sandbox commodity they want us to use on Solana
   - expected answer is usually `TT`
6. Whether any extra allowlist / whitelist step is required on Solana for this flow
7. Whether they want any extra contract review materials besides contract address / repo / docs
8. Their expected `sc_input_data` shape for Solana
   - we currently generate `instruction JSON -> utf8 -> hex`
9. Confirmation that their Solana payer account will be the signer for the contract call and the end user wallet will be passed as `beneficiary`

## What We Will Provide To Wert

We should send them:

1. Product name and short use case
   - presale purchase via card
   - Solana smart contract execution
2. Environment
   - `sandbox`
3. Network
   - `solana`
4. Program ID
   - `2bFdEAeUTwavEKDD8ZN8jeqQE1jzN4cVCZ6GEMj14JSN`
5. Purchase model
   - `payer != beneficiary`
   - beneficiary receives allocation
6. Payment asset expectation
   - sandbox: `TT`
   - production target: `USDC`
7. Frontend test domain
   - fill in your actual staging domain if available
8. Backend callback / support URLs
   - fill in your actual URLs if available
9. Repo or technical review material
   - only if their team asks for it

## Env Vars We Still Need To Fill

These are the remaining values needed for the backend smart-contract flow:

```env
WERT_PARTNER_ID=
WERT_SC_SIGNER_PRIVATE_KEY=
WERT_SOLANA_PAYER_ADDRESS=
WERT_SOLANA_PAYER_PAYMENT_ACCOUNT=
```

These values can already be taken from repo defaults for sandbox if needed, but should still be confirmed:

```env
WERT_SOLANA_PROGRAM_ID=2bFdEAeUTwavEKDD8ZN8jeqQE1jzN4cVCZ6GEMj14JSN
WERT_SOLANA_PRESALE_CONFIG_PDA=HLNBwUdHBAZT4QocLgMWK1W49xNo2pcTWYMAtMTUGy32
WERT_SOLANA_PAYMENT_MINT=AZKvuGpNziXj4SvqdnmVU8qxhejERRtoLyDfhewYbWYe
WERT_SOLANA_TREASURY_ADDRESS=54FmBeXamvtiN7KH42rVBrahu7jrNdS1qG5kW3b6BEpu
WERT_SOLANA_TREASURY_PAYMENT_ACCOUNT=qDi7pT8tyjBJ2DogGfR8mVpGhkqJcg9na1Znf4Zmgye
```

## Backend Endpoint Ready For Testing

The repo now exposes this sandbox smart-contract payload endpoint:

```bash
POST /api/wert/solana/checkout
```

Example request:

```json
{
  "amount_usd": 100,
  "network_id": "solana",
  "payment_method_id": "visa",
  "click_id": "demo-solana-001",
  "beneficiary_address": "USER_SOLANA_WALLET"
}
```

It returns a payload containing:

- `partner_id`
- `widget_origin`
- `address`
- `commodity`
- `commodity_amount`
- `network`
- `sc_address`
- `sc_input_data`
- `signature`

## Local Preview Script

The repo now includes a preview helper:

```bash
cd master_project/python
python scripts/preview_wert_solana_checkout.py
```

This prints:

- a sample request body
- the signed payload we would send to the widget
- decoded Solana instruction JSON from `sc_input_data`

If the real Wert sandbox values are not in `.env` yet, the script falls back to demo placeholders so we can still share the payload shape with Wert for review.

## English Message Template

```text
Hi Wert team,

We are integrating Solana smart contract checkout for our presale flow and would like to start with sandbox first.

Our integration model is:
- network: Solana
- smart contract checkout
- payer wallet: Wert side
- beneficiary wallet: end-user Solana wallet
- the contract records the allocation to the beneficiary, and the beneficiary later claims from the same wallet

Our current sandbox contract details are:
- Program ID: 2bFdEAeUTwavEKDD8ZN8jeqQE1jzN4cVCZ6GEMj14JSN
- Presale Config PDA: HLNBwUdHBAZT4QocLgMWK1W49xNo2pcTWYMAtMTUGy32
- Payment Mint: AZKvuGpNziXj4SvqdnmVU8qxhejERRtoLyDfhewYbWYe
- Treasury Owner: 54FmBeXamvtiN7KH42rVBrahu7jrNdS1qG5kW3b6BEpu
- Treasury Payment Account: qDi7pT8tyjBJ2DogGfR8mVpGhkqJcg9na1Znf4Zmgye

Could you please share or confirm the following sandbox details for us:
- Partner ID
- Smart Contract Signer private key
- Solana payer wallet address
- Solana payer SPL token account
- the sandbox commodity we should use on Solana
- whether any extra allowlisting or review step is required for this flow
- whether our Solana sc_input_data format is correct for your execution flow

For our integration, the Solana instruction is built so that:
- payer signs and pays
- beneficiary receives the purchase allocation

If needed, we can also share our repository and a short technical walkthrough of the contract flow.

Thanks.
```

## Short Chinese Version

可以直接发给他们的大意：

- 我们接的是 `Solana smart contract checkout`
- 先走 `sandbox`
- 我们的模型是 `Wert 付款，用户钱包作为 beneficiary 收额度`
- 让他们回：
  - `Partner ID`
  - `Smart Contract Signer private key`
  - `Solana payer wallet`
  - `Solana payer SPL token account`
  - sandbox 应该用什么 commodity
  - 是否还需要额外审核/白名单

## Internal Next Step

After Wert sends the missing values:

1. fill `.env`
2. install backend deps
3. call `POST /api/wert/solana/checkout`
4. confirm widget opens with signed payload
5. run one sandbox purchase
6. verify the purchase allocation lands in the beneficiary PDA
