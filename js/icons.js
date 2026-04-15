// ============================================================
// js/icons.js — biblioteca de ícones SVG neon para o tema neon
// Cada ícone é um SVG 72x72 com gradientes e efeito glow.
// Use catIconSVG(id, size) para obter o SVG redimensionado.
// ============================================================

// ── Ícones de categoria ───────────────────────────────────────
const CAT_ICONS = {

mercado: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="im-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1f12"/><stop offset="100%" stop-color="#0a1a10"/></linearGradient>
<linearGradient id="im-g" x1="18" y1="18" x2="54" y2="54"><stop offset="0%" stop-color="#60ff90"/><stop offset="100%" stop-color="#20c060"/></linearGradient>
<filter id="im-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#im-bg)"/>
<path d="M20 26h32l-4 16H24L20 26z" fill="url(#im-g)" filter="url(#im-glow)" opacity=".9"/>
<path d="M16 22h6l4 4" stroke="#60ff90" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<circle cx="27" cy="47" r="3" fill="#20c060" opacity=".9"/>
<circle cx="43" cy="47" r="3" fill="#20c060" opacity=".9"/>
<rect x="27" y="30" width="5" height="8" rx="1.5" fill="rgba(255,255,255,0.25)"/>
<rect x="34" y="28" width="5" height="10" rx="1.5" fill="rgba(255,255,255,0.2)"/>
<rect x="41" y="31" width="5" height="7" rx="1.5" fill="rgba(255,255,255,0.22)"/>
</svg>`,

compra: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ic-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#1a0d1f"/><stop offset="100%" stop-color="#140a18"/></linearGradient>
<linearGradient id="ic-g" x1="20" y1="16" x2="52" y2="56"><stop offset="0%" stop-color="#e060ff"/><stop offset="100%" stop-color="#8020c0"/></linearGradient>
<filter id="ic-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ic-bg)"/>
<path d="M24 32h24l-3 20H27L24 32z" fill="url(#ic-g)" filter="url(#ic-glow)" opacity=".9"/>
<path d="M30 32V28a6 6 0 0 1 12 0v4" stroke="#e060ff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/>
<path d="M36 38l1.5 3 3.5.5-2.5 2.5.5 3.5L36 46l-3 1.5.5-3.5L31 41.5l3.5-.5z" fill="rgba(255,255,255,0.3)"/>
</svg>`,

uber: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="iu-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1420"/><stop offset="100%" stop-color="#0a1018"/></linearGradient>
<linearGradient id="iu-g" x1="14" y1="28" x2="58" y2="50"><stop offset="0%" stop-color="#60c0ff"/><stop offset="100%" stop-color="#2060e0"/></linearGradient>
<filter id="iu-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#iu-bg)"/>
<rect x="14" y="35" width="44" height="14" rx="5" fill="url(#iu-g)" filter="url(#iu-glow)" opacity=".9"/>
<path d="M22 35V29a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v6" fill="rgba(80,160,255,0.7)"/>
<rect x="25" y="29" width="9" height="6" rx="2" fill="rgba(180,230,255,0.35)"/>
<rect x="38" y="29" width="9" height="6" rx="2" fill="rgba(180,230,255,0.35)"/>
<circle cx="24" cy="50" r="5" fill="#1a3080" stroke="#60c0ff" stroke-width="2"/>
<circle cx="24" cy="50" r="2" fill="#60c0ff" opacity=".6"/>
<circle cx="48" cy="50" r="5" fill="#1a3080" stroke="#60c0ff" stroke-width="2"/>
<circle cx="48" cy="50" r="2" fill="#60c0ff" opacity=".6"/>
<path d="M12 32h8M10 36h6" stroke="#60c0ff" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
</svg>`,

onibus: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="io-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1a18"/><stop offset="100%" stop-color="#0a1410"/></linearGradient>
<linearGradient id="io-g" x1="16" y1="18" x2="56" y2="56"><stop offset="0%" stop-color="#40e0c0"/><stop offset="100%" stop-color="#20a080"/></linearGradient>
<filter id="io-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#io-bg)"/>
<rect x="16" y="22" width="40" height="26" rx="5" fill="url(#io-g)" filter="url(#io-glow)" opacity=".85"/>
<rect x="20" y="26" width="8" height="7" rx="2" fill="rgba(200,255,240,0.3)"/>
<rect x="32" y="26" width="8" height="7" rx="2" fill="rgba(200,255,240,0.3)"/>
<rect x="44" y="26" width="8" height="7" rx="2" fill="rgba(200,255,240,0.3)"/>
<rect x="30" y="36" width="12" height="12" rx="2" fill="rgba(40,200,160,0.3)" stroke="rgba(200,255,240,0.3)" stroke-width="1"/>
<circle cx="24" cy="51" r="5" fill="#103020" stroke="#40e0c0" stroke-width="2"/>
<circle cx="48" cy="51" r="5" fill="#103020" stroke="#40e0c0" stroke-width="2"/>
<rect x="18" y="20" width="36" height="4" rx="2" fill="rgba(64,224,192,0.4)"/>
</svg>`,

lazer: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="il-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#1a0d1f"/><stop offset="100%" stop-color="#130a18"/></linearGradient>
<linearGradient id="il-g" x1="14" y1="26" x2="58" y2="50"><stop offset="0%" stop-color="#c060ff"/><stop offset="100%" stop-color="#6020a0"/></linearGradient>
<filter id="il-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#il-bg)"/>
<path d="M20 30C18 36 18 44 22 48c3 3 8 2 12-2l2-4 2 4c4 4 9 5 12 2 4-4 4-12 2-18-1-4-5-6-8-6H28c-3 0-7 2-8 6z" fill="url(#il-g)" filter="url(#il-glow)" opacity=".9"/>
<rect x="23" y="36" width="4" height="10" rx="1" fill="rgba(255,255,255,0.3)"/>
<rect x="20" y="39" width="10" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
<circle cx="48" cy="35" r="2.5" fill="rgba(255,100,100,0.8)"/>
<circle cx="44" cy="39" r="2.5" fill="rgba(100,255,100,0.8)"/>
<circle cx="52" cy="39" r="2.5" fill="rgba(100,100,255,0.8)"/>
<circle cx="48" cy="43" r="2.5" fill="rgba(255,255,100,0.8)"/>
</svg>`,

internet: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="in-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1820"/><stop offset="100%" stop-color="#0a1218"/></linearGradient>
<linearGradient id="in-g" x1="18" y1="18" x2="54" y2="54"><stop offset="0%" stop-color="#40b0ff"/><stop offset="100%" stop-color="#1060c0"/></linearGradient>
<filter id="in-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#in-bg)"/>
<circle cx="36" cy="48" r="3" fill="url(#in-g)" filter="url(#in-glow)"/>
<path d="M30 42a8.5 8.5 0 0 1 12 0" stroke="#40b0ff" stroke-width="2.5" stroke-linecap="round" fill="none" filter="url(#in-glow)" opacity=".9"/>
<path d="M23 35a18 18 0 0 1 26 0" stroke="#40b0ff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M16 28a27 27 0 0 1 40 0" stroke="#40b0ff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".45"/>
<rect x="30" y="50" width="12" height="4" rx="2" fill="rgba(40,120,255,0.3)"/>
</svg>`,

alimentacao: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ia-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#201208"/><stop offset="100%" stop-color="#180d06"/></linearGradient>
<linearGradient id="ia-g" x1="18" y1="20" x2="54" y2="36"><stop offset="0%" stop-color="#ffb040"/><stop offset="100%" stop-color="#e07020"/></linearGradient>
<filter id="ia-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ia-bg)"/>
<path d="M20 36 Q20 22 36 22 Q52 22 52 36z" fill="url(#ia-g)" filter="url(#ia-glow)" opacity=".9"/>
<ellipse cx="30" cy="26" rx="2" ry="1" fill="rgba(255,255,255,0.35)" transform="rotate(-20,30,26)"/>
<ellipse cx="38" cy="24" rx="2" ry="1" fill="rgba(255,255,255,0.35)" transform="rotate(10,38,24)"/>
<ellipse cx="44" cy="28" rx="2" ry="1" fill="rgba(255,255,255,0.35)" transform="rotate(-10,44,28)"/>
<path d="M18 37h36" stroke="#60d040" stroke-width="3" stroke-linecap="round" opacity=".9"/>
<rect x="20" y="39" width="32" height="3" rx="1.5" fill="rgba(255,60,60,0.8)"/>
<rect x="19" y="42" width="34" height="5" rx="2.5" fill="rgba(160,80,20,0.9)"/>
<path d="M19 47h34a4 4 0 0 1 0 8H19a4 4 0 0 1 0-8z" fill="#e07020" opacity=".9"/>
</svg>`,

saude: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="is-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#200d14"/><stop offset="100%" stop-color="#180a10"/></linearGradient>
<linearGradient id="is-g" x1="18" y1="18" x2="54" y2="54"><stop offset="0%" stop-color="#ff80a0"/><stop offset="100%" stop-color="#d02060"/></linearGradient>
<filter id="is-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#is-bg)"/>
<path d="M36 52C36 52 16 40 16 28C16 22 21 18 27 20C30 21 33 23 36 26C39 23 42 21 45 20C51 18 56 22 56 28C56 40 36 52 36 52z" fill="url(#is-g)" filter="url(#is-glow)" opacity=".9"/>
<rect x="32" y="30" width="8" height="14" rx="2" fill="rgba(255,255,255,0.4)"/>
<rect x="28" y="34" width="16" height="6" rx="2" fill="rgba(255,255,255,0.4)"/>
</svg>`,

vestuario: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="iv-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#200d10"/><stop offset="100%" stop-color="#160a0c"/></linearGradient>
<linearGradient id="iv-g" x1="16" y1="16" x2="56" y2="56"><stop offset="0%" stop-color="#ff6080"/><stop offset="100%" stop-color="#c02040"/></linearGradient>
<filter id="iv-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#iv-bg)"/>
<path d="M28 20L20 28L26 32L26 54L46 54L46 32L52 28L44 20C44 20 42 26 36 26C30 26 28 20 28 20z" fill="url(#iv-g)" filter="url(#iv-glow)" opacity=".9"/>
<rect x="30" y="36" width="8" height="7" rx="1.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
</svg>`,

contas: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ic2-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#181808"/><stop offset="100%" stop-color="#121206"/></linearGradient>
<linearGradient id="ic2-g" x1="30" y1="16" x2="42" y2="56"><stop offset="0%" stop-color="#ffe040"/><stop offset="100%" stop-color="#e09000"/></linearGradient>
<filter id="ic2-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ic2-bg)"/>
<path d="M42 16L28 38L38 38L30 56L48 32L38 32Z" fill="url(#ic2-g)" filter="url(#ic2-glow)" opacity=".95"/>
</svg>`,

assinatura: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ias-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1020"/><stop offset="100%" stop-color="#0a0c18"/></linearGradient>
<linearGradient id="ias-g" x1="24" y1="20" x2="54" y2="52"><stop offset="0%" stop-color="#8060ff"/><stop offset="100%" stop-color="#4020c0"/></linearGradient>
<filter id="ias-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ias-bg)"/>
<circle cx="36" cy="36" r="18" fill="url(#ias-g)" filter="url(#ias-glow)" opacity=".8"/>
<path d="M31 28L31 44L47 36Z" fill="rgba(255,255,255,0.9)"/>
</svg>`,

educacao: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ied-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0f1020"/><stop offset="100%" stop-color="#0a0c1a"/></linearGradient>
<linearGradient id="ied-g" x1="14" y1="24" x2="58" y2="56"><stop offset="0%" stop-color="#60a0ff"/><stop offset="100%" stop-color="#2040e0"/></linearGradient>
<filter id="ied-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ied-bg)"/>
<path d="M36 20L58 30L36 40L14 30Z" fill="url(#ied-g)" filter="url(#ied-glow)" opacity=".9"/>
<path d="M22 32L22 46C22 48 24 50 26 50L46 50C48 50 50 48 50 46L50 32" stroke="#60a0ff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".7"/>
<line x1="58" y1="30" x2="58" y2="42" stroke="#60a0ff" stroke-width="2" opacity=".6"/>
<circle cx="58" cy="44" r="3" fill="#60a0ff" opacity=".7"/>
</svg>`,

investimento: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ii-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1f12"/><stop offset="100%" stop-color="#0a1810"/></linearGradient>
<linearGradient id="ii-g" x1="16" y1="48" x2="56" y2="20"><stop offset="0%" stop-color="#40ff90"/><stop offset="50%" stop-color="#40e0ff"/><stop offset="100%" stop-color="#4080ff"/></linearGradient>
<filter id="ii-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ii-bg)"/>
<path d="M16 48L26 38L34 42L44 28L56 22" stroke="url(#ii-g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#ii-glow)"/>
<path d="M16 48L26 38L34 42L44 28L56 22L56 54L16 54Z" fill="url(#ii-g)" opacity=".1"/>
<path d="M50 16L56 22L50 22" stroke="#40ff90" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>
<circle cx="26" cy="38" r="3" fill="#40ff90" filter="url(#ii-glow)"/>
<circle cx="44" cy="28" r="3" fill="#40e0ff" filter="url(#ii-glow)"/>
</svg>`,

meta: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="imt-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#201008"/><stop offset="100%" stop-color="#180c06"/></linearGradient>
<filter id="imt-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#imt-bg)"/>
<circle cx="36" cy="36" r="18" stroke="rgba(255,140,40,0.3)" stroke-width="2" fill="none"/>
<circle cx="36" cy="36" r="12" stroke="rgba(255,140,40,0.5)" stroke-width="2" fill="none"/>
<circle cx="36" cy="36" r="6" fill="rgba(255,140,40,0.8)" filter="url(#imt-glow)"/>
<path d="M48 18L54 24L36 42" stroke="#ffb040" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#imt-glow)"/>
<path d="M48 18L48 26L56 18" stroke="#ffb040" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

divida: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="id-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#200a0a"/><stop offset="100%" stop-color="#160808"/></linearGradient>
<linearGradient id="id-g" x1="14" y1="24" x2="58" y2="50"><stop offset="0%" stop-color="#ff6060"/><stop offset="100%" stop-color="#c02020"/></linearGradient>
<filter id="id-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#id-bg)"/>
<rect x="14" y="24" width="44" height="28" rx="6" fill="url(#id-g)" filter="url(#id-glow)" opacity=".85"/>
<rect x="14" y="32" width="44" height="8" fill="rgba(0,0,0,0.4)"/>
<rect x="18" y="44" width="6" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
<rect x="28" y="44" width="6" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
<rect x="38" y="44" width="6" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
<rect x="18" y="26" width="10" height="7" rx="2" fill="rgba(255,220,100,0.7)"/>
<circle cx="52" cy="22" r="8" fill="#ff4040"/>
<text x="52" y="27" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="monospace">!</text>
</svg>`,

beleza: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ib-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#1a0a18"/><stop offset="100%" stop-color="#140814"/></linearGradient>
<linearGradient id="ib-g" x1="20" y1="16" x2="52" y2="56"><stop offset="0%" stop-color="#ff80e0"/><stop offset="100%" stop-color="#c020a0"/></linearGradient>
<filter id="ib-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#ib-bg)"/>
<path d="M36 18L38 28L48 30L38 32L36 42L34 32L24 30L34 28Z" fill="url(#ib-g)" filter="url(#ib-glow)" opacity=".9"/>
<path d="M52 20L53 24L57 25L53 26L52 30L51 26L47 25L51 24Z" fill="#ff80e0" opacity=".7" filter="url(#ib-glow)"/>
<path d="M20 44L21 47L24 48L21 49L20 52L19 49L16 48L19 47Z" fill="#ff80e0" opacity=".6" filter="url(#ib-glow)"/>
<rect x="30" y="42" width="12" height="14" rx="3" fill="rgba(255,128,224,0.3)" stroke="rgba(255,128,224,0.5)" stroke-width="1.5"/>
<rect x="33" y="39" width="6" height="4" rx="1.5" fill="rgba(255,128,224,0.4)"/>
</svg>`,

outros: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="iou-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#141420"/><stop offset="100%" stop-color="#0e0e18"/></linearGradient>
<filter id="iou-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#iou-bg)"/>
<circle cx="24" cy="36" r="6" fill="rgba(120,120,200,0.8)" filter="url(#iou-glow)"/>
<circle cx="36" cy="36" r="6" fill="rgba(140,100,220,0.8)" filter="url(#iou-glow)"/>
<circle cx="48" cy="36" r="6" fill="rgba(160,80,240,0.8)" filter="url(#iou-glow)"/>
</svg>`,

};

// ── Ícones de forma de pagamento ──────────────────────────────
const PAY_ICONS = {

dinheiro: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pd-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1f12"/><stop offset="100%" stop-color="#0a1810"/></linearGradient>
<linearGradient id="pd-g" x1="14" y1="26" x2="58" y2="48"><stop offset="0%" stop-color="#60ff80"/><stop offset="100%" stop-color="#20a040"/></linearGradient>
<filter id="pd-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pd-bg)"/>
<rect x="12" y="26" width="48" height="28" rx="4" fill="url(#pd-g)" filter="url(#pd-glow)" opacity=".85"/>
<rect x="16" y="30" width="40" height="20" rx="2" fill="none" stroke="rgba(100,255,120,0.4)" stroke-width="1.5"/>
<circle cx="36" cy="40" r="8" fill="rgba(10,40,20,0.6)" stroke="rgba(100,255,120,0.5)" stroke-width="1.5"/>
<text x="36" y="44" text-anchor="middle" font-size="10" font-weight="bold" fill="#60ff80" font-family="monospace">$</text>
<circle cx="20" cy="34" r="3" fill="rgba(10,40,20,0.5)" stroke="rgba(100,255,120,0.3)" stroke-width="1"/>
<circle cx="52" cy="46" r="3" fill="rgba(10,40,20,0.5)" stroke="rgba(100,255,120,0.3)" stroke-width="1"/>
</svg>`,

debito: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pdb-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1420"/><stop offset="100%" stop-color="#0a1018"/></linearGradient>
<linearGradient id="pdb-g" x1="14" y1="24" x2="58" y2="50"><stop offset="0%" stop-color="#60c0ff"/><stop offset="100%" stop-color="#2060c0"/></linearGradient>
<filter id="pdb-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pdb-bg)"/>
<rect x="12" y="22" width="48" height="30" rx="6" fill="url(#pdb-g)" filter="url(#pdb-glow)" opacity=".85"/>
<rect x="12" y="30" width="48" height="8" fill="rgba(0,0,0,0.35)"/>
<rect x="16" y="42" width="18" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
<rect x="16" y="24" width="10" height="7" rx="2" fill="rgba(255,220,100,0.7)"/>
</svg>`,

credito: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pc-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#200a0a"/><stop offset="100%" stop-color="#160808"/></linearGradient>
<linearGradient id="pc-g" x1="14" y1="24" x2="58" y2="50"><stop offset="0%" stop-color="#ff8060"/><stop offset="100%" stop-color="#c03020"/></linearGradient>
<filter id="pc-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pc-bg)"/>
<rect x="12" y="22" width="48" height="30" rx="6" fill="url(#pc-g)" filter="url(#pc-glow)" opacity=".85"/>
<rect x="12" y="30" width="48" height="8" fill="rgba(0,0,0,0.35)"/>
<rect x="16" y="42" width="18" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
<rect x="16" y="24" width="10" height="7" rx="2" fill="rgba(255,220,100,0.7)"/>
</svg>`,

pix: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pp-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#0d1a18"/><stop offset="100%" stop-color="#0a1410"/></linearGradient>
<linearGradient id="pp-g" x1="18" y1="18" x2="54" y2="54"><stop offset="0%" stop-color="#40e0c0"/><stop offset="100%" stop-color="#20a080"/></linearGradient>
<filter id="pp-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pp-bg)"/>
<path d="M36 18L46 28L36 38L26 28Z" fill="url(#pp-g)" filter="url(#pp-glow)" opacity=".9"/>
<path d="M36 34L46 44L36 54L26 44Z" fill="url(#pp-g)" filter="url(#pp-glow)" opacity=".9"/>
<path d="M18 26L28 36L18 46" stroke="#40e0c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".7"/>
<path d="M54 26L44 36L54 46" stroke="#40e0c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".7"/>
</svg>`,

boleto: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pb-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#181808"/><stop offset="100%" stop-color="#121206"/></linearGradient>
<filter id="pb-glow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pb-bg)"/>
<rect x="14" y="22" width="4" height="30" rx="1" fill="#ffe040" filter="url(#pb-glow)" opacity=".9"/>
<rect x="20" y="22" width="2" height="30" rx="1" fill="#ffe040" opacity=".8"/>
<rect x="24" y="22" width="4" height="30" rx="1" fill="#ffe040" filter="url(#pb-glow)" opacity=".9"/>
<rect x="30" y="22" width="2" height="30" rx="1" fill="#ffe040" opacity=".7"/>
<rect x="34" y="22" width="4" height="30" rx="1" fill="#ffe040" opacity=".9"/>
<rect x="40" y="22" width="2" height="30" rx="1" fill="#ffe040" opacity=".8"/>
<rect x="44" y="22" width="4" height="30" rx="1" fill="#ffe040" filter="url(#pb-glow)" opacity=".9"/>
<rect x="50" y="22" width="2" height="30" rx="1" fill="#ffe040" opacity=".7"/>
<rect x="54" y="22" width="4" height="30" rx="1" fill="#ffe040" opacity=".9"/>
<rect x="12" y="54" width="48" height="5" rx="2" fill="rgba(255,220,40,0.2)"/>
</svg>`,

transferencia: `<svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pt-bg" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#1a0d1f"/><stop offset="100%" stop-color="#130a18"/></linearGradient>
<linearGradient id="pt-g" x1="14" y1="14" x2="58" y2="58"><stop offset="0%" stop-color="#c060ff"/><stop offset="100%" stop-color="#6020a0"/></linearGradient>
<filter id="pt-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="72" height="72" rx="18" fill="url(#pt-bg)"/>
<path d="M16 28h36l-8-8M56 44H20l8 8" stroke="url(#pt-g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#pt-glow)"/>
</svg>`,

};

// ── Ícones de navegação ───────────────────────────────────────
const NAV_ICONS = {

home: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 16L16 5L28 16V28H20V21H12V28H4V16Z" fill="url(#nh-g)" stroke="none"/>
<defs><linearGradient id="nh-g" x1="4" y1="5" x2="28" y2="28"><stop offset="0%" stop-color="#a078ff"/><stop offset="100%" stop-color="#6040c0"/></linearGradient></defs>
</svg>`,

lancamentos: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nl-g" x1="4" y1="4" x2="28" y2="28"><stop offset="0%" stop-color="#ff6080"/><stop offset="100%" stop-color="#c02040"/></linearGradient></defs>
<rect x="4" y="8" width="24" height="3" rx="1.5" fill="url(#nl-g)"/>
<rect x="4" y="15" width="24" height="3" rx="1.5" fill="url(#nl-g)" opacity=".7"/>
<rect x="4" y="22" width="16" height="3" rx="1.5" fill="url(#nl-g)" opacity=".5"/>
</svg>`,

receitas: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nr-g" x1="4" y1="28" x2="28" y2="4"><stop offset="0%" stop-color="#40ff80"/><stop offset="100%" stop-color="#20c060"/></linearGradient></defs>
<circle cx="16" cy="16" r="10" fill="none" stroke="url(#nr-g)" stroke-width="2"/>
<path d="M16 22V16M16 16l-4-4M16 16l4-4" stroke="url(#nr-g)" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

graficos: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ng-g" x1="4" y1="28" x2="28" y2="4"><stop offset="0%" stop-color="#40b0ff"/><stop offset="100%" stop-color="#2060e0"/></linearGradient></defs>
<rect x="4" y="18" width="6" height="10" rx="2" fill="url(#ng-g)" opacity=".6"/>
<rect x="13" y="12" width="6" height="16" rx="2" fill="url(#ng-g)" opacity=".8"/>
<rect x="22" y="5" width="6" height="23" rx="2" fill="url(#ng-g)"/>
</svg>`,

historico: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nh2-g" x1="4" y1="4" x2="28" y2="28"><stop offset="0%" stop-color="#ffb040"/><stop offset="100%" stop-color="#e07020"/></linearGradient></defs>
<circle cx="16" cy="16" r="11" stroke="url(#nh2-g)" stroke-width="2" fill="none"/>
<path d="M16 9v7l5 3" stroke="url(#nh2-g)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

orcamento: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="no-g" x1="4" y1="28" x2="28" y2="4"><stop offset="0%" stop-color="#e060ff"/><stop offset="100%" stop-color="#8020c0"/></linearGradient></defs>
<circle cx="16" cy="16" r="11" stroke="url(#no-g)" stroke-width="2" fill="none"/>
<path d="M16 5A11 11 0 0 1 27 16" stroke="url(#no-g)" stroke-width="4" stroke-linecap="round"/>
<circle cx="16" cy="16" r="3" fill="url(#no-g)"/>
<line x1="16" y1="16" x2="22" y2="10" stroke="url(#no-g)" stroke-width="2" stroke-linecap="round"/>
</svg>`,

metas: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="nm-glow"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<circle cx="16" cy="16" r="11" stroke="rgba(255,180,40,0.4)" stroke-width="1.5" fill="none"/>
<circle cx="16" cy="16" r="7" stroke="rgba(255,180,40,0.6)" stroke-width="1.5" fill="none"/>
<circle cx="16" cy="16" r="3" fill="#ffb040" filter="url(#nm-glow)"/>
<path d="M22 8l4 4-10 10" stroke="#ffb040" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

compromissos: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nc-g" x1="4" y1="4" x2="28" y2="28"><stop offset="0%" stop-color="#40e0c0"/><stop offset="100%" stop-color="#20a080"/></linearGradient></defs>
<path d="M8 10a8 8 0 0 1 8-8" stroke="url(#nc-g)" stroke-width="2.5" stroke-linecap="round"/>
<path d="M10 8l-4 2 2-4" stroke="url(#nc-g)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 22a8 8 0 0 1-8 8" stroke="url(#nc-g)" stroke-width="2.5" stroke-linecap="round"/>
<path d="M22 24l4-2-2 4" stroke="url(#nc-g)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="10" y="14" width="12" height="6" rx="3" fill="url(#nc-g)" opacity=".7"/>
</svg>`,

cartoes: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nk-g" x1="2" y1="8" x2="30" y2="26"><stop offset="0%" stop-color="#ff8060"/><stop offset="100%" stop-color="#c03020"/></linearGradient></defs>
<rect x="2" y="8" width="28" height="18" rx="4" fill="url(#nk-g)" opacity=".85"/>
<rect x="2" y="14" width="28" height="5" fill="rgba(0,0,0,0.3)"/>
<rect x="6" y="20" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)"/>
<rect x="6" y="10" width="6" height="4" rx="1.5" fill="rgba(255,220,100,0.7)"/>
</svg>`,

investimentos: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ni-g" x1="4" y1="28" x2="28" y2="4"><stop offset="0%" stop-color="#40ff90"/><stop offset="100%" stop-color="#40e0ff"/></linearGradient>
<filter id="ni-glow"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<polyline points="4,24 12,16 18,20 28,8" stroke="url(#ni-g)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#ni-glow)"/>
<polyline points="22,8 28,8 28,14" stroke="url(#ni-g)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

menu: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nm2-g" x1="4" y1="4" x2="28" y2="28"><stop offset="0%" stop-color="#b070ff"/><stop offset="100%" stop-color="#6030c0"/></linearGradient></defs>
<line x1="4" y1="10" x2="28" y2="10" stroke="url(#nm2-g)" stroke-width="2.5" stroke-linecap="round"/>
<line x1="4" y1="16" x2="28" y2="16" stroke="url(#nm2-g)" stroke-width="2.5" stroke-linecap="round"/>
<line x1="4" y1="22" x2="20" y2="22" stroke="url(#nm2-g)" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

};

// ── Helpers ───────────────────────────────────────────────────
function catIconSVG(catId) {
  return CAT_ICONS[catId] || CAT_ICONS['outros'];
}

function payIconSVG(payId) {
  return PAY_ICONS[payId] || '';
}

function navIconSVG(navId) {
  return NAV_ICONS[navId] || '';
}

function isNeonTheme() {
  return document.documentElement.getAttribute('data-theme') === 'neon';
}

// ── Ícones de UI (badges, estados, analytics) ─────────────────
const UI_ICONS = {

  recurring: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:12px;height:12px;vertical-align:middle">
    <path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 1l3 2-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  installment: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:12px;height:12px;vertical-align:middle">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M5 3V1M11 3V1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  card: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:12px;height:12px;vertical-align:middle">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M1 7h14" stroke="currentColor" stroke-width="1.5"/>
    <rect x="3" y="9.5" width="5" height="1.5" rx=".75" fill="currentColor"/>
  </svg>`,

  warning: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;vertical-align:middle">
    <path d="M8 2L15 14H1L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M8 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="8" cy="12" r=".75" fill="currentColor"/>
  </svg>`,

  critical: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;vertical-align:middle">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M8 4v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="8" cy="11.5" r=".75" fill="currentColor"/>
  </svg>`,

  chartUp: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <path d="M2 12L6 8 9 10 14 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11 4h3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  calendar: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M1.5 7h13" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="4" y="10" width="2" height="2" rx=".5" fill="currentColor" opacity=".7"/>
    <rect x="7" y="10" width="2" height="2" rx=".5" fill="currentColor" opacity=".7"/>
    <rect x="10" y="10" width="2" height="2" rx=".5" fill="currentColor" opacity=".7"/>
  </svg>`,

  piggy: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <ellipse cx="8" cy="9" rx="5" ry="4" stroke="currentColor" stroke-width="1.5"/>
    <path d="M3 10l-1.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M13 10l1.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="6" cy="8" r=".75" fill="currentColor"/>
    <path d="M9 5.5c0-1.5 4-1.5 4 0s-1.5 2-2 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 6V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  bell: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <path d="M8 2a4 4 0 0 0-4 4v3l-1 2h10l-1-2V6a4 4 0 0 0-4-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M6 13a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  empty: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;vertical-align:middle">
    <rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.5"/>
    <path d="M6 8h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  palette: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="5.5" cy="6.5" r="1" fill="currentColor"/>
    <circle cx="10.5" cy="6.5" r="1" fill="currentColor"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
    <circle cx="5.5" cy="9.5" r="1" fill="currentColor"/>
    <circle cx="10.5" cy="9.5" r="1" fill="currentColor"/>
  </svg>`,

  moon: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <path d="M13 10a6 6 0 1 1-7-7 4.5 4.5 0 0 0 7 7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,

  star4: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:13px;height:13px;vertical-align:middle">
    <path d="M8 1l1.5 5.5L15 8l-5.5 1.5L8 15l-1.5-5.5L1 8l5.5-1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="currentColor" opacity=".8"/>
  </svg>`,
};

function uiIcon(name, color) {
  const svg = UI_ICONS[name] || '';
  if (!color) return svg;
  return svg.replace(/currentColor/g, color);
}

// ============================================================
// ÍCONES LUCIDE — sistema unificado (ambos os temas)
// icon('pencil')              → SVG string com classe "icon"
// icon('pencil', 'icon-sm')  → com classe extra
// ============================================================

const _LUCIDE = {
  // Navegação
  'home':            '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'list':            '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'trending-up':     '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'clock':           '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'pie-chart':       '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  'star':            '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'credit-card':     '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  'menu':            '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  'bar-chart-2':     '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  'calendar':        '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'calendar-check':  '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>',
  // Ações
  'pencil':          '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  'x':               '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'check':           '<polyline points="20 6 9 17 4 12"/>',
  'check-circle':    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'x-circle':        '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  'alert-triangle':  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'refresh-cw':      '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'package':         '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  'target':          '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'download':        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  // Labels / modais
  'bell':            '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  'palette':         '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  'lightbulb':       '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  'wallet':          '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  'zap':             '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'trophy':          '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  'info':            '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  // Picker de ícones de metas
  'car':             '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  'plane':           '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  'smartphone':      '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  'laptop':          '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
  'graduation-cap':  '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  'heart':           '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  'umbrella':        '<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
  'dumbbell':        '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
  'music':           '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  'camera':          '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  'anchor':          '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  'globe':           '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
};

/**
 * Gera SVG Lucide como string HTML.
 * @param {string} name  - Nome do ícone
 * @param {string} [cls] - Classes CSS extras
 */
function icon(name, cls) {
  const paths = _LUCIDE[name];
  if (!paths) return '';
  const extra = cls ? ' ' + cls : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="icon${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

// ── Ícones de nav — versão Lucide (tema classic) ─────────────
const NAV_ICONS_CLASSIC = {
  home:          () => icon('home'),
  lancamentos:   () => icon('list'),
  receitas:      () => icon('trending-up'),
  graficos:      () => icon('bar-chart-2'),
  historico:     () => icon('clock'),
  orcamento:     () => icon('pie-chart'),
  metas:         () => icon('star'),
  compromissos:  () => icon('calendar-check'),
  cartoes:       () => icon('credit-card'),
  menu:          () => icon('menu'),
  investimentos: () => icon('trending-up'),
};

// ── Picker de ícones de metas ────────────────────────────────
const GOAL_ICON_NAMES = [
  'target', 'car', 'plane', 'home', 'smartphone',
  'laptop', 'graduation-cap', 'heart', 'umbrella', 'dumbbell',
  'music', 'camera', 'anchor', 'globe', 'wallet',
];

/**
 * Retorna HTML para exibir o ícone de uma meta.
 * Suporta tanto nomes Lucide (novos) quanto emojis (dados legados).
 */
function getGoalIconHtml(iconValue) {
  if (!iconValue) return icon('target');
  if (_LUCIDE[iconValue]) return icon(iconValue);
  return `<span class="icon-emoji">${iconValue}</span>`; // fallback legado
}
