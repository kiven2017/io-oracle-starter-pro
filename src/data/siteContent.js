export const navItems = [
  { id: 'experts', href: '#experts', label: 'Core Team' },
  { id: 'durian', href: '#durian', label: 'Use Case' },
  { id: 'whitepaper', href: '#whitepaper', label: 'Abstract' },
  { id: 'tech', href: '#tech', label: 'Technology' },
  { id: 'advisors', href: '#advisors', label: 'Advisory' },
]

export const heroIndustries = ['Smart Agriculture', 'Smart Logistics', 'Green Energy']

export const presaleSnapshot = {
  stage: '1 / 15',
  price: '$0.0035',
  next: '$0.0039',
  network: 'BSC / ETH / SOL',
  soldPercent: 45.2,
  remaining: '54,800,000 AIO REMAINING',
  vesting: ['15% at TGE', '12-Month Linear'],
  statuses: [
    { label: 'Audit', value: 'Running', tone: 'text-cyan-400' },
    { label: 'Multisig', value: 'Enabled', tone: 'text-green-500' },
    { label: 'MVP Demo', value: 'Pending', tone: 'text-slate-600' },
  ],
}

export const teamMembers = [
  {
    name: 'Vincent Lee',
    title: 'Co-founder / Chairman',
    src: '/assets/team/core/vincent-lee.jpg',
    initials: 'VL',
    gradient: ['#22d3ee', '#2563eb'],
    descriptionZh:
      '香港RWA全球产业联盟共同发起人、技术专家委委员，香港财富通控股集团董事长。拥有20余年AI、区块链及物联网研发经验，曾任大连海事大学国家重点专项技术负责人。持有及申请中专利近20项，著有《RWA重构金融商业模式》。',
    descriptionEn:
      'Co-founder of Hong Kong RWA Global Industry Alliance and Chairman of Fortune Link Holdings. With over 20 years of experience in AI, Blockchain, and IoT, he previously led national-level research projects at Dalian Maritime University. He holds nearly 20 patents and is the author of RWA: Restructuring Financial Business Models.',
  },
  {
    name: 'Kevin',
    title: 'Deputy Director',
    src: '/assets/team/core/kevin.jpg',
    initials: 'K',
    gradient: ['#0f172a', '#22d3ee'],
    descriptionZh:
      '中国通信工业协会区块链专委会常务副主任，工信部及多地政府区块链与元宇宙智库专家。深耕文化科技融合与“链改”行动，是国内首批区块链人才评价认证专家及讲师。',
    descriptionEn:
      'Deputy Director of the Blockchain Committee of China Communications Industry Association and a key advisor for MIIT and various municipal governments on Metaverse and Blockchain. He is a pioneer of the "Chain Reform" initiative and an expert in the integration of culture and technology.',
  },
  {
    name: 'Aliks Dou',
    title: 'Executive Secretary-General',
    src: '/assets/team/core/aliks-dou.jpg',
    initials: 'AD',
    gradient: ['#2563eb', '#0f172a'],
    descriptionZh:
      '中国通信工业协会区块链专委会执行秘书长，香港RWA全球产业联盟发起人。数字藏品标准制定领军人物，主导编撰《数字藏品通用标准》，致力于产业数字化转型与数字经济研究。',
    descriptionEn:
      'Executive Secretary-General of the Blockchain Committee of China Communications Industry Association and Founder of the Hong Kong RWA Global Industry Alliance. A leading expert in digital economy and industrial transformation, he spearheaded the compilation of the General Standards for Digital Collections.',
  },
]

export const proofSteps = [
  {
    title: '1) Source Batch Creation',
    description:
      'Assigning unique Device DID to shipment lots, establishing data sovereignty at origin.',
    border: 'border-cyan-500/60',
  },
  {
    title: '2) Hardware Integrity Signature',
    description:
      'Sensor logs signed inside NXP SE050 chip. Hardware-level immutability for the global supply chain.',
    border: 'border-cyan-500/30',
  },
  {
    title: '3) Verifiable Truth Proof',
    description:
      'On-chain hashes serve as audit-ready evidence for trade insurance, settlement, and compliance.',
    border: 'border-cyan-500/10',
  },
]

export const whitepaperCards = [
  {
    title: 'Physical Trust Stack',
    description: 'Hardware RoT + Device DID + Real Verification.',
    tone: 'hover:border-cyan-500/40',
  },
  {
    title: 'RoT Hardware Root',
    description: 'Tamper-proof key storage inside NXP SE050.',
    tone: 'hover:border-cyan-400/40',
  },
  {
    title: 'Data Oil Model',
    description: 'Scarcity powered by real-world physical signature.',
    tone: 'hover:border-cyan-400/40',
  },
  {
    title: 'PaaS Ecosystem',
    description: 'Unified multi-chain feeds for RWA settlement.',
    tone: 'hover:border-cyan-400/40',
  },
]

export const techPillars = [
  {
    title: 'Hardware RoT',
    description:
      'Source-level signing ensures data integrity for institutional RWA across Thai agriculture and Global energy sectors.',
  },
  {
    title: 'Modular PaaS',
    description:
      'From solar farms to logistics, AIOracle standardizes physical metrics for seamless multi-chain Web3 integration.',
  },
  {
    title: 'Oracle Network',
    description:
      'Real-world data feeds compatible with Solana and ETH, powering the next-gen DeFi liquidity bridges.',
  },
]

export const launchMetrics = [
  {
    label: 'Accepted Routing',
    value: 'USDC / Solana / Card',
    note: 'Checkout paths stay aligned with the active settlement routes shown in the console.',
  },
  {
    label: 'Claim Profile',
    value: '15% TGE',
    note: '12-month linear release mirrors the hero console unlock plan.',
  },
  {
    label: 'Trust Layer',
    value: 'SE050 + DID',
    note: 'Physical-origin signatures stay central to the product story.',
  },
]

export const launchSteps = [
  {
    title: 'Connect Wallet',
    description:
      'Use a production-ready wallet entry point with a clear security posture and chain context before purchase.',
  },
  {
    title: 'Choose Network',
    description:
      'Keep BSC and ETH routing prominent while preserving the original AIOracle stage, price, and schedule logic.',
  },
  {
    title: 'Secure Allocation',
    description:
      'Enter the active payment amount, preview token output, and keep the experience focused on a fast, premium presale flow.',
  },
  {
    title: 'Track Claim Window',
    description:
      'Surface TGE unlock, vesting schedule, and audit status in one place so post-purchase trust signals stay visible.',
  },
]

export const roadmapPhases = [
  {
    title: 'Stage 01',
    note: 'Presale active',
    detail: 'Stage 1 starts at $0.0035 with the first allocation now open.',
  },
  {
    title: 'Audit',
    note: 'Running',
    detail: 'Smart contract review remains visible as an always-on trust status.',
  },
  {
    title: 'MVP Demo',
    note: 'Pending',
    detail: 'Hardware proof and oracle data demos align with the durian cold-chain story.',
  },
  {
    title: 'Plan B',
    note: 'TGE release',
    detail: '15% unlock at TGE, followed by a 12-month linear vesting line.',
  },
]

export const tokenomicsPoints = [
  'IDC signature-driven burning logic',
  'Scarcity anchored to real-world asset volume',
]

export const advisors = [
  {
    name: 'Mr. Dachao Tian',
    src: '/assets/advisors/dachao-tian.png',
    handle: '@ChainfirCapital',
    lines: ['Founder of Chainfir Capital', 'Global Blockchain Fund Alliance'],
    initials: 'DT',
    gradient: ['#164e63', '#1d4ed8'],
  },
  {
    name: 'Aditya Kumar',
    src: '/assets/advisors/ishant-singh.png',
    handle: 'DevRel Lead / GTM',
    lines: ['Web3 x AI Ecosystem Strategy', 'Product Marketing Specialist'],
    initials: 'AK',
    gradient: ['#1d4ed8', '#581c87'],
  },
  {
    name: 'Ishant Singh',
    src: '/assets/advisors/aditya-kumar.png',
    handle: 'AI Product Leader',
    lines: ['Ex OpenAI, Amazon Architect', 'Startup Advisor & Founder'],
    initials: 'IS',
    gradient: ['#581c87', '#164e63'],
  },
]

export const affiliateTiers = [
  {
    title: 'Core Partner',
    slot: '10,000 USDT SLOT',
    direct: '12%',
    indirect: '5%',
    emphasis: 'border-cyan-500/40',
    cta: 'Apply for Core Slot',
    buttonClass: 'bg-cyan-500 text-black hover:bg-cyan-400',
  },
  {
    title: 'Standard Node',
    slot: '2,000 USDT SLOT',
    direct: '8%',
    indirect: '3%',
    emphasis: 'border-white/10',
    cta: 'Become Affiliate',
    buttonClass: 'bg-white/10 border border-white/10 text-white hover:bg-white/20',
  },
]

export const gatewayCards = [
  {
    title: 'Partner Alliance',
    description:
      'Asset holders and government bodies. Secure your RWA infrastructure with our trusted Oracle node network.',
    button: 'ALLIANCE ONBOARDING',
    accent: 'from-blue-900/20',
    iconTone: 'text-blue-400',
  },
  {
    title: 'Hardware Sandbox',
    description:
      'Early access to Financial-Grade (SE050) Oracles is now open for private trial. Secure your supply source.',
    button: 'REQUEST DEVICE TRIAL',
    accent: 'from-cyan-900/20',
    iconTone: 'text-cyan-400',
  },
]

export const faqItems = [
  {
    question: 'Which wallets and networks are expected to work?',
    answer:
      'The presale flow now supports BSC, Ethereum, and Solana routing in the interface. Users should connect a wallet that matches the selected settlement network and verify the network label again before approving any payment.',
  },
  {
    question: 'What is the minimum participation amount?',
    answer:
      'The page currently shows a 100 USDT minimum. That threshold is there to reduce failed micro-transactions and to keep the quote logic consistent with the active presale stage shown in the interface.',
  },
  {
    question: 'How is token allocation calculated during the presale?',
    answer:
      'Allocation is based on the active stage price displayed in the presale panel at the time of purchase. Buyers should always review the current stage, token price, selected network, and final receive amount in the checkout interface before confirming the transaction on-chain.',
  },
  {
    question: 'When do purchased tokens become claimable?',
    answer:
      'The current release plan shown on the page is 15% at TGE, with the remaining 85% released linearly over 12 months. Buyers should treat the final vesting dashboard and official token distribution notice as the source of record once the claim process goes live.',
  },
  {
    question: 'How can I verify that I am using the official sale page?',
    answer:
      'Use the official domain, verify links from the project\'s public channels, and check the announced social account before connecting a wallet. A legitimate team will not ask users to send funds through direct messages, private wallets, or unverified mirror pages.',
  },
  {
    question: 'Are presale purchases usually refundable?',
    answer:
      'In most token presales, confirmed on-chain purchases are treated as final unless a formal refund policy is published in the sale terms. That is why buyers should double-check the wallet address, network, amount, and vesting terms before approving a transaction.',
  },
]

export const strategicPartners = ['HK RWA Global Industry Alliance', 'Humanity Protocol']

export const officialWallets = [
  {
    id: 'bnb-bep20',
    title: 'BNB Chain (BEP20)',
    note: 'Official BNB Chain treasury wallet',
    address: '0x1FcCAc591Cc2B9Ae03c7763e21E3366814431330',
    accent: 'cyan',
  },
  {
    id: 'multichain',
    title: 'Multi-chain Wallet',
    note: 'Official multi-chain settlement wallet',
    address: '0x4A7819eAaBB7bd6BC2C519E3aBD2856087442BCf',
    accent: 'emerald',
  },
  {
    id: 'solana',
    title: 'Solana Wallet',
    note: 'Official Solana treasury wallet',
    address: 'BEw54UDHbNhZgjPYLG7oSyQLEzQPCvnmSgW7XStG7Kuk',
    accent: 'violet',
  },
]

export const footerGroups = [
  {
    title: 'Resources',
    links: [
      { label: 'GitBook', href: 'https://docs.aioracle.link', icon: 'book' },
      { label: 'Whitepaper V3.0', href: '#', icon: 'file' },
    ],
  },
  {
    title: 'Safety',
    links: [
      { label: 'Risk Disclosure', href: '#', icon: 'shield' },
      { label: 'Anti-Scam Guide', href: '#', icon: 'shield' },
    ],
  },
  {
    title: 'Official',
    links: [
      { label: 'Telegram Official', href: 'https://t.me/AIOracle_Official', icon: 'telegram' },
      { label: 'Telegram News', href: 'https://t.me/AIOracle_News', icon: 'telegram' },
      { label: 'Telegram Global', href: 'https://t.me/AIOracleGlobal', icon: 'telegram' },
      { label: 'X @AIOracle_link', href: 'https://x.com/AIOracle_link', icon: 'x' },
    ],
  },
]
