import { useState, useRef, useEffect, useCallback } from "react";

// ════════════════════════════════════════════════════════════
// NUMBERS · NEXUS ENGINE · PHASE 3
// Full Dynasty: 12 eras, gov layer, 33 zones, 65+ events
// ════════════════════════════════════════════════════════════

const TICK_RATE = 1000;
const toRoman = n => ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][n-1] || n;

// ── ERAS ──────────────────────────────────────────────────
const ERAS = [
  { gen:1, year:"1921", name:"The Founders", era:"1920s", tagline:"Jazz & Prohibition", desc:"Harlem, New York. The numbers game is yours to build.", heatBase:1.0, incomeBase:1.0, fmod:{community:0,italian:0,police:0,political:0} },
  { gen:2, year:"1943", name:"The Builders", era:"1940s", tagline:"Veterans Return Home", desc:"Post-war Harlem surges. The empire must grow or fall behind.", heatBase:0.9, incomeBase:1.3, fmod:{community:5,italian:-10,police:-5,political:5} },
  { gen:3, year:"1961", name:"The Movement", era:"1960s", tagline:"Civil Rights Era", desc:"The streets are changing. Will you stand with your people?", heatBase:1.2, incomeBase:1.6, fmod:{community:10,italian:-5,police:-15,political:15} },
  { gen:4, year:"1972", name:"The Empire", era:"1970s", tagline:"Peak Power", desc:"The apex. Fur coats, Cadillacs, and everything at stake.", heatBase:1.1, incomeBase:2.0, fmod:{community:0,italian:-20,police:-10,political:10} },
  { gen:5, year:"1984", name:"The Reckoning", era:"1980s", tagline:"Hold What You Built", desc:"The streets are harder. Hold the line or lose everything.", heatBase:1.5, incomeBase:1.8, fmod:{community:-15,italian:-30,police:-20,political:5} },
  { gen:6, year:"2001", name:"The Legacy", era:"2000s", tagline:"The Dynasty Endures", desc:"The family name can mean something legitimate. If you choose it.", heatBase:0.7, incomeBase:2.5, fmod:{community:10,italian:0,police:5,political:20} },
  { gen:7, year:"2010", name:"The Digital Age", era:"2010s", tagline:"Social Media & Tech Wealth", desc:"The world moves fast now. The Johnson empire must move faster.", heatBase:0.6, incomeBase:3.0, fmod:{community:5,italian:0,police:8,political:15} },
  { gen:8, year:"2016", name:"The Reckoning II", era:"2016", tagline:"Black Lives Matter Era", desc:"A new movement demands accountability from everyone. Including you.", heatBase:0.8, incomeBase:3.2, fmod:{community:15,italian:0,police:-5,political:20} },
  { gen:9, year:"2020", name:"The Pandemic", era:"2020s", tagline:"The World Stops", desc:"A global pandemic reshapes every business. Adapt or collapse.", heatBase:0.5, incomeBase:2.8, fmod:{community:8,italian:0,police:5,political:10} },
  { gen:10, year:"2025", name:"The Crypto Era", era:"2025", tagline:"Digital Finance & AI", desc:"Money is going digital. The Johnson empire must go with it.", heatBase:0.4, incomeBase:4.0, fmod:{community:5,italian:0,police:10,political:15} },
  { gen:11, year:"2030", name:"The Institution", era:"2030s", tagline:"A Century of Power", desc:"One hundred years. The Johnson name is woven into Harlem.", heatBase:0.3, incomeBase:5.0, fmod:{community:12,italian:0,police:12,political:20} },
  { gen:12, year:"2040", name:"The Centennial", era:"2040s", tagline:"The Final Chapter", desc:"The dynasty reaches its centennial. What will it mean?", heatBase:0.2, incomeBase:6.0, fmod:{community:15,italian:0,police:15,political:25} },
];

const ERA_OPS = {
  1: {
    label:"Numbers Racket", flavor:"The original hustle. Street runners collect slips, banks tally the bets.",
    primary:[
      {key:"workers",name:"Street Runners",icon:"\u{1F3C3}",desc:"Boys who collect bets across every block.",baseRate:5,upgKey:"workerLvl",costBase:150,costExp:1.42,heatPer:0.08},
      {key:"banks",name:"Numbers Banks",icon:"\u{1F4CB}",desc:"Back rooms where the day is tallied.",baseRate:25,upgKey:"bankLvl",costBase:800,costExp:1.65,heatPer:0.25},
    ],
    upgrades:[
      {key:"workerLvl",name:"Runner Training",desc:"Faster and smarter.",costBase:400,costExp:2.1},
      {key:"bankLvl",name:"Bank Security",desc:"Loyal men at the counting table.",costBase:1200,costExp:2.2},
    ],
  },
  2: {
    label:"Policy Network", flavor:"More organized now. Policy writers replace rough street runners. Back room poker adds a second revenue stream.",
    primary:[
      {key:"workers",name:"Policy Writers",icon:"\u{270D}",desc:"Organized bet writers running daily policy slips through barbershops and social clubs.",baseRate:9,upgKey:"workerLvl",costBase:200,costExp:1.42,heatPer:0.07},
      {key:"banks",name:"Numbers Banks",icon:"\u{1F4CB}",desc:"More sophisticated now. Ledgers, couriers, coded slips.",baseRate:35,upgKey:"bankLvl",costBase:900,costExp:1.65,heatPer:0.22},
      {key:"poker",name:"Back Room Poker",icon:"\u{1F0CF}",desc:"Returning veterans want somewhere to play.",baseRate:40,upgKey:"pokerLvl",costBase:1200,costExp:1.55,heatPer:0.30},
    ],
    upgrades:[
      {key:"workerLvl",name:"Writer Network",desc:"Wider reach, better organized.",costBase:500,costExp:2.1},
      {key:"bankLvl",name:"Bank Operations",desc:"Tighter books and better men at the door.",costBase:1400,costExp:2.2},
      {key:"pokerLvl",name:"Game Management",desc:"Professional dealers. Trusted clientele only.",costBase:1800,costExp:2.0},
    ],
  },
  3: {
    label:"Underground Empire", flavor:"The operation has grown beyond the block. Underground casinos and record distribution run alongside the original policy numbers.",
    primary:[
      {key:"workers",name:"Policy Network",icon:"\u{1F4C2}",desc:"A city-wide policy network with dozens of writers operating out of trusted storefronts.",baseRate:14,upgKey:"workerLvl",costBase:300,costExp:1.38,heatPer:0.06},
      {key:"banks",name:"Numbers Banks",icon:"\u{1F4CB}",desc:"Multiple locations, rotating counting houses.",baseRate:50,upgKey:"bankLvl",costBase:1200,costExp:1.6,heatPer:0.20},
      {key:"casino",name:"Underground Casino",icon:"\u{1F3B0}",desc:"High-stakes room for Harlem's elite. Craps, cards, connections.",baseRate:65,upgKey:"casinoLvl",costBase:3000,costExp:1.5,heatPer:0.40},
      {key:"records",name:"Record Distribution",icon:"\u{1F3B5}",desc:"Pressing and distributing records. Legal income, real culture.",baseRate:30,upgKey:"recordsLvl",costBase:2000,costExp:1.55,heatPer:0.05},
    ],
    upgrades:[
      {key:"workerLvl",name:"Network Expansion",desc:"Wider territory, more slips daily.",costBase:700,costExp:2.1},
      {key:"bankLvl",name:"Counting Operations",desc:"Better security, tighter books.",costBase:1800,costExp:2.2},
      {key:"casinoLvl",name:"Casino Upgrades",desc:"Better games, higher stakes.",costBase:5000,costExp:1.9},
      {key:"recordsLvl",name:"Label Development",desc:"Talent acquisition and wider distribution.",costBase:3000,costExp:1.9},
    ],
  },
  4: {
    label:"The Empire at Its Peak", flavor:"Numbers, casinos, sports books, and loan operations. The Johnson family is the economic center of Black Harlem.",
    primary:[
      {key:"workers",name:"Numbers Empire",icon:"\u{1F451}",desc:"A fully integrated numbers operation spanning multiple boroughs.",baseRate:25,upgKey:"workerLvl",costBase:500,costExp:1.35,heatPer:0.05},
      {key:"banks",name:"Counting Houses",icon:"\u{1F3DB}",desc:"Multiple locations with professional accountants and ironclad security.",baseRate:80,upgKey:"bankLvl",costBase:2000,costExp:1.55,heatPer:0.18},
      {key:"casino",name:"Underground Casino",icon:"\u{1F3B0}",desc:"Politicians, athletes, and businessmen walk through the door.",baseRate:100,upgKey:"casinoLvl",costBase:5000,costExp:1.5,heatPer:0.38},
      {key:"sports",name:"Sports Book",icon:"\u{1F3C6}",desc:"Boxing, horses, baseball. Harlem bets big and your house wins.",baseRate:55,upgKey:"sportsLvl",costBase:3500,costExp:1.5,heatPer:0.28},
      {key:"loans",name:"Loan Operation",icon:"\u{1F4B5}",desc:"Interest on short-term loans. Profitable but morally complicated.",baseRate:45,upgKey:"loansLvl",costBase:4000,costExp:1.55,heatPer:0.10},
    ],
    upgrades:[
      {key:"workerLvl",name:"Empire Expansion",desc:"More territory, more workers, more slips.",costBase:1000,costExp:2.1},
      {key:"bankLvl",name:"Security Overhaul",desc:"Ironclad counting houses.",costBase:3000,costExp:2.2},
      {key:"casinoLvl",name:"VIP Rooms",desc:"A-list clientele only.",costBase:8000,costExp:1.9},
      {key:"sportsLvl",name:"Book Expansion",desc:"More sports, higher volume.",costBase:6000,costExp:1.9},
      {key:"loansLvl",name:"Lending Network",desc:"Wider reach, better collection.",costBase:5000,costExp:2.0},
    ],
  },
  5: {
    label:"The Pager Era", flavor:"Street runners are gone. Pager networks and coded messages. Check cashing fronts launder millions. But the streets are harder now.",
    primary:[
      {key:"workers",name:"Pager Network",icon:"\u{1F4DF}",desc:"Coded messages through pager systems. No more face-to-face.",baseRate:20,upgKey:"workerLvl",costBase:400,costExp:1.35,heatPer:0.04},
      {key:"banks",name:"Counting Houses",icon:"\u{1F3DB}",desc:"Fortified. Multiple layers of insulation.",baseRate:70,upgKey:"bankLvl",costBase:2500,costExp:1.55,heatPer:0.16},
      {key:"casino",name:"Underground Casino",icon:"\u{1F3B0}",desc:"High rollers only. Tight security.",baseRate:90,upgKey:"casinoLvl",costBase:7000,costExp:1.5,heatPer:0.35},
      {key:"checkcash",name:"Check Cashing",icon:"\u{1F4B3}",desc:"Legal cover, real laundry capacity, community service.",baseRate:50,upgKey:"checkcashLvl",costBase:5000,costExp:1.5,heatPer:0.05},
    ],
    upgrades:[
      {key:"workerLvl",name:"Network Security",desc:"Encrypted codes. Rotating contacts.",costBase:1200,costExp:2.1},
      {key:"bankLvl",name:"Counter-Surveillance",desc:"Sweeping for bugs. Staying ahead.",costBase:3500,costExp:2.0},
      {key:"casinoLvl",name:"Casino Fortress",desc:"Almost raid-proof.",costBase:10000,costExp:1.9},
      {key:"checkcashLvl",name:"Chain Expansion",desc:"More storefronts, more throughput.",costBase:6000,costExp:1.9},
    ],
  },
  6: {
    label:"Going Legitimate", flavor:"The underground is being wound down. Investment firm, real estate, entertainment group. This is the legacy generation.",
    primary:[
      {key:"workers",name:"Investment Advisors",icon:"\u{1F4C8}",desc:"Licensed professionals managing the family portfolio.",baseRate:40,upgKey:"workerLvl",costBase:800,costExp:1.30,heatPer:0.01},
      {key:"banks",name:"Development Office",icon:"\u{1F3D9}",desc:"Real estate development. Acquiring, developing, leasing.",baseRate:120,upgKey:"bankLvl",costBase:5000,costExp:1.5,heatPer:0.05},
      {key:"media",name:"Entertainment Group",icon:"\u{1F3AC}",desc:"Music, production, media licensing. Culture as business.",baseRate:80,upgKey:"mediaLvl",costBase:8000,costExp:1.5,heatPer:0.02},
      {key:"holding",name:"Holding Company",icon:"\u{1F3E6}",desc:"The Johnson Group LLC. Clean income at scale.",baseRate:200,upgKey:"holdingLvl",costBase:20000,costExp:1.45,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Portfolio Growth",desc:"Wider investments, better returns.",costBase:2000,costExp:2.0},
      {key:"bankLvl",name:"Development Scale",desc:"Larger projects, better financing.",costBase:8000,costExp:1.9},
      {key:"mediaLvl",name:"Entertainment Deals",desc:"Bigger artists, wider distribution.",costBase:10000,costExp:1.9},
      {key:"holdingLvl",name:"Corporate Expansion",desc:"New acquisitions, new markets.",costBase:30000,costExp:1.8},
    ],
  },
  7: {
    label:"Tech & Real Estate Empire", flavor:"The underground is history. Tech investments, property management, and community development.",
    primary:[
      {key:"workers",name:"Tech Associates",icon:"\u{1F4BB}",desc:"Digital consultants managing the family portfolio.",baseRate:60,upgKey:"workerLvl",costBase:1500,costExp:1.28,heatPer:0.005},
      {key:"banks",name:"Property Management",icon:"\u{1F3D8}",desc:"Managing a portfolio of Harlem properties.",baseRate:180,upgKey:"bankLvl",costBase:8000,costExp:1.45,heatPer:0.02},
      {key:"media",name:"Digital Media",icon:"\u{1F4F1}",desc:"Social media, streaming, digital licensing.",baseRate:100,upgKey:"mediaLvl",costBase:12000,costExp:1.45,heatPer:0.01},
      {key:"holding",name:"Venture Investments",icon:"\u{1F4CA}",desc:"Stakes in startups and emerging tech.",baseRate:300,upgKey:"holdingLvl",costBase:30000,costExp:1.40,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Digital Expertise",desc:"Higher-caliber analysts.",costBase:3000,costExp:2.0},
      {key:"bankLvl",name:"Portfolio Scale",desc:"Larger holdings, better management.",costBase:12000,costExp:1.9},
      {key:"mediaLvl",name:"Platform Growth",desc:"More subscribers, wider licensing.",costBase:15000,costExp:1.9},
      {key:"holdingLvl",name:"Investment Thesis",desc:"Better deal flow and exit multiples.",costBase:40000,costExp:1.8},
    ],
  },
  8: {
    label:"Impact & Accountability", flavor:"The BLM era demands that power answer for itself. The Johnson name is under a new kind of scrutiny.",
    primary:[
      {key:"workers",name:"Impact Analysts",icon:"\u{270A}",desc:"ESG and social impact measurement.",baseRate:70,upgKey:"workerLvl",costBase:2000,costExp:1.25,heatPer:0.003},
      {key:"banks",name:"Community Development",icon:"\u{1F3D7}",desc:"Affordable housing and neighborhood revitalization.",baseRate:200,upgKey:"bankLvl",costBase:10000,costExp:1.42,heatPer:0.01},
      {key:"media",name:"Content Studio",icon:"\u{1F3AC}",desc:"Documentaries, podcasts, cultural production.",baseRate:120,upgKey:"mediaLvl",costBase:15000,costExp:1.42,heatPer:0.005},
      {key:"holding",name:"Family Office",icon:"\u{1F3E6}",desc:"Centralized wealth management across all holdings.",baseRate:400,upgKey:"holdingLvl",costBase:40000,costExp:1.38,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Impact Framework",desc:"Measurable community outcomes.",costBase:4000,costExp:2.0},
      {key:"bankLvl",name:"Development Scale",desc:"Larger projects, deeper impact.",costBase:15000,costExp:1.9},
      {key:"mediaLvl",name:"Cultural Authority",desc:"The Johnson voice in American culture.",costBase:20000,costExp:1.9},
      {key:"holdingLvl",name:"Wealth Architecture",desc:"Multi-generational wealth structures.",costBase:50000,costExp:1.8},
    ],
  },
  9: {
    label:"Pandemic Pivot", flavor:"The world stopped. The Johnson operation adapts: telehealth, essential services, digital everything.",
    primary:[
      {key:"workers",name:"Remote Workforce",icon:"\u{1F3E0}",desc:"Distributed team running operations from anywhere.",baseRate:80,upgKey:"workerLvl",costBase:2500,costExp:1.22,heatPer:0.002},
      {key:"banks",name:"Essential Services",icon:"\u{1F6D2}",desc:"Groceries, logistics, delivery networks.",baseRate:250,upgKey:"bankLvl",costBase:12000,costExp:1.40,heatPer:0.008},
      {key:"media",name:"Telehealth Platform",icon:"\u{1FA7A}",desc:"Community health services, digital access.",baseRate:150,upgKey:"mediaLvl",costBase:18000,costExp:1.40,heatPer:0.003},
      {key:"holding",name:"Crisis Fund",icon:"\u{1F4B0}",desc:"Strategic reserves deployed for community survival.",baseRate:500,upgKey:"holdingLvl",costBase:50000,costExp:1.35,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Digital Operations",desc:"Fully remote, fully efficient.",costBase:5000,costExp:2.0},
      {key:"bankLvl",name:"Supply Chain",desc:"Essential logistics at scale.",costBase:18000,costExp:1.9},
      {key:"mediaLvl",name:"Health Network",desc:"Wider reach, more lives touched.",costBase:25000,costExp:1.9},
      {key:"holdingLvl",name:"Resilience Strategy",desc:"Pandemic-proof wealth architecture.",costBase:60000,costExp:1.8},
    ],
  },
  10: {
    label:"Digital Finance & AI", flavor:"Crypto, AI, and digital assets. The Johnson empire enters the algorithmic age.",
    primary:[
      {key:"workers",name:"AI Engineers",icon:"\u{1F916}",desc:"Building AI products for enterprise and community.",baseRate:120,upgKey:"workerLvl",costBase:4000,costExp:1.20,heatPer:0.001},
      {key:"banks",name:"Crypto Exchange",icon:"\u{26D3}",desc:"Digital asset exchange and DeFi protocols.",baseRate:350,upgKey:"bankLvl",costBase:20000,costExp:1.38,heatPer:0.005},
      {key:"media",name:"AI Studio",icon:"\u{2728}",desc:"AI-powered content, licensing, and product studio.",baseRate:200,upgKey:"mediaLvl",costBase:25000,costExp:1.38,heatPer:0.002},
      {key:"holding",name:"Digital Treasury",icon:"\u{1F4B8}",desc:"Multi-chain treasury and DAO governance.",baseRate:700,upgKey:"holdingLvl",costBase:80000,costExp:1.32,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"AI Capability",desc:"Frontier models, enterprise contracts.",costBase:8000,costExp:2.0},
      {key:"bankLvl",name:"Protocol Growth",desc:"Higher TVL, more liquidity.",costBase:30000,costExp:1.9},
      {key:"mediaLvl",name:"Studio Scale",desc:"AI products reaching millions.",costBase:35000,costExp:1.9},
      {key:"holdingLvl",name:"Treasury Yield",desc:"Optimized multi-chain returns.",costBase:100000,costExp:1.8},
    ],
  },
  11: {
    label:"The Johnson Institution", flavor:"A century of power. The family name is woven into every institution that matters.",
    primary:[
      {key:"workers",name:"Institutional Staff",icon:"\u{1F3DB}",desc:"A professional corps running the Johnson ecosystem.",baseRate:200,upgKey:"workerLvl",costBase:8000,costExp:1.18,heatPer:0.0},
      {key:"banks",name:"Endowment Fund",icon:"\u{1F4DA}",desc:"A permanent fund generating returns for the community.",baseRate:500,upgKey:"bankLvl",costBase:40000,costExp:1.35,heatPer:0.0},
      {key:"media",name:"Cultural Foundation",icon:"\u{1F3A8}",desc:"Arts, education, and cultural preservation.",baseRate:300,upgKey:"mediaLvl",costBase:30000,costExp:1.35,heatPer:0.0},
      {key:"holding",name:"Dynasty Holdings",icon:"\u{1F48E}",desc:"The Johnson Group at institutional scale.",baseRate:1000,upgKey:"holdingLvl",costBase:120000,costExp:1.30,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Institutional Excellence",desc:"World-class talent pipeline.",costBase:12000,costExp:2.0},
      {key:"bankLvl",name:"Endowment Growth",desc:"Compound returns, permanent legacy.",costBase:50000,costExp:1.9},
      {key:"mediaLvl",name:"Cultural Impact",desc:"Shaping American culture.",costBase:40000,costExp:1.9},
      {key:"holdingLvl",name:"Apex Expansion",desc:"The empire at its theoretical peak.",costBase:150000,costExp:1.8},
    ],
  },
  12: {
    label:"The Centennial", flavor:"One hundred and nineteen years. The Johnson family reaches the final chapter. What does it all mean?",
    primary:[
      {key:"workers",name:"Legacy Council",icon:"\u{1F4AB}",desc:"The final stewards of the Johnson name.",baseRate:300,upgKey:"workerLvl",costBase:10000,costExp:1.15,heatPer:0.0},
      {key:"banks",name:"Heritage Trust",icon:"\u{267E}",desc:"Permanent trust preserving the family legacy.",baseRate:800,upgKey:"bankLvl",costBase:60000,costExp:1.32,heatPer:0.0},
      {key:"media",name:"Centennial Foundation",icon:"\u{1F31F}",desc:"The dynasty's public face for the next century.",baseRate:500,upgKey:"mediaLvl",costBase:50000,costExp:1.32,heatPer:0.0},
      {key:"holding",name:"Global Holdings",icon:"\u{1F30D}",desc:"The empire's crown. International scale.",baseRate:1500,upgKey:"holdingLvl",costBase:200000,costExp:1.28,heatPer:0.0},
    ],
    upgrades:[
      {key:"workerLvl",name:"Council Wisdom",desc:"A century of accumulated knowledge.",costBase:15000,costExp:2.0},
      {key:"bankLvl",name:"Perpetual Trust",desc:"Wealth that outlasts any individual.",costBase:80000,costExp:1.9},
      {key:"mediaLvl",name:"Centennial Vision",desc:"Shaping Harlem's next hundred years.",costBase:60000,costExp:1.9},
      {key:"holdingLvl",name:"Final Expansion",desc:"The last move. Make it count.",costBase:250000,costExp:1.8},
    ],
  },
};

const ERA_ASSETS = {
  1: {
    fronts:[
      {key:"jazzClubs",name:"Jazz Club",desc:"+$4/s, +$100 launder, -2 heat",cost:500,passive:4,launder:100,heat:-2,rep:0},
      {key:"barbershops",name:"Barbershop",desc:"+$1.5/s, +$50 launder, -1 heat",cost:250,passive:1.5,launder:50,heat:-1,rep:1},
      {key:"funeralHomes",name:"Funeral Home",desc:"+$3/s, +$150 launder",cost:800,passive:3,launder:150,heat:-3,rep:0},
    ],
    realty:[
      {key:"tenements",name:"Tenement Building",desc:"+$5/s rent. Community loyalty.",cost:600,passive:5,rep:3},
      {key:"commercial",name:"Commercial Property",desc:"+$10/s. Legitimate cover.",cost:1200,passive:10,rep:1},
    ],
    vehicles:[{key:"runnerCars",name:"Runner Automobile",desc:"+$7/s route income.",cost:400,passive:7,heat:1},{key:"deliveryVans",name:"Delivery Van",desc:"+$20/s.",cost:1000,passive:20,heat:0}],
    storage:[{key:"stashHouses",name:"Stash House",desc:"-1 heat per house.",cost:350,passive:0,heat:-1},{key:"warehouses",name:"Warehouse",desc:"+1 heat risk.",cost:1500,passive:0,heat:1}],
  },
  2: {
    fronts:[
      {key:"jazzClubs",name:"Jazz Club",desc:"+$4/s, +$100 launder",cost:500,passive:4,launder:100,heat:-2,rep:0},
      {key:"socialClubs",name:"Veterans Social Club",desc:"+$6/s, +$80 launder, -5 heat, +rep",cost:1200,passive:6,launder:80,heat:-5,rep:2},
      {key:"barbershops",name:"Barbershop",desc:"+$1.5/s, +$50 launder",cost:250,passive:1.5,launder:50,heat:-1,rep:1},
      {key:"funeralHomes",name:"Funeral Home",desc:"+$3/s, +$150 launder",cost:800,passive:3,launder:150,heat:-3,rep:0},
    ],
    realty:[
      {key:"tenements",name:"Tenement Building",desc:"+$5/s rent.",cost:600,passive:5,rep:3},
      {key:"commercial",name:"Commercial Property",desc:"+$10/s.",cost:1200,passive:10,rep:1},
      {key:"luxury",name:"Luxury Apartment",desc:"+$20/s. Status.",cost:3500,passive:20,rep:0},
    ],
    vehicles:[{key:"runnerCars",name:"Runner Automobile",desc:"+$7/s.",cost:400,passive:7,heat:1},{key:"deliveryVans",name:"Delivery Van",desc:"+$20/s.",cost:1000,passive:20,heat:0}],
    storage:[{key:"stashHouses",name:"Stash House",desc:"-1 heat.",cost:350,passive:0,heat:-1},{key:"warehouses",name:"Warehouse",desc:"+1 heat.",cost:1500,passive:0,heat:1},{key:"safeHouses",name:"Safe House",desc:"-3 heat. Emergency fallback.",cost:2500,passive:0,heat:-3}],
  },
  3: {
    fronts:[
      {key:"recordLabels",name:"Record Label",desc:"+$10/s, +$200 launder, +rep.",cost:4000,passive:10,launder:200,heat:-3,rep:4},
      {key:"socialClubs",name:"Social Club",desc:"+$6/s, +$80 launder, -5 heat.",cost:1200,passive:6,launder:80,heat:-5,rep:2},
      {key:"funeralHomes",name:"Funeral Home",desc:"+$3/s, +$150 launder.",cost:800,passive:3,launder:150,heat:-3,rep:0},
      {key:"restaurants",name:"Soul Food Restaurant",desc:"+$8/s, +$120 launder, +rep.",cost:2000,passive:8,launder:120,heat:-2,rep:3},
    ],
    realty:[
      {key:"tenements",name:"Tenement Building",desc:"+$5/s rent.",cost:600,passive:5,rep:3},
      {key:"commercial",name:"Commercial Property",desc:"+$10/s.",cost:1200,passive:10,rep:1},
      {key:"luxury",name:"Luxury Apartment",desc:"+$20/s. Status.",cost:3500,passive:20,rep:0},
      {key:"officeBlocks",name:"Office Building",desc:"+$35/s. Serious legitimacy.",cost:8000,passive:35,rep:2},
    ],
    vehicles:[{key:"runnerCars",name:"Runner Auto",desc:"+$7/s.",cost:400,passive:7,heat:1},{key:"cadillacs",name:"Cadillac Fleetwood",desc:"+$30/s. Status.",cost:3500,passive:30,heat:1,rep:2}],
    storage:[{key:"stashHouses",name:"Stash House",desc:"-1 heat.",cost:350,passive:0,heat:-1},{key:"safeHouses",name:"Safe House",desc:"-3 heat.",cost:2500,passive:0,heat:-3},{key:"offshoreAcc",name:"Offshore Account",desc:"-4 heat, +$500 launder.",cost:5000,passive:0,heat:-4,launder:500}],
  },
  4: {
    fronts:[
      {key:"supperClubs",name:"Supper Club",desc:"+$20/s, +$300 launder, +rep.",cost:8000,passive:20,launder:300,heat:-2,rep:5},
      {key:"recordLabels",name:"Record Label",desc:"+$10/s, +$200 launder.",cost:4000,passive:10,launder:200,heat:-3,rep:4},
      {key:"restaurants",name:"Soul Food Restaurant",desc:"+$8/s, +$120 launder.",cost:2000,passive:8,launder:120,heat:-2,rep:3},
      {key:"nightclubs",name:"Nightclub",desc:"+$15/s, +$250 launder.",cost:6000,passive:15,launder:250,heat:-1,rep:2},
    ],
    realty:[
      {key:"tenements",name:"Tenement Building",desc:"+$5/s.",cost:600,passive:5,rep:3},
      {key:"luxury",name:"Luxury Apartment",desc:"+$20/s.",cost:3500,passive:20,rep:0},
      {key:"officeBlocks",name:"Office Building",desc:"+$35/s.",cost:8000,passive:35,rep:2},
      {key:"hotels",name:"Boutique Hotel",desc:"+$60/s. The pinnacle.",cost:18000,passive:60,rep:3},
    ],
    vehicles:[{key:"cadillacs",name:"Cadillac Fleetwood",desc:"+$30/s. Status.",cost:3500,passive:30,heat:1,rep:2},{key:"limousines",name:"Limousine",desc:"+$50/s.",cost:8000,passive:50,heat:0,rep:3}],
    storage:[{key:"safeHouses",name:"Safe House",desc:"-3 heat.",cost:2500,passive:0,heat:-3},{key:"offshoreAcc",name:"Offshore Account",desc:"-4 heat, +$500 launder.",cost:5000,passive:0,heat:-4,launder:500},{key:"shells",name:"Shell Company",desc:"-5 heat, +$800 launder.",cost:12000,passive:0,heat:-5,launder:800}],
  },
  5: {
    fronts:[
      {key:"nightclubs",name:"Nightclub",desc:"+$15/s, +$250 launder.",cost:6000,passive:15,launder:250,heat:-1,rep:2},
      {key:"recordLabels",name:"Record Label",desc:"+$10/s, +$200 launder.",cost:4000,passive:10,launder:200,heat:-3,rep:4},
      {key:"restaurants",name:"Soul Food Restaurant",desc:"+$8/s, +$120 launder.",cost:2000,passive:8,launder:120,heat:-2,rep:3},
      {key:"checkCashing",name:"Check Cashing Store",desc:"+$12/s, +$300 launder, -4 heat.",cost:3500,passive:12,launder:300,heat:-4,rep:1},
    ],
    realty:[
      {key:"luxury",name:"Luxury Apartment",desc:"+$20/s.",cost:3500,passive:20,rep:0},
      {key:"officeBlocks",name:"Office Building",desc:"+$35/s.",cost:8000,passive:35,rep:2},
      {key:"hotels",name:"Boutique Hotel",desc:"+$60/s.",cost:18000,passive:60,rep:3},
    ],
    vehicles:[{key:"cadillacs",name:"Cadillac Fleetwood",desc:"+$30/s.",cost:3500,passive:30,heat:1,rep:2},{key:"limousines",name:"Limousine",desc:"+$50/s.",cost:8000,passive:50,heat:0,rep:3}],
    storage:[{key:"offshoreAcc",name:"Offshore Account",desc:"-4 heat, +$500 launder.",cost:5000,passive:0,heat:-4,launder:500},{key:"shells",name:"Shell Company",desc:"-5 heat, +$800 launder.",cost:12000,passive:0,heat:-5,launder:800},{key:"trusts",name:"Family Trust",desc:"-6 heat, +$1K launder.",cost:25000,passive:0,heat:-6,launder:1000}],
  },
  6: {
    fronts:[
      {key:"investFirm",name:"Investment Firm",desc:"+$30/s, +$500 launder, +rep.",cost:15000,passive:30,launder:500,heat:-5,rep:6},
      {key:"lawFirm",name:"Law Firm",desc:"+$20/s, -8 heat, +rep.",cost:12000,passive:20,launder:300,heat:-8,rep:5},
      {key:"recordLabels",name:"Record Label",desc:"+$10/s, +$200 launder.",cost:4000,passive:10,launder:200,heat:-3,rep:4},
    ],
    realty:[
      {key:"officeBlocks",name:"Office Building",desc:"+$35/s.",cost:8000,passive:35,rep:2},
      {key:"hotels",name:"Boutique Hotel",desc:"+$60/s.",cost:18000,passive:60,rep:3},
      {key:"development",name:"Real Estate Dev Co",desc:"+$150/s.",cost:50000,passive:150,rep:5},
    ],
    vehicles:[{key:"limousines",name:"Limousine",desc:"+$50/s.",cost:8000,passive:50,heat:0,rep:3},{key:"corporate",name:"Corporate Fleet",desc:"+$100/s.",cost:30000,passive:100,heat:0,rep:2}],
    storage:[{key:"shells",name:"Shell Company",desc:"-5 heat, +$800 launder.",cost:12000,passive:0,heat:-5,launder:800},{key:"trusts",name:"Family Trust",desc:"-6 heat, +$1K launder.",cost:25000,passive:0,heat:-6,launder:1000}],
  },
  7:{
    fronts:[{key:"techStudios",name:"Tech Studio",desc:"+$25/s, +$600 launder.",cost:15000,passive:25,launder:600,heat:-3,rep:3},{key:"socialMediaCo",name:"Social Media Agency",desc:"+$35/s, +rep.",cost:18000,passive:35,launder:400,heat:-2,rep:4}],
    realty:[{key:"development",name:"Real Estate Dev Co",desc:"+$150/s.",cost:50000,passive:150,rep:5},{key:"condoTowers",name:"Condo Tower",desc:"+$250/s.",cost:100000,passive:250,rep:4}],
    vehicles:[{key:"corporate",name:"Corporate Fleet",desc:"+$100/s.",cost:30000,passive:100,heat:0,rep:2},{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4}],
    storage:[{key:"trusts",name:"Family Trust",desc:"-6 heat, +$1K launder.",cost:25000,passive:0,heat:-6,launder:1000},{key:"cryptoWallet",name:"Crypto Wallet",desc:"-3 heat, +$800 launder.",cost:20000,passive:0,heat:-3,launder:800}],
  },
  8:{
    fronts:[{key:"cdfi",name:"Community Bank",desc:"+$40/s, +$700 launder, +rep.",cost:20000,passive:40,launder:700,heat:-6,rep:7},{key:"techStudios",name:"Tech Studio",desc:"+$25/s, +$600 launder.",cost:15000,passive:25,launder:600,heat:-3,rep:3}],
    realty:[{key:"condoTowers",name:"Condo Tower",desc:"+$250/s.",cost:100000,passive:250,rep:4},{key:"affordHousing",name:"Affordable Housing",desc:"+$80/s, +8 rep.",cost:60000,passive:80,rep:8}],
    vehicles:[{key:"corporate",name:"Corporate Fleet",desc:"+$100/s.",cost:30000,passive:100,heat:0,rep:2},{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4}],
    storage:[{key:"trusts",name:"Family Trust",desc:"-6 heat, +$1K launder.",cost:25000,passive:0,heat:-6,launder:1000},{key:"daoTreasury",name:"DAO Treasury",desc:"-5 heat, +$1.2K launder.",cost:40000,passive:0,heat:-5,launder:1200}],
  },
  9:{
    fronts:[{key:"telehealth",name:"Telehealth Platform",desc:"+$60/s, +$500 launder.",cost:25000,passive:60,launder:500,heat:-4,rep:5},{key:"essentials",name:"Essential Services",desc:"+$50/s, -3 heat.",cost:20000,passive:50,launder:300,heat:-3,rep:4}],
    realty:[{key:"condoTowers",name:"Condo Tower",desc:"+$250/s.",cost:100000,passive:250,rep:4},{key:"affordHousing",name:"Affordable Housing",desc:"+$80/s, +8 rep.",cost:60000,passive:80,rep:8},{key:"warehouseNet",name:"Logistics Hub",desc:"+$200/s.",cost:80000,passive:200,rep:2}],
    vehicles:[{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4},{key:"droneFleet",name:"Drone Fleet",desc:"+$300/s.",cost:120000,passive:300,heat:0,rep:2}],
    storage:[{key:"cryptoWallet",name:"Crypto Wallet",desc:"-3 heat, +$800 launder.",cost:20000,passive:0,heat:-3,launder:800},{key:"caymansAcc",name:"Caymans Entity",desc:"-8 heat, +$2K launder.",cost:75000,passive:0,heat:-8,launder:2000}],
  },
  10:{
    fronts:[{key:"aiStudio",name:"AI Studio",desc:"+$100/s, +$800 launder.",cost:40000,passive:100,launder:800,heat:-2,rep:4},{key:"cryptoExch",name:"Crypto Exchange",desc:"+$150/s, +$2K launder.",cost:60000,passive:150,launder:2000,heat:-1,rep:2}],
    realty:[{key:"smartBuilding",name:"Smart Building",desc:"+$400/s.",cost:200000,passive:400,rep:3},{key:"affordHousing",name:"Affordable Housing",desc:"+$80/s, +8 rep.",cost:60000,passive:80,rep:8}],
    vehicles:[{key:"droneFleet",name:"Drone Fleet",desc:"+$300/s.",cost:120000,passive:300,heat:0,rep:2},{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4}],
    storage:[{key:"daoTreasury",name:"DAO Treasury",desc:"-5 heat, +$1.2K launder.",cost:40000,passive:0,heat:-5,launder:1200},{key:"swissTrust",name:"Swiss Trust",desc:"-10 heat, +$3K launder.",cost:150000,passive:0,heat:-10,launder:3000}],
  },
  11:{
    fronts:[{key:"johnsonInst",name:"Johnson Institution",desc:"+$120/s, +$1K launder, +rep.",cost:80000,passive:120,launder:1000,heat:-5,rep:10},{key:"aiStudio",name:"AI Studio",desc:"+$100/s, +$800 launder.",cost:40000,passive:100,launder:800,heat:-2,rep:4}],
    realty:[{key:"harlemTower",name:"Harlem Heritage Tower",desc:"+$800/s. Family name in steel.",cost:500000,passive:800,rep:8},{key:"smartBuilding",name:"Smart Building",desc:"+$400/s.",cost:200000,passive:400,rep:3}],
    vehicles:[{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4},{key:"droneFleet",name:"Drone Fleet",desc:"+$300/s.",cost:120000,passive:300,heat:0,rep:2}],
    storage:[{key:"swissTrust",name:"Swiss Trust",desc:"-10 heat, +$3K launder.",cost:150000,passive:0,heat:-10,launder:3000},{key:"dynastyVault",name:"Dynasty Vault",desc:"-15 heat, +$5K launder.",cost:500000,passive:0,heat:-15,launder:5000}],
  },
  12:{
    fronts:[{key:"centennialFnd",name:"Centennial Foundation",desc:"+$200/s, +$2K launder, +rep.",cost:150000,passive:200,launder:2000,heat:-8,rep:12},{key:"johnsonInst",name:"Johnson Institution",desc:"+$120/s, +$1K launder.",cost:80000,passive:120,launder:1000,heat:-5,rep:10}],
    realty:[{key:"globalHQ",name:"Global Headquarters",desc:"+$1500/s. The empire's crown.",cost:1000000,passive:1500,rep:10},{key:"harlemTower",name:"Harlem Heritage Tower",desc:"+$800/s.",cost:500000,passive:800,rep:8}],
    vehicles:[{key:"privateJets",name:"Private Aviation",desc:"+$200/s.",cost:80000,passive:200,heat:0,rep:4},{key:"droneFleet",name:"Drone Fleet",desc:"+$300/s.",cost:120000,passive:300,heat:0,rep:2}],
    storage:[{key:"dynastyVault",name:"Dynasty Vault",desc:"-15 heat, +$5K launder.",cost:500000,passive:0,heat:-15,launder:5000},{key:"swissTrust",name:"Swiss Trust",desc:"-10 heat, +$3K launder.",cost:150000,passive:0,heat:-10,launder:3000}],
  },
};

const ASSET_CATS=[{id:"fronts",label:"Fronts",icon:"\u{1F3B7}"},{id:"realty",label:"Real Estate",icon:"\u{1F3E0}"},{id:"vehicles",label:"Vehicles",icon:"\u{1F697}"},{id:"storage",label:"Storage",icon:"\u{1F4E6}"}];

const ASSET_ICONS={
  // Fronts
  jazzClubs:"\u{1F3B7}",barbershops:"\u{1F488}",funeralHomes:"\u{26B0}",socialClubs:"\u{1F37A}",
  recordLabels:"\u{1F3B5}",restaurants:"\u{1F372}",supperClubs:"\u{1F37E}",nightclubs:"\u{1F483}",
  checkCashing:"\u{1F4B3}",investFirm:"\u{1F4C8}",lawFirm:"\u{2696}",
  techStudios:"\u{1F4BB}",socialMediaCo:"\u{1F4F1}",cdfi:"\u{1F3E6}",
  telehealth:"\u{1FA7A}",essentials:"\u{1F6D2}",aiStudio:"\u{1F916}",cryptoExch:"\u{26D3}",
  johnsonInst:"\u{1F3DB}",centennialFnd:"\u{1F31F}",
  // Realty
  tenements:"\u{1F3DA}",commercial:"\u{1F3EC}",luxury:"\u{1F306}",officeBlocks:"\u{1F3E2}",
  hotels:"\u{1F3E8}",development:"\u{1F3D7}",condoTowers:"\u{1F3D9}",affordHousing:"\u{1F3D8}",
  smartBuilding:"\u{1F4A1}",harlemTower:"\u{1F5FC}",globalHQ:"\u{1F30D}",warehouseNet:"\u{1F4E6}",
  // Vehicles
  runnerCars:"\u{1F697}",deliveryVans:"\u{1F69A}",cadillacs:"\u{1F3CE}",limousines:"\u{1F699}",
  corporate:"\u{1F68C}",privateJets:"\u{2708}",droneFleet:"\u{1F681}",
  // Storage
  stashHouses:"\u{1F3E0}",warehouses:"\u{1F4E6}",safeHouses:"\u{1F512}",
  offshoreAcc:"\u{1F3DD}",shells:"\u{1F4BC}",trusts:"\u{1F4DC}",
  cryptoWallet:"\u{1F4B0}",daoTreasury:"\u{26D3}",caymansAcc:"\u{1F334}",
  swissTrust:"\u{1F3D4}",dynastyVault:"\u{1F3F0}",
};

// ── ZONES ─────────────────────────────────────────────────
const ZONES=[
  {id:0,name:"Sugar Hill",area:"Harlem",bonus:"+15% income",bType:"income",mult:1.15,cost:0,minGen:1},
  {id:1,name:"Strivers Row",area:"Harlem",bonus:"+20% launder",bType:"launder",mult:1.20,cost:600,minGen:1},
  {id:2,name:"The Tenderloin",area:"Harlem",bonus:"+10% income",bType:"income",mult:1.10,cost:400,minGen:1},
  {id:3,name:"East Harlem",area:"Harlem",bonus:"-15% heat",bType:"heat",mult:0.85,cost:800,minGen:1},
  {id:4,name:"Morningside",area:"Harlem",bonus:"+25% income",bType:"income",mult:1.25,cost:900,minGen:1},
  {id:5,name:"Saint Nicholas",area:"Harlem",bonus:"+20% rep",bType:"rep",mult:1.20,cost:700,minGen:1},
  {id:6,name:"Bradhurst Ave",area:"Harlem",bonus:"+15% income",bType:"income",mult:1.15,cost:1000,minGen:1},
  {id:7,name:"Lenox Avenue",area:"Harlem",bonus:"-20% heat",bType:"heat",mult:0.80,cost:1200,minGen:1},
  {id:8,name:"Fifth Avenue",area:"Harlem",bonus:"+30% launder",bType:"launder",mult:1.30,cost:1500,minGen:1},
  {id:9,name:"Riverside Dr.",area:"Harlem",bonus:"+15% rep",bType:"rep",mult:1.15,cost:1400,minGen:1},
  {id:10,name:"Washington Hts",area:"Harlem",bonus:"+35% income",bType:"income",mult:1.35,cost:2000,minGen:1},
  {id:11,name:"Polo Grounds",area:"Harlem",bonus:"+40% income",bType:"income",mult:1.40,cost:2500,minGen:1},
  // Brooklyn (Gen 2+)
  {id:12,name:"Bed-Stuy",area:"Brooklyn",bonus:"+30% income",bType:"income",mult:1.30,cost:3000,minGen:2},
  {id:13,name:"Crown Heights",area:"Brooklyn",bonus:"+25% rep",bType:"rep",mult:1.25,cost:3500,minGen:2},
  {id:14,name:"Brownsville",area:"Brooklyn",bonus:"-25% heat",bType:"heat",mult:0.75,cost:2800,minGen:2},
  {id:15,name:"Fort Greene",area:"Brooklyn",bonus:"+35% launder",bType:"launder",mult:1.35,cost:4000,minGen:2},
  // Bronx (Gen 3+)
  {id:16,name:"Mott Haven",area:"The Bronx",bonus:"+45% income",bType:"income",mult:1.45,cost:5000,minGen:3},
  {id:17,name:"South Bronx",area:"The Bronx",bonus:"-30% heat",bType:"heat",mult:0.70,cost:5500,minGen:3},
  {id:18,name:"Hunts Point",area:"The Bronx",bonus:"+50% income",bType:"income",mult:1.50,cost:6000,minGen:3},
  // Manhattan (Gen 4+)
  {id:19,name:"Hell's Kitchen",area:"Manhattan",bonus:"+60% income",bType:"income",mult:1.60,cost:9000,minGen:4},
  // National (Gen 7+)
  {id:20,name:"Capitol Hill",area:"Washington D.C.",bonus:"Maxes Political",bType:"rep",mult:1.50,cost:500000,minGen:7},
  {id:21,name:"Georgetown",area:"Washington D.C.",bonus:"-40% heat",bType:"heat",mult:0.60,cost:800000,minGen:7},
  {id:22,name:"Shaw District",area:"Washington D.C.",bonus:"+60% income",bType:"income",mult:1.60,cost:1000000,minGen:7},
  {id:23,name:"West Philly",area:"Philadelphia",bonus:"+55% income",bType:"income",mult:1.55,cost:600000,minGen:7},
  {id:24,name:"North Philly",area:"Philadelphia",bonus:"+30% rep",bType:"rep",mult:1.30,cost:900000,minGen:7},
  {id:25,name:"Bronzeville",area:"Chicago",bonus:"+65% income",bType:"income",mult:1.65,cost:1000000,minGen:8},
  {id:26,name:"South Side",area:"Chicago",bonus:"+40% rep",bType:"rep",mult:1.40,cost:1500000,minGen:8},
  {id:27,name:"The Loop",area:"Chicago",bonus:"+90% launder",bType:"launder",mult:1.90,cost:3000000,minGen:8},
  {id:28,name:"Sweet Auburn",area:"Atlanta",bonus:"+50% income",bType:"income",mult:1.50,cost:800000,minGen:8},
  {id:29,name:"Buckhead",area:"Atlanta",bonus:"+70% launder",bType:"launder",mult:1.70,cost:2000000,minGen:9},
  {id:30,name:"Compton",area:"Los Angeles",bonus:"+75% income",bType:"income",mult:1.75,cost:2500000,minGen:9},
  {id:31,name:"Third Ward",area:"Houston",bonus:"+60% income",bType:"income",mult:1.60,cost:1500000,minGen:9},
  {id:32,name:"Corktown",area:"Detroit",bonus:"-50% heat",bType:"heat",mult:0.50,cost:1200000,minGen:10},
];

const ZONE_METHODS=[
  {id:"buyin",label:"Buy In",costMult:1.0,heatGain:3,desc:"Negotiate. Quiet."},
  {id:"muscle",label:"Muscle",costMult:0.55,heatGain:22,desc:"Force it. Cheap but loud."},
  {id:"infiltrate",label:"Infiltrate",costMult:1.5,heatGain:1,desc:"Surgical. Expensive."},
];

// ── FACTIONS ──────────────────────────────────────────────
const FACTION_DEFS={
  community:{name:"The Community",icon:"\u{1F3D8}",desc:"Harlem's people.",color:"#6baa6b"},
  italian:{name:"The Outfit",icon:"\u{1F454}",desc:"Italian syndicate downtown.",color:"#c07070"},
  police:{name:"Corrupt Police",icon:"\u{1F46E}",desc:"Officers on the take.",color:"#7088a8"},
  political:{name:"The Ward Machine",icon:"\u{1F3DB}",desc:"Ministers and politicians.",color:"#b090c0"},
};

// ── HEIRS ─────────────────────────────────────────────────
const HEIR_POOLS={
  2:[
    {name:"Robert Johnson",title:"The Soldier",icon:"\u{2694}",type:"enforcer",traits:["Disciplined","Feared","Loyal"],bonus:"Territory holds stronger. Income +20%.",incomeMult:1.2,heatMult:1.0,launderMult:1.0},
    {name:"James Johnson",title:"The Gentleman",icon:"\u{1F3A9}",type:"diplomat",traits:["Educated","Connected","Patient"],bonus:"All factions start +15. Heat rate -20%.",incomeMult:1.0,heatMult:0.8,launderMult:1.0,factionBonus:15},
    {name:"Samuel Johnson",title:"The Hustler",icon:"\u{1F4BC}",type:"businessman",traits:["Sharp","Resourceful","Ambitious"],bonus:"Launder efficiency +30%. Asset income +20%.",incomeMult:1.0,heatMult:1.0,launderMult:1.3},
  ],
  3:[
    {name:"Clarence Johnson",title:"The General",icon:"\u{1F31F}",type:"enforcer",traits:["Strategic","Fearless","Commanding"],bonus:"Territory costs -25%. Income +25%.",incomeMult:1.25,heatMult:1.0,launderMult:1.0},
    {name:"Dr. Leon Johnson",title:"The Scholar",icon:"\u{1F4DC}",type:"diplomat",traits:["Principled","Wise","Connected"],bonus:"Community and Political factions +25. Heat -25%.",incomeMult:1.0,heatMult:0.75,launderMult:1.0,factionBonus:25},
    {name:"Marcus Jr.",title:"The Entrepreneur",icon:"\u{1F4B0}",type:"businessman",traits:["Innovative","Driven","Calculating"],bonus:"Launder cap +50%. Business income +35%.",incomeMult:1.0,heatMult:1.0,launderMult:1.5},
  ],
  4:[
    {name:"Damon Johnson",title:"The Warlord",icon:"\u{1F531}",type:"enforcer",traits:["Ruthless","Commanding","Feared"],bonus:"Rival territory costs -35%. Income +30%.",incomeMult:1.3,heatMult:1.0,launderMult:1.0},
    {name:"Reginald Johnson",title:"The Prince",icon:"\u{1F451}",type:"diplomat",traits:["Charismatic","Smooth","Connected"],bonus:"All factions +20. Heat -30%.",incomeMult:1.0,heatMult:0.7,launderMult:1.0,factionBonus:20},
    {name:"Calvin Johnson",title:"The Architect",icon:"\u{1F3DB}",type:"businessman",traits:["Visionary","Patient","Methodical"],bonus:"Real estate doubled. Launder +40%.",incomeMult:1.0,heatMult:1.0,launderMult:1.4},
  ],
  5:[
    {name:"Andre Johnson",title:"The Survivor",icon:"\u{1F6E1}",type:"enforcer",traits:["Resilient","Hard","Unbreakable"],bonus:"Heat penalty reduced 40%. Operations floor raised.",incomeMult:1.1,heatMult:0.6,launderMult:1.0},
    {name:"Bernard Johnson",title:"The Peacemaker",icon:"\u{1F54A}",type:"diplomat",traits:["Diplomatic","Wise","Trusted"],bonus:"Community maxed at start. Heat -35%.",incomeMult:1.0,heatMult:0.65,launderMult:1.0,factionBonus:30},
    {name:"Winston Johnson",title:"The Broker",icon:"\u{1F4CA}",type:"businessman",traits:["Calculated","Legitimate","Strategic"],bonus:"Asset income +50%. Start with $5K clean.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,cleanBonus:5000},
  ],
  6:[
    {name:"Isaiah Johnson",title:"The Senator",icon:"\u{1F3DB}",type:"diplomat",traits:["Political","Respected","Untouchable"],bonus:"Heat grows 50% slower. Political maxed.",incomeMult:1.0,heatMult:0.5,launderMult:1.0,factionBonus:25},
    {name:"Victor Johnson",title:"The CEO",icon:"\u{1F48E}",type:"businessman",traits:["Legitimate","Powerful","Respected"],bonus:"All income +40%. Start with office buildings.",incomeMult:1.4,heatMult:1.0,launderMult:1.0},
    {name:"Marcus III",title:"The Legend",icon:"\u{2B50}",type:"legend",traits:["Legacy","Feared","Beloved"],bonus:"All bonuses combined at 50%.",incomeMult:1.2,heatMult:0.75,launderMult:1.25,factionBonus:15},
  ],
  7:[
    {name:"Devon Johnson",title:"The Innovator",icon:"\u{1F52C}",type:"businessman",traits:["Visionary","Connected","Digital"],bonus:"Tech and media +50%. Heat -20%.",incomeMult:1.0,heatMult:0.8,launderMult:1.0},
    {name:"Layla Johnson",title:"The Diplomat",icon:"\u{1F339}",type:"diplomat",traits:["Strategic","Charismatic","Wise"],bonus:"All factions +30. Community maxed.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,factionBonus:30},
    {name:"Carter Johnson",title:"The Builder",icon:"\u{1F3D7}",type:"enforcer",traits:["Driven","Disciplined","Bold"],bonus:"Real estate doubled. Territory +25%.",incomeMult:1.25,heatMult:1.0,launderMult:1.0},
  ],
  8:[
    {name:"Zora Johnson",title:"The Activist",icon:"\u{270A}",type:"diplomat",traits:["Principled","Fearless","Respected"],bonus:"Community and political maxed. Rep starts 80.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,factionBonus:35},
    {name:"Marcus IV",title:"The Operator",icon:"\u{1F4F1}",type:"businessman",traits:["Sharp","Networked","Strategic"],bonus:"Digital income +60%. Launder +50%.",incomeMult:1.0,heatMult:1.0,launderMult:1.5},
    {name:"Jerome Johnson",title:"The Guardian",icon:"\u{1F6E1}",type:"enforcer",traits:["Loyal","Commanding","Steady"],bonus:"Heat grows 40% slower. Territory holds.",incomeMult:1.0,heatMult:0.6,launderMult:1.0},
  ],
  9:[
    {name:"Nia Johnson",title:"The Adapter",icon:"\u{1F30A}",type:"diplomat",traits:["Resilient","Empathetic","Wise"],bonus:"Pandemic penalty removed. Community loyal.",incomeMult:1.0,heatMult:0.7,launderMult:1.0,factionBonus:25},
    {name:"Elijah Johnson",title:"The Strategist",icon:"\u{1F9E0}",type:"businessman",traits:["Calculated","Patient","Visionary"],bonus:"All income +50%.",incomeMult:1.5,heatMult:1.0,launderMult:1.0},
    {name:"Darius Johnson",title:"The Rock",icon:"\u{2693}",type:"enforcer",traits:["Unbreakable","Trusted","Grounded"],bonus:"Heat never exceeds 60.",incomeMult:1.0,heatMult:0.5,launderMult:1.0},
  ],
  10:[
    {name:"Soleil Johnson",title:"The Futurist",icon:"\u{1F310}",type:"businessman",traits:["Innovative","Global","Ambitious"],bonus:"Crypto/AI income +70%. Launder +100%.",incomeMult:1.0,heatMult:1.0,launderMult:2.0},
    {name:"Kofi Johnson",title:"The Elder",icon:"\u{1F4FF}",type:"diplomat",traits:["Wise","Respected","Ancestral"],bonus:"Legacy bonus +15. All factions +35.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,factionBonus:35},
    {name:"Amara Johnson",title:"The Builder",icon:"\u{1F528}",type:"enforcer",traits:["Fearless","Disciplined","Visionary"],bonus:"All construction doubled.",incomeMult:1.3,heatMult:1.0,launderMult:1.0},
  ],
  11:[
    {name:"Genesis Johnson",title:"The Centurion",icon:"\u{1F4AB}",type:"legend",traits:["Legendary","Respected","Timeless"],bonus:"All gen bonuses combined. Income 2x.",incomeMult:2.0,heatMult:0.5,launderMult:1.5,factionBonus:20},
    {name:"Sage Johnson",title:"The Scholar",icon:"\u{1F4DA}",type:"diplomat",traits:["Brilliant","Principled","Visionary"],bonus:"Legacy +20. Community maxed. Rep 100.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,factionBonus:40},
    {name:"Phoenix Johnson",title:"The Ascendant",icon:"\u{1F525}",type:"businessman",traits:["Unstoppable","Driven","Legendary"],bonus:"Income +80%. Dynasty wealth multiplied.",incomeMult:1.8,heatMult:1.0,launderMult:1.0},
  ],
  12:[
    {name:"Legacy Johnson",title:"The Final Heir",icon:"\u{267E}",type:"legend",traits:["The Dynasty","The Legacy","The Future"],bonus:"All systems maximized.",incomeMult:2.0,heatMult:0.3,launderMult:2.0,factionBonus:30},
    {name:"Harlem Johnson",title:"The Name",icon:"\u{1F5FD}",type:"diplomat",traits:["Harlem","New York","America"],bonus:"Legacy score doubled. Community immortal.",incomeMult:1.0,heatMult:1.0,launderMult:1.0,factionBonus:50},
    {name:"Century Johnson",title:"The Centennial",icon:"\u{1F4AF}",type:"businessman",traits:["One Hundred Years","Still Standing"],bonus:"Dynasty wealth tripled at ending.",incomeMult:2.5,heatMult:1.0,launderMult:1.0},
  ],
};

// ── RIVAL DATA ────────────────────────────────────────────
const RIVAL_PROFILES={
  moreno:{name:"The Moreno Family",shortName:"Moreno",origin:"Brooklyn",personality:"aggressive",icon:"\u{1F531}",
    leaders:{
      2:{name:"Sal Moreno",title:"The Soldier",trait:"Strategic",intro:"Sal came back from the war with discipline and connections. He wants what you have."},
      3:{name:"Sal Moreno",title:"The Soldier",trait:"Strategic",intro:"Sal is entrenched now. Brooklyn is his."},
      4:{name:"Vinny Moreno",title:"The Prince",trait:"Ruthless",intro:"Sal's son takes the reins. Younger, hungrier, and less patient."},
      5:{name:"Vinny Moreno",title:"The Don",trait:"Ruthless",intro:"Vinny has consolidated. The Moreno operation is at peak power."},
      6:{name:"Anthony Moreno",title:"The Businessman",trait:"Calculating",intro:"The third generation goes legitimate. But old habits linger."},
      7:{name:"Michael Moreno",title:"The Developer",trait:"Ambitious",intro:"Real estate and tech. The Morenos are reinventing themselves."},
      8:{name:"Michael Moreno",title:"The Developer",trait:"Ambitious",intro:"Michael is buying up Brooklyn. Fast."},
      9:{name:"Sofia Moreno",title:"The Mogul",trait:"Relentless",intro:"First woman to lead the family. She is not interested in tradition."},
      10:{name:"Sofia Moreno",title:"The Mogul",trait:"Relentless",intro:"Sofia has turned the Morenos into a media empire."},
      11:{name:"Dante Moreno",title:"The Heir",trait:"Cold",intro:"The Moreno dynasty enters its institutional phase."},
      12:{name:"Dante Moreno",title:"The Heir",trait:"Cold",intro:"The Morenos and the Johnsons. A century of rivalry."},
    }},
  washington:{name:"The Washington Family",shortName:"Washington",origin:"Bed-Stuy",personality:"community",icon:"\u{270A}",
    leaders:{
      2:{name:"Marcus Washington",title:"The Captain",trait:"Disciplined",intro:"Marcus came back from the Pacific a changed man. He organized with military precision."},
      3:{name:"Marcus Washington",title:"The Captain",trait:"Disciplined",intro:"Marcus has the respect of every block in Bed-Stuy."},
      4:{name:"James Washington",title:"The Preacher",trait:"Charismatic",intro:"James leads from the pulpit. Community trust runs deep."},
      5:{name:"James Washington",title:"The Preacher",trait:"Charismatic",intro:"James is the moral center of Bed-Stuy. And that is power."},
      6:{name:"David Washington",title:"The Professor",trait:"Strategic",intro:"Howard-educated. David is building institutions, not empires."},
      7:{name:"Aisha Washington",title:"The Organizer",trait:"Fearless",intro:"Aisha runs the Washington network like a political machine."},
      8:{name:"Aisha Washington",title:"The Organizer",trait:"Fearless",intro:"BLM gave Aisha a national platform. She is using it."},
      9:{name:"Malik Washington",title:"The Technologist",trait:"Visionary",intro:"Malik pivoted to mutual aid tech during the pandemic."},
      10:{name:"Malik Washington",title:"The Technologist",trait:"Visionary",intro:"Malik's crypto cooperative is gaining ground."},
      11:{name:"Zion Washington",title:"The Legacy",trait:"Principled",intro:"Zion carries a century of Washington values."},
      12:{name:"Zion Washington",title:"The Legacy",trait:"Principled",intro:"The Washingtons and the Johnsons. Two visions of Harlem."},
    }},
};

// ── ERA COLOR THEMES ──────────────────────────────────────
const ERA_THEMES={
  1:{accent:"#c9a84c",accentDim:"rgba(201,168,76,.5)",accentGlow:"rgba(201,168,76,.15)",border:"rgba(201,168,76,.12)",label:"Jazz Age Gold"},
  2:{accent:"#8a9a6a",accentDim:"rgba(138,154,106,.5)",accentGlow:"rgba(138,154,106,.15)",border:"rgba(138,154,106,.12)",label:"Wartime Olive"},
  3:{accent:"#c06848",accentDim:"rgba(192,104,72,.5)",accentGlow:"rgba(192,104,72,.15)",border:"rgba(192,104,72,.12)",label:"Civil Rights Ember"},
  4:{accent:"#9a6ab0",accentDim:"rgba(154,106,176,.5)",accentGlow:"rgba(154,106,176,.15)",border:"rgba(154,106,176,.12)",label:"Empire Purple"},
  5:{accent:"#4a90d0",accentDim:"rgba(74,144,208,.5)",accentGlow:"rgba(74,144,208,.15)",border:"rgba(74,144,208,.12)",label:"Neon Blue"},
  6:{accent:"#b0a080",accentDim:"rgba(176,160,128,.5)",accentGlow:"rgba(176,160,128,.15)",border:"rgba(176,160,128,.12)",label:"Legacy Silver"},
  7:{accent:"#4ab0a0",accentDim:"rgba(74,176,160,.5)",accentGlow:"rgba(74,176,160,.15)",border:"rgba(74,176,160,.12)",label:"Digital Teal"},
  8:{accent:"#d07040",accentDim:"rgba(208,112,64,.5)",accentGlow:"rgba(208,112,64,.15)",border:"rgba(208,112,64,.12)",label:"Movement Orange"},
  9:{accent:"#7090b0",accentDim:"rgba(112,144,176,.5)",accentGlow:"rgba(112,144,176,.15)",border:"rgba(112,144,176,.12)",label:"Pandemic Steel"},
  10:{accent:"#60c0a0",accentDim:"rgba(96,192,160,.5)",accentGlow:"rgba(96,192,160,.15)",border:"rgba(96,192,160,.12)",label:"Crypto Green"},
  11:{accent:"#c0b070",accentDim:"rgba(192,176,112,.5)",accentGlow:"rgba(192,176,112,.15)",border:"rgba(192,176,112,.12)",label:"Institutional Gold"},
  12:{accent:"#e0d0a0",accentDim:"rgba(224,208,160,.5)",accentGlow:"rgba(224,208,160,.15)",border:"rgba(224,208,160,.12)",label:"Centennial Ivory"},
};

// ── CHOICE REACTIONS ──────────────────────────────────────
const REACTIONS={
  p:[
    "The community watches. They will remember this.",
    "A principled choice. Not the easiest one.",
    "You chose the harder road. Respect follows.",
    "This is what separates a leader from a hustler.",
    "The neighborhood nods. This is the Johnson way.",
  ],
  c:[
    "A careful move. Time will tell if it was enough.",
    "Calculated. Neither hero nor villain today.",
    "You played it safe. Sometimes that is wisdom.",
    "The middle path. Survivable. Forgettable.",
    "No one will write songs about this choice. But you will sleep tonight.",
  ],
  a:[
    "Power has a price. You just paid some of it.",
    "The streets notice when a man moves like that.",
    "Bold. Dangerous. Effective. For now.",
    "That choice will echo. Whether you want it to or not.",
    "The old heads shake their heads. The young ones take notes.",
  ],
};

// ── NEWSPAPER HEADLINES ───────────────────────────────────
const NEWSPAPERS={
  1:["Amsterdam News","New York Age","Chicago Defender"],
  2:["Amsterdam News","Pittsburgh Courier"],
  3:["Amsterdam News","Jet Magazine","Ebony"],
  4:["Village Voice","Amsterdam News","Jet Magazine"],
  5:["Amsterdam News","NY Post","Village Voice"],
  6:["NY Times","Amsterdam News","Crain's New York"],
  7:["NY Times","TechCrunch","Harlem World"],
  8:["NY Times","The Root","Huffington Post"],
  9:["NY Times","The Atlantic","ProPublica"],
  10:["NY Times","Bloomberg","Axios"],
  11:["NY Times","Harvard Business Review","Forbes"],
  12:["NY Times","The New Yorker","National Geographic"],
};

const HEADLINES={
  // Triggered by rep thresholds
  highRep:[
    {gen:[1,2,3],text:"Johnson Family a Pillar of Harlem Community"},
    {gen:[1,2,3],text:"Who Is Mr. Johnson? The Man Behind Sugar Hill"},
    {gen:[2,3,4],text:"Harlem's Own: The Johnson Name Means Something"},
    {gen:[4,5,6],text:"Johnson Family Funds New Community Center"},
    {gen:[5,6,7],text:"From the Numbers to the Boardroom: The Johnson Arc"},
    {gen:[6,7,8],text:"Johnson Foundation Reaches $10M in Grants"},
    {gen:[7,8,9],text:"Profile: The Quiet Power of the Johnson Family"},
    {gen:[8,9,10],text:"Johnson Group Named Most Trusted Brand in Harlem"},
    {gen:[10,11,12],text:"The Johnson Century: A Hundred Years of Harlem"},
  ],
  lowRep:[
    {gen:[1,2,3,4],text:"Police Eye Numbers Operations in Harlem"},
    {gen:[2,3,4,5],text:"Who Benefits from the Johnson Empire?"},
    {gen:[4,5,6],text:"Federal Task Force Named: Harlem in Crosshairs"},
    {gen:[5,6],text:"The Dark Side of the Johnson Name"},
    {gen:[7,8,9],text:"Tech Wealth Built on What? The Johnson Question"},
    {gen:[9,10,11],text:"Billionaires Behaving Badly: Harlem's Own"},
  ],
  highHeat:[
    {gen:[1,2,3,4,5],text:"Precinct Steps Up Patrols in Harlem"},
    {gen:[2,3,4,5],text:"Federal Wire Taps Authorized"},
    {gen:[3,4,5],text:"Grand Jury Convened on Harlem Operations"},
    {gen:[4,5,6],text:"Johnson Associate Subpoenaed"},
  ],
  highWealth:[
    {gen:[3,4,5],text:"Johnson Family Named on Fortune 500 Prospect List"},
    {gen:[5,6,7],text:"Harlem Holding Group Posts Record Quarter"},
    {gen:[7,8,9],text:"Johnson Holdings Valued at $500M"},
    {gen:[9,10,11],text:"Johnson Group Enters Fortune 100"},
    {gen:[10,11,12],text:"Inside the Johnson Dynasty: America's Quietest Billionaires"},
  ],
  rival:[
    {gen:[2,3,4],text:"Morenos Expand: Brooklyn Family Eyes Manhattan"},
    {gen:[3,4,5],text:"Rival Operations: A Decade of Two Families"},
    {gen:[5,6,7],text:"Moreno vs Johnson: Harlem's Cold War"},
    {gen:[7,8,9],text:"Washington Coalition Challenges Johnson Dominance"},
    {gen:[8,9,10],text:"Two Visions of Black Wealth: A Divided Legacy"},
  ],
  era:{
    1:[{text:"Harlem Renaissance Reshapes American Culture"},{text:"Prohibition Fuels Underground Economy"},{text:"Jazz Clubs Packed Nightly on Lenox Avenue"}],
    2:[{text:"Veterans Return to a Changed Harlem"},{text:"GI Bill Promise Meets Harlem Reality"},{text:"Post-War Boom Touches Every Block"}],
    3:[{text:"Civil Rights Movement Fills Harlem Streets"},{text:"Malcolm X Speaks at 125th and Lenox"},{text:"Harlem Demands Equal Justice"}],
    4:[{text:"Disco Changes Harlem Nightlife"},{text:"Heroin Epidemic Grips the Community"},{text:"Black Power Movement Reshapes Politics"}],
    5:[{text:"Crack Cocaine Ravages Urban Communities"},{text:"Reagan Era Targets Inner Cities"},{text:"Hip-Hop Born in the Bronx, Spreads to Harlem"}],
    6:[{text:"Harlem Renaissance 2.0: Neighborhood Reborn"},{text:"Tech Money Flows into Harlem"},{text:"Gentrification Debate Divides Community"}],
    7:[{text:"Social Media Reshapes Communication"},{text:"Tech Wealth Transforms Neighborhoods"},{text:"Obama Era Opens New Doors"}],
    8:[{text:"Black Lives Matter Reshapes National Dialogue"},{text:"Corporate America Reckons with Race"},{text:"Diversity Funds Flood Markets"}],
    9:[{text:"Pandemic Kills Thousands in Harlem"},{text:"Essential Workers Bear the Burden"},{text:"Remote Work Revolution Begins"}],
    10:[{text:"AI Transforms Every Industry"},{text:"Crypto Crashes and Recovers"},{text:"Digital Currency Reshapes Finance"}],
    11:[{text:"A Century of Harlem: 1921-2030"},{text:"Multi-Generational Wealth Reaches Record Levels"},{text:"The Institution Era Begins"}],
    12:[{text:"Harlem Centennial: 100 Years of Culture"},{text:"The Great Dynasties of American Business"},{text:"Looking Back: The Century in Harlem"}],
  },
};

// ── GOVERNMENT AGENCIES ───────────────────────────────────
const GOV_AGENCIES={
  cia:{name:"CIA",icon:"\u{1F575}",desc:"Central Intelligence Agency. The deep state.",unlockGen:6,color:"#7a8a6a"},
  dod:{name:"Dept. of Defense",icon:"\u{2694}",desc:"Military contracts and defense spending.",unlockGen:6,color:"#8a7a6a"},
  congress:{name:"U.S. Congress",icon:"\u{1F3DB}",desc:"Legislative power. PACs, caucuses, bills.",unlockGen:7,color:"#9a8ab0"},
  state:{name:"State Department",icon:"\u{1F310}",desc:"International business intelligence.",unlockGen:7,color:"#6a8a9a"},
  nasa:{name:"NASA",icon:"\u{1F680}",desc:"Satellite data and dual-use technology.",unlockGen:8,color:"#5a7aaa"},
  fed:{name:"Federal Reserve",icon:"\u{1F3E6}",desc:"The financial architecture of the nation.",unlockGen:9,color:"#8a9a6a"},
  hud:{name:"HUD",icon:"\u{1F3D8}",desc:"Housing and Urban Development. Community money.",unlockGen:7,color:"#6a9a7a"},
  dhs:{name:"Homeland Security",icon:"\u{1F6E1}",desc:"Post-9/11 security apparatus.",unlockGen:8,color:"#9a6a6a"},
};

const GOV_CONTRACTS=[
  {id:"dod_base",agency:"dod",name:"Base Logistics",cost:0,revenue:5000,relReq:10,desc:"Supply chain consulting for military bases.",govRel:5,exposure:2},
  {id:"dod_systems",agency:"dod",name:"Defense Systems",cost:0,revenue:25000,relReq:40,desc:"Intelligence systems architecture.",govRel:10,exposure:8},
  {id:"cia_consult",agency:"cia",name:"CIA Consulting",cost:0,revenue:8000,relReq:15,desc:"Analytical consulting for the agency.",govRel:8,exposure:5},
  {id:"cia_network",agency:"cia",name:"Network Operations",cost:0,revenue:50000,relReq:60,desc:"Human intelligence network management.",govRel:15,exposure:15},
  {id:"congress_pac",agency:"congress",name:"PAC Funding",cost:5000,revenue:3000,relReq:0,desc:"Political action committee contributions.",govRel:12,exposure:1},
  {id:"congress_caucus",agency:"congress",name:"Caucus Support",cost:10000,revenue:8000,relReq:25,desc:"Black caucus legislative support.",govRel:15,exposure:3},
  {id:"hud_housing",agency:"hud",name:"Housing Grants",cost:0,revenue:10000,relReq:10,desc:"Affordable housing development grants.",govRel:8,exposure:1},
  {id:"hud_revitalize",agency:"hud",name:"Revitalization Fund",cost:0,revenue:30000,relReq:35,desc:"Neighborhood revitalization contracts.",govRel:12,exposure:2},
  {id:"nasa_data",agency:"nasa",name:"Satellite Data",cost:0,revenue:6000,relReq:10,desc:"Civilian data processing contracts.",govRel:6,exposure:1},
  {id:"state_consult",agency:"state",name:"Risk Analysis",cost:0,revenue:7000,relReq:10,desc:"Economic and political risk analysis.",govRel:7,exposure:2},
  {id:"fed_advisory",agency:"fed",name:"Fed Advisory",cost:0,revenue:15000,relReq:20,desc:"Community lending advisory board.",govRel:10,exposure:3},
  {id:"dhs_cyber",agency:"dhs",name:"Cyber Defense",cost:0,revenue:12000,relReq:15,desc:"Cybersecurity consulting.",govRel:8,exposure:4},
];

// ── STRATEGIC INVESTMENTS ─────────────────────────────────
const INVESTMENTS=[
  {id:"nationalExpansion",name:"National Expansion",cost:500000,minGen:7,minWealth:500000,
    desc:"Unlock 14 national zones across D.C., Philadelphia, Chicago, Atlanta, L.A., Houston, and Detroit.",
    icon:"\u{1F5FA}",effect:"nationalExpansion"},
  {id:"hbcuEndowment",name:"HBCU Endowment",cost:200000,minGen:6,minWealth:200000,
    desc:"Permanent scholarship fund at Howard University. Rep maxed. Community trust +30.",
    icon:"\u{1F393}",effect:"hbcuEndowment"},
  {id:"pacFunding",name:"Political Action Committee",cost:100000,minGen:7,minWealth:100000,
    desc:"Establish a PAC. Political faction maxed. Congressional relationship +25.",
    icon:"\u{1F3DB}",effect:"pacFunding"},
  {id:"heritageTower",name:"Harlem Heritage Tower",cost:500000,minGen:9,minWealth:500000,
    desc:"A landmark tower on 135th Street. +$800/tick income. The family name in steel and glass.",
    icon:"\u{1F5FC}",effect:"heritageTower"},
  {id:"defenseContract",name:"Defense Pipeline",cost:300000,minGen:7,minWealth:300000,
    desc:"Permanent DOD contract pipeline. +$5,000/tick. DOD relationship +30.",
    icon:"\u{2694}",effect:"defenseContract"},
  {id:"blackBudgetAccess",name:"Black Budget Access",cost:1000000,minGen:9,minWealth:1000000,
    desc:"Unlock classified government programs. Massive income. Massive exposure. No going back.",
    icon:"\u{2B1B}",effect:"blackBudgetAccess",requireGov:{cia:30,dod:30}},
];

// ── BLACK BUDGET PROGRAMS ─────────────────────────────────
const BLACK_BUDGET=[
  {id:"prism",name:"PRISM",tier:1,cost:500000,desc:"Signals intelligence architecture. Heat rate permanently reduced 40%.",
    income:50000,exposure:15,effect:"prism"},
  {id:"quantum",name:"QUANTUM",tier:1,cost:800000,desc:"Quantum-resistant encryption. Launder capacity doubled.",
    income:80000,exposure:12,effect:"quantum"},
  {id:"aurora",name:"AURORA",tier:2,cost:1500000,desc:"Predictive analytics platform. Event timer slowed 40%. Income preview.",
    income:120000,exposure:18,effect:"aurora",reqTier:1},
  {id:"prometheus",name:"PROMETHEUS",tier:2,cost:2000000,desc:"AI-driven pattern recognition. All income +25%.",
    income:200000,exposure:20,effect:"prometheus",reqTier:1},
  {id:"atlas",name:"ATLAS",tier:3,cost:5000000,desc:"Global intelligence network. Territory costs -50%. 40 countries.",
    income:500000,exposure:30,effect:"atlas",reqTier:2},
];

// ── CHAIN EVENTS (flag-conditional) ───────────────────────
const CHAIN_EVENTS=[
  // Civil rights march echoes
  {id:"chain_march_senator",minGen:7,reqFlag:"civilRightsMarch",title:"The Senator Remembers",sub:"Political -- Echo",
    body:"A newly elected senator pulls you aside at a fundraiser. She says: my mother was at that march on Lenox Avenue. She told me who stood with the people that day. Your family name was on her list.",
    choices:[
      {label:"Tell her the community made that decision, not you.",tag:"p",effects:{fPolitical:20,rep:8}},
      {label:"Ask what she needs. An ally is an ally.",tag:"c",effects:{fPolitical:15,clean:-5000}},
      {label:"Accept the compliment. Move on.",tag:"a",effects:{fPolitical:8}},
    ]},
  // Drug money haunts you
  {id:"chain_drugs_crack",minGen:5,reqFlag:"drugMoneyAccepted",title:"The Ghosts of Harlem",sub:"Community -- Reckoning",
    body:"A mother stands in your lobby. Her son died last week. She says the drugs that killed him came through routes your family helped build twenty years ago. She is not wrong.",
    choices:[
      {label:"Fund a recovery center in her son's name.",tag:"p",effects:{clean:-5000,fCommunity:15,rep:10,flag:"fundedRecovery"}},
      {label:"Apologize privately. Offer money for the funeral.",tag:"c",effects:{clean:-1000,fCommunity:5}},
      {label:"Have security escort her out.",tag:"a",effects:{fCommunity:-20,rep:-10}},
    ]},
  // Protected community payoff
  {id:"chain_protect_legacy",minGen:8,reqFlag:"protectedCommunity",title:"The Block Remembers",sub:"Community -- Payoff",
    body:"A documentary crew is filming on 125th Street. Every person they interview mentions the same thing: the Johnson family never let drugs in. That one decision, fifty years ago, is the reason this block survived.",
    choices:[
      {label:"Participate in the documentary.",tag:"p",effects:{rep:15,fCommunity:20}},
      {label:"Decline but allow them to film on your property.",tag:"c",effects:{rep:8,fCommunity:10}},
      {label:"Shut it down. History is complicated.",tag:"a",effects:{fCommunity:-5}},
    ]},
  // Reverend's church payoff
  {id:"chain_reverend_grandson",minGen:6,reqFlag:"helpedReverend",title:"The Reverend's Grandson",sub:"Community -- Echo",
    body:"A young man in a suit walks into your office. He says: my grandfather was Reverend Clayton. You fixed his church roof in 1925. He told me before he died that if I ever needed help, to find the Johnsons. He needs startup funding for a community health clinic.",
    choices:[
      {label:"Fund the clinic. Full investment.",tag:"p",effects:{clean:-8000,fCommunity:25,rep:15,fPolitical:10}},
      {label:"Seed funding. $3,000.",tag:"c",effects:{clean:-3000,fCommunity:12,rep:6}},
      {label:"Decline. Sentiment is not a business plan.",tag:"a",effects:{fCommunity:-8}},
    ]},
  // Widow payoff
  {id:"chain_widow_daughter",minGen:4,reqFlag:"paidWidow",title:"The Widow's Daughter",sub:"Community -- Echo",
    body:"A woman finds you at a community event. She says: you paid my mother $120 when my father died. We never forgot. She hands you a hand-drawn card her children made. It says: Thank you Mr. Johnson.",
    choices:[
      {label:"Accept it. Frame it in your office.",tag:"p",effects:{rep:8,fCommunity:12}},
      {label:"Thank her and move on.",tag:"c",effects:{fCommunity:5}},
    ]},
  // Outfit refusal echoes
  {id:"chain_outfit_respect",minGen:5,reqFlag:"refusedOutfit",title:"The Old Don's Respect",sub:"The Outfit -- Echo",
    body:"Word reaches you through a back channel: the old Italian boss who you refused twice has died. In his will, he left a note for you. It says: the Johnson kid had more spine than any of my own people. Do not go to war with his family. They earned what they have.",
    choices:[
      {label:"Attend the funeral. Pay respects.",tag:"p",effects:{fItalian:15,rep:6}},
      {label:"Send flowers. Keep your distance.",tag:"c",effects:{fItalian:8}},
      {label:"Ignore it. Old history.",tag:"a",effects:{}},
    ]},
  // GI Bill housing echo
  {id:"chain_gi_homeowners",minGen:6,reqFlag:"giBillHousing",title:"The Homeowners Association",sub:"Community -- Payoff",
    body:"The families who got homes through the GI Bill program you funded have formed a homeowners association. They named it the Johnson Housing Coalition. Forty families. All still in Harlem. They are asking you to speak at the anniversary.",
    choices:[
      {label:"Speak. Tell them this is what it was all for.",tag:"p",effects:{rep:12,fCommunity:18,fPolitical:8}},
      {label:"Send a representative.",tag:"c",effects:{fCommunity:8,rep:4}},
    ]},
  // Black budget blowback
  {id:"chain_bb_whistleblower",minGen:10,reqFlag:"blackBudgetActive",title:"The Whistleblower",sub:"Government -- Crisis",
    body:"A former employee has gone to the press with documents about your classified government contracts. She says the public deserves to know what the Johnson Group is building for the intelligence community.",
    choices:[
      {label:"Let the story run. Own what you built.",tag:"p",effects:{heat:15,rep:-5,fCommunity:-10,exposure:20}},
      {label:"Legal team. NDA enforcement. Kill the story.",tag:"c",effects:{clean:-20000,heat:5,exposure:10}},
      {label:"Reach out to your CIA contact. Make it disappear.",tag:"a",effects:{clean:-50000,exposure:25,flag:"silencedWhistleblower"}},
    ]},
  // Fed board echo
  {id:"chain_fed_power",minGen:11,reqFlag:"fedBoard",title:"The Interest Rate Call",sub:"Government -- Power",
    body:"The Federal Reserve board is voting on interest rates. Your family member's vote could tip the balance. The community needs low rates. Your investments benefit from high rates. For the first time, the Johnson family has the power to shape the national economy.",
    choices:[
      {label:"Vote for low rates. The community comes first.",tag:"p",effects:{fCommunity:20,rep:15,dirty:-50000}},
      {label:"Abstain. Too much conflict of interest.",tag:"c",effects:{rep:5}},
      {label:"Vote for high rates. Protect the portfolio.",tag:"a",effects:{dirty:100000,fCommunity:-20,rep:-10}},
    ]},
];

// ── MILESTONE THRESHOLDS ──────────────────────────────────
const MILESTONES=[
  {id:"m_firstMillion",check:g=>g.totalEarned>=1000000,title:"The First Million",sub:"Milestone",
    body:"One million dollars has passed through the Johnson operation. Your grandfather made thirty thousand in his best year. The scale of what you have built is starting to become clear.",
    choices:[
      {label:"Invest $50K in community infrastructure.",tag:"p",effects:{clean:-50000,fCommunity:20,rep:12}},
      {label:"Reinvest in the operation.",tag:"c",effects:{dirty:10000}},
      {label:"Celebrate. You earned this.",tag:"a",effects:{rep:5,heat:3}},
    ]},
  {id:"m_tenZones",check:g=>g.territories.length>=10,title:"Ten Blocks Deep",sub:"Territory -- Milestone",
    body:"Ten zones under Johnson control. From Sugar Hill to the edges of the borough. When you walk these streets, people know whose territory they are standing on.",
    choices:[
      {label:"Host a block party. Feed the neighborhood.",tag:"p",effects:{clean:-2000,fCommunity:15,rep:10}},
      {label:"Quietly consolidate. No celebration needed.",tag:"c",effects:{heat:-5}},
      {label:"Make sure everyone knows. Visibility is power.",tag:"a",effects:{rep:8,heat:8}},
    ]},
  {id:"m_maxRep",check:g=>g.rep>=95,title:"The Name Means Something",sub:"Reputation -- Milestone",
    body:"The Johnson name is spoken with a weight that money alone cannot buy. In every barbershop, every church, every precinct house, your family is a fact of life in this city.",
    choices:[
      {label:"Use it for good. Open doors for others.",tag:"p",effects:{fCommunity:15,fPolitical:10}},
      {label:"Guard it. Reputation is fragile.",tag:"c",effects:{heat:-5}},
      {label:"Leverage it. Power should be used.",tag:"a",effects:{dirty:5000,heat:5}},
    ]},
  {id:"m_twentyZones",check:g=>g.territories.length>=20,title:"National Reach",sub:"Territory -- Milestone",
    body:"Twenty zones. Multiple cities. The Johnson family operates on a scale that makes the original numbers game look like a lemonade stand. Federal attention is inevitable at this level.",
    choices:[
      {label:"Establish community programs in every city.",tag:"p",effects:{clean:-20000,fCommunity:25,rep:15}},
      {label:"Diversify and insulate. Shell companies.",tag:"c",effects:{clean:-10000,heat:-10}},
      {label:"Keep expanding. Momentum is everything.",tag:"a",effects:{heat:10}},
    ]},
  {id:"m_billion",check:g=>g.totalEarned>=1000000000,title:"A Billion Dollars",sub:"Wealth -- Milestone",
    body:"One billion dollars has flowed through the Johnson operation since 1921. A number that would have been impossible for your grandfather to imagine. A number that puts your family in a category that governments take seriously.",
    choices:[
      {label:"Endow a permanent community trust. $100M.",tag:"p",effects:{clean:-100000,fCommunity:30,rep:25,flag:"billionTrust"}},
      {label:"Diversify internationally.",tag:"c",effects:{rep:10}},
      {label:"The number speaks for itself.",tag:"a",effects:{rep:5}},
    ]},
];

// ── EVENTS ────────────────────────────────────────────────
const ERA_EVENTS={
  1:[
    {id:"luckyNum",title:"A Lucky Number Hits",sub:"Operations -- Crisis",body:"One of your banks paid out big last night. You owe three hundred dollars to half the block.",choices:[
      {label:"Pay every winner in full.",tag:"p",effects:{dirty:-300,fCommunity:10,flag:"paidOutWinners"}},
      {label:"Pay half. Blame a counting error.",tag:"c",effects:{dirty:-150,fCommunity:-5}},
      {label:"Stall. Make them wait a week.",tag:"a",effects:{fCommunity:-15,rep:-5}},
    ]},
    {id:"walsh1",title:"Captain Walsh Pays a Visit",sub:"Police -- Pressure",body:"The precinct captain appears at your barbershop. He smiles and says Harlem has been getting noisier.",minHeat:15,choices:[
      {label:"Hand him an envelope -- $400.",tag:"c",effects:{clean:-400,heat:-22,fPolice:15}},
      {label:"$200 and information on a rival.",tag:"a",effects:{clean:-200,heat:-10,fItalian:-10}},
      {label:"Send him away empty-handed.",tag:"p",effects:{heat:18}},
    ]},
    {id:"downtown1",title:"Downtown Men in Harlem",sub:"The Outfit -- Threat",body:"Three men in expensive suits walking your streets, counting foot traffic near your banks.",choices:[
      {label:"Send word: these blocks are not for sale.",tag:"a",effects:{fItalian:-12,flag:"refusedOutfit"}},
      {label:"Request a formal sit-down.",tag:"c",effects:{fItalian:6}},
      {label:"Double your street presence quietly.",tag:"p",effects:{dirty:-150,heat:4}},
    ]},
    {id:"reverend1",title:"Reverend Clayton's Request",sub:"Community -- Opportunity",body:"The church roof is failing. He asks for an investment in the neighborhood.",choices:[
      {label:"Donate $500 to the church fund.",tag:"p",effects:{clean:-500,rep:14,fCommunity:18,fPolitical:10,flag:"helpedReverend"}},
      {label:"Give $200, put your name on the plaque.",tag:"c",effects:{clean:-200,rep:7,fCommunity:9}},
      {label:"Decline.",tag:"a",effects:{rep:-6,fCommunity:-9,fPolitical:-5}},
    ]},
    {id:"youngman1",title:"A Young Man Wants In",sub:"Operations -- Opportunity",body:"A sharp kid from 133rd Street. Nineteen. Fast. Knows every alley in Harlem.",choices:[
      {label:"Put him on. Start him low, watch him.",tag:"c",effects:{workers:1}},
      {label:"Test him first with a job that counts.",tag:"p",effects:{workers:1,fCommunity:3}},
      {label:"Turn him away. Too risky.",tag:"a",effects:{}},
    ]},
    {id:"bootleg1",title:"Bootleg Liquor Deal",sub:"1920s -- Opportunity",body:"A contact offers bootleg whiskey distribution through your network. Double income, double risk.",choices:[
      {label:"Take the deal.",tag:"a",effects:{dirty:1000,heat:15}},
      {label:"Small cut for introductions.",tag:"c",effects:{dirty:400,heat:6}},
      {label:"Stick to numbers.",tag:"p",effects:{fCommunity:5}},
    ]},
    {id:"harlem1",title:"The Harlem Renaissance",sub:"1920s -- Community",body:"A jazz musician asks for a loan to record his first record. No bank will look at him.",choices:[
      {label:"Loan $200. No interest.",tag:"p",effects:{clean:-200,fCommunity:12,rep:6}},
      {label:"Loan at reasonable interest.",tag:"c",effects:{clean:-200,fCommunity:5}},
      {label:"Decline.",tag:"a",effects:{fCommunity:-3}},
    ]},
    {id:"cottonClub",title:"The Cotton Club Connection",sub:"Operations -- Opportunity",body:"A floor manager says his boss wants numbers running during shows. Wealthy crowd, but you would operate inside someone else's house.",choices:[
      {label:"Set up a discreet numbers desk.",tag:"c",effects:{dirty:600,heat:4,fItalian:-5}},
      {label:"Send one trusted runner.",tag:"p",effects:{dirty:200,fCommunity:-3}},
      {label:"Decline. Your operation stays in Black hands.",tag:"a",effects:{fCommunity:8,rep:5}},
    ]},
    {id:"widowSlip",title:"The Widow's Number",sub:"Community -- Moral Choice",body:"A widow says her husband had a winning slip when he died. $120 payout. No witness. Paying costs you. Not paying costs you different.",choices:[
      {label:"Pay her in full. Bring it to the door yourself.",tag:"p",effects:{dirty:-120,fCommunity:15,rep:8,flag:"paidWidow"}},
      {label:"Pay half. Explain the rules.",tag:"c",effects:{dirty:-60,fCommunity:4}},
      {label:"Deny it. No witness, no payout.",tag:"a",effects:{fCommunity:-18,rep:-8}},
    ]},
    {id:"iceRoute",title:"The Ice Man's Offer",sub:"Operations -- Innovation",body:"The ice delivery man covers twelve blocks. Nobody questions an ice man. He offers to carry slips alongside the ice.",choices:[
      {label:"Hire him on. Perfect cover.",tag:"c",effects:{dirty:250,heat:-5,workers:1}},
      {label:"Use him for the hottest blocks only.",tag:"p",effects:{dirty:100,heat:-3}},
      {label:"Too many in the chain. Decline.",tag:"a",effects:{}},
    ]},
    {id:"rentParty",title:"The Rent Party",sub:"1920s -- Community",body:"Your tenant is three months behind. She is throwing a rent party tonight. Half the block will be there. She asks if you will come.",choices:[
      {label:"Show up. Forgive two months rent.",tag:"p",effects:{clean:-80,fCommunity:14,rep:6}},
      {label:"Attend, collect one month, let the rest ride.",tag:"c",effects:{fCommunity:5,rep:2}},
      {label:"Collect what is owed.",tag:"a",effects:{dirty:120,fCommunity:-12,rep:-4}},
    ]},
    {id:"printShop",title:"The Print Shop Job",sub:"Operations -- Innovation",body:"A printer can produce slips that look like dry cleaning receipts. If anyone gets searched, the slips pass inspection.",choices:[
      {label:"Order a full run. $300.",tag:"p",effects:{clean:-300,heat:-10,flag:"disguisedSlips"}},
      {label:"Half run. Test on hot blocks.",tag:"c",effects:{clean:-150,heat:-5}},
      {label:"Pass. Good runners do not get searched.",tag:"a",effects:{}},
    ]},
    {id:"funeralFavor",title:"A Funeral Favor",sub:"Community -- Opportunity",body:"Old Mr. Henderson died. His family cannot afford a burial. You own a funeral home. The whole block is watching.",choices:[
      {label:"Handle the whole funeral. No charge.",tag:"p",effects:{clean:-150,fCommunity:20,rep:12,flag:"hendersonFuneral"}},
      {label:"Half price.",tag:"c",effects:{clean:-75,fCommunity:8,rep:4}},
      {label:"Full price. Business is business.",tag:"a",effects:{fCommunity:-14,rep:-6}},
    ]},
    {id:"garveyMan",title:"Marcus Garvey's Man",sub:"1920s -- Political",body:"A man from the UNIA says Brother Garvey needs five hundred for a printing press. He looks at your operation and says: we are building the same thing, from different angles.",choices:[
      {label:"Give the full $500.",tag:"p",effects:{clean:-500,fPolitical:18,fCommunity:12,rep:10}},
      {label:"Give $150 and your condolences.",tag:"c",effects:{clean:-150,fPolitical:6,fCommunity:4}},
      {label:"Decline. Politics draws attention.",tag:"a",effects:{heat:-3,fPolitical:-8}},
    ]},
  ],
  2:[
    {id:"veterans2",title:"The Veterans Return",sub:"1940s -- Opportunity",body:"A dozen men back from the war. Disciplined, tough, unwilling to take orders from the Italian outfit.",choices:[
      {label:"Hire them all. Pay well.",tag:"p",effects:{workers:4,dirty:-400,fCommunity:10,flag:"hiredVeterans"}},
      {label:"Hire the two most promising.",tag:"c",effects:{workers:2,dirty:-200}},
      {label:"Turn them away. Veterans draw attention.",tag:"a",effects:{fCommunity:-8}},
    ]},
    {id:"italian2",title:"The Italian Offer",sub:"The Outfit -- Ultimatum",body:"A downtown lieutenant wants 20% of your Harlem operation. In exchange, protection from rivals and police.",choices:[
      {label:"Refuse flatly. Harlem is yours.",tag:"a",effects:{fItalian:-20,heat:10,flag:"refusedOutfit"}},
      {label:"Counter-offer: 10%, one-year trial.",tag:"c",effects:{dirty:-500,fItalian:10,heat:-8}},
      {label:"Agree. 20% buys peace.",tag:"p",effects:{dirty:-800,fItalian:20,heat:-20,fCommunity:-12,flag:"acceptedOutfit"}},
    ]},
    {id:"federal2",title:"Federal Agents in the Neighborhood",sub:"Government -- Threat",body:"Two men in grey suits asking questions on 125th. Not NYPD. Something federal.",choices:[
      {label:"Go completely quiet for two weeks.",tag:"p",effects:{heat:-20}},
      {label:"Pay for intel on their investigation.",tag:"c",effects:{clean:-400,heat:-10}},
      {label:"Keep operating. They have nothing.",tag:"a",effects:{heat:15}},
    ]},
    {id:"deacon2",title:"Deacon Williams Comes Calling",sub:"Community -- Opportunity",body:"Deacon Williams wants funding for a youth center on 122nd. The whole congregation provides cover in return.",choices:[
      {label:"Fund the full center -- $800.",tag:"p",effects:{clean:-800,rep:18,fCommunity:20,fPolitical:15,heat:-15}},
      {label:"Contribute $300.",tag:"c",effects:{clean:-300,rep:8,fCommunity:10}},
      {label:"Decline. Too visible.",tag:"a",effects:{fCommunity:-10,fPolitical:-8}},
    ]},
    {id:"runner2",title:"A Runner Goes Missing",sub:"Operations -- Crisis",body:"One of your best runners has not been seen in four days. His wife came to your door.",choices:[
      {label:"Send men to find out what happened.",tag:"a",effects:{dirty:-300,heat:8,fCommunity:7}},
      {label:"Take care of his family. Say nothing.",tag:"p",effects:{clean:-200,rep:6,fCommunity:12}},
      {label:"Replace him quietly.",tag:"c",effects:{fCommunity:-6}},
    ]},
    {id:"strike2",title:"The Dockworkers Strike",sub:"1940s -- Opportunity",body:"A longshoremen strike is paralyzing the port. The union organizer asks for financial support.",choices:[
      {label:"Fund the strike. Align with labor.",tag:"p",effects:{clean:-600,fCommunity:14,fPolitical:10}},
      {label:"Stay neutral. Wait for it to end.",tag:"c",effects:{}},
      {label:"Move goods through back channels.",tag:"a",effects:{dirty:800,heat:8,fCommunity:-8}},
    ]},
    {id:"numbers2b",title:"Policy Dream Hit",sub:"1940s -- Operations",body:"Your policy bank hit a 600-to-1 number. Three players won big. You owe more than you have liquid.",choices:[
      {label:"Pay everyone out. All of it.",tag:"p",effects:{dirty:-1500,fCommunity:15}},
      {label:"Spread it over two weeks.",tag:"c",effects:{dirty:-800,fCommunity:3}},
      {label:"Claim the slip was fraudulent.",tag:"a",effects:{fCommunity:-20,rep:-8}},
    ]},
    // NEW Era 2 events
    {id:"giReturn",title:"The GI Bill Opportunity",sub:"1940s -- Innovation",body:"Black veterans are being shut out of GI Bill benefits across the country. But a sympathetic VA clerk says he can fast-track housing loans for your men -- if you guarantee the down payments through your operation.",choices:[
      {label:"Fund the down payments. Build Black homeownership.",tag:"p",effects:{clean:-1000,fCommunity:22,rep:15,fPolitical:8,flag:"giBillHousing"}},
      {label:"Fund half. Test the waters.",tag:"c",effects:{clean:-500,fCommunity:10,rep:6}},
      {label:"Too exposed. The VA is federal territory.",tag:"a",effects:{heat:-5}},
    ]},
    {id:"bebopClub",title:"The Bebop Club",sub:"1940s -- Community",body:"A group of young musicians -- Bird, Diz, Monk -- are playing a new kind of jazz in your club. The old crowd does not understand it. But the young crowd is electric. The music is changing.",choices:[
      {label:"Give them the stage. Every night.",tag:"p",effects:{fCommunity:12,rep:10,dirty:300}},
      {label:"Alternate nights. Keep the old crowd too.",tag:"c",effects:{fCommunity:6,rep:5,dirty:150}},
      {label:"Stick with what works. Swing sells.",tag:"a",effects:{dirty:100,fCommunity:-4}},
    ]},
    {id:"harlemHosp",title:"Harlem Hospital Crisis",sub:"1940s -- Community",body:"Harlem Hospital is overwhelmed and underfunded. A doctor you know says a $500 donation would keep the children's ward open through winter. The city does not care. You do -- or you do not.",choices:[
      {label:"Donate $500. Anonymous.",tag:"p",effects:{clean:-500,fCommunity:18,rep:12}},
      {label:"Donate $200 with your name on it.",tag:"c",effects:{clean:-200,fCommunity:8,rep:8}},
      {label:"The hospital is the city's problem.",tag:"a",effects:{fCommunity:-10}},
    ]},
    {id:"dockHeist",title:"The Dock Opportunity",sub:"1940s -- Operations",body:"A longshoreman says a shipment of silk from Japan will sit unguarded on Pier 54 for one night. The cargo is worth ten times what your best week earns. But the docks are Moreno territory.",choices:[
      {label:"Hit the pier. Fast in, fast out.",tag:"a",effects:{dirty:2000,heat:18,fItalian:-15}},
      {label:"Buy the manifest info and sell it.",tag:"c",effects:{dirty:600,heat:4}},
      {label:"Pass. The docks are not your world.",tag:"p",effects:{fItalian:5}},
    ]},
    {id:"unionCard",title:"The Union Card",sub:"1940s -- Political",body:"A Black union organizer says he can get your men union cards. Legitimate benefits, legitimate cover. But unions report to the government and the government is watching.",choices:[
      {label:"Get every worker a union card.",tag:"p",effects:{clean:-400,heat:-8,fPolitical:12,fCommunity:8,flag:"unionCards"}},
      {label:"Cards for your front businesses only.",tag:"c",effects:{clean:-200,heat:-4,fPolitical:6}},
      {label:"Decline. Too much paperwork, too many eyes.",tag:"a",effects:{heat:-2}},
    ]},
  ],
  3:[
    {id:"march3",title:"The Civil Rights March",sub:"1960s -- Defining Moment",body:"A major march down Lenox Avenue. The Reverend organization asks if yours will publicly support it. The whole neighborhood is watching.",choices:[
      {label:"Stand with the march. Publicly.",tag:"p",effects:{rep:20,fCommunity:20,fPolitical:15,heat:8,flag:"civilRightsMarch"}},
      {label:"Contribute money quietly.",tag:"c",effects:{clean:-600,fCommunity:10,fPolitical:8}},
      {label:"Stay neutral. Not your fight.",tag:"a",effects:{fCommunity:-18,fPolitical:-12,rep:-10}},
    ]},
    {id:"cointel3",title:"COINTELPRO Investigation",sub:"Federal -- Threat",body:"An informant warns you: the FBI has opened a file. They are not investigating crime. They are investigating power. Black power, specifically.",choices:[
      {label:"Shut down two operations. Go dark.",tag:"p",effects:{heat:-25,dirty:-400}},
      {label:"Retain a lawyer to find what they know.",tag:"c",effects:{clean:-800,heat:-12}},
      {label:"Keep operating. They cannot prove anything.",tag:"a",effects:{heat:20}},
    ]},
    {id:"drugs3",title:"Drug Money Enters Harlem",sub:"1960s -- Moral Choice",body:"A connection offers heroin distribution alongside your numbers network. The money would triple income overnight. You know what it does to neighborhoods.",choices:[
      {label:"Hard refuse. Numbers only. Always.",tag:"p",effects:{fCommunity:15,rep:12,flag:"protectedCommunity"}},
      {label:"Take a small cut for routing only.",tag:"c",effects:{dirty:2000,fCommunity:-15,rep:-10,heat:12,flag:"drugMoneyAccepted"}},
      {label:"Full partnership.",tag:"a",effects:{dirty:5000,fCommunity:-30,rep:-20,heat:25,flag:"drugMoneyAccepted"}},
    ]},
    {id:"council3",title:"City Councilman Approaches",sub:"Political -- Opportunity",body:"A Black city councilman needs $2,000 for his campaign. He is good. He could change real things in this neighborhood.",choices:[
      {label:"Fund the full campaign.",tag:"p",effects:{clean:-2000,fPolitical:25,rep:10,flag:"fundedPolitician"}},
      {label:"Give $800, stay arm's length.",tag:"c",effects:{clean:-800,fPolitical:12}},
      {label:"Decline. Too dangerous.",tag:"a",effects:{fPolitical:-5}},
    ]},
    {id:"radicals3",title:"The Young Radicals",sub:"Community -- Tension",body:"Young militants say numbers banks exploit the community. They are not wrong. How you handle this defines your relationship with the next generation.",choices:[
      {label:"Meet with them. Listen, then explain.",tag:"p",effects:{fCommunity:12,rep:8}},
      {label:"Donate to their community fund.",tag:"c",effects:{clean:-400,fCommunity:6,rep:4}},
      {label:"Apply pressure to make them back off.",tag:"a",effects:{heat:10,fCommunity:-14,rep:-8}},
    ]},
    {id:"outfit3",title:"One Last Offer from Downtown",sub:"The Outfit -- Final Ultimatum",body:"A senior Italian boss comes personally. He says this is the last time they offer partnership. After this, it is competition. He means it.",choices:[
      {label:"Refuse. You have come too far to share.",tag:"a",effects:{fItalian:-25,heat:8,flag:"refusedOutfit"}},
      {label:"Negotiate a mutual non-aggression pact.",tag:"c",effects:{fItalian:10}},
      {label:"Accept limited partnership.",tag:"p",effects:{fItalian:20,heat:-15,flag:"acceptedOutfit"}},
    ]},
    {id:"blackout3",title:"The Great Blackout",sub:"Era Event -- Opportunity",body:"A massive power outage hits the city. The community needs immediate help and your operation has an unexpected window.",choices:[
      {label:"Open your locations as community shelters.",tag:"p",effects:{fCommunity:22,rep:15,heat:-10}},
      {label:"Run a special numbers draw.",tag:"a",effects:{dirty:1500,fCommunity:-8}},
      {label:"Keep a low profile and wait it out.",tag:"c",effects:{}},
    ]},
    {id:"selma3",title:"The March on Washington",sub:"1960s -- National Moment",body:"Two hundred thousand people marched on Washington. Your crews want to know where the Johnson family stands.",choices:[
      {label:"Send a delegation from Harlem.",tag:"p",effects:{rep:10,fCommunity:14,fPolitical:10}},
      {label:"Quiet donation to the NAACP.",tag:"c",effects:{clean:-500,fCommunity:7}},
      {label:"Business as usual.",tag:"a",effects:{fCommunity:-10,rep:-6}},
    ]},
    {id:"casinoRaid3",title:"Casino Raid on 142nd",sub:"Operations -- Crisis",body:"Someone talked. The police are hitting the casino on 142nd tonight. You have four hours to move everything.",choices:[
      {label:"Move the operation to the backup site. Cost: $1,500.",tag:"p",effects:{clean:-1500,heat:-12}},
      {label:"Burn the evidence. Take the loss.",tag:"c",effects:{dirty:-2000,heat:-20}},
      {label:"Let it happen. Rebuild from scratch.",tag:"a",effects:{heat:15,fPolice:-10}},
    ]},
  ],
  4:[
    {id:"empire4",title:"The Empire Recognized",sub:"1970s -- Status",body:"A profile in the Amsterdam News calls you the most powerful Black family in New York. The article is flattering. It is also a spotlight.",choices:[
      {label:"Accept the attention. Use it for community leverage.",tag:"p",effects:{rep:15,fCommunity:10,heat:8}},
      {label:"Issue a quiet denial. Stay in the shadows.",tag:"c",effects:{heat:-5,rep:3}},
      {label:"Buy the reporter. Control the narrative.",tag:"a",effects:{clean:-600,heat:-10,fPolice:-5}},
    ]},
    {id:"sportsfix4",title:"The Fix Is In",sub:"Operations -- Opportunity",body:"A boxer in your sports book says he can take a dive in the fifth round. Guaranteed money. But if the commission finds out, the whole book burns.",choices:[
      {label:"Take the fix. The payout is too good.",tag:"a",effects:{dirty:3000,heat:12,fPolice:-8}},
      {label:"Decline but keep the information.",tag:"c",effects:{dirty:500}},
      {label:"Report it to the commission anonymously.",tag:"p",effects:{fPolice:10,rep:5,heat:-5}},
    ]},
    {id:"disco4",title:"The Disco Era",sub:"1970s -- Community",body:"A new club on your block is playing disco every night. The old guard hates it. The young crowd is spending money. Your nightclub needs to decide: swing or disco.",choices:[
      {label:"Go disco. The future is the future.",tag:"c",effects:{dirty:800,rep:6,fCommunity:5}},
      {label:"Split the nights. Something for everyone.",tag:"p",effects:{dirty:400,fCommunity:8,rep:4}},
      {label:"Keep it classic. Loyalty matters.",tag:"a",effects:{fCommunity:3,rep:-2}},
    ]},
    {id:"rico4",title:"RICO Rumors",sub:"Federal -- Threat",body:"A lawyer friend says the feds are building RICO cases against organized Black enterprise. They are calling it organized crime. You call it economic survival.",choices:[
      {label:"Restructure everything. Shell companies, layers.",tag:"p",effects:{clean:-3000,heat:-20,flag:"ricoPrepped"}},
      {label:"Hire a federal defense team.",tag:"c",effects:{clean:-1500,heat:-10}},
      {label:"Ignore it. They have been threatening for years.",tag:"a",effects:{heat:15}},
    ]},
    {id:"cadillac4",title:"The Cadillac Moment",sub:"1970s -- Status",body:"A custom pearl-white Cadillac Fleetwood is available. Everyone in Harlem will know whose car that is. It is a statement. It is also a target.",choices:[
      {label:"Buy it. Let them see.",tag:"a",effects:{clean:-2000,rep:12,heat:6,fCommunity:4}},
      {label:"Buy it but keep it garaged. Special occasions.",tag:"c",effects:{clean:-2000,rep:6}},
      {label:"Pass. Power is quiet.",tag:"p",effects:{heat:-3,fCommunity:2}},
    ]},
    {id:"son4",title:"Your Son Wants Out",sub:"Family -- Crisis",body:"Your eldest son says he does not want to be part of the operation. He wants to go to college. To be legitimate. He is looking at you differently now.",choices:[
      {label:"Let him go. Pay for everything. Be proud.",tag:"p",effects:{clean:-1500,rep:8,fCommunity:10,flag:"sonToCollege"}},
      {label:"Support him but make clear: family first.",tag:"c",effects:{clean:-800,fCommunity:3}},
      {label:"Tell him he does not have that choice.",tag:"a",effects:{fCommunity:-8,rep:-4}},
    ]},
  ],
  5:[
    {id:"crack5",title:"The Crack Epidemic Hits",sub:"1980s -- Era Crisis",body:"Crack cocaine is destroying your neighborhood. The people who make your operation possible are being torn apart. Some of your own runners are using.",choices:[
      {label:"Fund a community recovery program. Publicly.",tag:"p",effects:{clean:-2000,fCommunity:25,rep:15,flag:"foughtCrack"}},
      {label:"Protect your operation. Let the community handle itself.",tag:"c",effects:{fCommunity:-10,heat:-5}},
      {label:"Exploit the chaos. Expand while others collapse.",tag:"a",effects:{dirty:3000,fCommunity:-25,rep:-15,heat:10}},
    ]},
    {id:"wire5",title:"The Wire",sub:"Federal -- Threat",body:"One of your most trusted lieutenants has been wearing a wire for six weeks. How much he gave them, you do not know.",choices:[
      {label:"Get legal ahead of whatever they have.",tag:"p",effects:{clean:-3000,heat:-15}},
      {label:"Shut down every operation he touched.",tag:"c",effects:{heat:-20,dirty:-2000}},
      {label:"Confront him before he reports back.",tag:"a",effects:{heat:20}},
    ]},
    {id:"hiphop5",title:"Hip-Hop is Born in Harlem",sub:"1980s -- Cultural Moment",body:"A new sound from parks and rec centers. Young people with tapes and turntables. One wants backing for a record label.",choices:[
      {label:"Back the label. $500 seed money.",tag:"p",effects:{clean:-500,fCommunity:14,rep:8}},
      {label:"Let them use your club's back room.",tag:"c",effects:{fCommunity:8}},
      {label:"Noise and kids. Pass.",tag:"a",effects:{fCommunity:-4}},
    ]},
    {id:"gentrification5",title:"Developers Eye Harlem",sub:"1980s -- Territory",body:"Midtown developers circling Harlem for the first time. Your territory is at risk of a different kind of takeover.",choices:[
      {label:"Buy up every available property.",tag:"p",effects:{clean:-3000,fCommunity:10}},
      {label:"Sell to developers at a premium.",tag:"a",effects:{clean:2000,fCommunity:-18,rep:-10}},
      {label:"Form a neighborhood coalition.",tag:"c",effects:{fCommunity:12,fPolitical:8}},
    ]},
    {id:"memorial5",title:"Memorial for the Fallen",sub:"Community -- Milestone",body:"Harlem holds a memorial for those lost to the epidemic. Community leaders ask the biggest figures to speak.",choices:[
      {label:"Attend and speak. Own your place.",tag:"p",effects:{rep:12,fCommunity:16}},
      {label:"Pay for the memorial privately.",tag:"c",effects:{clean:-1000,fCommunity:8}},
      {label:"Skip it.",tag:"a",effects:{fCommunity:-12,rep:-6}},
    ]},
    {id:"heir5",title:"Your Heir is Being Watched",sub:"Family -- Threat",body:"Your chosen successor has been photographed meeting with known associates. The feds are building a succession case.",choices:[
      {label:"Move him to a legitimate role immediately.",tag:"p",effects:{flag:"wentLegitimate"}},
      {label:"Go dark on all communication for a month.",tag:"c",effects:{heat:-14}},
      {label:"Let him handle it himself.",tag:"a",effects:{heat:10}},
    ]},
    {id:"rico5",title:"The RICO Indictment",sub:"Federal -- Major Threat",body:"Federal prosecutors are using RICO to target Harlem operations. Three other families have already gone down. You might be next.",choices:[
      {label:"Restructure everything through shell companies.",tag:"p",effects:{clean:-5000,heat:-25,flag:"ricoPrepped"}},
      {label:"Hire the best defense team money can buy.",tag:"c",effects:{clean:-3000,heat:-12}},
      {label:"Run the gauntlet. They need evidence.",tag:"a",effects:{heat:20}},
    ]},
  ],
  6:[
    {id:"biz6",title:"Columbia Wants Your Story",sub:"2000s -- Legacy",body:"Columbia Business School is profiling Harlem entrepreneurs. A professor wants to write about the Johnson family rise.",choices:[
      {label:"Cooperate fully. Tell the whole story, your way.",tag:"p",effects:{rep:20,fPolitical:15,flag:"wentLegitimate"}},
      {label:"Allow limited access.",tag:"c",effects:{rep:10}},
      {label:"Decline. Some things stay private.",tag:"a",effects:{}},
    ]},
    {id:"foundation6",title:"The Johnson Foundation",sub:"Legacy -- Opportunity",body:"Your grandchildren want to formalize the family philanthropic work into a named foundation. This could define what the dynasty means.",choices:[
      {label:"Establish it. Commit $20,000.",tag:"p",effects:{clean:-20000,rep:25,fCommunity:20,fPolitical:15,flag:"foundationEstablished"}},
      {label:"Start small -- $5,000 seed fund.",tag:"c",effects:{clean:-5000,rep:12,fCommunity:12}},
      {label:"Let the family handle it later.",tag:"a",effects:{}},
    ]},
    {id:"journalist6",title:"The Investigative Journalist",sub:"2000s -- Threat",body:"A journalist is writing about the history of Harlem numbers. The Johnson name keeps coming up in old court documents.",choices:[
      {label:"Meet with her. Shape the story.",tag:"p",effects:{fCommunity:8,heat:-5}},
      {label:"Have your lawyer send a letter.",tag:"c",effects:{heat:5}},
      {label:"Ignore it.",tag:"a",effects:{heat:8}},
    ]},
    {id:"invest6",title:"Harlem Redevelopment",sub:"2000s -- Opportunity",body:"A major real estate development is planned for central Harlem. You have the cash and connections to be a founding investor.",choices:[
      {label:"Invest $10,000. Ground floor.",tag:"p",effects:{clean:-10000,rep:8,flag:"wentLegitimate"}},
      {label:"Smaller stake -- $4,000.",tag:"c",effects:{clean:-4000,rep:4}},
      {label:"Pass. Do not trust developers.",tag:"a",effects:{}},
    ]},
    {id:"grandson6",title:"The Grandson's Question",sub:"Family -- Legacy",body:"Your grandson sits down with you on the stoop on 135th Street. He asks: was it worth it? All of it. From the beginning. He is asking because he wants to know what to do with his own life.",choices:[
      {label:"Tell him the truth. All of it. Let him decide.",tag:"p",effects:{rep:10,fCommunity:10,flag:"truthTold"}},
      {label:"Tell him the version that protects the family.",tag:"c",effects:{rep:5}},
      {label:"Tell him to build something new. Something clean.",tag:"a",effects:{rep:8,fCommunity:5,flag:"wentLegitimate"}},
    ]},
  ],
  7:[
    {id:"techBoom7",title:"The Tech Boom",sub:"2010s -- Opportunity",body:"A Silicon Valley VC wants to invest $5M in your tech subsidiary. The catch: they want a board seat and full transparency on the family's financial history.",choices:[
      {label:"Accept the investment. Transparency is the new power.",tag:"p",effects:{clean:5000,rep:10,fPolitical:8,flag:"vcInvestment"}},
      {label:"Negotiate: money yes, board seat no.",tag:"c",effects:{clean:2000,rep:5}},
      {label:"Decline. The family's books stay private.",tag:"a",effects:{fCommunity:3}},
    ]},
    {id:"social7",title:"Social Media Exposé",sub:"2010s -- Threat",body:"A viral Twitter thread is connecting your family's legitimate businesses to the numbers game history. It is trending. Your PR team is panicking.",choices:[
      {label:"Own the story. Post your own thread about the family legacy.",tag:"p",effects:{rep:12,fCommunity:15,heat:5}},
      {label:"Lawyer up. Cease and desist.",tag:"c",effects:{clean:-2000,heat:-3}},
      {label:"Ignore it. The internet forgets in a week.",tag:"a",effects:{heat:8}},
    ]},
    {id:"harlemRent7",title:"Harlem Rent Crisis",sub:"Community -- Moral Choice",body:"Your tenants are being priced out by the very gentrification you helped resist. Some of them are families who have been in your buildings since the 1970s.",choices:[
      {label:"Freeze rents for legacy tenants. Eat the loss.",tag:"p",effects:{clean:-5000,fCommunity:25,rep:15,flag:"frozeRents"}},
      {label:"Modest increases. Below market but sustainable.",tag:"c",effects:{fCommunity:8,rep:5}},
      {label:"Market rate. This is business.",tag:"a",effects:{dirty:3000,fCommunity:-20,rep:-10}},
    ]},
    {id:"govContract7",title:"First Government Contract",sub:"Government -- Opportunity",body:"A congressional aide reaches out. HUD wants a community development partner in Harlem. The Johnson name came up. This is the door to government money.",choices:[
      {label:"Pursue it. Full compliance, full transparency.",tag:"p",effects:{clean:-3000,fPolitical:15,rep:8,flag:"govDoor"}},
      {label:"Express interest cautiously. Feel it out.",tag:"c",effects:{fPolitical:8}},
      {label:"Too much scrutiny. Pass.",tag:"a",effects:{heat:-5}},
    ]},
  ],
  8:[
    {id:"blm8",title:"The Movement Comes Home",sub:"2016 -- Defining Moment",body:"Black Lives Matter protests are filling Harlem streets. Young organizers are asking the Johnson family to stand publicly. Your corporate partners are watching nervously.",choices:[
      {label:"Stand with the movement. Publicly and financially.",tag:"p",effects:{clean:-5000,fCommunity:30,rep:20,fPolitical:15,flag:"blmSupport"}},
      {label:"Donate anonymously. Stay behind the scenes.",tag:"c",effects:{clean:-2000,fCommunity:12,rep:8}},
      {label:"Stay neutral. Protect the corporate relationships.",tag:"a",effects:{fCommunity:-15,rep:-8}},
    ]},
    {id:"police8",title:"Police Accountability",sub:"2016 -- Political",body:"Your congressional allies are pushing a police reform bill. They want the Johnson Foundation to endorse it publicly. The police union is threatening your security contracts.",choices:[
      {label:"Endorse it. This is what the foundation is for.",tag:"p",effects:{fCommunity:20,fPolitical:12,fPolice:-15,rep:12}},
      {label:"Support quietly. No public endorsement.",tag:"c",effects:{fCommunity:8,fPolitical:5}},
      {label:"Stay out of it. Too politically charged.",tag:"a",effects:{fPolice:5,fCommunity:-10}},
    ]},
    {id:"nasa8",title:"NASA Partnership",sub:"Government -- Opportunity",body:"NASA needs a private partner for satellite data processing. Your tech division has the capability. The contract is legitimate but the dual-use implications are real.",choices:[
      {label:"Accept the contract. Civilian scope only.",tag:"p",effects:{clean:8000,rep:6,flag:"nasaContract"}},
      {label:"Accept but explore the dual-use potential quietly.",tag:"c",effects:{clean:8000,dirty:5000,heat:4}},
      {label:"Decline. Government tech contracts get complicated.",tag:"a",effects:{}},
    ]},
    {id:"gentrification8",title:"The Final Block",sub:"Community -- Crisis",body:"The last Black-owned block on 125th Street is being targeted by developers. You can buy it or lose it forever.",choices:[
      {label:"Buy it. Whatever it costs.",tag:"p",effects:{clean:-50000,fCommunity:30,rep:20,flag:"savedBlock"}},
      {label:"Form a community land trust to share the cost.",tag:"c",effects:{clean:-20000,fCommunity:20,rep:12,fPolitical:10}},
      {label:"Let the market decide.",tag:"a",effects:{fCommunity:-25,rep:-12}},
    ]},
  ],
  9:[
    {id:"pandemic9",title:"The Pandemic Hits Harlem",sub:"2020 -- Era Crisis",body:"COVID-19 is devastating Harlem. Your businesses are shuttered. Your community is dying at higher rates than anywhere in the city. What the Johnson family does now will be remembered for a generation.",choices:[
      {label:"Convert your properties into testing and food distribution sites.",tag:"p",effects:{clean:-10000,fCommunity:35,rep:25,flag:"pandemicHero"}},
      {label:"Maintain operations remotely. Focus on survival.",tag:"c",effects:{fCommunity:8,rep:5}},
      {label:"Pivot to PPE sales. Profit from the crisis.",tag:"a",effects:{dirty:15000,fCommunity:-20,rep:-12}},
    ]},
    {id:"digital9",title:"The Digital Pivot",sub:"2020 -- Innovation",body:"Everything is going digital overnight. Your holding company needs to decide: invest heavily in digital infrastructure or hold cash for the downturn.",choices:[
      {label:"Go all in on digital. $20K investment.",tag:"p",effects:{clean:-20000,rep:8,flag:"digitalPivot"}},
      {label:"Moderate investment. Hedge both ways.",tag:"c",effects:{clean:-8000,rep:4}},
      {label:"Hold cash. Wait for the bottom.",tag:"a",effects:{}},
    ]},
    {id:"mutual9",title:"Mutual Aid Networks",sub:"Community -- Opportunity",body:"Young organizers have built a mutual aid network across Harlem. They are asking the Johnson Foundation to match their fundraising dollar for dollar.",choices:[
      {label:"Match every dollar. No strings attached.",tag:"p",effects:{clean:-8000,fCommunity:25,rep:15}},
      {label:"Match 50%. Offer logistics support.",tag:"c",effects:{clean:-4000,fCommunity:15,rep:8}},
      {label:"Decline. The foundation has its own priorities.",tag:"a",effects:{fCommunity:-10}},
    ]},
  ],
  10:[
    {id:"crypto10",title:"The Crypto Opportunity",sub:"2025 -- Innovation",body:"A former Goldman Sachs engineer wants to build a community-owned crypto protocol. She needs $50K and the Johnson name. The upside is enormous. The risk is real.",choices:[
      {label:"Fund it fully. The future is decentralized.",tag:"p",effects:{clean:-50000,rep:10,flag:"cryptoProtocol"}},
      {label:"Seed fund. $15K. See what happens.",tag:"c",effects:{clean:-15000,rep:5}},
      {label:"Pass. Crypto is too volatile for the family name.",tag:"a",effects:{}},
    ]},
    {id:"ai10",title:"The AI Question",sub:"2025 -- Moral Choice",body:"Your AI studio has built something powerful. A predictive model that could help community health or be sold to law enforcement. It cannot do both.",choices:[
      {label:"Community health. That is the mission.",tag:"p",effects:{fCommunity:20,rep:15,flag:"aiForCommunity"}},
      {label:"License both. Separate products.",tag:"c",effects:{dirty:20000,fCommunity:-5,heat:4}},
      {label:"Sell to law enforcement. The money is better.",tag:"a",effects:{dirty:40000,fCommunity:-25,fPolice:15,rep:-10}},
    ]},
    {id:"fed10",title:"Federal Reserve Board Seat",sub:"Government -- Milestone",body:"The President has nominated a Johnson family member for a regional Federal Reserve board seat. This would be the highest government position any family member has held.",choices:[
      {label:"Accept. Full financial disclosure, full transparency.",tag:"p",effects:{rep:20,fPolitical:25,flag:"fedBoard"}},
      {label:"Negotiate for limited disclosure.",tag:"c",effects:{rep:10,fPolitical:12}},
      {label:"Decline. Too much exposure for the family history.",tag:"a",effects:{fPolitical:-5}},
    ]},
  ],
  11:[
    {id:"century11",title:"The Century Mark",sub:"2030 -- Milestone",body:"The Johnson family has operated in Harlem for one hundred years. The New York Times wants to run a feature. The city wants to name a street. This is the moment where history is written.",choices:[
      {label:"Open the family archive. Let them write the real story.",tag:"p",effects:{rep:25,fCommunity:25,fPolitical:20,flag:"centuryArchive"}},
      {label:"Curated access. Control what becomes public.",tag:"c",effects:{rep:15,fCommunity:10}},
      {label:"Private celebration. The family knows what it built.",tag:"a",effects:{rep:5}},
    ]},
    {id:"succession11",title:"The Succession Plan",sub:"Family -- Internal",body:"The family council is split on the future. One faction wants to maintain the empire. Another wants to endow everything and dissolve. A third wants to go fully public. You have to choose.",choices:[
      {label:"Endow everything. The Johnson Foundation becomes permanent.",tag:"p",effects:{clean:-100000,rep:30,fCommunity:30,flag:"permanentFoundation"}},
      {label:"Go public. Johnson Holdings IPO.",tag:"c",effects:{rep:15,fPolitical:15,flag:"wentPublic"}},
      {label:"Maintain. The family keeps control.",tag:"a",effects:{rep:5}},
    ]},
    {id:"institute11",title:"The Johnson Institute",sub:"2030 -- Legacy",body:"Howard University offers to establish the Johnson Institute for Community Economics. Named in perpetuity. They need a $200K endowment.",choices:[
      {label:"Fund it fully. This is immortality.",tag:"p",effects:{clean:-200000,rep:30,fCommunity:25,fPolitical:20,flag:"howardInstitute"}},
      {label:"Partial funding. $80K.",tag:"c",effects:{clean:-80000,rep:15,fCommunity:12}},
      {label:"Decline. The money has better uses.",tag:"a",effects:{}},
    ]},
  ],
  12:[
    {id:"final12",title:"The Final Decision",sub:"2040 -- The End",body:"You are the last Johnson to lead the dynasty. The centennial is here. Every choice you have made echoes in this room. What do you do with what your family built?",choices:[
      {label:"Give it all back to Harlem. Every dollar, every building.",tag:"p",effects:{rep:50,fCommunity:50,flag:"gaveBack"}},
      {label:"Preserve the empire for the next hundred years.",tag:"c",effects:{rep:20}},
      {label:"Sell everything. The dynasty ends with a number.",tag:"a",effects:{dirty:500000,fCommunity:-30,rep:-15}},
    ]},
    {id:"letter12",title:"The Letter",sub:"Family -- Final",body:"In a wall safe behind your grandfather's portrait, you find a letter. Marcus Johnson, 1921. It says: Whatever you built, I hope you remember where you started. I hope you took care of the people who took care of you.",choices:[
      {label:"Read it aloud at the centennial dinner.",tag:"p",effects:{rep:20,fCommunity:20,flag:"letterRead"}},
      {label:"Keep it private. Frame it in your office.",tag:"c",effects:{rep:10}},
      {label:"Burn it. The past is the past.",tag:"a",effects:{fCommunity:-15,rep:-5}},
    ]},
    {id:"street12",title:"The Street Naming",sub:"2040 -- Legacy",body:"The city of New York is naming a block of 135th Street after the Johnson family. The ceremony is next week. Every living family member will be there. The community will be watching.",choices:[
      {label:"Attend. Speak from the heart. No notes.",tag:"p",effects:{rep:25,fCommunity:25,fPolitical:15,flag:"streetNamed"}},
      {label:"Attend. Read the prepared remarks.",tag:"c",effects:{rep:12,fCommunity:10}},
      {label:"Send someone else. You have nothing left to prove.",tag:"a",effects:{rep:5}},
    ]},
  ],
  rival:[
    {id:"rival_border",title:"Border Dispute",sub:"Rival -- Conflict",body:"Your rival's runners have been crossing into your territory. Two blocks, three days running. Your men are waiting for orders.",choices:[
      {label:"Flood the zone. Hold it visibly.",tag:"a",effects:{heat:8,dirty:-500}},
      {label:"Send a message through a mutual contact.",tag:"c",effects:{}},
      {label:"Let them have the border. Pick your battles.",tag:"p",effects:{rep:-3}},
    ]},
    {id:"rival_truce",title:"Rival Seeks a Truce",sub:"Rival -- Diplomacy",body:"Word comes through a middleman: your rival wants to draw borders. A formal truce. Defined territory for both sides.",choices:[
      {label:"Accept. Peace benefits both sides.",tag:"p",effects:{fCommunity:5,heat:-8}},
      {label:"Counter with a demand for two more blocks.",tag:"c",effects:{heat:4}},
      {label:"Decline. No deals with rivals.",tag:"a",effects:{heat:10}},
    ]},
    {id:"rival_raid",title:"Rival Got Raided",sub:"Rival -- Opportunity",body:"Police just hit your rival's main operation. Their runners are scattered, their counting house is dark. This is a window.",choices:[
      {label:"Move immediately into their exposed territory.",tag:"a",effects:{heat:15,dirty:-400}},
      {label:"Recruit their scattered runners.",tag:"c",effects:{workers:3,fCommunity:4}},
      {label:"Stay back. Let the heat settle.",tag:"p",effects:{heat:-6}},
    ]},
    {id:"rival_spy",title:"A Runner Playing Both Sides",sub:"Rival -- Betrayal",body:"One of your runners has been feeding information to the rival operation. Routes, timing, bank locations. You caught him carrying two sets of slips.",choices:[
      {label:"Make an example. The block will hear about it.",tag:"a",effects:{heat:12,fCommunity:-6}},
      {label:"Fire him quietly. Change all the routes.",tag:"c",effects:{clean:-200,heat:-4}},
      {label:"Turn him. Feed false information back.",tag:"p",effects:{heat:-6,dirty:300}},
    ]},
  ],
};

// ── COLORS ────────────────────────────────────────────────
let C={bg:"#080503",surface:"#0f0c08",card:"#141008",border:"rgba(201,168,76,.12)",gold:"#c9a84c",goldDim:"rgba(201,168,76,.5)",goldGlow:"rgba(201,168,76,.15)",text:"#d4c5a0",muted:"#7a6f58",dirty:"#d4b08a",clean:"#a8cba8",red:"#8b4020",green:"#2d6b3c",cyan:"#5a9ab5"};
function applyTheme(gen){
  const t=ERA_THEMES[gen]||ERA_THEMES[1];
  C.gold=t.accent;C.goldDim=t.accentDim;C.goldGlow=t.accentGlow;C.border=t.border;
}

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}body{background:${C.bg};}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseGold{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 0 12px 2px rgba(201,168,76,.15)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes notifIn{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes milestoneIn{0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}`;

// ── MATH ──────────────────────────────────────────────────
function calcBulkCost(b,e,c,q){let t=0;for(let i=0;i<q;i++)t+=Math.floor(b*Math.pow(e,c+i));return t;}
function getAssets(gen){return ERA_ASSETS[gen]||ERA_ASSETS[1];}
function allAssets(gen){const a=getAssets(gen);return[...(a.fronts||[]),...(a.realty||[]),...(a.vehicles||[]),...(a.storage||[])];}
function getOps(gen){return ERA_OPS[gen]||ERA_OPS[1];}

function calcIncome(G){
  const ops=getOps(G.gen);let base=0;
  ops.primary.forEach(p=>{const cnt=G[p.key]||0,lvl=G[p.upgKey]||0;base+=cnt*p.baseRate*(1+lvl*0.4);});
  allAssets(G.gen).forEach(a=>{if(G[a.key]>0)base+=G[a.key]*(a.passive||0);});
  let tm=1;G.territories.forEach(id=>{const z=ZONES[id];if(z&&z.bType==="income")tm+=(z.mult-1);});
  const hp=G.heat>60?1-(G.heat-60)*0.01:1;
  let mult=ERAS[G.gen-1]?.incomeBase||1;
  if(G.heir?.incomeMult)mult*=G.heir.incomeMult;
  // Government contract income
  let govInc=0;
  if(G.activeGovContracts)G.activeGovContracts.forEach(id=>{const c=GOV_CONTRACTS.find(x=>x.id===id);if(c)govInc+=c.revenue;});
  // Black budget income
  let bbInc=0;
  if(G.blackBudgetPrograms)G.blackBudgetPrograms.forEach(id=>{const p=BLACK_BUDGET.find(x=>x.id===id);if(p)bbInc+=p.income;});
  // PROMETHEUS: all income +25%
  let bbMult=1;
  if(G.blackBudgetPrograms&&G.blackBudgetPrograms.includes("prometheus"))bbMult=1.25;
  // Investment income
  let invInc=0;
  if(G.spentInvestments){
    if(G.spentInvestments.includes("defenseContract"))invInc+=5000;
    if(G.spentInvestments.includes("heritageTower"))invInc+=800;
  }
  return Math.max(0,(base*mult*tm*hp)*bbMult+govInc+bbInc+invInc);
}
function calcHeatRate(G){
  const ops=getOps(G.gen);let h=0;
  ops.primary.forEach(p=>{h+=(G[p.key]||0)*p.heatPer;});
  h*=(1-(G.bankLvl||0)*0.18);
  allAssets(G.gen).forEach(a=>{if(G[a.key]>0&&a.heat)h+=G[a.key]*a.heat;});
  let hm=ERAS[G.gen-1]?.heatBase||1;
  G.territories.forEach(id=>{const z=ZONES[id];if(z&&z.bType==="heat")hm*=z.mult;});
  if(G.heir?.heatMult)hm*=G.heir.heatMult;
  // PRISM: heat rate -40%
  if(G.blackBudgetPrograms&&G.blackBudgetPrograms.includes("prism"))hm*=0.6;
  return Math.max(0,h*hm);
}
function calcLaunderCap(G){
  let c=150;
  allAssets(G.gen).forEach(a=>{if(G[a.key]>0&&a.launder)c+=G[a.key]*a.launder;});
  G.territories.forEach(id=>{const z=ZONES[id];if(z&&z.bType==="launder")c=Math.floor(c*z.mult);});
  if(G.heir?.launderMult)c=Math.floor(c*G.heir.launderMult);
  // QUANTUM: launder cap doubled
  if(G.blackBudgetPrograms&&G.blackBudgetPrograms.includes("quantum"))c*=2;
  return c;
}
function fmt(n){if(n>=1e9)return"$"+(n/1e9).toFixed(2)+"B";if(n>=1e6)return"$"+(n/1e6).toFixed(1)+"M";if(n>=1e3)return"$"+(n/1e3).toFixed(1)+"K";return"$"+Math.floor(n);}
function cap(v,mn=0,mx=100){return Math.min(mx,Math.max(mn,v));}
function heatColor(h){if(h<20)return"#2d6b3c";if(h<40)return"#6b8b2d";if(h<60)return"#8b7020";if(h<80)return"#8b4020";return"#8b2020";}
function heatLabel(h){if(h<20)return"COLD";if(h<40)return"WARM";if(h<60)return"HOT";if(h<80)return"BURNING";return"INFERNO";}

// ── DEFAULT STATE ─────────────────────────────────────────
function defaultState(){
  return {
    gen:1,day:1,tick:0,dirty:800,clean:300,totalEarned:0,
    workers:1,workerLvl:0,banks:0,bankLvl:0,poker:0,pokerLvl:0,
    casino:0,casinoLvl:0,records:0,recordsLvl:0,sports:0,sportsLvl:0,loans:0,loansLvl:0,
    media:0,mediaLvl:0,holding:0,holdingLvl:0,checkcash:0,checkcashLvl:0,
    jazzClubs:0,barbershops:0,funeralHomes:0,socialClubs:0,recordLabels:0,restaurants:0,
    supperClubs:0,nightclubs:0,checkCashing:0,investFirm:0,lawFirm:0,
    tenements:0,commercial:0,luxury:0,officeBlocks:0,hotels:0,development:0,
    runnerCars:0,deliveryVans:0,cadillacs:0,limousines:0,corporate:0,
    stashHouses:0,warehouses:0,safeHouses:0,offshoreAcc:0,shells:0,trusts:0,
    heat:5,rep:32,territories:[0],
    factions:{community:{trust:60,respect:50},italian:{trust:25,respect:20},police:{trust:18,respect:10},political:{trust:35,respect:30}},
    heir:{name:"Marcus Johnson",title:"The Founder",icon:"\u{1F464}",type:"founder",traits:["Street Smart","Visionary","Patient"],incomeMult:1,heatMult:1,launderMult:1},
    opLog:[],fLog:[],flags:{},usedEvents:[],nextEvent:50,buyQty:1,modalActive:false,
    legacy:{communityInvestments:0,bribesTotal:0,raidsTotal:0,totalWealthAllGens:0,totalRepAllGens:0,peakZones:0,heirTypes:[]},
    dynastyHistory:[],
    // Government
    gov:{cia:{rel:0},dod:{rel:0},congress:{rel:0},state:{rel:0},nasa:{rel:0},fed:{rel:0},hud:{rel:0},dhs:{rel:0}},
    activeGovContracts:[],
    exposure:0, // federal exposure (0-100)
    spentInvestments:[],blackBudgetActive:false,blackBudgetPrograms:[],blackBudgetDepth:0,
    triggeredMilestones:[],triggeredChains:[],
    // Rival
    rival:{active:false,name:"",shortName:"",personality:"",icon:"",zones:[],wealth:0,rep:20,income:8,stance:"watching",lastAction:"",nextMove:60,truce:0,relationship:0,leaderName:"",leaderTitle:"",leaderTrait:""},
  };
}

// ── APPLY EFFECTS ─────────────────────────────────────────
function applyEffects(G,fx){
  if(!fx)return true;
  if(fx.clean&&fx.clean<0&&G.clean<Math.abs(fx.clean))return false;
  if(fx.dirty){if(fx.dirty<0)G.dirty=Math.max(0,G.dirty+fx.dirty);else G.dirty+=fx.dirty;}
  if(fx.clean){G.clean+=fx.clean;}
  if(fx.heat)G.heat=cap(G.heat+fx.heat,0,100);
  if(fx.rep)G.rep=cap(G.rep+fx.rep);
  if(fx.workers)G.workers=(G.workers||0)+fx.workers;
  if(fx.fCommunity)G.factions.community.trust=cap(G.factions.community.trust+fx.fCommunity);
  if(fx.fItalian)G.factions.italian.trust=cap(G.factions.italian.trust+fx.fItalian);
  if(fx.fPolice)G.factions.police.trust=cap(G.factions.police.trust+fx.fPolice);
  if(fx.fPolitical)G.factions.political.trust=cap(G.factions.political.trust+fx.fPolitical);
  if(fx.flag)G.flags[fx.flag]=true;
  return true;
}

// ── SHARED UI ─────────────────────────────────────────────
const se={fontFamily:"'Special Elite',cursive"};const cr={fontFamily:"'Crimson Pro',serif"};
function Notif({msg,onDone}){useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);return <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:C.card,border:`1px solid ${C.border}`,padding:"10px 20px",...se,fontSize:".7rem",color:C.gold,letterSpacing:"1px",zIndex:200,animation:"notifIn .3s ease",whiteSpace:"nowrap"}}>{msg}</div>;}

function MilestoneFlash({icon,title,sub,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:180,pointerEvents:"none",background:"radial-gradient(circle at center, rgba(201,168,76,.1), transparent 60%)",animation:"fadeIn .4s ease"}}>
    <div style={{textAlign:"center",animation:"milestoneIn .6s cubic-bezier(.2,1.2,.3,1)"}}>
      <div style={{fontSize:"3.5rem",marginBottom:10,filter:"drop-shadow(0 0 20px rgba(201,168,76,.5))"}}>{icon}</div>
      <div style={{...se,fontSize:".48rem",letterSpacing:"5px",textTransform:"uppercase",color:C.gold,opacity:.7,marginBottom:6}}>{sub}</div>
      <div style={{...se,fontSize:"1.2rem",color:C.gold,letterSpacing:"3px",textTransform:"uppercase"}}>{title}</div>
    </div>
  </div>;
}
function ST({text}){return <div style={{...se,fontSize:".5rem",letterSpacing:"3px",textTransform:"uppercase",color:C.gold,marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>{text}</div>;}

function StatsBar({G:g,onSave}){
  const era=ERAS[g.gen-1]||ERAS[0];const inc=calcIncome(g);const h=Math.floor(g.heat);
  return(
    <div style={{padding:"12px 14px 8px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{...se,fontSize:".48rem",letterSpacing:"3px",textTransform:"uppercase",color:C.muted}}>
          Gen {toRoman(g.gen)} &middot; {era.year} &middot; Day {g.day}
        </div>
        <button onClick={onSave} style={{background:"transparent",border:`1px solid ${C.border}`,padding:"3px 10px",...se,fontSize:".36rem",color:C.muted,letterSpacing:"1px",cursor:"pointer"}}>SAVE</button>
      </div>
      {/* Heir bar */}
      <div style={{textAlign:"center",marginBottom:8}}>
        <span style={{...se,fontSize:".44rem",color:C.gold,letterSpacing:"1px"}}>{g.heir.icon} {g.heir.name} &mdash; {g.heir.title}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <SC label="Dirty Cash" value={fmt(g.dirty)} sub={`+${fmt(inc)}/sec`} color={C.dirty}/>
        <SC label="Clean Cash" value={fmt(g.clean)} sub="spendable" color={C.clean}/>
        <SC label="Rep" value={Math.floor(g.rep)} sub={g.rep>=80?"Legendary":g.rep>=50?"Respected":"Building"} color={C.gold}/>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{...se,fontSize:".46rem",letterSpacing:"2px",color:C.muted,textTransform:"uppercase"}}>Heat</span>
          <span style={{...se,fontSize:".46rem",color:heatColor(h)}}>{heatLabel(h)} &middot; {h}%</span>
        </div>
        <div style={{height:6,background:"rgba(201,168,76,.06)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${h}%`,background:heatColor(h),borderRadius:3,transition:"width .5s,background .5s"}}/>
        </div>
      </div>
      {/* Exposure bar - shows from gen 6+ */}
      {g.gen>=6&&g.exposure>0&&(
        <div style={{marginTop:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{...se,fontSize:".42rem",letterSpacing:"2px",color:C.muted,textTransform:"uppercase"}}>Fed Exposure</span>
            <span style={{...se,fontSize:".42rem",color:g.exposure>60?"#c07070":g.exposure>30?C.gold:C.green}}>{Math.floor(g.exposure)}%</span>
          </div>
          <div style={{height:4,background:"rgba(201,168,76,.06)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${g.exposure}%`,background:g.exposure>60?"#c07070":g.exposure>30?C.gold:C.green,borderRadius:2,transition:"width .5s"}}/>
          </div>
        </div>
      )}
      {/* Rival bar */}
      {g.rival.active&&(
        <div style={{marginTop:8,padding:"6px 8px",background:"rgba(192,112,112,.06)",border:"1px solid rgba(192,112,112,.15)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{...se,fontSize:".44rem",color:"#c07070",letterSpacing:"1px"}}>{g.rival.icon} {g.rival.leaderName||g.rival.shortName}</span>
            <span style={{...se,fontSize:".38rem",color:C.muted}}>{g.rival.zones.length} zones</span>
          </div>
          <div style={{...cr,fontSize:".46rem",color:C.muted,fontStyle:"italic",marginTop:2}}>{g.rival.lastAction||g.rival.stance}</div>
        </div>
      )}
      {/* Retire hint */}
      {g.day>=80&&g.gen<=12&&(
        <div style={{textAlign:"center",marginTop:8}}>
          <span style={{...se,fontSize:".42rem",color:C.cyan,letterSpacing:"2px",animation:"pulseGold 3s ease infinite"}}>RETIREMENT AVAILABLE</span>
        </div>
      )}
    </div>
  );
}
function SC({label,value,sub,color}){return <div style={{background:C.card,border:`1px solid ${C.border}`,borderBottom:`2px solid ${color}33`,padding:"8px 8px 6px",textAlign:"center"}}><div style={{...se,fontSize:".4rem",letterSpacing:"2px",textTransform:"uppercase",color:C.muted,marginBottom:2}}>{label}</div><div style={{...cr,fontSize:"1.05rem",fontWeight:600,color,lineHeight:1.1}}>{value}</div><div style={{...cr,fontSize:".5rem",color:C.muted,fontStyle:"italic",marginTop:2}}>{sub}</div></div>;}

function OpBtn({icon,name,desc,cost,canAfford,onClick,accent}){
  return <button onClick={onClick} style={{display:"flex",alignItems:"flex-start",gap:10,width:"100%",background:canAfford?"rgba(201,168,76,.03)":"rgba(60,50,30,.02)",border:`1px solid ${canAfford?C.border:"rgba(100,80,50,.08)"}`,padding:"10px 12px",marginBottom:6,cursor:canAfford?"pointer":"default",opacity:canAfford?1:.45,textAlign:"left",minHeight:48}}>
    <span style={{fontSize:"1rem",lineHeight:1,flexShrink:0,marginTop:2}}>{icon}</span>
    <div style={{flex:1,minWidth:0}}><div style={{...se,fontSize:".56rem",color:accent||C.text,letterSpacing:"1px",marginBottom:2}}>{name}</div><div style={{...cr,fontSize:".54rem",color:C.muted,lineHeight:1.3}}>{desc}</div></div>
    <div style={{...se,fontSize:".48rem",color:canAfford?C.gold:C.muted,whiteSpace:"nowrap",letterSpacing:"1px",flexShrink:0,marginTop:3}}>{cost}</div>
  </button>;
}
function ToolBtn({label,sub,onClick}){return <button onClick={onClick} style={{width:"100%",background:"rgba(201,168,76,.04)",border:`1px solid ${C.border}`,padding:"10px 14px",cursor:"pointer",textAlign:"left",minHeight:48,marginBottom:6}}><div style={{...se,fontSize:".56rem",color:C.gold,letterSpacing:"1px",marginBottom:2}}>{label}</div><div style={{...cr,fontSize:".5rem",color:C.muted}}>{sub}</div></button>;}

// ── TAB: OPS ──────────────────────────────────────────────
function OpsTab({G:g,onBuyOp,onBuyUpg,onLaunder,onBribe,onCommunity,onSetQty,onRetire,onInvest}){
  const ops=getOps(g.gen);
  const availInvest=INVESTMENTS.filter(inv=>inv.minGen<=g.gen&&!g.spentInvestments.includes(inv.id)&&g.totalEarned>=inv.minWealth);
  return <div style={{padding:"10px 14px"}}>
    <ST text={ops.label}/><div style={{...cr,fontSize:".68rem",color:C.muted,fontStyle:"italic",marginBottom:12,lineHeight:1.4}}>{ops.flavor}</div>
    <div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center"}}>
      {[1,5,10,25].map(q=><button key={q} onClick={()=>onSetQty(q)} style={{background:g.buyQty===q?C.goldGlow:"transparent",border:`1px solid ${g.buyQty===q?C.gold:C.border}`,color:g.buyQty===q?C.gold:C.muted,...se,fontSize:".5rem",padding:"5px 12px",cursor:"pointer",letterSpacing:"1px",minWidth:44,minHeight:36}}>x{q}</button>)}
    </div>
    {ops.primary.map(p=>{const cnt=g[p.key]||0,cost=calcBulkCost(p.costBase,p.costExp,cnt,g.buyQty);return <OpBtn key={p.key} icon={p.icon} name={`${p.name} (x${cnt})`} desc={p.desc} cost={fmt(cost)} canAfford={(g.dirty+g.clean)>=cost} onClick={()=>onBuyOp(p.key,p.costBase,p.costExp)}/>;})}
    <ST text="Upgrades"/>
    {ops.upgrades.map(u=>{const lvl=g[u.key]||0,cost=Math.floor(u.costBase*Math.pow(u.costExp,lvl));return <OpBtn key={u.key} icon={"\u2B06"} name={`${u.name} (Lv.${lvl})`} desc={u.desc} cost={fmt(cost)} canAfford={g.clean>=cost} onClick={()=>onBuyUpg(u.key,u.costBase,u.costExp)} accent="#9bc"/>;})}
    <ST text="Tools"/>
    <ToolBtn label="Launder Cash" sub={`Cap: ${fmt(calcLaunderCap(g))} | 15% fee`} onClick={onLaunder}/>
    <ToolBtn label="Bribe the Precinct" sub={`Cost: ${fmt(Math.floor(280*(1+g.heat/120)))} clean | -25 heat`} onClick={onBribe}/>
    <ToolBtn label="Community Fund" sub="$200 clean | -10 heat, +5 rep" onClick={onCommunity}/>
    {/* Strategic Investments */}
    {(availInvest.length>0||g.spentInvestments.length>0)&&<><ST text="Strategic Investments"/>
      {g.spentInvestments.length>0&&<div style={{marginBottom:8}}>{g.spentInvestments.map(id=>{const inv=INVESTMENTS.find(x=>x.id===id);return inv?<div key={id} style={{...cr,fontSize:".5rem",color:C.green,padding:"3px 0"}}>{inv.icon} {inv.name} - ACQUIRED</div>:null;})}</div>}
      {availInvest.map(inv=> <button key={inv.id} onClick={()=>onInvest(inv)} style={{width:"100%",background:"rgba(201,168,76,.04)",border:`1px solid ${C.border}`,padding:"10px 14px",cursor:"pointer",textAlign:"left",minHeight:52,marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{...se,fontSize:".56rem",color:C.gold,letterSpacing:"1px"}}>{inv.icon} {inv.name}</span>
          <span style={{...se,fontSize:".48rem",color:C.gold}}>{fmt(inv.cost)}</span>
        </div>
        <div style={{...cr,fontSize:".5rem",color:C.muted,lineHeight:1.3}}>{inv.desc}</div>
        {inv.requireGov&&<div style={{...se,fontSize:".38rem",color:C.cyan,marginTop:3}}>Requires: {Object.entries(inv.requireGov).map(([a,v])=>`${GOV_AGENCIES[a]?.name} ${v}+`).join(", ")}</div>}
      </button>)}
    </>}
    {g.day>=80&&g.gen<=12&&(<><ST text="Dynasty"/><button onClick={onRetire} style={{width:"100%",background:"rgba(90,154,181,.08)",border:`1px solid ${C.cyan}`,padding:"14px",cursor:"pointer",minHeight:52,...se,fontSize:".6rem",color:C.cyan,letterSpacing:"2px",textTransform:"uppercase"}}>Retire &mdash; Pass the Torch</button></>)}
  </div>;
}

// ── TAB: ASSETS ───────────────────────────────────────────
function AssetsTab({G:g,onBuyAsset}){
  const assets=getAssets(g.gen);
  return <div style={{padding:"10px 14px"}}><ST text="Assets and Fronts"/><div style={{...cr,fontSize:".63rem",color:C.muted,fontStyle:"italic",marginBottom:12}}>Clean cash only.</div>
    {ASSET_CATS.map(cat=>{const items=assets[cat.id];if(!items||!items.length)return null;return <div key={cat.id} style={{marginBottom:14}}><div style={{...se,fontSize:".44rem",letterSpacing:"2px",textTransform:"uppercase",color:C.muted,marginBottom:6}}>{cat.icon} {cat.label}</div>
      {items.map(a=>{const cnt=g[a.key]||0,tc=a.cost*g.buyQty;return <OpBtn key={a.key} icon={ASSET_ICONS[a.key]||cat.icon} name={`${a.name} (x${cnt})`} desc={a.desc} cost={fmt(tc)} canAfford={g.clean>=tc} onClick={()=>onBuyAsset(a.key)} accent={C.clean}/>;})}</div>;})}
  </div>;
}

// ── TAB: TERRITORY ────────────────────────────────────────
function TurfTab({G:g,onExpand}){
  const vis=ZONES.filter(z=>z.minGen<=g.gen);let lastArea="";
  return <div style={{padding:"10px 14px"}}><ST text={`Territory (${g.territories.length}/${vis.length})`}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {vis.map(z=>{
        const owned=g.territories.includes(z.id);const rivalOwned=g.rival.active&&g.rival.zones.includes(z.id);
        const bc=z.bType==="income"?C.gold:z.bType==="heat"?"#5a8a6a":z.bType==="launder"?"#7a9abc":C.muted;
        const isNewArea=z.area!==lastArea;lastArea=z.area;
        return <div key={z.id} style={{gridColumn:isNewArea&&z.id>0?"1/-1":undefined}}>
          {isNewArea&&z.id>0&&<div style={{...se,fontSize:".44rem",letterSpacing:"3px",textTransform:"uppercase",color:C.muted,marginBottom:6,marginTop:8}}>{z.area}</div>}
          <div style={{background:owned?"rgba(201,168,76,.06)":rivalOwned?"rgba(192,112,112,.04)":C.card,border:`1px solid ${owned?"rgba(201,168,76,.25)":rivalOwned?"rgba(192,112,112,.15)":C.border}`,padding:10,position:"relative"}}>
            {owned&&<div style={{position:"absolute",top:4,right:6,...se,fontSize:".36rem",color:C.gold,letterSpacing:"1px"}}>YOURS</div>}
            {rivalOwned&&<div style={{position:"absolute",top:4,right:6,...se,fontSize:".36rem",color:"#c07070",letterSpacing:"1px"}}>{g.rival.shortName.toUpperCase()}</div>}
            <div style={{...se,fontSize:".56rem",color:owned?C.gold:C.text,letterSpacing:"1px",marginBottom:3}}>{z.name}</div>
            <div style={{...cr,fontSize:".48rem",color:bc,marginBottom:6}}>{z.bonus}</div>
            {!owned&&!rivalOwned&&<div style={{display:"flex",gap:4}}>
              {ZONE_METHODS.map(m=>{const cost=Math.floor(z.cost*m.costMult);const af=(g.dirty+g.clean)>=cost;return <button key={m.id} onClick={()=>af&&onExpand(z.id,m.id)} style={{flex:1,background:af?"rgba(201,168,76,.05)":"transparent",border:`1px solid ${af?C.border:"rgba(80,60,40,.1)"}`,padding:"4px 2px",cursor:af?"pointer":"default",opacity:af?1:.35,minHeight:36}}><div style={{...se,fontSize:".36rem",color:C.gold,letterSpacing:"1px"}}>{m.label}</div><div style={{...cr,fontSize:".4rem",color:C.muted}}>{fmt(cost)}</div></button>;})}
            </div>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ── TAB: FACTIONS ─────────────────────────────────────────
function FactionTab({G:g}){
  return <div style={{padding:"10px 14px"}}><ST text="Factions"/>
    {Object.entries(FACTION_DEFS).map(([k,d])=>{const f=g.factions[k];if(!f)return null;return <div key={k} style={{background:C.card,border:`1px solid ${C.border}`,padding:12,marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:"1.1rem"}}>{d.icon}</span><div><div style={{...se,fontSize:".58rem",color:d.color,letterSpacing:"1px"}}>{d.name}</div><div style={{...cr,fontSize:".5rem",color:C.muted,fontStyle:"italic"}}>{d.desc}</div></div></div>
      {["trust","respect"].map(stat=><div key={stat} style={{marginBottom:3}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{...se,fontSize:".38rem",color:C.muted,letterSpacing:"1px",textTransform:"uppercase"}}>{stat}</span><span style={{...se,fontSize:".38rem",color:d.color}}>{Math.floor(f[stat])}</span></div><div style={{height:4,background:"rgba(201,168,76,.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${f[stat]}%`,background:d.color,opacity:stat==="respect"?.6:1,borderRadius:2,transition:"width .4s"}}/></div></div>)}
    </div>;})}
    {g.fLog.length>0&&<><ST text="Faction Ledger"/><div style={{maxHeight:160,overflowY:"auto"}}>{g.fLog.map((e,i)=><div key={i} style={{...cr,fontSize:".62rem",color:e.type==="g"?C.clean:e.type==="b"?"#c07070":C.text,padding:"3px 0",borderBottom:`1px solid ${C.border}`,opacity:Math.max(.3,1-i*.08),lineHeight:1.3}}><span style={{...se,fontSize:".38rem",color:C.muted,marginRight:6}}>D{e.day}</span>{e.txt}</div>)}</div></>}
  </div>;
}

// ── TAB: GOVERNMENT ───────────────────────────────────────
function GovTab({G:g,onContract,onBB}){
  const unlocked=Object.entries(GOV_AGENCIES).filter(([k,a])=>a.unlockGen<=g.gen);
  if(unlocked.length===0) return <div style={{padding:"10px 14px"}}><ST text="Government"/><div style={{...cr,fontSize:".68rem",color:C.muted,fontStyle:"italic",lineHeight:1.5}}>Government relationships unlock in Generation VI. Build your empire first.</div></div>;
  return <div style={{padding:"10px 14px"}}>
    <ST text="Government Relationships"/>
    {/* Exposure meter */}
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{...se,fontSize:".44rem",letterSpacing:"2px",color:C.muted,textTransform:"uppercase"}}>Federal Exposure</span>
        <span style={{...se,fontSize:".44rem",color:g.exposure>60?"#c07070":g.exposure>30?C.gold:C.green}}>{Math.floor(g.exposure)}%</span>
      </div>
      <div style={{height:5,background:"rgba(201,168,76,.06)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${g.exposure}%`,background:g.exposure>60?"#c07070":g.exposure>30?C.gold:C.green,borderRadius:3,transition:"width .5s"}}/>
      </div>
      <div style={{...cr,fontSize:".48rem",color:C.muted,fontStyle:"italic",marginTop:3}}>
        {g.exposure<15?"Below the radar.":g.exposure<35?"Federal agencies are aware of you.":g.exposure<60?"Active monitoring. Handle with care.":g.exposure<80?"Under investigation. Every move is watched.":"Full federal scrutiny. Crisis territory."}
      </div>
    </div>
    {/* Agencies */}
    {unlocked.map(([key,ag])=>{
      const rel=g.gov[key]?.rel||0;
      const contracts=GOV_CONTRACTS.filter(c=>c.agency===key);
      const active=contracts.filter(c=>g.activeGovContracts.includes(c.id));
      const avail=contracts.filter(c=>!g.activeGovContracts.includes(c.id)&&rel>=c.relReq);
      return <div key={key} style={{background:C.card,border:`1px solid ${C.border}`,padding:12,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:"1.1rem"}}>{ag.icon}</span>
          <div style={{flex:1}}>
            <div style={{...se,fontSize:".56rem",color:ag.color,letterSpacing:"1px"}}>{ag.name}</div>
            <div style={{...cr,fontSize:".48rem",color:C.muted,fontStyle:"italic"}}>{ag.desc}</div>
          </div>
          <span style={{...se,fontSize:".44rem",color:ag.color}}>{Math.floor(rel)}</span>
        </div>
        <div style={{height:4,background:"rgba(201,168,76,.06)",borderRadius:2,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${rel}%`,background:ag.color,borderRadius:2,transition:"width .4s"}}/>
        </div>
        {/* Active contracts */}
        {active.map(c=> <div key={c.id} style={{...cr,fontSize:".5rem",color:C.clean,padding:"3px 0",borderBottom:`1px solid ${C.border}`}}>
          \u2713 {c.name} &middot; +{fmt(c.revenue)}/tick
        </div>)}
        {/* Available contracts */}
        {avail.map(c=> <button key={c.id} onClick={()=>onContract(c)} style={{width:"100%",background:"rgba(201,168,76,.03)",border:`1px solid ${C.border}`,padding:"8px 10px",marginTop:4,cursor:"pointer",textAlign:"left",minHeight:44}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{...se,fontSize:".5rem",color:C.text,letterSpacing:"1px"}}>{c.name}</span>
            <span style={{...se,fontSize:".44rem",color:C.gold}}>+{fmt(c.revenue)}/tick</span>
          </div>
          <div style={{...cr,fontSize:".46rem",color:C.muted,marginTop:2}}>{c.desc}</div>
          {c.cost>0&&<div style={{...se,fontSize:".4rem",color:C.muted,marginTop:2}}>Cost: {fmt(c.cost)} clean</div>}
        </button>)}
        {avail.length===0&&active.length===0&&<div style={{...cr,fontSize:".46rem",color:C.muted,fontStyle:"italic"}}>Relationship {rel<10?"too low":"building"}. Need {contracts[0]?.relReq||10}+.</div>}
      </div>;
    })}
    {/* Gov income summary */}
    {g.activeGovContracts.length>0&&<div style={{...se,fontSize:".44rem",color:C.gold,letterSpacing:"1px",textAlign:"center",marginTop:8}}>
      Gov Income: +{fmt(g.activeGovContracts.reduce((s,id)=>{const c=GOV_CONTRACTS.find(x=>x.id===id);return s+(c?c.revenue:0);},0))}/tick
    </div>}
    {/* Black Budget */}
    {g.blackBudgetActive&&<>
      <div style={{marginTop:14,padding:"10px 0 4px",borderTop:`1px solid rgba(192,60,60,.2)`}}>
        <ST text={`Black Budget (Depth: ${g.blackBudgetDepth})`}/>
        <div style={{...cr,fontSize:".54rem",color:"#c07070",fontStyle:"italic",marginBottom:10,lineHeight:1.4}}>
          Classified programs. Massive income. Massive exposure. Every program deepens the entanglement.
        </div>
      </div>
      {g.blackBudgetPrograms.length>0&&<div style={{marginBottom:8}}>{g.blackBudgetPrograms.map(id=>{const p=BLACK_BUDGET.find(x=>x.id===id);return p?<div key={id} style={{...cr,fontSize:".5rem",color:"#c07070",padding:"3px 0"}}>{"\u2B1B"} {p.name} - ACTIVE (+{fmt(p.income)}/tick)</div>:null;})}</div>}
      {BLACK_BUDGET.filter(p=>!g.blackBudgetPrograms.includes(p.id)).map(prog=>{
        const canBuy=g.clean>=prog.cost&&(!prog.reqTier||BLACK_BUDGET.filter(p=>p.tier<prog.tier&&g.blackBudgetPrograms.includes(p.id)).length>0);
        return <button key={prog.id} onClick={()=>canBuy&&onBB(prog)} style={{width:"100%",background:canBuy?"rgba(192,60,60,.06)":"rgba(40,20,20,.03)",border:`1px solid ${canBuy?"rgba(192,60,60,.2)":"rgba(80,40,40,.1)"}`,padding:"10px 14px",cursor:canBuy?"pointer":"default",opacity:canBuy?1:.4,textAlign:"left",minHeight:48,marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <span style={{...se,fontSize:".52rem",color:"#c07070",letterSpacing:"1px"}}>{"\u2B1B"} {prog.name} (T{prog.tier})</span>
            <span style={{...se,fontSize:".44rem",color:"#c07070"}}>{fmt(prog.cost)}</span>
          </div>
          <div style={{...cr,fontSize:".48rem",color:C.muted,lineHeight:1.3}}>{prog.desc}</div>
          <div style={{...se,fontSize:".38rem",color:C.muted,marginTop:3}}>+{fmt(prog.income)}/tick | Exposure +{prog.exposure}</div>
        </button>;
      })}
    </>}
  </div>;
}

// ── TAB: FAMILY ───────────────────────────────────────────
function FamilyTab({G:g}){
  const heir=g.heir;
  return <div style={{padding:"10px 14px"}}>
    {/* Current Heir */}
    <ST text="Current Heir"/>
    <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"18px 16px",textAlign:"center",marginBottom:14}}>
      <div style={{fontSize:"2.5rem",marginBottom:6}}>{heir.icon}</div>
      <div style={{...se,fontSize:"1rem",color:C.gold,letterSpacing:"2px",marginBottom:3}}>{heir.name}</div>
      <div style={{...cr,fontSize:".68rem",color:C.muted,fontStyle:"italic",marginBottom:10}}>{heir.title} &middot; Generation {toRoman(g.gen)}</div>
      {heir.traits&&<div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",marginBottom:10}}>
        {heir.traits.map((t,i)=><span key={i} style={{...se,fontSize:".4rem",color:C.gold,letterSpacing:"1px",padding:"3px 8px",border:`1px solid ${C.border}`,background:"rgba(201,168,76,.04)"}}>{t}</span>)}
      </div>}
      {heir.bonus&&<div style={{...cr,fontSize:".6rem",color:C.cyan,lineHeight:1.4,fontStyle:"italic"}}>{heir.bonus}</div>}
    </div>
    {/* Generation Stats */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"8px 6px",textAlign:"center"}}>
        <div style={{...cr,fontSize:".88rem",fontWeight:600,color:C.gold}}>{fmt(g.totalEarned)}</div>
        <div style={{...se,fontSize:".34rem",color:C.muted,letterSpacing:"1px",textTransform:"uppercase"}}>This Gen</div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"8px 6px",textAlign:"center"}}>
        <div style={{...cr,fontSize:".88rem",fontWeight:600,color:C.gold}}>{Math.floor(g.rep)}</div>
        <div style={{...se,fontSize:".34rem",color:C.muted,letterSpacing:"1px",textTransform:"uppercase"}}>Rep</div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"8px 6px",textAlign:"center"}}>
        <div style={{...cr,fontSize:".88rem",fontWeight:600,color:C.gold}}>{g.territories.length}</div>
        <div style={{...se,fontSize:".34rem",color:C.muted,letterSpacing:"1px",textTransform:"uppercase"}}>Zones</div>
      </div>
    </div>
    {/* Dynasty Timeline Visual */}
    <ST text="Dynasty Timeline"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:4,marginBottom:14}}>
      {ERAS.map((e,i)=>{
        const hist=g.dynastyHistory.find(h=>h.gen===i+1);
        const current=i+1===g.gen;
        const done=i+1<g.gen;
        const future=i+1>g.gen;
        return <div key={i} style={{
          background:current?"rgba(201,168,76,.12)":done?"rgba(168,203,168,.06)":"rgba(20,16,8,.5)",
          border:`1px solid ${current?C.gold:done?"rgba(168,203,168,.2)":C.border}`,
          padding:"8px 4px",textAlign:"center",opacity:future?0.35:1,minHeight:58,
        }}>
          <div style={{...se,fontSize:".42rem",color:current?C.gold:done?C.clean:C.muted,letterSpacing:"1px",marginBottom:2}}>G{toRoman(i+1)}</div>
          <div style={{...cr,fontSize:".46rem",color:C.muted,marginBottom:2}}>{e.year.slice(0,4)}</div>
          {hist&&<div style={{...cr,fontSize:".4rem",color:C.text,fontStyle:"italic",lineHeight:1.1}}>{hist.name.split(" ")[0]}</div>}
          {current&&<div style={{...cr,fontSize:".4rem",color:C.gold,fontStyle:"italic"}}>Now</div>}
        </div>;
      })}
    </div>
    {/* Dynasty History List */}
    {g.dynastyHistory.length>0&&<>
      <ST text="Past Generations"/>
      {g.dynastyHistory.map((h,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,padding:"10px 12px",marginBottom:5}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{...se,fontSize:".52rem",color:C.gold,letterSpacing:"1px"}}>Gen {toRoman(h.gen)} &middot; {h.year}</span>
          <span style={{...se,fontSize:".4rem",color:C.muted}}>{h.days} days</span>
        </div>
        <div style={{...se,fontSize:".56rem",color:C.text,marginBottom:2}}>{h.name}</div>
        <div style={{...cr,fontSize:".5rem",color:C.muted,fontStyle:"italic",marginBottom:3}}>{h.title}</div>
        <div style={{...cr,fontSize:".5rem",color:C.muted}}>{fmt(h.wealth)} earned &middot; {h.rep} rep &middot; {h.zones} zones</div>
      </div>)}
    </>}
  </div>;
}

// ── TAB: LOG ──────────────────────────────────────────────
function LogTab({G:g}){
  return <div style={{padding:"10px 14px"}}><ST text="Operations Log"/>
    {/* Dynasty history */}
    {g.dynastyHistory.length>0&&<><div style={{marginBottom:12}}>{g.dynastyHistory.map((h,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,padding:"8px 10px",marginBottom:4}}><div style={{...se,fontSize:".48rem",color:C.gold,letterSpacing:"1px"}}>Gen {toRoman(h.gen)} &middot; {h.year} &middot; {h.name}</div><div style={{...cr,fontSize:".5rem",color:C.muted}}>{fmt(h.wealth)} earned &middot; {h.rep} rep &middot; {h.zones} zones &middot; {h.days} days</div></div>)}</div><ST text="Current Log"/></>}
    <div style={{maxHeight:300,overflowY:"auto"}}>{g.opLog.length===0&&<div style={{...cr,fontSize:".7rem",color:C.muted,fontStyle:"italic"}}>No operations yet...</div>}
      {g.opLog.map((e,i)=><div key={i} style={{...cr,fontSize:".64rem",color:e.type==="g"?C.clean:e.type==="b"?"#c07070":C.text,padding:"3px 0",borderBottom:`1px solid ${C.border}`,opacity:i===0?1:Math.max(.3,1-i*.06),lineHeight:1.4}}><span style={{...se,fontSize:".38rem",color:C.muted,marginRight:6}}>D{e.day}</span>{e.txt}</div>)}
    </div>
  </div>;
}

// ── EVENT MODAL ───────────────────────────────────────────
const tagC={p:"#6baa6b",c:"#b8a04a",a:"#c07070"};const tagL={p:"patient",c:"calculated",a:"aggressive"};
function EventModal({event:ev,onChoice}){
  const [reaction, setReaction] = useState(null);
  const handleChoice = (ch) => {
    const pool = REACTIONS[ch.tag] || REACTIONS.c;
    const txt = ch.reaction || pool[Math.floor(Math.random() * pool.length)];
    setReaction({ txt, tag: ch.tag });
    setTimeout(() => { setReaction(null); onChoice(ch); }, 2200);
  };
  return <div style={{position:"fixed",inset:0,background:"rgba(8,5,3,.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
    <div style={{maxWidth:380,width:"100%",background:C.card,border:`1px solid ${C.border}`,padding:"20px 18px",animation:"modalIn .3s ease",maxHeight:"85dvh",overflowY:"auto"}}>
      {!reaction ? <>
        <div style={{...se,fontSize:".44rem",letterSpacing:"3px",textTransform:"uppercase",color:C.muted,marginBottom:4}}>{ev.sub}</div>
        <div style={{...se,fontSize:".95rem",color:C.text,marginBottom:10,lineHeight:1.3}}>{ev.title}</div>
        <div style={{...cr,fontSize:".73rem",color:C.muted,lineHeight:1.55,marginBottom:18,fontStyle:"italic"}}>{ev.body}</div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
          {ev.choices.map((ch,i)=> <button key={i} onClick={()=>handleChoice(ch)} style={{width:"100%",background:"rgba(201,168,76,.03)",border:`1px solid ${C.border}`,padding:"12px 14px",cursor:"pointer",textAlign:"left",minHeight:52}}>
            <div style={{...se,fontSize:".4rem",letterSpacing:"2px",textTransform:"uppercase",color:tagC[ch.tag]||C.muted,marginBottom:4}}>{tagL[ch.tag]||ch.tag}</div>
            <div style={{...cr,fontSize:".7rem",color:C.text,lineHeight:1.35}}>{ch.label}</div>
          </button>)}
        </div>
      </> : <div style={{textAlign:"center",padding:"30px 10px",animation:"fadeIn .5s ease"}}>
        <div style={{...cr,fontSize:".8rem",color:reaction.tag==="p"?C.green:reaction.tag==="a"?C.red:C.gold,lineHeight:1.5,fontStyle:"italic"}}>{reaction.txt}</div>
      </div>}
    </div>
  </div>;
}

// ── HEIR SELECTION MODAL ──────────────────────────────────
function HeirModal({gen,onSelect}){
  const pool=HEIR_POOLS[gen];if(!pool)return null;
  const era=ERAS[gen-1];
  return <div style={{position:"fixed",inset:0,background:"rgba(8,5,3,.96)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
    <div style={{maxWidth:400,width:"100%",background:C.card,border:`1px solid ${C.cyan}`,padding:"20px 16px",animation:"modalIn .4s ease",maxHeight:"90dvh",overflowY:"auto"}}>
      <div style={{...se,fontSize:".44rem",letterSpacing:"3px",textTransform:"uppercase",color:C.cyan,marginBottom:4}}>Generation {toRoman(gen)} &mdash; {era?.year}</div>
      <div style={{...se,fontSize:".9rem",color:C.text,marginBottom:6}}>Choose Your Heir</div>
      <div style={{...cr,fontSize:".68rem",color:C.muted,fontStyle:"italic",marginBottom:16,lineHeight:1.4}}>The empire enters {era?.era}. Who carries the Johnson name into {era?.tagline}?</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {pool.map((h,i)=><button key={i} onClick={()=>onSelect(h)} style={{background:"rgba(90,154,181,.04)",border:`1px solid ${C.border}`,padding:"14px",cursor:"pointer",textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:"1.3rem"}}>{h.icon}</span>
            <div><div style={{...se,fontSize:".6rem",color:C.text,letterSpacing:"1px"}}>{h.name}</div><div style={{...se,fontSize:".44rem",color:C.cyan,letterSpacing:"2px"}}>{h.title}</div></div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{h.traits.map((t,j)=><span key={j} style={{...se,fontSize:".36rem",color:C.gold,letterSpacing:"1px",padding:"2px 6px",border:`1px solid ${C.border}`,background:"rgba(201,168,76,.04)"}}>{t}</span>)}</div>
          <div style={{...cr,fontSize:".58rem",color:C.muted,fontStyle:"italic",lineHeight:1.3}}>{h.bonus}</div>
        </button>)}
      </div>
    </div>
  </div>;
}

// ── TRANSITION SCREEN ─────────────────────────────────────
function TransitionScreen({G:g,heir,onContinue}){
  const era=ERAS[g.gen-1];const nextEra=ERAS[g.gen];
  const [phase,setPhase]=useState(0); // 0: year fade, 1: heir reveal, 2: stats + button
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),1800);
    const t2=setTimeout(()=>setPhase(2),3600);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20,overflow:"hidden"}}>
    {/* Phase 0: Year announcement */}
    {phase===0&&<div style={{textAlign:"center",animation:"fadeIn 1s ease"}}>
      <div style={{...se,fontSize:".48rem",letterSpacing:"6px",textTransform:"uppercase",color:C.muted,marginBottom:16}}>The Year Is</div>
      <div style={{...se,fontSize:"3rem",color:C.gold,letterSpacing:"8px",marginBottom:12,animation:"milestoneIn .8s cubic-bezier(.2,1.2,.3,1)"}}>{nextEra?.year||"2040"}</div>
      <div style={{...cr,fontSize:".8rem",color:C.text,fontStyle:"italic",opacity:.7}}>{nextEra?.name}</div>
      <div style={{...cr,fontSize:".6rem",color:C.muted,fontStyle:"italic",marginTop:4}}>{nextEra?.tagline}</div>
    </div>}
    {/* Phase 1: Era flavor */}
    {phase===1&&<div style={{textAlign:"center",maxWidth:380,animation:"fadeIn .8s ease"}}>
      <div style={{fontSize:"2rem",marginBottom:14}}>{heir.icon}</div>
      <div style={{...se,fontSize:".44rem",letterSpacing:"4px",textTransform:"uppercase",color:C.muted,marginBottom:6}}>Generation {toRoman(g.gen+1)} &middot; {nextEra?.year}</div>
      <div style={{...se,fontSize:"1.3rem",color:C.gold,letterSpacing:"2px",marginBottom:4}}>{heir.name}</div>
      <div style={{...cr,fontSize:".72rem",color:C.text,fontStyle:"italic",marginBottom:14,opacity:.8}}>{heir.title}</div>
      <div style={{...cr,fontSize:".68rem",color:C.muted,fontStyle:"italic",lineHeight:1.5,padding:"0 20px"}}>{nextEra?.desc}</div>
    </div>}
    {/* Phase 2: Full summary */}
    {phase===2&&<div style={{maxWidth:380,width:"100%",textAlign:"center",animation:"fadeIn .8s ease"}}>
      <div style={{...se,fontSize:".44rem",letterSpacing:"4px",textTransform:"uppercase",color:C.muted,marginBottom:8}}>Gen {toRoman(g.gen)} &mdash; {era?.year} &mdash; Complete</div>
      <div style={{...se,fontSize:"1.1rem",color:C.text,marginBottom:6}}>{g.heir.name} Steps Down</div>
      <div style={{...cr,fontSize:".7rem",color:C.cyan,fontStyle:"italic",marginBottom:20}}>{heir.name} carries the Johnson name into {nextEra?.year}.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[{l:"Wealth Built",v:fmt(g.totalEarned)},{l:"Reputation",v:Math.floor(g.rep)},{l:"Zones Held",v:g.territories.length},{l:"Days Ruled",v:g.day}].map((s,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,padding:8}}><div style={{...cr,fontSize:"1rem",fontWeight:600,color:C.gold}}>{s.v}</div><div style={{...se,fontSize:".38rem",color:C.muted,letterSpacing:"1px"}}>{s.l}</div></div>)}
      </div>
      <button onClick={onContinue} style={{background:"rgba(90,154,181,.1)",border:`1px solid ${C.cyan}`,padding:"14px 40px",...se,fontSize:".6rem",color:C.cyan,letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",minHeight:52}}>Enter {nextEra?.era||"New Era"}</button>
    </div>}
  </div>;
}

// ── CRISIS MODAL ──────────────────────────────────────────
function CrisisModal({onResolve}){return <div style={{position:"fixed",inset:0,background:"rgba(8,5,3,.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}><div style={{maxWidth:360,width:"100%",background:C.card,border:`1px solid ${C.red}`,padding:24,animation:"slideUp .4s ease"}}><div style={{...se,fontSize:".5rem",letterSpacing:"3px",textTransform:"uppercase",color:C.red,marginBottom:8}}>CRISIS</div><div style={{...se,fontSize:"1rem",color:C.text,marginBottom:12}}>The Precinct Raid</div><div style={{...cr,fontSize:".73rem",color:C.muted,lineHeight:1.5,marginBottom:20,fontStyle:"italic"}}>Heat reached critical. The 32nd Precinct came through the front door. Dirty cash seized.</div><button onClick={onResolve} style={{width:"100%",background:"rgba(139,64,32,.15)",border:`1px solid ${C.red}`,padding:"12px 16px",...se,fontSize:".6rem",color:C.text,letterSpacing:"2px",cursor:"pointer",minHeight:48}}>Regroup</button></div></div>;}

// ── LEGACY SCORING ────────────────────────────────────────
function calcLegacyScore(g) {
  const L = g.legacy; let score = 0;
  const wealthM = L.totalWealthAllGens / 1e6;
  score += Math.min(20, Math.floor(wealthM));
  const avgRep = L.totalRepAllGens / Math.max(1, g.dynastyHistory.length || 12);
  score += Math.min(15, Math.floor(avgRep / 5));
  score += Math.min(10, Math.floor(L.peakZones / 2));
  score += Math.min(10, (L.communityInvestments || 0));
  score -= (L.raidsTotal || 0) * 2;
  score -= Math.min(3, L.bribesTotal || 0);
  if (g.flags.drugMoneyAccepted) score -= 8;
  if (g.flags.civilRightsMarch) score += 5;
  if (g.flags.wentLegitimate || g.flags.foundationEstablished) score += 8;
  if (g.flags.protectedCommunity) score += 4;
  if (g.flags.truthTold) score += 3;
  if (g.flags.pandemicHero) score += 5;
  if (g.flags.blmSupport) score += 4;
  if (g.flags.aiForCommunity) score += 3;
  if (g.flags.savedBlock) score += 4;
  if (g.flags.permanentFoundation) score += 6;
  if (g.flags.howardInstitute) score += 5;
  if (g.flags.centuryArchive) score += 4;
  if (g.flags.gaveBack) score += 8;
  if (g.flags.letterRead) score += 3;
  if (g.flags.streetNamed) score += 3;
  if (g.flags.frozeRents) score += 3;
  // Government relationships (0-10 pts)
  if (g.gov) {
    const totalRel = Object.values(g.gov).reduce((s, ag) => s + (ag.rel || 0), 0);
    score += Math.min(10, Math.floor(totalRel / 60));
  }
  if (g.flags.fedBoard) score += 4;
  const diplomats = (L.heirTypes || []).filter(t => t === "diplomat").length;
  if (diplomats >= 4) score += 5;
  else if (diplomats >= 2) score += 3;
  const gens = g.dynastyHistory?.length || 0;
  if (gens >= 12) score += 5;
  else if (gens >= 8) score += 3;
  return Math.max(0, Math.min(100, score));
}

function getArchetype(g) {
  const L = g.legacy; const score = calcLegacyScore(g);
  const avgRep = L.totalRepAllGens / Math.max(1, g.dynastyHistory.length || 12);
  const wealthM = L.totalWealthAllGens / 1e6;
  const communityScore = (L.communityInvestments || 0) - (g.flags.communityBetrayed ? 20 : 0);
  const govRel = g.gov ? Object.values(g.gov).reduce((s, a) => s + (a.rel || 0), 0) : 0;
  const gens = g.dynastyHistory?.length || 0;

  if (score >= 85 && (g.flags.permanentFoundation || g.flags.howardInstitute) && gens >= 10) {
    return { icon: "\u{1F3DB}", name: "The Institution",
      desc: "Twelve generations. From a numbers runner on Sugar Hill to a name on buildings, scholarships, and legislation. The Johnson family became the institution they once operated outside of. Harlem's story is inseparable from theirs.",
      medals: ["Pillar of Harlem", "Institutional Power", "The Full Arc", "A Century"] };
  }
  if (score >= 75 && govRel >= 200 && g.flags.fedBoard) {
    return { icon: "\u{1F575}", name: "The Shadow State",
      desc: "The Johnson family moved from the streets into the corridors of government itself. CIA consultants, Federal Reserve advisors, congressional allies. The line between public service and private power was erased entirely. The most dangerous kind of legacy: invisible and permanent.",
      medals: ["Government Architect", "Deep State", "Invisible Hand", "Power Behind Power"] };
  }
  if (score >= 70 && (g.flags.wentLegitimate || g.flags.foundationEstablished) && avgRep > 60) {
    return { icon: "\u{2696}", name: "The Statesman",
      desc: "From a street corner in 1921 to legitimate power. The Johnson family built wealth when wealth was denied, kept the community fed, and left Harlem better than they found it.",
      medals: ["Pillar of Harlem", "Clean Hands", "Long Game"] };
  }
  if (communityScore >= 15 && avgRep >= 55 && !g.flags.drugMoneyAccepted) {
    return { icon: "\u{1F54A}", name: "The Philanthropist",
      desc: "The family never forgot where the money came from. Every generation invested back. Harlem mourned when the last Johnson stepped back.",
      medals: ["Beloved by Harlem", "Community Pillar", "Clean Conscience"] };
  }
  if (wealthM >= 10 && L.peakZones >= 20 && (L.raidsTotal || 0) <= 3) {
    return { icon: "\u{1F451}", name: "The Kingpin",
      desc: "Nobody moved in Harlem without the Johnsons knowing. Multiple boroughs, national expansion, government contracts. Not crime. Government.",
      medals: ["Total Dominion", "Iron Grip", "The Long Reign", "Coast to Coast"] };
  }
  if (g.flags.aiForCommunity && g.flags.digitalPivot && g.flags.cryptoProtocol) {
    return { icon: "\u{1F916}", name: "The Futurist",
      desc: "The Johnson family saw the future before anyone else. AI, crypto, digital infrastructure. They built the tools the next century will run on. Whether Harlem benefits depends on who inherits the code.",
      medals: ["Digital Pioneer", "AI Architect", "Future Builder"] };
  }
  if (score >= 45) {
    return { icon: "\u{1F30A}", name: "The Survivor",
      desc: "Twelve generations in Harlem. Raids, federal investigations, crack, gentrification, a pandemic, and the digital revolution. The Johnson family is still here. That is the legacy.",
      medals: ["Still Standing", "Endurance", "Harlem Roots"] };
  }
  return { icon: "\u{1F4A8}", name: "The Cautionary Tale",
    desc: "The Johnson name is whispered in Harlem. Not with reverence. What could have been a dynasty that lasted a century became a warning about what power does when it forgets where it came from.",
    medals: ["Ambition", "Burned Bright"] };
}

function LegacyScreen({ G: g, onRestart }) {
  const score = calcLegacyScore(g);
  const arch = getArchetype(g);
  const history = g.dynastyHistory || [];

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 200, overflowY: "auto" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 20px 60px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeIn 1s ease" }}>
          <div style={{ ...se, fontSize: ".44rem", letterSpacing: "5px", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>The Dynasty Ends</div>
          <div style={{ ...se, fontSize: "1.6rem", color: C.gold, letterSpacing: "3px", marginBottom: 6 }}>THE JOHNSONS</div>
          <div style={{ ...cr, fontSize: ".75rem", color: C.muted, fontStyle: "italic" }}>1921 &mdash; 2040 &middot; Twelve Generations</div>
        </div>

        {/* Archetype */}
        <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeIn 1.5s ease" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{arch.icon}</div>
          <div style={{ ...se, fontSize: "1rem", color: C.gold, letterSpacing: "2px", marginBottom: 8 }}>{arch.name}</div>
          <div style={{ ...cr, fontSize: ".72rem", color: C.text, lineHeight: 1.5, fontStyle: "italic", opacity: 0.8, maxWidth: 340, margin: "0 auto" }}>{arch.desc}</div>
        </div>

        {/* Score */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", border: `2px solid ${C.gold}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(201,168,76,.05)" }}>
            <div style={{ ...cr, fontSize: "1.8rem", fontWeight: 700, color: C.gold }}>{score}</div>
            <div style={{ ...se, fontSize: ".38rem", letterSpacing: "2px", color: C.gold, opacity: .6, textTransform: "uppercase" }}>Legacy</div>
          </div>
        </div>

        {/* Medals */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {arch.medals.map((m, i) => (
            <span key={i} style={{ ...se, fontSize: ".38rem", color: C.gold, letterSpacing: "1px", padding: "4px 10px", border: `1px solid ${C.border}`, background: "rgba(201,168,76,.04)" }}>{m}</span>
          ))}
          {g.flags.civilRightsMarch && <span style={{ ...se, fontSize: ".38rem", color: "#6baa6b", letterSpacing: "1px", padding: "4px 10px", border: "1px solid rgba(107,170,107,.2)", background: "rgba(107,170,107,.04)" }}>Marched for Justice</span>}
          {g.flags.protectedCommunity && <span style={{ ...se, fontSize: ".38rem", color: "#6baa6b", letterSpacing: "1px", padding: "4px 10px", border: "1px solid rgba(107,170,107,.2)", background: "rgba(107,170,107,.04)" }}>Protected the Block</span>}
          {g.flags.drugMoneyAccepted && <span style={{ ...se, fontSize: ".38rem", color: C.red, letterSpacing: "1px", padding: "4px 10px", border: "1px solid rgba(139,64,32,.2)", background: "rgba(139,64,32,.04)" }}>Crossed the Line</span>}
          {g.flags.foundationEstablished && <span style={{ ...se, fontSize: ".38rem", color: C.cyan, letterSpacing: "1px", padding: "4px 10px", border: "1px solid rgba(90,154,181,.2)", background: "rgba(90,154,181,.04)" }}>Foundation Built</span>}
        </div>

        {/* Dynasty Timeline */}
        <ST text="Dynasty Timeline" />
        <div style={{ marginBottom: 24 }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "10px 12px", marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ ...se, fontSize: ".5rem", color: C.gold, letterSpacing: "1px" }}>Gen {toRoman(h.gen)} &middot; {h.year}</span>
                <span style={{ ...se, fontSize: ".4rem", color: C.muted }}>{h.days} days</span>
              </div>
              <div style={{ ...se, fontSize: ".54rem", color: C.text, marginBottom: 2 }}>{h.name} &mdash; {h.title}</div>
              <div style={{ ...cr, fontSize: ".5rem", color: C.muted }}>{fmt(h.wealth)} earned &middot; {h.rep} rep &middot; {h.zones} zones</div>
            </div>
          ))}
        </div>

        {/* Final Stats */}
        <ST text="Dynasty Totals" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 30 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 8, textAlign: "center" }}>
            <div style={{ ...cr, fontSize: "1rem", fontWeight: 600, color: C.gold }}>{fmt(g.legacy.totalWealthAllGens)}</div>
            <div style={{ ...se, fontSize: ".36rem", color: C.muted, letterSpacing: "1px" }}>Total Wealth</div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 8, textAlign: "center" }}>
            <div style={{ ...cr, fontSize: "1rem", fontWeight: 600, color: C.gold }}>{g.legacy.peakZones}</div>
            <div style={{ ...se, fontSize: ".36rem", color: C.muted, letterSpacing: "1px" }}>Peak Zones</div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 8, textAlign: "center" }}>
            <div style={{ ...cr, fontSize: "1rem", fontWeight: 600, color: C.gold }}>{history.length}</div>
            <div style={{ ...se, fontSize: ".36rem", color: C.muted, letterSpacing: "1px" }}>Generations</div>
          </div>
        </div>

        {/* Restart */}
        <button onClick={onRestart} style={{ width: "100%", background: "rgba(201,168,76,.08)", border: `1px solid ${C.gold}`, padding: "14px", ...se, fontSize: ".6rem", color: C.gold, letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", minHeight: 52 }}>
          Begin Again &mdash; A New Dynasty
        </button>

        <div style={{ ...se, fontSize: ".33rem", letterSpacing: "2px", textTransform: "uppercase", textAlign: "center", color: C.muted, opacity: .3, padding: "24px 0 8px" }}>
          Nexus Engine v1.0 &middot; Phase 6
        </div>
      </div>
    </div>
  );
}

// ── TITLE ─────────────────────────────────────────────────
function TitleScreen({onStart,onLoad}){return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,background:C.bg}}><div style={{animation:"fadeIn 1s ease",textAlign:"center"}}><div style={{...se,fontSize:".43rem",letterSpacing:"6px",textTransform:"uppercase",color:C.muted,marginBottom:12}}>Nexus Engine &middot; Phase 7</div><div style={{...se,fontSize:"2rem",color:C.gold,letterSpacing:"4px",marginBottom:6}}>NUMBERS</div><div style={{...cr,fontSize:".8rem",color:C.muted,fontStyle:"italic",marginBottom:6}}>A Harlem Dynasty</div><div style={{...cr,fontSize:".63rem",color:C.text,opacity:.5,marginBottom:40}}>1921 &mdash; 12 generations. Your legacy.</div><button onClick={onStart} style={{background:"rgba(201,168,76,.08)",border:`1px solid ${C.gold}`,padding:"14px 48px",...se,fontSize:".7rem",color:C.gold,letterSpacing:"4px",textTransform:"uppercase",cursor:"pointer",minHeight:52,animation:"pulseGold 3s ease infinite",marginBottom:12,display:"block",width:"100%",maxWidth:280,margin:"0 auto 12px"}}>New Dynasty</button><button onClick={onLoad} style={{background:"transparent",border:`1px solid ${C.border}`,padding:"12px 48px",...se,fontSize:".6rem",color:C.muted,letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",minHeight:48,display:"block",width:"100%",maxWidth:280,margin:"0 auto"}}>Load Game</button></div></div>;}

function SlotPickerModal({mode,slots,onPick,onCancel}){
  return <div style={{position:"fixed",inset:0,background:"rgba(8,5,3,.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
    <div style={{maxWidth:380,width:"100%",background:C.card,border:`1px solid ${C.border}`,padding:"20px 18px",animation:"modalIn .3s ease"}}>
      <div style={{...se,fontSize:".44rem",letterSpacing:"3px",textTransform:"uppercase",color:C.muted,marginBottom:4}}>Save System</div>
      <div style={{...se,fontSize:".95rem",color:C.gold,marginBottom:16,letterSpacing:"2px"}}>{mode==="save"?"Save Game":"Load Game"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[1,2,3].map(i=>{
          const slot=slots[i-1];
          const empty=!slot;
          const disabled=mode==="load"&&empty;
          return <button key={i} onClick={()=>!disabled&&onPick(i)} disabled={disabled} style={{
            width:"100%",background:disabled?"rgba(20,16,8,.5)":"rgba(201,168,76,.04)",
            border:`1px solid ${disabled?"rgba(80,70,50,.1)":C.border}`,
            padding:"12px 14px",cursor:disabled?"default":"pointer",textAlign:"left",minHeight:58,opacity:disabled?.4:1
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{...se,fontSize:".52rem",color:C.gold,letterSpacing:"2px"}}>Slot {i}</span>
              {slot&&<span style={{...se,fontSize:".4rem",color:C.muted}}>Gen {slot.genRoman||"?"} &middot; {slot.year||"?"}</span>}
            </div>
            {slot?<div style={{...cr,fontSize:".58rem",color:C.text}}>{slot.heirName||"Active Dynasty"}</div>
              :<div style={{...cr,fontSize:".58rem",color:C.muted,fontStyle:"italic"}}>Empty slot</div>}
          </button>;
        })}
      </div>
      <button onClick={onCancel} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,padding:"10px",marginTop:12,...se,fontSize:".55rem",color:C.muted,letterSpacing:"2px",cursor:"pointer",minHeight:44,textTransform:"uppercase"}}>Cancel</button>
    </div>
  </div>;
}

// ── TABS ──────────────────────────────────────────────────
const TABS=[{id:"ops",label:"Ops",icon:"\u{1F3B2}"},{id:"assets",label:"Assets",icon:"\u{1F3B7}"},{id:"turf",label:"Turf",icon:"\u{1F5FA}"},{id:"family",label:"Family",icon:"\u{1F46A}"},{id:"factions",label:"People",icon:"\u{1F91D}"},{id:"gov",label:"Gov",icon:"\u{1F3DB}"},{id:"log",label:"Log",icon:"\u{1F4DC}"}];

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
export default function NumbersNexus(){
  const[screen,setScreen]=useState("title");
  const[,forceRender]=useState(0);
  const[tab,setTab]=useState("ops");
  const[notif,setNotif]=useState(null);
  const[currentEvent,setCurrentEvent]=useState(null);
  const[crisis,setCrisis]=useState(false);
  const[heirSelect,setHeirSelect]=useState(false);
  const[transScreen,setTransScreen]=useState(null);
  const[legacyScreen,setLegacyScreen]=useState(false);
  const[milestoneFlash,setMilestoneFlash]=useState(null);
  const[slotPicker,setSlotPicker]=useState(null); // {mode:"save"|"load",slots:[...]}

  const G=useRef(defaultState());
  const lastTime=useRef(0);const accum=useRef(0);

  const notify=useCallback(m=>setNotif({msg:m,key:Date.now()}),[]);
  const opLog=useCallback((txt,type="n")=>{const g=G.current;g.opLog.unshift({txt,type,day:g.day});if(g.opLog.length>50)g.opLog.pop();},[]);
  const fLog=useCallback((txt,type="n")=>{const g=G.current;g.fLog.unshift({txt,type,day:g.day});if(g.fLog.length>30)g.fLog.pop();},[]);

  // ── RIVAL AI ──
  const initRival=useCallback(()=>{
    const g=G.current;const R=g.rival;
    const key=g.flags.acceptedOutfit?"moreno":"washington";
    const prof=RIVAL_PROFILES[key];
    const leader=prof.leaders[g.gen]||prof.leaders[2];
    R.active=true;R.name=prof.name;R.shortName=prof.shortName;R.personality=prof.personality;R.icon=prof.icon;
    R.zones=[12,14].filter(id=>!g.territories.includes(id));R.wealth=500;R.rep=25;R.income=8;R.stance="watching";R.nextMove=60;
    R.leaderName=leader.name;R.leaderTitle=leader.title;R.leaderTrait=leader.trait;
    R.lastAction=`${leader.name} establishes ${prof.name} in ${prof.origin}.`;
    fLog(`${leader.name}, ${leader.title}, emerges. ${leader.intro}`,"b");
  },[fLog]);

  const rivalTick=useCallback(()=>{
    const g=G.current;const R=g.rival;if(!R.active)return;
    R.wealth+=R.income;if(R.truce>0)R.truce--;
    R.nextMove--;if(R.nextMove>0)return;
    R.nextMove=20+Math.floor(Math.random()*25);
    const ln=R.leaderName||R.shortName;
    if(R.truce>0){R.lastAction=`${ln} observing truce.`;return;}
    R.income=Math.max(R.income,g.gen*5+R.zones.length*3);
    const roll=Math.random();
    if(R.personality==="aggressive"){
      if(roll<0.4){
        const avail=ZONES.filter(z=>z.minGen<=g.gen&&!g.territories.includes(z.id)&&!R.zones.includes(z.id)&&R.wealth>=z.cost*0.4);
        if(avail.length){const z=avail[Math.floor(Math.random()*avail.length)];R.zones.push(z.id);R.wealth-=z.cost*0.4;R.stance="expanding";R.lastAction=`${ln} took ${z.name}.`;}
      }else if(roll<0.6){R.rep=Math.min(100,R.rep+3);R.stance="intimidating";R.lastAction=`${ln} making moves. People are talking.`;}
      else{R.wealth+=R.income*5;R.stance="building";R.lastAction=`${ln} is building war chest.`;}
    }else{
      if(roll<0.3){const avail=ZONES.filter(z=>z.minGen<=g.gen&&!g.territories.includes(z.id)&&!R.zones.includes(z.id)&&R.wealth>=z.cost*0.5);
        if(avail.length){const z=avail[Math.floor(Math.random()*avail.length)];R.zones.push(z.id);R.wealth-=z.cost*0.5;R.stance="expanding";R.lastAction=`${ln} established presence in ${z.name}.`;}
      }else if(roll<0.5){R.rep=Math.min(100,R.rep+4);R.stance="community";R.lastAction=`${ln} investing in community programs.`;}
      else{R.wealth+=R.income*4;R.stance="building";R.lastAction=`${ln} growing quietly.`;}
    }
  },[]);

  // ── TRIGGER EVENT ──
  const triggerEvent=useCallback(()=>{
    const g=G.current;if(g.modalActive)return;
    // Check milestones first (highest priority)
    const milestone=MILESTONES.find(m=>!g.triggeredMilestones.includes(m.id)&&m.check(g));
    if(milestone){g.triggeredMilestones.push(milestone.id);g.modalActive=true;setCurrentEvent(milestone);return;}
    // Check chain events (flag-conditional, 25% chance per tick)
    if(Math.random()<0.25){
      const chain=CHAIN_EVENTS.find(e=>!g.triggeredChains.includes(e.id)&&e.minGen<=g.gen&&g.flags[e.reqFlag]);
      if(chain){g.triggeredChains.push(chain.id);g.modalActive=true;setCurrentEvent(chain);return;}
    }
    // Rival event (20% chance)
    if(g.rival.active&&Math.random()<0.2){
      const rPool=(ERA_EVENTS.rival||[]).filter(e=>!g.usedEvents.includes(e.id));
      if(rPool.length){const ev=rPool[Math.floor(Math.random()*rPool.length)];g.usedEvents.push(ev.id);g.modalActive=true;setCurrentEvent(ev);return;}
    }
    // Regular era events
    const pool=(ERA_EVENTS[g.gen]||[]).filter(e=>{if(g.usedEvents.includes(e.id))return false;if(e.minHeat&&g.heat<e.minHeat)return false;return true;});
    if(!pool.length){g.usedEvents=g.usedEvents.filter(id=>!(ERA_EVENTS[g.gen]||[]).find(e=>e.id===id)&&!(ERA_EVENTS.rival||[]).find(e=>e.id===id));return;}
    const ev=pool[Math.floor(Math.random()*pool.length)];
    g.usedEvents.push(ev.id);g.modalActive=true;setCurrentEvent(ev);
  },[]);

  // ── GAME TICK ──
  const gameTick=useCallback(()=>{
    const g=G.current;if(crisis||g.modalActive)return;
    g.tick++;if(g.tick%8===0)g.day++;
    const inc=calcIncome(g);g.dirty+=inc;g.totalEarned+=inc;
    // Wealth milestone flashes
    if(g.totalEarned>=1000000&&!g.flags.flash1M){g.flags.flash1M=true;setMilestoneFlash({icon:"\u{1F4B0}",title:"The First Million",sub:"Wealth Milestone"});}
    if(g.totalEarned>=1000000000&&!g.flags.flash1B){g.flags.flash1B=true;setMilestoneFlash({icon:"\u{1F48E}",title:"A Billion Dollars",sub:"Dynasty Milestone"});}
    if(g.rep>=95&&!g.flags.flashRep){g.flags.flashRep=true;setMilestoneFlash({icon:"\u{1F451}",title:"The Name Means Something",sub:"Reputation"});}
    g.heat=Math.min(100,g.heat+calcHeatRate(g));
    if(g.tick%80===0)Object.values(g.factions).forEach(f=>{f.trust=Math.max(0,f.trust-1);});
    if(g.tick%120===0)g.territories.forEach(id=>{const z=ZONES[id];if(z&&z.bType==="rep")g.factions.political.trust=cap(g.factions.political.trust+1);});
    if(g.territories.length>g.legacy.peakZones)g.legacy.peakZones=g.territories.length;
    // rival
    // government tick
    if(g.tick%120===0&&g.activeGovContracts&&g.activeGovContracts.length>0){
      g.activeGovContracts.forEach(id=>{const c=GOV_CONTRACTS.find(x=>x.id===id);if(c&&g.gov[c.agency])g.gov[c.agency].rel=cap((g.gov[c.agency].rel||0)+0.5);});
    }
    // exposure grows with wealth/territory, decays slowly
    if(g.tick%60===0){
      const wealthPressure=g.totalEarned>1e6?0.3:g.totalEarned>100000?0.15:0.05;
      const zonePressure=g.territories.length>15?0.2:g.territories.length>8?0.1:0;
      g.exposure=cap(g.exposure+wealthPressure+zonePressure-(g.gen>=6?0.1:0),0,100);
    }
    if(g.rival.active)rivalTick();
    // newspaper headlines - every 40 ticks
    if(g.tick%40===0&&g.tick>0){
      const papers=NEWSPAPERS[g.gen]||["Amsterdam News"];
      const paper=papers[Math.floor(Math.random()*papers.length)];
      const pools=[];
      if(g.rep>=70)pools.push(...HEADLINES.highRep.filter(h=>h.gen.includes(g.gen)));
      if(g.rep<=25)pools.push(...HEADLINES.lowRep.filter(h=>h.gen.includes(g.gen)));
      if(g.heat>=60)pools.push(...HEADLINES.highHeat.filter(h=>h.gen.includes(g.gen)));
      if(g.totalEarned>=500000)pools.push(...HEADLINES.highWealth.filter(h=>h.gen.includes(g.gen)));
      if(g.rival.active&&g.rival.zones.length>=3)pools.push(...HEADLINES.rival.filter(h=>h.gen.includes(g.gen)));
      // Always include general era headlines
      pools.push(...(HEADLINES.era[g.gen]||[]));
      if(pools.length){
        const h=pools[Math.floor(Math.random()*pools.length)];
        opLog(`\u{1F4F0} ${paper}: "${h.text}"`,"n");
      }
    }
    // events
    g.nextEvent--;if(g.nextEvent<=0){g.nextEvent=35+Math.floor(Math.random()*40);triggerEvent();}
    // inferno
    if(g.heat>=100){
      g.heat=65;g.dirty=Math.floor(g.dirty*0.4);g.legacy.raidsTotal++;
      if(g.territories.length>1){const lost=g.territories.pop();opLog(`RAID: ${ZONES[lost].name} lost.`,"b");}
      else opLog("RAID: Heavy losses.","b");
      setCrisis(true);
    }
  },[crisis,rivalTick,triggerEvent,opLog]);

  // ── RAF LOOP ──
  useEffect(()=>{
    if(screen!=="game")return;let raf;
    const loop=t=>{if(lastTime.current===0)lastTime.current=t;accum.current+=t-lastTime.current;lastTime.current=t;
      let ticked=false;while(accum.current>=TICK_RATE){accum.current-=TICK_RATE;gameTick();ticked=true;}
      if(ticked)forceRender(r=>r+1);raf=requestAnimationFrame(loop);};
    raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);
  },[screen,gameTick]);

  // ── ACTIONS ──
  const handleBuyOp=useCallback((key,cb,ce)=>{const g=G.current,qty=g.buyQty,cnt=g[key]||0,total=calcBulkCost(cb,ce,cnt,qty);if((g.dirty+g.clean)<total){notify("Insufficient funds.");return;}let rem=total;if(g.dirty>=rem)g.dirty-=rem;else{rem-=g.dirty;g.dirty=0;g.clean-=rem;}g[key]=(g[key]||0)+qty;const p=(getOps(g.gen).primary||[]).find(p2=>p2.key===key);opLog(`${p?p.name:key} x${qty} added. (total x${g[key]})`,"g");forceRender(r=>r+1);},[notify,opLog]);
  const handleBuyUpg=useCallback((key,cb,ce)=>{const g=G.current,lvl=g[key]||0,cost=Math.floor(cb*Math.pow(ce,lvl));if(g.clean<cost){notify("Not enough clean cash.");return;}g.clean-=cost;g[key]=(g[key]||0)+1;opLog(`${key} upgraded to Lv.${g[key]}.`,"g");forceRender(r=>r+1);},[notify,opLog]);
  const handleBuyAsset=useCallback(key=>{const g=G.current,qty=g.buyQty;let found=null;allAssets(g.gen).forEach(a=>{if(a.key===key)found=a;});if(!found)return;const tc=found.cost*qty;if(g.clean<tc){notify("Not enough clean cash.");return;}g.clean-=tc;g[key]=(g[key]||0)+qty;if(found.rep)g.rep=cap(g.rep+found.rep*qty);opLog(`${found.name} x${qty} acquired.`,"g");forceRender(r=>r+1);},[notify,opLog]);
  const handleLaunder=useCallback(()=>{const g=G.current,capV=calcLaunderCap(g),amt=Math.min(g.dirty,capV);if(amt<=0){notify("Nothing to launder.");return;}const cl=Math.floor(amt*0.85);g.dirty-=amt;g.clean+=cl;opLog(`Laundered ${fmt(amt)} -- received ${fmt(cl)} clean.`,"n");forceRender(r=>r+1);},[notify,opLog]);
  const handleBribe=useCallback(()=>{const g=G.current,cost=Math.floor(280*(1+g.heat/120));if(g.clean<cost){notify("Not enough clean cash.");return;}g.clean-=cost;g.heat=Math.max(0,g.heat-25);g.factions.police.trust=cap(g.factions.police.trust+8);g.legacy.bribesTotal++;opLog("Payment made. The precinct goes quiet.","n");forceRender(r=>r+1);},[notify,opLog]);
  const handleCommunity=useCallback(()=>{const g=G.current;if(g.clean<200){notify("Not enough clean cash.");return;}g.clean-=200;g.heat=Math.max(0,g.heat-10);g.rep=cap(g.rep+5);g.factions.community.trust=cap(g.factions.community.trust+7);g.legacy.communityInvestments++;opLog("Community investment made.","g");forceRender(r=>r+1);},[notify,opLog]);
  const handleSetQty=useCallback(q=>{G.current.buyQty=q;forceRender(r=>r+1);},[]);
  const handleExpand=useCallback((zId,method)=>{const g=G.current,z=ZONES[zId],m=ZONE_METHODS.find(zm=>zm.id===method);const cost=Math.floor(z.cost*m.costMult);if((g.dirty+g.clean)<cost){notify("Insufficient funds.");return;}let rem=cost;if(g.dirty>=rem)g.dirty-=rem;else{rem-=g.dirty;g.dirty=0;g.clean-=rem;}g.territories.push(zId);g.heat=Math.min(100,g.heat+m.heatGain);const how={buyin:"negotiated entry",muscle:"forced takeover",infiltrate:"quiet infiltration"};opLog(`${z.name} secured via ${how[method]}.`,"g");fLog(`${z.name} is Johnson territory.`,"g");
    // Milestone flashes
    if(g.territories.length===10&&!g.flags.flash10)(()=>{g.flags.flash10=true;setMilestoneFlash({icon:"\u{1F5FA}",title:"Ten Blocks Deep",sub:"Territory Milestone"});})();
    if(g.territories.length===20&&!g.flags.flash20)(()=>{g.flags.flash20=true;setMilestoneFlash({icon:"\u{1F30D}",title:"National Reach",sub:"Twenty Zones"});})();
    forceRender(r=>r+1);
  },[notify,opLog,fLog]);
  const handleEventChoice=useCallback(ch=>{const g=G.current;const ok=applyEffects(g,ch.effects);if(!ok){notify("Not enough clean cash.");return;}opLog(ch.label,ch.tag==="p"?"g":ch.tag==="a"?"b":"n");g.modalActive=false;setCurrentEvent(null);forceRender(r=>r+1);},[opLog,notify]);

  const handleContract=useCallback(contract=>{
    const g=G.current;
    if(contract.cost>0&&g.clean<contract.cost){notify("Not enough clean cash.");return;}
    if(g.activeGovContracts.includes(contract.id))return;
    if(contract.cost>0)g.clean-=contract.cost;
    g.activeGovContracts.push(contract.id);
    g.gov[contract.agency].rel=cap((g.gov[contract.agency].rel||0)+contract.govRel);
    g.exposure=cap(g.exposure+(contract.exposure||0));
    opLog(`Gov contract: ${contract.name} accepted. +${fmt(contract.revenue)}/tick.`,"g");
    fLog(`${GOV_AGENCIES[contract.agency]?.name} relationship strengthened.`,"g");
    forceRender(r=>r+1);
  },[notify,opLog,fLog]);

  const handleInvestment=useCallback(inv=>{
    const g=G.current;
    if(g.spentInvestments.includes(inv.id))return;
    if(g.clean<inv.cost){notify("Not enough clean cash.");return;}
    if(inv.requireGov){
      const ok=Object.entries(inv.requireGov).every(([ag,req])=>(g.gov[ag]?.rel||0)>=req);
      if(!ok){notify("Government relationships too low.");return;}
    }
    g.clean-=inv.cost;
    g.spentInvestments.push(inv.id);
    // Apply effects
    if(inv.effect==="nationalExpansion")g.flags.nationalExpansion=true;
    if(inv.effect==="hbcuEndowment"){g.rep=100;g.factions.community.trust=cap(g.factions.community.trust+30);g.flags.hbcuEndowment=true;}
    if(inv.effect==="pacFunding"){g.factions.political.trust=100;g.gov.congress.rel=cap((g.gov.congress.rel||0)+25);g.flags.pacFunding=true;}
    if(inv.effect==="heritageTower"){g.flags.heritageTower=true;}
    if(inv.effect==="defenseContract"){g.gov.dod.rel=cap((g.gov.dod.rel||0)+30);g.flags.defenseContract=true;}
    if(inv.effect==="blackBudgetAccess"){g.blackBudgetActive=true;g.flags.blackBudgetActive=true;g.exposure=cap(g.exposure+10);}
    opLog(`Strategic investment: ${inv.name} acquired.`,"g");
    forceRender(r=>r+1);
  },[notify,opLog]);

  const handleBlackBudget=useCallback(prog=>{
    const g=G.current;
    if(!g.blackBudgetActive){notify("Black Budget access required.");return;}
    if(g.blackBudgetPrograms.includes(prog.id))return;
    if(g.clean<prog.cost){notify("Not enough clean cash.");return;}
    if(prog.reqTier){
      const hasTier=BLACK_BUDGET.filter(p=>p.tier<prog.tier&&g.blackBudgetPrograms.includes(p.id)).length>0;
      if(!hasTier){notify(`Requires a Tier ${prog.tier-1} program first.`);return;}
    }
    g.clean-=prog.cost;
    g.blackBudgetPrograms.push(prog.id);
    g.blackBudgetDepth++;
    g.exposure=cap(g.exposure+prog.exposure);
    opLog(`BLACK BUDGET: ${prog.name} activated. +${fmt(prog.income)}/tick. Exposure +${prog.exposure}.`,"b");
    forceRender(r=>r+1);
  },[notify,opLog]);

  // ── RETIRE ──
  const handleRetire=useCallback(()=>{
    const g=G.current;
    g.legacy.totalWealthAllGens+=g.totalEarned;g.legacy.totalRepAllGens+=g.rep;
    if(g.factions.community.trust<20)g.flags.communityBetrayed=true;
    g.dynastyHistory.push({gen:g.gen,year:ERAS[g.gen-1]?.year,name:g.heir.name,title:g.heir.title,wealth:g.totalEarned,rep:Math.floor(g.rep),zones:g.territories.length,days:g.day});
    if(g.gen>=6){
      // Dynasty complete - show legacy ending
      g.modalActive=true;setLegacyScreen(true);
    }else{
      g.modalActive=true;setHeirSelect(true);
    }
  },[]);

  const handleSelectHeir=useCallback(heir=>{
    setHeirSelect(false);setTransScreen(heir);
  },[]);

  const handleContinueTransition=useCallback(()=>{
    const g=G.current;const heir=transScreen;
    const keepZones=g.territories.slice(0,Math.ceil(g.territories.length*0.5));
    const inheritCash=Math.floor(Math.min(g.clean,g.clean*0.3)+500);
    const era=ERAS[g.gen];
    // faction carryover
    Object.keys(g.factions).forEach(k=>{const mod=era?.fmod?.[k]||0;
      g.factions[k].respect=cap(Math.floor(g.factions[k].respect*0.70)+mod);
      g.factions[k].trust=cap(Math.floor(g.factions[k].trust*0.45)+mod+15+(heir.factionBonus||0));
    });
    g.gen++;g.day=1;g.tick=0;g.dirty=800;g.clean=inheritCash;g.totalEarned=0;
    g.heat=8;g.rep=cap(Math.floor(g.rep*0.6));g.territories=keepZones;
    // reset ops
    g.workers=2;g.workerLvl=0;g.banks=1;g.bankLvl=0;g.poker=0;g.pokerLvl=0;
    g.casino=0;g.casinoLvl=0;g.records=0;g.recordsLvl=0;g.sports=0;g.sportsLvl=0;g.loans=0;g.loansLvl=0;
    g.media=0;g.mediaLvl=0;g.holding=0;g.holdingLvl=0;g.checkcash=0;g.checkcashLvl=0;
    // halve assets
    ["jazzClubs","barbershops","funeralHomes","socialClubs","recordLabels","restaurants","supperClubs","nightclubs","checkCashing","investFirm","lawFirm","tenements","commercial","luxury","officeBlocks","hotels","development","condoTowers","affordHousing","smartBuilding","harlemTower","globalHQ","warehouseNet","techStudios","socialMediaCo","cdfi","telehealth","essentials","aiStudio","cryptoExch","johnsonInst","centennialFnd","runnerCars","deliveryVans","cadillacs","limousines","corporate","privateJets","droneFleet","stashHouses","warehouses","safeHouses","offshoreAcc","shells","trusts","cryptoWallet","daoTreasury","caymansAcc","swissTrust","dynastyVault"].forEach(k=>{g[k]=Math.floor((g[k]||0)*0.5);});
    g.usedEvents=[];g.nextEvent=50;
    // gov persists across generations (relationship is multi-generational)
    g.exposure=Math.max(0,g.exposure*0.7);
    g.heir=heir;g.legacy.heirTypes.push(heir.type);
    // heir special bonuses
    if(heir.cleanBonus)g.clean+=heir.cleanBonus;
    if(heir.title==="The CEO"){g.officeBlocks=(g.officeBlocks||0)+2;}
    if(heir.type==="legend"){g.rep=cap(g.rep+20);}
    // init rival at gen 2
    if(g.gen===2&&!g.rival.active)initRival();
    // Update rival leader for new generation
    if(g.rival.active){
      const key=g.flags.acceptedOutfit?"moreno":"washington";
      const prof=RIVAL_PROFILES[key];
      const leader=prof.leaders[g.gen]||prof.leaders[g.gen-1]||{name:g.rival.shortName,title:"Leader",trait:"Unknown"};
      const oldName=g.rival.leaderName;
      g.rival.leaderName=leader.name;g.rival.leaderTitle=leader.title;g.rival.leaderTrait=leader.trait;
      if(oldName!==leader.name)fLog(`${leader.name}, ${leader.title}, now leads ${g.rival.name}.`,"b");
    }
    g.modalActive=false;setTransScreen(null);
    opLog(`${heir.name} takes the reins. ${ERAS[g.gen-1]?.desc||""}`,"g");
    opLog(`${keepZones.length} zones inherited. ${fmt(g.clean)} carried forward.`,"n");
    forceRender(r=>r+1);
  },[transScreen,initRival,opLog,fLog]);

  // ── SAVE / LOAD ──
  const saveGame=useCallback(async(slot=1)=>{
    const g=G.current;
    const s={
      gen:g.gen,day:g.day,tick:g.tick,dirty:Math.floor(g.dirty),clean:Math.floor(g.clean),totalEarned:Math.floor(g.totalEarned),
      workers:g.workers,workerLvl:g.workerLvl,banks:g.banks,bankLvl:g.bankLvl,poker:g.poker||0,pokerLvl:g.pokerLvl||0,
      casino:g.casino||0,casinoLvl:g.casinoLvl||0,records:g.records||0,recordsLvl:g.recordsLvl||0,
      sports:g.sports||0,sportsLvl:g.sportsLvl||0,loans:g.loans||0,loansLvl:g.loansLvl||0,
      media:g.media||0,mediaLvl:g.mediaLvl||0,holding:g.holding||0,holdingLvl:g.holdingLvl||0,
      checkcash:g.checkcash||0,checkcashLvl:g.checkcashLvl||0,
      heat:Math.floor(g.heat),rep:Math.floor(g.rep),territories:g.territories,buyQty:g.buyQty,nextEvent:g.nextEvent,
      factions:g.factions,flags:g.flags,usedEvents:g.usedEvents,legacy:g.legacy,dynastyHistory:g.dynastyHistory,
      spentInvestments:g.spentInvestments,blackBudgetActive:g.blackBudgetActive,blackBudgetPrograms:g.blackBudgetPrograms,
      blackBudgetDepth:g.blackBudgetDepth,triggeredMilestones:g.triggeredMilestones,triggeredChains:g.triggeredChains,
      gov:g.gov,activeGovContracts:g.activeGovContracts,exposure:Math.floor(g.exposure||0),
      heir:{name:g.heir.name,title:g.heir.title,icon:g.heir.icon,type:g.heir.type,traits:g.heir.traits,
        incomeMult:g.heir.incomeMult||1,heatMult:g.heir.heatMult||1,launderMult:g.heir.launderMult||1},
      rival:{active:g.rival.active,name:g.rival.name,shortName:g.rival.shortName,personality:g.rival.personality,
        icon:g.rival.icon,zones:g.rival.zones,wealth:Math.floor(g.rival.wealth),rep:g.rival.rep,income:g.rival.income,
        stance:g.rival.stance,nextMove:g.rival.nextMove,truce:g.rival.truce,relationship:g.rival.relationship,
        leaderName:g.rival.leaderName||"",leaderTitle:g.rival.leaderTitle||"",leaderTrait:g.rival.leaderTrait||""},
      // Meta for save slot display
      _meta:{savedAt:Date.now(),genRoman:toRoman(g.gen),year:ERAS[g.gen-1]?.year,heirName:g.heir.name},
    };
    ["jazzClubs","barbershops","funeralHomes","socialClubs","recordLabels","restaurants","supperClubs","nightclubs",
     "checkCashing","investFirm","lawFirm","tenements","commercial","luxury","officeBlocks","hotels","development",
     "condoTowers","affordHousing","smartBuilding","harlemTower","globalHQ","warehouseNet","techStudios","socialMediaCo",
     "cdfi","telehealth","essentials","aiStudio","cryptoExch","johnsonInst","centennialFnd",
     "runnerCars","deliveryVans","cadillacs","limousines","corporate","privateJets","droneFleet",
     "stashHouses","warehouses","safeHouses","offshoreAcc","shells","trusts","cryptoWallet","daoTreasury",
     "caymansAcc","swissTrust","dynastyVault"].forEach(k=>{if(g[k])s[k]=g[k];});
    const json=JSON.stringify(s);
    const key=`save:numbers:${slot}`;
    // localStorage (Netlify deployment - works cross-session)
    try{
      localStorage.setItem(key,json);
      notify(`Saved to Slot ${slot}.`);
    }catch(e){
      notify("Save failed.");
    }
  },[notify]);

  const loadGame=useCallback(async(slot=1)=>{
    const key=`save:numbers:${slot}`;
    let parsed=null;
    try{
      const raw=localStorage.getItem(key);
      if(raw)parsed=JSON.parse(raw);
      // Legacy fallback
      if(!parsed&&slot===1){
        const legacy=localStorage.getItem("save:numbers");
        if(legacy)parsed=JSON.parse(legacy);
      }
    }catch(e){}
    if(parsed&&parsed.gen){
      const s=parsed;
      G.current={...defaultState(),...s,factions:{...defaultState().factions,...(s.factions||{})},
        legacy:{...defaultState().legacy,...(s.legacy||{})},rival:{...defaultState().rival,...(s.rival||{})},
        heir:{...defaultState().heir,...(s.heir||{})},flags:{...(s.flags||{})},gov:{...defaultState().gov,...(s.gov||{})},
        activeGovContracts:s.activeGovContracts||[],exposure:s.exposure||0,opLog:[],fLog:[],modalActive:false};
      return true;
    }
    return false;
  },[]);

  const scanSaveSlots=useCallback(async()=>{
    const slots=[null,null,null];
    for(let i=1;i<=3;i++){
      try{
        const raw=localStorage.getItem(`save:numbers:${i}`);
        if(raw){
          const parsed=JSON.parse(raw);
          if(parsed&&parsed.gen)slots[i-1]=parsed._meta||{genRoman:toRoman(parsed.gen),year:ERAS[parsed.gen-1]?.year,heirName:parsed.heir?.name};
        }
        // Legacy for slot 1
        if(!slots[0]&&i===1){
          const legacy=localStorage.getItem("save:numbers");
          if(legacy){
            const parsed=JSON.parse(legacy);
            if(parsed&&parsed.gen)slots[0]=parsed._meta||{genRoman:toRoman(parsed.gen),year:ERAS[parsed.gen-1]?.year,heirName:parsed.heir?.name};
          }
        }
      }catch(e){}
    }
    return slots;
  },[]);

  const handleLoadAndResume=useCallback(async()=>{
    const slots=await scanSaveSlots();
    setSlotPicker({mode:"load",slots});
  },[scanSaveSlots]);

  const handleOpenSaveSlots=useCallback(async()=>{
    const slots=await scanSaveSlots();
    setSlotPicker({mode:"save",slots});
  },[scanSaveSlots]);

  const handleSlotPick=useCallback(async(slot)=>{
    if(!slotPicker)return;
    const mode=slotPicker.mode;
    setSlotPicker(null);
    if(mode==="save"){
      await saveGame(slot);
    }else{
      const ok=await loadGame(slot);
      if(!ok){notify("Load failed.");return;}
      lastTime.current=0;accum.current=0;
      setCrisis(false);setCurrentEvent(null);setHeirSelect(false);setTransScreen(null);setTab("ops");
      G.current.modalActive=false;
      notify(`Slot ${slot} loaded.`);
      setScreen("game");
    }
  },[slotPicker,saveGame,loadGame,notify]);

  // Autosave every 60s
  useEffect(()=>{
    if(screen!=="game")return;
    const iv=setInterval(()=>{
      if(!G.current.modalActive&&!crisis)saveGame(1);
    },60000);
    return ()=>clearInterval(iv);
  },[screen,crisis,saveGame]);

  const handleStart=useCallback(()=>{
    G.current=defaultState();lastTime.current=0;accum.current=0;
    setCrisis(false);setCurrentEvent(null);setHeirSelect(false);setTransScreen(null);setTab("ops");
    G.current.opLog.unshift({txt:"One runner walks the block. The numbers game is yours to build.",type:"n",day:1});
    G.current.opLog.unshift({txt:"Your operation begins in Sugar Hill, Harlem. The year is 1921.",type:"n",day:1});
    setScreen("game");
  },[]);

  if(screen==="title")return <><style>{CSS}</style><TitleScreen onStart={handleStart} onLoad={handleLoadAndResume}/>{slotPicker&&<SlotPickerModal mode={slotPicker.mode} slots={slotPicker.slots} onPick={handleSlotPick} onCancel={()=>setSlotPicker(null)}/>}</>;
  const g=G.current;
  applyTheme(g.gen);

  return <><style>{CSS}</style>
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text,...cr,maxWidth:480,margin:"0 auto",paddingBottom:58,position:"relative"}}>
      <StatsBar G={g} onSave={handleOpenSaveSlots}/>
      <div style={{overflowY:"auto"}}>
        {tab==="ops"&&<OpsTab G={g} onBuyOp={handleBuyOp} onBuyUpg={handleBuyUpg} onLaunder={handleLaunder} onBribe={handleBribe} onCommunity={handleCommunity} onSetQty={handleSetQty} onRetire={handleRetire} onInvest={handleInvestment}/>}
        {tab==="assets"&&<AssetsTab G={g} onBuyAsset={handleBuyAsset}/>}
        {tab==="turf"&&<TurfTab G={g} onExpand={handleExpand}/>}
        {tab==="factions"&&<FactionTab G={g}/>}
        {tab==="family"&&<FamilyTab G={g}/>}
        {tab==="gov"&&<GovTab G={g} onContract={handleContract} onBB={handleBlackBudget}/>}
        {tab==="log"&&<LogTab G={g}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"center",zIndex:50,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{display:"flex",maxWidth:480,width:"100%"}}>{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 0",minHeight:48,background:"transparent",border:"none",cursor:"pointer",borderTop:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent"}}><span style={{fontSize:".85rem",marginBottom:1}}>{t.icon}</span><span style={{...se,fontSize:".36rem",letterSpacing:"1.5px",textTransform:"uppercase",color:tab===t.id?C.gold:C.muted}}>{t.label}</span></button>)}</div>
      </div>
      {currentEvent&&<EventModal event={currentEvent} onChoice={handleEventChoice}/>}
      {crisis&&<CrisisModal onResolve={()=>setCrisis(false)}/>}
      {heirSelect&&<HeirModal gen={g.gen+1} onSelect={handleSelectHeir}/>}
      {transScreen&&<TransitionScreen G={g} heir={transScreen} onContinue={handleContinueTransition}/>}
      {legacyScreen&&<LegacyScreen G={g} onRestart={()=>{setLegacyScreen(false);setScreen("title");}}/>}
      {milestoneFlash&&<MilestoneFlash icon={milestoneFlash.icon} title={milestoneFlash.title} sub={milestoneFlash.sub} onDone={()=>setMilestoneFlash(null)}/>}
      {slotPicker&&<SlotPickerModal mode={slotPicker.mode} slots={slotPicker.slots} onPick={handleSlotPick} onCancel={()=>setSlotPicker(null)}/>}
      {notif&&<Notif key={notif.key} msg={notif.msg} onDone={()=>setNotif(null)}/>}
      <div style={{...se,fontSize:".33rem",letterSpacing:"2px",textTransform:"uppercase",textAlign:"center",color:C.muted,opacity:.3,padding:"20px 0 8px"}}>Nexus Engine v1.0 &middot; Phase 6</div>
    </div>
  </>;
}
