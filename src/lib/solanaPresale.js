import bs58 from 'bs58'

const BUY_WITH_SPL_DISCRIMINATOR_HEX = '56c2e072bb008135'
const CLAIM_TOKENS_DISCRIMINATOR_HEX = '6cd8d2e700d42a40'
const PAYMENT_DECIMALS = 6
const AIO_DECIMALS = 6
const BUYER_POSITION_SEED = 'buyer_position'
const ZERO_PUBLIC_KEY = '11111111111111111111111111111111'

let solanaModulePromise = null

async function loadSolanaModules() {
  if (!solanaModulePromise) {
    solanaModulePromise = Promise.all([
      import('buffer/'),
      import('@solana/web3.js'),
      import('@solana/spl-token'),
    ]).then(([bufferModule, web3Module, splTokenModule]) => {
      const { Buffer } = bufferModule
      if (typeof window !== 'undefined' && !window.Buffer) {
        window.Buffer = Buffer
      }

      return {
        Buffer,
        ...web3Module,
        ...splTokenModule,
      }
    })
  }

  return solanaModulePromise
}

function normalizeConfig(rawConfig) {
  if (!rawConfig) {
    return null
  }

  return {
    environment: rawConfig.environment,
    warning: rawConfig.warning,
    rpcUrl: rawConfig.rpc_url ?? rawConfig.rpcUrl,
    programId: rawConfig.program_id ?? rawConfig.programId,
    presaleConfigPda: rawConfig.presale_config_pda ?? rawConfig.presaleConfigPda,
    presaleTokenVault: rawConfig.presale_token_vault ?? rawConfig.presaleTokenVault,
    paymentMint: rawConfig.payment_mint ?? rawConfig.paymentMint,
    aioMint: rawConfig.aio_mint ?? rawConfig.aioMint,
    admin: rawConfig.admin,
    treasury: rawConfig.treasury,
    buyer: rawConfig.buyer,
    treasuryPaymentAccount: rawConfig.treasury_payment_account ?? rawConfig.treasuryPaymentAccount,
    buyerPaymentAccount: rawConfig.buyer_payment_account ?? rawConfig.buyerPaymentAccount,
    buyerAioAccount: rawConfig.buyer_aio_account ?? rawConfig.buyerAioAccount,
    initializeSignature: rawConfig.initialize_signature ?? rawConfig.initializeSignature,
    buyerMintSignature: rawConfig.buyer_mint_signature ?? rawConfig.buyerMintSignature,
    aioMintSignature: rawConfig.aio_mint_signature ?? rawConfig.aioMintSignature,
    depositSignature: rawConfig.deposit_signature ?? rawConfig.depositSignature,
  }
}

function readU8(data, offset) {
  return data[offset]
}

function readU16(data, offset) {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint16(offset, true)
}

function readU64(data, offset) {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(offset, true)
}

function readI64(data, offset) {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getBigInt64(offset, true)
}

async function readPubkey(data, offset) {
  const { PublicKey } = await loadSolanaModules()
  return new PublicKey(data.subarray(offset, offset + 32))
}

async function decodePresaleConfigAccount(data) {
  const { Buffer } = await loadSolanaModules()
  const payload = Buffer.from(data).subarray(8)
  let offset = 0

  const admin = await readPubkey(payload, offset)
  offset += 32
  const treasury = await readPubkey(payload, offset)
  offset += 32
  const paymentMint = await readPubkey(payload, offset)
  offset += 32
  const aioMint = await readPubkey(payload, offset)
  offset += 32

  const totalStages = readU8(payload, offset)
  offset += 1
  const currentStage = readU8(payload, offset)
  offset += 1
  const paymentMintDecimals = readU8(payload, offset)
  offset += 1
  const aioMintDecimals = readU8(payload, offset)
  offset += 1
  const tgeReleaseBps = readU16(payload, offset)
  offset += 2
  const linearReleaseBps = readU16(payload, offset)
  offset += 2
  const vestingDurationMonths = readU8(payload, offset)
  offset += 1
  const priceIncreaseBps = readU16(payload, offset)
  offset += 2
  const paused = readU8(payload, offset) === 1
  offset += 1
  const bump = readU8(payload, offset)
  offset += 1
  const minPurchaseAmount = readU64(payload, offset)
  offset += 8
  const basePriceInUsd6 = readU64(payload, offset)
  offset += 8
  const totalPaymentCollected = readU64(payload, offset)
  offset += 8
  const totalTokensSold = readU64(payload, offset)
  offset += 8
  const claimStartTs = readI64(payload, offset)
  offset += 8
  const createdAt = readI64(payload, offset)
  offset += 8
  const updatedAt = readI64(payload, offset)

  return {
    admin,
    treasury,
    paymentMint,
    aioMint,
    totalStages,
    currentStage,
    paymentMintDecimals,
    aioMintDecimals,
    tgeReleaseBps,
    linearReleaseBps,
    vestingDurationMonths,
    priceIncreaseBps,
    paused,
    bump,
    minPurchaseAmount,
    basePriceInUsd6,
    totalPaymentCollected,
    totalTokensSold,
    claimStartTs,
    createdAt,
    updatedAt,
  }
}

async function decodeBuyerPositionAccount(data) {
  const { Buffer } = await loadSolanaModules()
  const payload = Buffer.from(data).subarray(8)
  let offset = 0

  const buyer = await readPubkey(payload, offset)
  offset += 32
  const presaleConfig = await readPubkey(payload, offset)
  offset += 32
  const purchasedTokens = readU64(payload, offset)
  offset += 8
  const paidAmount = readU64(payload, offset)
  offset += 8
  const claimedTokens = readU64(payload, offset)
  offset += 8
  const purchaseCount = readU64(payload, offset)
  offset += 8
  const lastPurchaseTs = readI64(payload, offset)
  offset += 8
  const bump = readU8(payload, offset)

  return {
    buyer,
    presaleConfig,
    purchasedTokens,
    paidAmount,
    claimedTokens,
    purchaseCount,
    lastPurchaseTs,
    bump,
  }
}

function getClaimableRaw(position, presaleConfig, nowTs = Math.floor(Date.now() / 1000)) {
  if (!position || !presaleConfig) {
    return 0n
  }

  const claimStartTs = Number(presaleConfig.claimStartTs)
  if (claimStartTs <= 0) {
    return 0n
  }

  const purchased = position.purchasedTokens
  const tgeUnlocked = (purchased * BigInt(presaleConfig.tgeReleaseBps)) / 10_000n
  const vestingSeconds = BigInt(presaleConfig.vestingDurationMonths) * 30n * 24n * 60n * 60n
  const elapsedSeconds = BigInt(Math.max(nowTs - claimStartTs, 0))
  let linearUnlocked = 0n

  if (elapsedSeconds > 0n) {
    const linearTotal = (purchased * BigInt(presaleConfig.linearReleaseBps)) / 10_000n
    linearUnlocked =
      elapsedSeconds >= vestingSeconds || vestingSeconds === 0n
        ? linearTotal
        : (linearTotal * elapsedSeconds) / vestingSeconds
  }

  const unlocked = tgeUnlocked + linearUnlocked
  return unlocked > position.claimedTokens ? unlocked - position.claimedTokens : 0n
}

async function createU64InstructionData(discriminatorHex, value) {
  const { Buffer } = await loadSolanaModules()
  const discriminator = Buffer.from(discriminatorHex, 'hex')
  const data = Buffer.alloc(16)
  discriminator.copy(data, 0)
  data.writeBigUInt64LE(value, 8)
  return data
}

async function createBuyInstructionData({
  paymentAmountRaw,
  directReferrerAddress,
  indirectReferrerAddress,
  promoId = 0,
}) {
  const { Buffer, PublicKey } = await loadSolanaModules()
  const discriminator = Buffer.from(BUY_WITH_SPL_DISCRIMINATOR_HEX, 'hex')
  const data = Buffer.alloc(81)
  discriminator.copy(data, 0)
  data.writeBigUInt64LE(paymentAmountRaw, 8)
  new PublicKey(directReferrerAddress || ZERO_PUBLIC_KEY).toBuffer().copy(data, 16)
  new PublicKey(indirectReferrerAddress || ZERO_PUBLIC_KEY).toBuffer().copy(data, 48)
  data.writeUInt8(Number.isFinite(Number(promoId)) ? Number(promoId) : 0, 80)
  return data
}

async function ensureAtaInstruction(connection, payer, mint, owner) {
  const {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
  } = await loadSolanaModules()

  const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
  const accountInfo = await connection.getAccountInfo(ata)
  if (accountInfo) {
    return { ata, instruction: null }
  }

  return {
    ata,
    instruction: createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  }
}

async function resolveReferrerAccounts({ paymentMint, directReferrerAddress, indirectReferrerAddress }) {
  const {
    PublicKey,
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
  } = await loadSolanaModules()

  const directReferrer = directReferrerAddress ? new PublicKey(directReferrerAddress) : null
  const indirectReferrer = indirectReferrerAddress ? new PublicKey(indirectReferrerAddress) : null

  if (!directReferrer && indirectReferrer) {
    throw new Error('Indirect Solana referrer requires a direct referrer.')
  }

  if (directReferrer && indirectReferrer && directReferrer.equals(indirectReferrer)) {
    throw new Error('Direct and indirect Solana referrers must be different wallets.')
  }

  return {
    directReferrer,
    directReferrerPaymentAccount: directReferrer
      ? getAssociatedTokenAddressSync(paymentMint, directReferrer, false, TOKEN_PROGRAM_ID)
      : null,
    indirectReferrer,
    indirectReferrerPaymentAccount: indirectReferrer
      ? getAssociatedTokenAddressSync(paymentMint, indirectReferrer, false, TOKEN_PROGRAM_ID)
      : null,
  }
}

async function buildBuyInstructions({
  connection,
  normalizedConfig,
  buyer,
  directReferrerAddress,
  indirectReferrerAddress,
  promoId = 0,
}) {
  const {
    Buffer,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await loadSolanaModules()
  const programId = new PublicKey(normalizedConfig.programId)
  const presaleConfigPda = new PublicKey(normalizedConfig.presaleConfigPda)
  const paymentMint = new PublicKey(normalizedConfig.paymentMint)
  const treasury = new PublicKey(normalizedConfig.treasury)
  const treasuryPaymentAccount = new PublicKey(normalizedConfig.treasuryPaymentAccount)
  const [buyerPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(BUYER_POSITION_SEED), presaleConfigPda.toBuffer(), buyer.toBuffer()],
    programId,
  )

  const { ata: buyerPaymentAccount, instruction: createBuyerPaymentAtaIx } = await ensureAtaInstruction(
    connection,
    buyer,
    paymentMint,
    buyer,
  )
  const referrerAccounts = await resolveReferrerAccounts({
    paymentMint,
    directReferrerAddress,
    indirectReferrerAddress,
  })

  return {
    buyerPositionPda,
    buyerPaymentAccount,
    createBuyerPaymentAtaIx,
    buildInstruction: async (paymentAmountRaw) =>
      new TransactionInstruction({
        programId,
        keys: [
          { pubkey: buyer, isSigner: true, isWritable: true },
          { pubkey: presaleConfigPda, isSigner: false, isWritable: true },
          { pubkey: buyerPositionPda, isSigner: false, isWritable: true },
          { pubkey: paymentMint, isSigner: false, isWritable: false },
          { pubkey: buyerPaymentAccount, isSigner: false, isWritable: true },
          { pubkey: treasuryPaymentAccount, isSigner: false, isWritable: true },
          { pubkey: treasury, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ...(referrerAccounts.directReferrer
            ? [
                { pubkey: referrerAccounts.directReferrer, isSigner: false, isWritable: false },
                { pubkey: referrerAccounts.directReferrerPaymentAccount, isSigner: false, isWritable: true },
              ]
            : []),
          ...(referrerAccounts.indirectReferrer
            ? [
                { pubkey: referrerAccounts.indirectReferrer, isSigner: false, isWritable: false },
                { pubkey: referrerAccounts.indirectReferrerPaymentAccount, isSigner: false, isWritable: true },
              ]
            : []),
        ],
        data: await createBuyInstructionData({
          paymentAmountRaw,
          directReferrerAddress: referrerAccounts.directReferrer?.toBase58(),
          indirectReferrerAddress: referrerAccounts.indirectReferrer?.toBase58(),
          promoId,
        }),
      }),
  }
}

async function buildClaimInstructions({ connection, normalizedConfig, buyer }) {
  const { Buffer, PublicKey, TransactionInstruction, TOKEN_PROGRAM_ID } = await loadSolanaModules()
  const programId = new PublicKey(normalizedConfig.programId)
  const presaleConfigPda = new PublicKey(normalizedConfig.presaleConfigPda)
  const aioMint = new PublicKey(normalizedConfig.aioMint)
  const presaleTokenVault = new PublicKey(normalizedConfig.presaleTokenVault)
  const [buyerPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(BUYER_POSITION_SEED), presaleConfigPda.toBuffer(), buyer.toBuffer()],
    programId,
  )
  const { ata: buyerAioAccount, instruction: createBuyerAioAtaIx } = await ensureAtaInstruction(
    connection,
    buyer,
    aioMint,
    buyer,
  )

  return {
    buyerPositionPda,
    buyerAioAccount,
    createBuyerAioAtaIx,
    instruction: new TransactionInstruction({
      programId,
      keys: [
        { pubkey: buyer, isSigner: true, isWritable: true },
        { pubkey: presaleConfigPda, isSigner: false, isWritable: true },
        { pubkey: buyerPositionPda, isSigner: false, isWritable: true },
        { pubkey: aioMint, isSigner: false, isWritable: false },
        { pubkey: presaleTokenVault, isSigner: false, isWritable: true },
        { pubkey: buyerAioAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: await createU64InstructionData(CLAIM_TOKENS_DISCRIMINATOR_HEX, 0n).then((data) => data.subarray(0, 8)),
    }),
  }
}

async function buildUnsignedTransaction({ connection, payer, instructions }) {
  const { Transaction } = await loadSolanaModules()
  const transaction = new Transaction()
  for (const instruction of instructions) {
    transaction.add(instruction)
  }

  // Mobile deeplink signing still needs a recent blockhash and fee payer even before the wallet signs.
  transaction.feePayer = payer
  const latestBlockhash = await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = latestBlockhash.blockhash

  return transaction
}

async function sendWalletTransaction(connection, walletProvider, instructions) {
  const { Transaction } = await loadSolanaModules()
  const transaction = new Transaction()
  for (const instruction of instructions) {
    transaction.add(instruction)
  }

  transaction.feePayer = walletProvider.publicKey
  const latestBlockhash = await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = latestBlockhash.blockhash

  if (typeof walletProvider.signAndSendTransaction === 'function') {
    const result = await walletProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'confirmed',
    })
    const signature = result.signature ?? result
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      'confirmed',
    )
    return signature
  }

  const signedTransaction = await walletProvider.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    preflightCommitment: 'confirmed',
  })
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    'confirmed',
  )
  return signature
}

export function getInjectedSolanaProvider(providerId) {
  if (typeof window === 'undefined') {
    return null
  }

  if (providerId === 'phantom') {
    if (window.phantom?.solana?.isPhantom) {
      return window.phantom.solana
    }
    if (window.solana?.isPhantom) {
      return window.solana
    }
  }

  if (providerId === 'solflare') {
    if (window.solflare?.isSolflare) {
      return window.solflare
    }
    if (window.solana?.isSolflare) {
      return window.solana
    }
  }

  return null
}

export function getSolanaProviderInstallUrl(providerId) {
  const isMobileDevice =
    typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || navigator.vendor || '')

  if (providerId === 'phantom') {
    return isMobileDevice
      ? 'https://phantom.com/download'
      : 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa'
  }

  if (providerId === 'solflare') {
    return isMobileDevice
      ? 'https://www.solflare.com/download/'
      : 'https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic'
  }

  return isMobileDevice ? 'https://phantom.com/download' : 'https://chromewebstore.google.com/'
}

export async function connectInjectedSolanaWallet(providerId) {
  const walletProvider = getInjectedSolanaProvider(providerId)
  if (!walletProvider) {
    throw new Error('Selected Solana wallet was not detected. Open this page inside Phantom or Solflare, or install the browser extension first.')
  }

  const response = await walletProvider.connect()
  const publicKey = response.publicKey ?? walletProvider.publicKey
  if (!publicKey) {
    throw new Error('Wallet connected without returning a public key.')
  }

  return {
    walletProvider,
    address: publicKey.toBase58(),
  }
}

export async function loadDevnetSolanaConfig(configUrl) {
  const response = await fetch(configUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Unable to load Solana devnet config: ${response.status}`)
  }

  return normalizeConfig(await response.json())
}

export async function createSolanaConnection(rpcUrl) {
  const { Connection } = await loadSolanaModules()
  return new Connection(rpcUrl, 'confirmed')
}

export function formatSolanaExplorerUrl(signature, cluster = 'devnet') {
  const suffix = cluster ? `?cluster=${cluster}` : ''
  return `https://explorer.solana.com/tx/${signature}${suffix}`
}

export function shortAddress(address, head = 4, tail = 4) {
  if (!address || address.length <= head + tail + 3) {
    return address
  }

  return `${address.slice(0, head)}...${address.slice(-tail)}`
}

export function toUiAmount(rawAmount, decimals = PAYMENT_DECIMALS) {
  return Number(rawAmount) / 10 ** decimals
}

export function toRawAmount(uiAmount, decimals = PAYMENT_DECIMALS) {
  return BigInt(Math.round(uiAmount * 10 ** decimals))
}

export async function fetchSolanaBuyerSnapshot({ config, buyerAddress }) {
  const normalizedConfig = normalizeConfig(config)
  if (!normalizedConfig) {
    return null
  }

  const { Buffer, PublicKey } = await loadSolanaModules()
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const programId = new PublicKey(normalizedConfig.programId)
  const presaleConfigPda = new PublicKey(normalizedConfig.presaleConfigPda)
  const buyer = new PublicKey(buyerAddress)
  const [buyerPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(BUYER_POSITION_SEED), presaleConfigPda.toBuffer(), buyer.toBuffer()],
    programId,
  )
  const [presaleConfigAccount, buyerPositionAccount] = await Promise.all([
    connection.getAccountInfo(presaleConfigPda),
    connection.getAccountInfo(buyerPositionPda),
  ])

  const presaleConfig = presaleConfigAccount ? await decodePresaleConfigAccount(presaleConfigAccount.data) : null
  const buyerPosition = buyerPositionAccount ? await decodeBuyerPositionAccount(buyerPositionAccount.data) : null
  const claimableRaw = getClaimableRaw(buyerPosition, presaleConfig)

  return {
    buyerPositionPda: buyerPositionPda.toBase58(),
    presaleConfig,
    buyerPosition,
    claimableRaw,
    claimableUi: toUiAmount(claimableRaw, AIO_DECIMALS),
  }
}

export async function fetchSolanaWalletOverview({ config, rpcUrl, buyerAddress }) {
  const normalizedConfig = normalizeConfig(config)
  const resolvedRpcUrl = normalizedConfig?.rpcUrl ?? rpcUrl

  if (!resolvedRpcUrl || !buyerAddress) {
    return null
  }

  const { PublicKey, LAMPORTS_PER_SOL } = await loadSolanaModules()
  const connection = await createSolanaConnection(resolvedRpcUrl)
  const owner = new PublicKey(buyerAddress)

  const readTokenUiAmount = async (mint) => {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, { mint })
    return tokenAccounts.value.reduce((sum, account) => {
      const amount = account.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0
      return sum + Number(amount)
    }, 0)
  }

  const nativeLamports = await connection.getBalance(owner, 'confirmed')

  let paymentBalanceUi = null
  if (normalizedConfig?.paymentMint) {
    paymentBalanceUi = await readTokenUiAmount(new PublicKey(normalizedConfig.paymentMint))
  }

  let saleBalanceUi = null
  if (normalizedConfig?.aioMint) {
    saleBalanceUi = await readTokenUiAmount(new PublicKey(normalizedConfig.aioMint))
  }

  return {
    nativeSymbol: 'SOL',
    nativeBalanceUi: Number(nativeLamports) / LAMPORTS_PER_SOL,
    paymentSymbol: normalizedConfig?.paymentMint ? 'USDC' : '--',
    paymentBalanceUi,
    saleSymbol: normalizedConfig?.aioMint ? 'AIO' : '--',
    saleBalanceUi,
    hasProjectTokenConfig: Boolean(normalizedConfig?.paymentMint && normalizedConfig?.aioMint),
  }
}

export async function submitSolanaBuy({
  config,
  walletProvider,
  paymentAmountUi,
  promoId = 0,
  directReferrerAddress,
  indirectReferrerAddress,
}) {
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const buyer = walletProvider.publicKey
  const paymentAmountRaw = toRawAmount(paymentAmountUi, PAYMENT_DECIMALS)
  const { buyerPositionPda, buyerPaymentAccount, createBuyerPaymentAtaIx, buildInstruction } = await buildBuyInstructions({
    connection,
    normalizedConfig,
    buyer,
    directReferrerAddress,
    indirectReferrerAddress,
    promoId,
  })

  const instructions = []
  if (createBuyerPaymentAtaIx) {
    instructions.push(createBuyerPaymentAtaIx)
  }

  instructions.push(await buildInstruction(paymentAmountRaw))

  return {
    signature: await sendWalletTransaction(connection, walletProvider, instructions),
    buyerPositionPda: buyerPositionPda.toBase58(),
    buyerPaymentAccount: buyerPaymentAccount.toBase58(),
  }
}

export async function submitSolanaClaim({ config, walletProvider }) {
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const buyer = walletProvider.publicKey
  const { buyerPositionPda, buyerAioAccount, createBuyerAioAtaIx, instruction } = await buildClaimInstructions({
    connection,
    normalizedConfig,
    buyer,
  })

  const instructions = []
  if (createBuyerAioAtaIx) {
    instructions.push(createBuyerAioAtaIx)
  }

  instructions.push(instruction)

  return {
    signature: await sendWalletTransaction(connection, walletProvider, instructions),
    buyerPositionPda: buyerPositionPda.toBase58(),
    buyerAioAccount: buyerAioAccount.toBase58(),
  }
}

export async function buildSolanaBuyTransaction({
  config,
  buyerAddress,
  paymentAmountUi,
  promoId = 0,
  directReferrerAddress,
  indirectReferrerAddress,
}) {
  const { PublicKey } = await loadSolanaModules()
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const buyer = new PublicKey(buyerAddress)
  const paymentAmountRaw = toRawAmount(paymentAmountUi, PAYMENT_DECIMALS)
  const { buyerPositionPda, buyerPaymentAccount, createBuyerPaymentAtaIx, buildInstruction } = await buildBuyInstructions({
    connection,
    normalizedConfig,
    buyer,
    directReferrerAddress,
    indirectReferrerAddress,
    promoId,
  })

  const instructions = []
  if (createBuyerPaymentAtaIx) {
    instructions.push(createBuyerPaymentAtaIx)
  }
  instructions.push(await buildInstruction(paymentAmountRaw))

  const transaction = await buildUnsignedTransaction({
    connection,
    payer: buyer,
    instructions,
  })

  return {
    transaction: bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    ),
    buyerPositionPda: buyerPositionPda.toBase58(),
    buyerPaymentAccount: buyerPaymentAccount.toBase58(),
  }
}

export async function buildSolanaClaimTransaction({ config, buyerAddress }) {
  const { PublicKey } = await loadSolanaModules()
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const buyer = new PublicKey(buyerAddress)
  const { buyerPositionPda, buyerAioAccount, createBuyerAioAtaIx, instruction } = await buildClaimInstructions({
    connection,
    normalizedConfig,
    buyer,
  })

  const instructions = []
  if (createBuyerAioAtaIx) {
    instructions.push(createBuyerAioAtaIx)
  }
  instructions.push(instruction)

  const transaction = await buildUnsignedTransaction({
    connection,
    payer: buyer,
    instructions,
  })

  return {
    transaction: bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    ),
    buyerPositionPda: buyerPositionPda.toBase58(),
    buyerAioAccount: buyerAioAccount.toBase58(),
  }
}

export async function submitSignedSolanaTransaction({ config, signedTransaction }) {
  const { Buffer, Transaction } = await loadSolanaModules()
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  const serializedTransaction = Buffer.from(bs58.decode(signedTransaction))
  const transaction = Transaction.from(serializedTransaction)
  const signature = await connection.sendRawTransaction(serializedTransaction, {
    preflightCommitment: 'confirmed',
  })

  await connection.confirmTransaction(
    {
      signature,
      blockhash: transaction.recentBlockhash,
      lastValidBlockHeight: (await connection.getLatestBlockhash('confirmed')).lastValidBlockHeight,
    },
    'confirmed',
  )

  return {
    signature,
  }
}

export async function confirmSolanaSignature({ config, signature }) {
  const normalizedConfig = normalizeConfig(config)
  const connection = await createSolanaConnection(normalizedConfig.rpcUrl)
  await connection.confirmTransaction(signature, 'confirmed')
  return {
    signature,
  }
}
