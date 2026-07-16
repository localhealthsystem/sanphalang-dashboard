import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  Activity, Users, MapPin, TrendingUp, Database, Building2, Heart,
  Shield, ChevronRight, ExternalLink, AlertTriangle, CheckCircle,
  Clock, Star, Layers, BarChart3, Target, Globe, FileText, Bell,
  ArrowUpRight, ArrowDownRight, Minus, Eye
} from "lucide-react";

// ============================================================
// ข้อมูลคงที่ — ตรวจสอบจากเอกสารโครงการ ASA Phase 2
// (ASA_Phase2_v92_budget_calculated_v3.docx)
// ============================================================

// ระยะที่ 1: 5 จังหวัดนำร่อง (เขตสุขภาพ 1, 3, 6, 7, 12)
const PROVINCES_PHASE1 = [
  { name: "เชียงราย", zone: 1 },
  { name: "นครสวรรค์", zone: 3 },
  { name: "ตราด", zone: 6 },
  { name: "ขอนแก่น", zone: 7 },
  { name: "พัทลุง", zone: 12 },
];

// ระยะที่ 2: 8 จังหวัดใหม่ (เขตสุขภาพ 2, 4, 5, 8, 9, 10, 11, 13)
// ที่มา: "จังหวัดเป้าหมายใหม่ (8 จังหวัด)" ในข้อเสนอโครงการ
const PROVINCES_PHASE2 = [
  { name: "พิษณุโลก", zone: 2, mentor: "เชียงราย" },
  { name: "ปทุมธานี", zone: 4, mentor: "นครสวรรค์" },
  { name: "สุพรรณบุรี", zone: 5, mentor: "นครสวรรค์" },
  { name: "บึงกาฬ", zone: 8, mentor: "ขอนแก่น" },
  { name: "ชัยภูมิ", zone: 9, mentor: "ขอนแก่น" },
  { name: "อุบลราชธานี", zone: 10, mentor: "ขอนแก่น" },
  { name: "กระบี่", zone: 11, mentor: "พัทลุง" },
  { name: "กรุงเทพมหานคร", zone: 13, mentor: "ตราด" },
];

const ALL_PROVINCE_META = [...PROVINCES_PHASE1.map(p => ({...p, phase:1, mentor:null})),
                           ...PROVINCES_PHASE2.map(p => ({...p, phase:2}))];
const ALL_PROVINCE_NAMES = ALL_PROVINCE_META.map(p => p.name);

// ระยะเวลาโครงการ: 24 เดือน (มิ.ย. 2569 – พ.ค. 2571)
const PROJECT_PERIOD = "มิ.ย. 2569 – พ.ค. 2571 (24 เดือน)";

const PARTNER_AGENCIES = [
  { id: "nha", name: "สช.", fullName: "สำนักงานคณะกรรมการสุขภาพแห่งชาติ", role: "แกนกลางประสาน/เลขานุการภาคีอาสา", color: "#3B82F6" },
  { id: "thaihealth", name: "สสส.", fullName: "สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ", role: "แหล่งทุนสร้างเสริมสุขภาพ/วิชาการ", color: "#10B981" },
  { id: "hsri", name: "สวรส.", fullName: "สถาบันวิจัยระบบสาธารณสุข", role: "วิจัยประเมินผลเชิงระบบ (DE)", color: "#F59E0B" },
  { id: "nhso", name: "สปสช.", fullName: "สำนักงานหลักประกันสุขภาพแห่งชาติ", role: "กองทุน กปท./LTC/กองทุนจังหวัด", color: "#EF4444" },
  { id: "codi", name: "พอช.", fullName: "สถาบันพัฒนาองค์กรชุมชน", role: "เสริมองค์กรชุมชน/สภาองค์กรชุมชน", color: "#8B5CF6" },
  { id: "tsri", name: "บพท.", fullName: "หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่", role: "ทุนวิจัยพัฒนาเชิงพื้นที่", color: "#EC4899" },
  { id: "nida", name: "นิด้า", fullName: "สถาบันบัณฑิตพัฒนบริหารศาสตร์", role: "วิชาการ/ประเมินผล/CoP", color: "#06B6D4" },
  { id: "niems", name: "สพฉ.", fullName: "สถาบันการแพทย์ฉุกเฉินแห่งชาติ", role: "ระบบการแพทย์ฉุกเฉิน/ภัยพิบัติ", color: "#F97316" },
  { id: "ha", name: "สรพ.", fullName: "สถาบันรับรองคุณภาพสถานพยาบาล", role: "คุณภาพระบบบริการสุขภาพ", color: "#14B8A6" },
];

// ข้อมูล TWBI คงที่รายจังหวัด (13 จังหวัด)
const twbiData = [
  { province: "เชียงราย", phase: 1, twbiScore: 72.4, health: 75, education: 68, economy: 62, environment: 78, safety: 70, governance: 81 },
  { province: "นครสวรรค์", phase: 1, twbiScore: 68.2, health: 70, education: 65, economy: 58, environment: 72, safety: 68, governance: 76 },
  { province: "ตราด", phase: 1, twbiScore: 65.5, health: 68, education: 62, economy: 55, environment: 80, safety: 65, governance: 63 },
  { province: "ขอนแก่น", phase: 1, twbiScore: 74.8, health: 78, education: 75, economy: 70, environment: 68, safety: 72, governance: 85 },
  { province: "พัทลุง", phase: 1, twbiScore: 69.1, health: 72, education: 64, economy: 56, environment: 76, safety: 72, governance: 75 },
  { province: "พิษณุโลก", phase: 2, twbiScore: 64.5, health: 67, education: 62, economy: 60, environment: 70, safety: 64, governance: 64 },
  { province: "ปทุมธานี", phase: 2, twbiScore: 66.8, health: 65, education: 72, economy: 75, environment: 52, safety: 55, governance: 82 },
  { province: "สุพรรณบุรี", phase: 2, twbiScore: 62.3, health: 63, education: 58, economy: 55, environment: 72, safety: 62, governance: 64 },
  { province: "บึงกาฬ", phase: 2, twbiScore: 55.8, health: 56, education: 50, economy: 42, environment: 68, safety: 58, governance: 61 },
  { province: "ชัยภูมิ", phase: 2, twbiScore: 58.4, health: 60, education: 54, economy: 48, environment: 66, safety: 60, governance: 62 },
  { province: "อุบลราชธานี", phase: 2, twbiScore: 58.3, health: 60, education: 55, economy: 48, environment: 62, safety: 58, governance: 67 },
  { province: "กระบี่", phase: 2, twbiScore: 63.7, health: 66, education: 60, economy: 68, environment: 72, safety: 55, governance: 61 },
  { province: "กรุงเทพมหานคร", phase: 2, twbiScore: 70.2, health: 72, education: 78, economy: 82, environment: 48, safety: 50, governance: 91 },
];

// ข้อมูลการมีส่วนร่วม (Tiered Participation)
const participationData = [
  { province: "เชียงราย", phase: 1, level: 3, milestoneCompleted: 7, milestoneTotal: 7, targetTambon: 22, activeTambon: 20, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: true },
  { province: "นครสวรรค์", phase: 1, level: 3, milestoneCompleted: 6, milestoneTotal: 7, targetTambon: 18, activeTambon: 15, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: true },
  { province: "ตราด", phase: 1, level: 2, milestoneCompleted: 5, milestoneTotal: 7, targetTambon: 12, activeTambon: 8, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: true },
  { province: "ขอนแก่น", phase: 1, level: 3, milestoneCompleted: 7, milestoneTotal: 7, targetTambon: 25, activeTambon: 23, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: true },
  { province: "พัทลุง", phase: 1, level: 3, milestoneCompleted: 6, milestoneTotal: 7, targetTambon: 15, activeTambon: 14, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: true },
  { province: "พิษณุโลก", phase: 2, level: 1, milestoneCompleted: 2, milestoneTotal: 7, targetTambon: 16, activeTambon: 4, decisionArena: false, nodeManager: true, shareConnected: true, targetAgenda: false },
  { province: "ปทุมธานี", phase: 2, level: 2, milestoneCompleted: 3, milestoneTotal: 7, targetTambon: 14, activeTambon: 5, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: false },
  { province: "สุพรรณบุรี", phase: 2, level: 1, milestoneCompleted: 2, milestoneTotal: 7, targetTambon: 12, activeTambon: 3, decisionArena: false, nodeManager: true, shareConnected: true, targetAgenda: false },
  { province: "บึงกาฬ", phase: 2, level: 1, milestoneCompleted: 1, milestoneTotal: 7, targetTambon: 10, activeTambon: 2, decisionArena: false, nodeManager: false, shareConnected: false, targetAgenda: false },
  { province: "ชัยภูมิ", phase: 2, level: 1, milestoneCompleted: 2, milestoneTotal: 7, targetTambon: 16, activeTambon: 3, decisionArena: false, nodeManager: true, shareConnected: false, targetAgenda: false },
  { province: "อุบลราชธานี", phase: 2, level: 2, milestoneCompleted: 3, milestoneTotal: 7, targetTambon: 28, activeTambon: 8, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: false },
  { province: "กระบี่", phase: 2, level: 1, milestoneCompleted: 2, milestoneTotal: 7, targetTambon: 12, activeTambon: 3, decisionArena: false, nodeManager: true, shareConnected: true, targetAgenda: false },
  { province: "กรุงเทพมหานคร", phase: 2, level: 2, milestoneCompleted: 3, milestoneTotal: 7, targetTambon: 10, activeTambon: 4, decisionArena: true, nodeManager: true, shareConnected: true, targetAgenda: false },
];

// ข้อมูลทรัพยากร (ล้านบาท)
const resourceData = [
  { province: "เชียงราย", phase: 1, nhsoFund: 8.2, thaiHealthFund: 4.5, codiFund: 2.8, provincialBudget: 12.5, communityWelfare: 1.8 },
  { province: "นครสวรรค์", phase: 1, nhsoFund: 6.5, thaiHealthFund: 3.8, codiFund: 2.1, provincialBudget: 10.2, communityWelfare: 1.4 },
  { province: "ตราด", phase: 1, nhsoFund: 3.5, thaiHealthFund: 2.1, codiFund: 1.2, provincialBudget: 6.8, communityWelfare: 0.8 },
  { province: "ขอนแก่น", phase: 1, nhsoFund: 9.8, thaiHealthFund: 5.2, codiFund: 3.5, provincialBudget: 15.8, communityWelfare: 2.2 },
  { province: "พัทลุง", phase: 1, nhsoFund: 5.2, thaiHealthFund: 3.5, codiFund: 2.5, provincialBudget: 8.5, communityWelfare: 1.5 },
  { province: "พิษณุโลก", phase: 2, nhsoFund: 4.8, thaiHealthFund: 2.2, codiFund: 1.2, provincialBudget: 8.8, communityWelfare: 0.8 },
  { province: "ปทุมธานี", phase: 2, nhsoFund: 6.2, thaiHealthFund: 3.0, codiFund: 1.0, provincialBudget: 18.5, communityWelfare: 0.5 },
  { province: "สุพรรณบุรี", phase: 2, nhsoFund: 4.5, thaiHealthFund: 2.0, codiFund: 1.5, provincialBudget: 7.8, communityWelfare: 1.2 },
  { province: "บึงกาฬ", phase: 2, nhsoFund: 2.8, thaiHealthFund: 1.2, codiFund: 0.8, provincialBudget: 4.2, communityWelfare: 0.4 },
  { province: "ชัยภูมิ", phase: 2, nhsoFund: 4.2, thaiHealthFund: 1.8, codiFund: 1.2, provincialBudget: 6.5, communityWelfare: 0.8 },
  { province: "อุบลราชธานี", phase: 2, nhsoFund: 7.5, thaiHealthFund: 2.8, codiFund: 2.0, provincialBudget: 11.2, communityWelfare: 1.2 },
  { province: "กระบี่", phase: 2, nhsoFund: 3.8, thaiHealthFund: 2.5, codiFund: 1.0, provincialBudget: 12.0, communityWelfare: 0.8 },
  { province: "กรุงเทพมหานคร", phase: 2, nhsoFund: 15.0, thaiHealthFund: 5.5, codiFund: 2.5, provincialBudget: 45.0, communityWelfare: 1.5 },
].map(r => ({ ...r, coInvestTotal: parseFloat((r.nhsoFund + r.thaiHealthFund + r.codiFund + r.provincialBudget + r.communityWelfare).toFixed(1)) }));

// ข้อมูลผลลัพธ์ O1-O4
const outcomeData = [
  { province: "เชียงราย", phase: 1, O1_partnership: 85, O2_dataUsage: 78, O3_coInvestment: 72, O4_wellbeing: 68 },
  { province: "นครสวรรค์", phase: 1, O1_partnership: 80, O2_dataUsage: 72, O3_coInvestment: 65, O4_wellbeing: 62 },
  { province: "ตราด", phase: 1, O1_partnership: 68, O2_dataUsage: 60, O3_coInvestment: 55, O4_wellbeing: 50 },
  { province: "ขอนแก่น", phase: 1, O1_partnership: 90, O2_dataUsage: 85, O3_coInvestment: 78, O4_wellbeing: 72 },
  { province: "พัทลุง", phase: 1, O1_partnership: 82, O2_dataUsage: 75, O3_coInvestment: 70, O4_wellbeing: 65 },
  { province: "พิษณุโลก", phase: 2, O1_partnership: 45, O2_dataUsage: 38, O3_coInvestment: 30, O4_wellbeing: 25 },
  { province: "ปทุมธานี", phase: 2, O1_partnership: 55, O2_dataUsage: 48, O3_coInvestment: 40, O4_wellbeing: 32 },
  { province: "สุพรรณบุรี", phase: 2, O1_partnership: 40, O2_dataUsage: 32, O3_coInvestment: 25, O4_wellbeing: 20 },
  { province: "บึงกาฬ", phase: 2, O1_partnership: 30, O2_dataUsage: 22, O3_coInvestment: 15, O4_wellbeing: 12 },
  { province: "ชัยภูมิ", phase: 2, O1_partnership: 38, O2_dataUsage: 30, O3_coInvestment: 22, O4_wellbeing: 18 },
  { province: "อุบลราชธานี", phase: 2, O1_partnership: 55, O2_dataUsage: 42, O3_coInvestment: 35, O4_wellbeing: 30 },
  { province: "กระบี่", phase: 2, O1_partnership: 42, O2_dataUsage: 35, O3_coInvestment: 28, O4_wellbeing: 22 },
  { province: "กรุงเทพมหานคร", phase: 2, O1_partnership: 58, O2_dataUsage: 52, O3_coInvestment: 42, O4_wellbeing: 28 },
];

// ข้อมูล SHARE Platform
const shareData = [
  { province: "เชียงราย", datasets: 32, lastUpdate: "10 ก.ค. 69", users: 85, reports: 14 },
  { province: "นครสวรรค์", datasets: 28, lastUpdate: "8 ก.ค. 69", users: 62, reports: 11 },
  { province: "ตราด", datasets: 18, lastUpdate: "5 ก.ค. 69", users: 35, reports: 6 },
  { province: "ขอนแก่น", datasets: 35, lastUpdate: "12 ก.ค. 69", users: 92, reports: 16 },
  { province: "พัทลุง", datasets: 25, lastUpdate: "9 ก.ค. 69", users: 55, reports: 10 },
  { province: "พิษณุโลก", datasets: 8, lastUpdate: "1 ก.ค. 69", users: 15, reports: 2 },
  { province: "ปทุมธานี", datasets: 12, lastUpdate: "6 ก.ค. 69", users: 22, reports: 3 },
  { province: "สุพรรณบุรี", datasets: 6, lastUpdate: "28 มิ.ย. 69", users: 12, reports: 1 },
  { province: "บึงกาฬ", datasets: 2, lastUpdate: "20 มิ.ย. 69", users: 5, reports: 0 },
  { province: "ชัยภูมิ", datasets: 5, lastUpdate: "25 มิ.ย. 69", users: 10, reports: 1 },
  { province: "อุบลราชธานี", datasets: 15, lastUpdate: "6 ก.ค. 69", users: 28, reports: 4 },
  { province: "กระบี่", datasets: 7, lastUpdate: "30 มิ.ย. 69", users: 14, reports: 1 },
  { province: "กรุงเทพมหานคร", datasets: 18, lastUpdate: "8 ก.ค. 69", users: 35, reports: 5 },
];

// แจ้งเตือนความเสี่ยง
const riskAlerts = [
  { province: "บึงกาฬ", severity: "high", message: "ยังไม่มี Node Manager / SHARE ไม่เชื่อมต่อ / TWBI ต่ำสุด (55.8) / Milestone ผ่าน 1/7 เท่านั้น", action: "ส่งทีมพี่เลี้ยงจากขอนแก่นลงสนับสนุนเร่งด่วน จัดอบรม SHARE" },
  { province: "ชัยภูมิ", severity: "high", message: "SHARE ยังไม่เชื่อมต่อ / Decision Arena ยังไม่จัดตั้ง / Level 1 Engage", action: "ประสานขอนแก่น (พี่เลี้ยง) จัดเวทีภาคีจังหวัดและเชื่อมต่อ SHARE" },
  { province: "สุพรรณบุรี", severity: "medium", message: "ตำบลดำเนินการ 3/12 (25%) ต่ำกว่าเป้า / Decision Arena ยังไม่มี", action: "ทบทวนกลยุทธ์ขยายตำบลร่วมกับ อปท. ร่วมกับนครสวรรค์ (พี่เลี้ยง)" },
  { province: "ตราด", severity: "low", message: "Phase 1 แต่ยังอยู่ Level 2 — Milestone 5/7", action: "พัฒนาแผน Sustainability เพื่อยกระดับเป็น Level 3" },
  { province: "กรุงเทพมหานคร", severity: "medium", message: "พื้นที่พิเศษ — โครงสร้าง อปท. แตกต่างจากจังหวัดอื่น ต้องปรับกลไก", action: "ออกแบบ Decision Arena เฉพาะบริบท กทม. ร่วมกับสำนักอนามัย/เขต" },
];

// ฐานข้อมูลเปิดภาครัฐ
const openDataSources = [
  { source: "สปสช.", type: "กองทุนสุขภาพตำบล/จังหวัด, LTC", url: "https://opendata.nhso.go.th", status: "connected", datasets: 45, icon: "H" },
  { source: "สสส.", type: "โครงการสร้างเสริมสุขภาพ", url: "https://www.thaihealth.or.th", status: "connected", datasets: 32, icon: "T" },
  { source: "พอช.", type: "องค์กรชุมชน/สวัสดิการชุมชน", url: "https://www.codi.or.th", status: "connected", datasets: 18, icon: "C" },
  { source: "สภาพัฒน์ (NESDC)", type: "GPP จังหวัด/พัฒนาเศรษฐกิจสังคม", url: "https://www.nesdc.go.th", status: "pending", datasets: 28, icon: "N" },
  { source: "สำนักงานสถิติ (NSO)", type: "สำมะโนประชากร/สำรวจครัวเรือน", url: "https://www.nso.go.th", status: "connected", datasets: 52, icon: "S" },
  { source: "กรมส่งเสริมฯ (DLA)", type: "ข้อมูล อปท./อบจ./งบประมาณท้องถิ่น", url: "https://www.dla.go.th", status: "pending", datasets: 15, icon: "D" },
  { source: "HDC (กสธ.)", type: "ข้อมูลสุขภาพ 43 แฟ้ม รายจังหวัด", url: "https://hdcservice.moph.go.th", status: "connected", datasets: 67, icon: "M" },
  { source: "TPMAP", type: "ความยากจนหลายมิติ/กลุ่มเปราะบาง", url: "https://www.tpmap.in.th", status: "connected", datasets: 24, icon: "P" },
];

// Timeline: ปฏิทินประชุม ภสพ. + KM + กิจกรรมโครงการ
// (จากเอกสารปฏิทินประชุม 2569-2571 ใน Google Drive)
const timelineData = [
  { month: "มิ.ย. 69", event: "เริ่มโครงการ Phase 2 / ชี้แจงจังหวัดใหม่ 8 จว.", status: "completed", type: "milestone" },
  { month: "5 มี.ค. 69", event: "KM 1: ปรับฐานแนวคิด (Mindset) — สามเหลี่ยมเข้มแข็ง, Area-based", status: "completed", type: "km" },
  { month: "2 เม.ย. 69", event: "KM 2: SDG Localization — COPEM Assessment / ผลลัพธ์เชิงเปรียบเทียบ 5 จว.", status: "completed", type: "km" },
  { month: "4 มิ.ย. 69", event: "KM 3: นวัตกรรม Dustboy, Horizontal MOU, Policy Advocacy", status: "completed", type: "km" },
  { month: "2 ก.ค. 69", event: "KM 4: CSO เปลี่ยนบทบาทเป็น Area Strategist — Balance Adaptation Flexibility", status: "completed", type: "km" },
  { month: "15-16 ก.ค. 69", event: "ภสพ. 6/69 CEO สัญจรนครสวรรค์ — Co-Investment / DE / สิทธิชุมชน", status: "in_progress", type: "meeting" },
  { month: "19 ส.ค. 69", event: "ภสพ. 8/69 — ประชุมประจำเดือน (Online 11.00-16.30)", status: "upcoming", type: "meeting" },
  { month: "16 ก.ย. 69", event: "ภสพ. 9/69 — ประชุมประจำเดือน / เชื่อมต่อ SHARE ครบ 13 จว.", status: "upcoming", type: "meeting" },
  { month: "21 ต.ค. 69", event: "ภสพ. 10/69 — กำหนด Target Agenda ร่วมรายจังหวัด", status: "upcoming", type: "meeting" },
  { month: "พ.ย. 69", event: "ภสพ. 11/69 — พี่เลี้ยงลงพื้นที่ รอบ 1", status: "upcoming", type: "meeting" },
  { month: "16 ธ.ค. 69", event: "ภสพ. 12/69 — ประเมิน Milestone Gating ครั้งที่ 1", status: "upcoming", type: "meeting" },
  { month: "20 ม.ค. 70", event: "ภสพ. 1/70 — CoP ครั้งที่ 1 / แลกเปลี่ยนเรียนรู้ข้ามจังหวัด", status: "upcoming", type: "meeting" },
  { month: "17 ก.พ. 70", event: "ภสพ. 2/70 — พี่เลี้ยงลงพื้นที่ รอบ 2", status: "upcoming", type: "meeting" },
  { month: "17 มี.ค. 70", event: "ภสพ. 3/70 — ทบทวน Target Agenda กลางโครงการ", status: "upcoming", type: "meeting" },
  { month: "21 เม.ย. 70", event: "ภสพ. 4/70 — ประเมิน Milestone Gating ครั้งที่ 2", status: "upcoming", type: "meeting" },
  { month: "พ.ค. 70", event: "รายงานกลางปี + ปรับแผนยุทธศาสตร์", status: "upcoming", type: "milestone" },
  { month: "มิ.ย.-ส.ค. 70", event: "ขับเคลื่อนมาตรการรายพื้นที่ + ขยายตำบล", status: "upcoming", type: "activity" },
  { month: "ก.ย. 70", event: "ประเมิน Level จังหวัด (Tiered Assessment)", status: "upcoming", type: "milestone" },
  { month: "ต.ค.-พ.ย. 70", event: "CoP ครั้งที่ 2 / Milestone Gating ครั้งที่ 3", status: "upcoming", type: "milestone" },
  { month: "ธ.ค. 70", event: "ถอดบทเรียน + จัดทำชุดความรู้", status: "upcoming", type: "activity" },
  { month: "ม.ค. 71", event: "เวทีนโยบายระดับชาติ + ข้อเสนอเชิงนโยบาย", status: "upcoming", type: "milestone" },
  { month: "ก.พ.-มี.ค. 71", event: "ประเมินผลโครงการ (DE) โดย สวรส./นิด้า", status: "upcoming", type: "activity" },
  { month: "เม.ย. 71", event: "สรุปโครงการ / ส่งมอบข้อเสนอเชิงนโยบาย", status: "upcoming", type: "milestone" },
  { month: "พ.ค. 71", event: "สิ้นสุดโครงการ / รายงานฉบับสมบูรณ์", status: "upcoming", type: "milestone" },
];

// ข้อค้นพบ NIDA (DE) รายจังหวัด — จากรายงาน ดร.พีรพร (ก.ค. 69)
const nidaFindings = {
  "เชียงราย": { model: "สมัชชาเชียงรายลานนาแห่งความสุข", strategy: "กลยุทธ์ 8+1 ประเด็น", coverage: "18 อำเภอ 124 ตำบล 143 อปท.", keyAction: "ยกร่างธรรมนูญจังหวัด (Roadmap 69-72)", strength: "Think Tank วิชาการ 3 มหาวิทยาลัย + เครือข่ายชาติพันธุ์", challenge: "KM / การตรวจสอบบัญชียังล่าช้า" },
  "นครสวรรค์": { model: "5 โซนภูมิเวศวัฒนธรรม + สภาพลเมือง", strategy: "Sandbox สิทธิชุมชน + สังคมสูงวัย", coverage: "30 องค์กร 15 เครือข่าย", keyAction: "ธรรมนูญ 4 ดี / AI เพื่อนใจพ่อแม่ / e-Living Will 42.91% ขึ้นทะเบียน", strength: "ทุนสังคม 30+ ปี / ผู้ว่าฯ หนุนเต็มที่", challenge: "ระเบียบงบประมาณข้ามหน่วยงาน / เหมืองแร่-สิทธิที่ดิน" },
  "ขอนแก่น": { model: "ขอนแก่น อยู่ดีมีแฮง ฮักแพงแบ่งปัน", strategy: "Sponge City + บ้านฝางโมเดล + สาวะถีโมเดล", coverage: "CSO 60+ กลุ่ม / 4-5 เทศบาลร่วม", keyAction: "ทลายกำแพงเขตแดนราชการจัดการน้ำท่วม / ไข่ดาว Model ลดอุบัติเหตุ", strength: "ทีมเลขาฯ เข้มแข็ง / Evidence-based", challenge: "ระบบอุปถัมภ์-บังคับใช้กฎหมาย PM2.5" },
  "พัทลุง": { model: "พัทลุงมหานครแห่งความสุข", strategy: "4 เมืองเป้าหมาย + เบญจภาค", coverage: "11 อำเภอ / สมาคม+กองทุนเป็นนิติบุคคล", keyAction: "อบจ. ออกคำสั่งแต่งตั้ง / Roadmap ถึง 2575 / ป่าต้นน้ำ Dashboard", strength: "Institutionalized — สมาคม+กองทุนพึ่งตนเอง", challenge: "นโยบายรัฐยังไม่ตอบโจทย์พื้นที่ / Silos ราชการ" },
  "ตราด": { model: "เด็กตราด สุข สง่าดีฮ + ปัญจปฏก 5 ดี", strategy: "Seamless Model + ตะกาง NCDs Model", coverage: "22 องค์กร / 64 ศพด. / 40 กรรมการ", keyAction: "ธรรมนูญสุขภาพตำบล 8 ฉบับ / หมอน้อยในโรงเรียน", strength: "แกนนำเกาะติดพื้นที่ / DE ช่วยปรับทิศทาง", challenge: "ภัยพิบัติชายแดน / ขอบเขตงานไม่ชัดเจนระยะแรก" },
};

// 4 กลุ่มวัย
const targetGroupData = [
  { name: "เด็กเล็ก (0-5 ปี)", coverage: 72, target: 85, indicator: "พัฒนาการสมวัย, โภชนาการ" },
  { name: "วัยรุ่น (6-18 ปี)", coverage: 65, target: 80, indicator: "สุขภาพจิต, ยาเสพติด, ท้องไม่พร้อม" },
  { name: "วัยทำงาน (19-59 ปี)", coverage: 58, target: 75, indicator: "NCDs, อาชีวอนามัย, หนี้สิน" },
  { name: "ผู้สูงอายุ (60+ ปี)", coverage: 78, target: 90, indicator: "LTC, พึ่งพิง, สวัสดิการ" },
];

// แนวโน้มรายเดือน (ข้อมูลจาก KM + COPEM Assessment)
const trendData = [
  { month: "มี.ค. 69", phase1Avg: 55, phase2Avg: 0, km: "KM1" },
  { month: "เม.ย. 69", phase1Avg: 60, phase2Avg: 0, km: "KM2" },
  { month: "พ.ค. 69", phase1Avg: 63, phase2Avg: 0 },
  { month: "มิ.ย. 69", phase1Avg: 65, phase2Avg: 15, km: "KM3" },
  { month: "ก.ค. 69", phase1Avg: 68, phase2Avg: 28, km: "KM4" },
];

// ข้อมูลประชุม ภสพ. วันนี้ (16 ก.ค. 69)
const todayMeeting = {
  title: "ภสพ. ครั้งที่ 6/2569 — CEO สัญจรนครสวรรค์",
  date: "15-16 ก.ค. 2569",
  location: "สปสช. เขต 3 นครสวรรค์ + วัดคีรีสวรรค์",
  chairman: "ศ.ดร.บรรเจิด สิงคะเนติ",
  agenda: [
    { id: "3.1", title: "ความก้าวหน้าภาคีอาสานครสวรรค์ (สช.+สภาพลเมือง+Sandbox)", presenter: "บัณฑิต มั่นคง / ผศ.ดร.วรภพ / วิสุทธิ", status: "completed" },
    { id: "5.1", title: "Co-Investment เชื่อมทุน: ข้อมูล วิชาการ งบประมาณ", presenter: "นพ.ปรีดา แต้อารักษ์", status: "in_progress" },
    { id: "5.2", title: "DE — Developmental Evaluation เสริมพลัง", presenter: "ผศ.ดร.กรณ์ / ดร.พีรพร (นิด้า)", status: "upcoming" },
    { id: "6.1", title: "ปฏิทินประชุมปี 2569-2571", presenter: "ปรานอม โอสาร", status: "upcoming" },
  ],
  onlineParticipants: "13 จังหวัด: เชียงราย พิษณุโลก นครสวรรค์ ปทุมธานี สุพรรณบุรี ตราด ขอนแก่น บึงกาฬ ชัยภูมิ อุบลราชธานี กระบี่ พัทลุง กรุงเทพมหานคร",
};

const COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316","#14B8A6","#6366F1","#D946EF","#84CC16","#0EA5E9"];

// ============================================================
// Shared Components
// ============================================================

const StatCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      {trend !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
          trend > 0 ? 'bg-green-50 text-green-600' : trend < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
        }`}>
          {trend > 0 ? <ArrowUpRight size={10}/> : trend < 0 ? <ArrowDownRight size={10}/> : <Minus size={10}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
  </div>
);

const LevelBadge = ({ level }) => {
  const c = { 1: { bg:"bg-amber-50", text:"text-amber-700", border:"border-amber-200", label:"Engage" },
              2: { bg:"bg-blue-50", text:"text-blue-700", border:"border-blue-200", label:"Operate" },
              3: { bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-200", label:"Sustain" } }[level];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}><Star size={10}/> L{level}: {c.label}</span>;
};

const ProgressBar = ({ value, max, color = "#3B82F6", height = 6 }) => (
  <div className="w-full bg-gray-100 rounded-full" style={{ height }}>
    <div className="rounded-full transition-all duration-500" style={{ width: `${Math.min((value/max)*100,100)}%`, height, backgroundColor: color }} />
  </div>
);

const SeverityBadge = ({ severity }) => {
  const c = { high: "bg-red-50 text-red-700 border-red-200", medium: "bg-amber-50 text-amber-700 border-amber-200", low: "bg-blue-50 text-blue-700 border-blue-200" }[severity];
  const label = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" }[severity];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${c}`}>{label}</span>;
};

// ============================================================
// Main Dashboard
// ============================================================

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("executive");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState("all");

  const filteredProvinces = useMemo(() => {
    if (phaseFilter === "1") return PROVINCES_PHASE1.map(p=>p.name);
    if (phaseFilter === "2") return PROVINCES_PHASE2.map(p=>p.name);
    return ALL_PROVINCE_NAMES;
  }, [phaseFilter]);

  const filtered = (data) => data.filter(d => filteredProvinces.includes(d.province));
  const fTWBI = useMemo(() => filtered(twbiData), [filteredProvinces]);
  const fPart = useMemo(() => filtered(participationData), [filteredProvinces]);
  const fRes = useMemo(() => filtered(resourceData), [filteredProvinces]);
  const fOut = useMemo(() => filtered(outcomeData), [filteredProvinces]);

  const avgTWBI = (fTWBI.reduce((s,d)=>s+d.twbiScore,0)/fTWBI.length).toFixed(1);
  const totalCoInvest = fRes.reduce((s,d)=>s+d.coInvestTotal,0).toFixed(1);
  const totalTambon = fPart.reduce((s,d)=>s+d.activeTambon,0);
  const totalTargetTambon = fPart.reduce((s,d)=>s+d.targetTambon,0);
  const lvl3Count = fPart.filter(p=>p.level===3).length;
  const lvl2Count = fPart.filter(p=>p.level===2).length;
  const lvl1Count = fPart.filter(p=>p.level===1).length;

  const selectedData = useMemo(() => {
    if (!selectedProvince) return null;
    const meta = ALL_PROVINCE_META.find(p=>p.name===selectedProvince);
    return {
      meta,
      twbi: twbiData.find(d=>d.province===selectedProvince),
      part: participationData.find(d=>d.province===selectedProvince),
      res: resourceData.find(d=>d.province===selectedProvince),
      out: outcomeData.find(d=>d.province===selectedProvince),
      share: shareData.find(d=>d.province===selectedProvince),
    };
  }, [selectedProvince]);

  const tabs = [
    { id: "executive", label: "สรุปผู้บริหาร", icon: Eye },
    { id: "overview", label: "ภาพรวม", icon: BarChart3 },
    { id: "provinces", label: "รายจังหวัด", icon: MapPin },
    { id: "twbi", label: "TWBI & SHARE", icon: Database },
    { id: "resources", label: "ทรัพยากร", icon: Layers },
    { id: "opendata", label: "ฐานข้อมูลเปิด", icon: Globe },
    { id: "timeline", label: "แผนดำเนินงาน", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target size={22} />
                <h1 className="text-lg font-bold">Dashboard กำกับติดตามโครงการสานพลังพื้นที่เข้มแข็ง</h1>
              </div>
              <p className="text-blue-200 text-xs">Target Ecosystem | Phase 1 (5 จว.) & Phase 2 (8 จว.) | 9 ภาคียุทธศาสตร์ | {PROJECT_PERIOD}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-[10px] text-blue-200">
                <div>ข้อมูล ณ 16 ก.ค. 2569</div>
                <div>SHARE | TWBI | Open Gov Data</div>
              </div>
              <select value={phaseFilter} onChange={e=>{setPhaseFilter(e.target.value); setSelectedProvince(null);}}
                className="bg-white/10 backdrop-blur text-white text-xs rounded-lg px-3 py-1.5 border border-white/20 focus:outline-none">
                <option value="all" className="text-gray-800">ทุกระยะ (13 จว.)</option>
                <option value="1" className="text-gray-800">Phase 1 (5 จว.)</option>
                <option value="2" className="text-gray-800">Phase 2 (8 จว.)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0.5 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={()=>{setActiveTab(tab.id); setSelectedProvince(null);}}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab===tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                <tab.icon size={14}/>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ==================== TAB: สรุปผู้บริหาร ==================== */}
        {activeTab === "executive" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard icon={MapPin} label="จังหวัด" value="13" subValue="P1: 5 จว. | P2: 8 จว." color="#3B82F6" />
              <StatCard icon={Activity} label="TWBI เฉลี่ย" value={avgTWBI} subValue="Well-being Index" color="#10B981" trend={4.8} />
              <StatCard icon={TrendingUp} label="Co-invest รวม" value={`${totalCoInvest} ล.บ.`} subValue="ทุกแหล่งทุน" color="#F59E0B" trend={12.3} />
              <StatCard icon={Users} label="ตำบลดำเนินการ" value={`${totalTambon}/${totalTargetTambon}`} subValue={`${((totalTambon/totalTargetTambon)*100).toFixed(0)}% ของเป้าหมาย`} color="#8B5CF6" trend={15} />
              <StatCard icon={Building2} label="ภาคียุทธศาสตร์" value="9" subValue="หน่วยงานร่วมขับเคลื่อน" color="#06B6D4" />
            </div>

            {/* ประชุมวันนี้ */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border border-amber-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <Bell size={15} className="text-amber-600"/>ประชุมวันนี้: {todayMeeting.title}
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{todayMeeting.date}</span>
              </div>
              <div className="text-[11px] text-gray-600 mb-2">
                <span className="font-medium">สถานที่:</span> {todayMeeting.location} | <span className="font-medium">ประธาน:</span> {todayMeeting.chairman}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                {todayMeeting.agenda.map(a => (
                  <div key={a.id} className={`p-2 rounded-lg border ${a.status==='completed'?'bg-green-50 border-green-200':a.status==='in_progress'?'bg-blue-50 border-blue-300 ring-1 ring-blue-200':'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      {a.status==='completed'?<CheckCircle size={11} className="text-green-500"/>:a.status==='in_progress'?<Activity size={11} className="text-blue-500"/>:<Clock size={11} className="text-gray-400"/>}
                      <span className="text-[10px] font-bold text-gray-600">วาระ {a.id}</span>
                    </div>
                    <div className="text-[10px] text-gray-700 font-medium leading-tight">{a.title}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{a.presenter}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-amber-700 bg-amber-100/50 rounded p-1.5">
                <strong>Online:</strong> {todayMeeting.onlineParticipants}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Layers size={15} className="text-purple-500"/>สรุประดับจังหวัด (Tiered Participation)
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[{name:"L3: Sustain",value:lvl3Count},{name:"L2: Operate",value:lvl2Count},{name:"L1: Engage",value:lvl1Count}]}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      <Cell fill="#10B981"/><Cell fill="#3B82F6"/><Cell fill="#F59E0B"/>
                    </Pie>
                    <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center text-xs text-gray-500 mt-1">L3: {lvl3Count} จว. | L2: {lvl2Count} จว. | L1: {lvl1Count} จว.</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Bell size={15} className="text-red-500"/>แจ้งเตือนความเสี่ยง ({riskAlerts.length} รายการ)
                </h3>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {riskAlerts.map((r,i) => (
                    <div key={i} className={`p-3 rounded-lg border ${r.severity==='high'?'bg-red-50 border-red-100':r.severity==='medium'?'bg-amber-50 border-amber-100':'bg-blue-50 border-blue-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={13} className={r.severity==='high'?'text-red-500':r.severity==='medium'?'text-amber-500':'text-blue-500'}/>
                        <span className="text-xs font-bold text-gray-800">{r.province}</span>
                        <SeverityBadge severity={r.severity}/>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-1">{r.message}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1"><ChevronRight size={10}/><strong>แนวทาง:</strong> {r.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* พี่เลี้ยง-น้องเลี้ยง */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={15} className="text-orange-500"/>ระบบพี่เลี้ยง-น้องเลี้ยง (Peer Learning)
                </h3>
                <div className="space-y-2">
                  {PROVINCES_PHASE1.map(mentor => {
                    const mentees = PROVINCES_PHASE2.filter(p=>p.mentor===mentor.name);
                    const mentorPart = participationData.find(p=>p.province===mentor.name);
                    return (
                      <div key={mentor.name} className="p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400"/>
                          <span className="text-xs font-bold text-blue-700">{mentor.name}</span>
                          <span className="text-[10px] text-gray-400">เขต {mentor.zone}</span>
                          <LevelBadge level={mentorPart?.level || 1}/>
                        </div>
                        <div className="ml-4 flex flex-wrap gap-1.5">
                          {mentees.map(m => (
                            <button key={m.name} onClick={()=>{setSelectedProvince(m.name); setActiveTab("provinces");}}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 border border-orange-100 hover:border-orange-300 transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"/>
                              <span className="text-[11px] text-orange-700">{m.name}</span>
                              <span className="text-[9px] text-gray-400">ขต{m.zone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trend */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp size={15} className="text-green-500"/>แนวโน้มความก้าวหน้ารายเดือน (% ผลลัพธ์เฉลี่ย)
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData} margin={{top:5,right:10,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="month" tick={{fontSize:11}}/>
                    <YAxis domain={[0,100]} tick={{fontSize:10}}/>
                    <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
                    <Line type="monotone" dataKey="phase1Avg" name="Phase 1 เฉลี่ย" stroke="#3B82F6" strokeWidth={2} dot={{r:4}}/>
                    <Line type="monotone" dataKey="phase2Avg" name="Phase 2 เฉลี่ย" stroke="#F97316" strokeWidth={2} dot={{r:4}}/>
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 p-2 bg-indigo-50 rounded-lg">
                  <p className="text-[10px] text-indigo-700 font-medium">สถานะ ณ ก.ค. 69: Phase 1 เฉลี่ย 68% | Phase 2 เฉลี่ย 28% — เพิ่งเริ่มต้นเดือนที่ 2 ต้องเร่งจังหวัดที่ยังไม่มี Node Manager</p>
                </div>
              </div>
            </div>

            {/* 9 ภาคี */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Building2 size={15} className="text-blue-500"/>ภาคียุทธศาสตร์ 9 หน่วยงาน</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PARTNER_AGENCIES.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{backgroundColor:a.color}}>{a.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700">{a.name} <span className="font-normal text-gray-400">— {a.fullName}</span></div>
                      <div className="text-[10px] text-gray-500 truncate">{a.role}</div>
                    </div>
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ภาพรวม ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={MapPin} label="จังหวัดดำเนินการ" value={filteredProvinces.length} subValue={phaseFilter==='all'?'P1:5 | P2:8':phaseFilter==='1'?'Phase 1':'Phase 2'} color="#3B82F6"/>
              <StatCard icon={Activity} label="TWBI เฉลี่ย" value={avgTWBI} subValue="Thailand Well-being Index" color="#10B981" trend={4.8}/>
              <StatCard icon={TrendingUp} label="Co-invest รวม" value={`${totalCoInvest} ล.บ.`} subValue="จากทุกแหล่งทุน" color="#F59E0B" trend={12.3}/>
              <StatCard icon={Users} label="ตำบลขับเคลื่อน" value={totalTambon} subValue={`เป้า ${totalTargetTambon} ตำบล`} color="#8B5CF6" trend={15}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Target size={15} className="text-indigo-500"/>ตัวชี้วัดผลลัพธ์ O1–O4</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={fOut} margin={{top:5,right:10,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="province" tick={{fontSize:8}} angle={-40} textAnchor="end" height={70}/>
                    <YAxis domain={[0,100]} tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{fontSize:11}}/><Legend wrapperStyle={{fontSize:10}}/>
                    <Bar dataKey="O1_partnership" name="O1: กลไกภาคี" fill="#3B82F6" radius={[2,2,0,0]}/>
                    <Bar dataKey="O2_dataUsage" name="O2: ใช้ข้อมูลนำ" fill="#10B981" radius={[2,2,0,0]}/>
                    <Bar dataKey="O3_coInvestment" name="O3: Co-invest" fill="#F59E0B" radius={[2,2,0,0]}/>
                    <Bar dataKey="O4_wellbeing" name="O4: สุขภาวะ" fill="#EF4444" radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Layers size={15} className="text-purple-500"/>ระดับการมีส่วนร่วม</h3>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {fPart.map((p,i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={()=>{setSelectedProvince(p.province); setActiveTab("provinces");}}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.phase===1?'bg-blue-400':'bg-orange-400'}`}/>
                      <span className="w-28 text-xs font-medium text-gray-700 truncate">{p.province}</span>
                      <LevelBadge level={p.level}/>
                      <div className="flex-1"><ProgressBar value={p.milestoneCompleted} max={p.milestoneTotal} color={p.level===3?"#10B981":p.level===2?"#3B82F6":"#F59E0B"}/></div>
                      <span className="text-[10px] text-gray-500 w-10 text-right">{p.milestoneCompleted}/{p.milestoneTotal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Heart size={15} className="text-red-500"/>กลุ่มเป้าหมาย 4 กลุ่มวัย + Disaster Response</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {targetGroupData.map((g,i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-700 mb-1">{g.name}</div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-xl font-bold" style={{color:COLORS[i]}}>{g.coverage}%</span>
                      <span className="text-[10px] text-gray-400 mb-0.5">/ เป้า {g.target}%</span>
                    </div>
                    <ProgressBar value={g.coverage} max={100} color={COLORS[i]} height={6}/>
                    <div className="text-[10px] text-gray-400 mt-1.5">{g.indicator}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: รายจังหวัด ==================== */}
        {activeTab === "provinces" && (
          <div className="space-y-4">
            {!selectedProvince ? (
              <>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">เลือกจังหวัดเพื่อดูรายละเอียด</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {ALL_PROVINCE_META.filter(p=>filteredProvinces.includes(p.name)).map(prov => {
                      const part = participationData.find(d=>d.province===prov.name);
                      const twbi = twbiData.find(d=>d.province===prov.name);
                      return (
                        <button key={prov.name} onClick={()=>setSelectedProvince(prov.name)}
                          className="text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${prov.phase===1?'bg-blue-400':'bg-orange-400'}`}/>
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">{prov.name}</span>
                          </div>
                          <LevelBadge level={part?.level || 1}/>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>TWBI: {twbi?.twbiScore}</span>
                            <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400"/>
                          </div>
                          <div className="mt-1 text-[10px] text-gray-400">เขต {prov.zone} {prov.mentor && `| พี่เลี้ยง: ${prov.mentor}`}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">เปรียบเทียบ TWBI Score</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={fTWBI} margin={{top:5,right:10,left:0,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                      <XAxis dataKey="province" tick={{fontSize:9}} angle={-35} textAnchor="end" height={65}/>
                      <YAxis domain={[0,100]} tick={{fontSize:10}}/><Tooltip/>
                      <Bar dataKey="twbiScore" name="TWBI Score" radius={[4,4,0,0]}>
                        {fTWBI.map((e,i) => <Cell key={i} fill={e.phase===1?"#3B82F6":"#F97316"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <button onClick={()=>setSelectedProvince(null)} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">← กลับหน้ารวม</button>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${selectedData?.meta?.phase===1?'bg-blue-500':'bg-orange-500'}`}>
                      {selectedProvince[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{selectedProvince === "กรุงเทพมหานคร" ? "กรุงเทพมหานคร" : `จังหวัด${selectedProvince}`}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>Phase {selectedData?.meta?.phase}</span>
                        <span>| เขตสุขภาพ {selectedData?.meta?.zone}</span>
                        {selectedData?.meta?.mentor && <span>| พี่เลี้ยง: <strong className="text-blue-600">{selectedData.meta.mentor}</strong></span>}
                        <LevelBadge level={selectedData?.part?.level || 1}/>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <StatCard icon={Activity} label="TWBI Score" value={selectedData?.twbi?.twbiScore} color="#10B981"/>
                    <StatCard icon={TrendingUp} label="Co-invest" value={`${selectedData?.res?.coInvestTotal} ล.บ.`} color="#F59E0B"/>
                    <StatCard icon={MapPin} label="ตำบลดำเนินการ" value={`${selectedData?.part?.activeTambon}/${selectedData?.part?.targetTambon}`} color="#3B82F6"/>
                    <StatCard icon={Database} label="SHARE Datasets" value={selectedData?.share?.datasets} subValue={`อัปเดต: ${selectedData?.share?.lastUpdate}`} color="#8B5CF6"/>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">มิติสุขภาวะ (TWBI 6 มิติ)</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={[
                          {dim:"สุขภาพ",value:selectedData?.twbi?.health},
                          {dim:"การศึกษา",value:selectedData?.twbi?.education},
                          {dim:"เศรษฐกิจ",value:selectedData?.twbi?.economy},
                          {dim:"สิ่งแวดล้อม",value:selectedData?.twbi?.environment},
                          {dim:"ความปลอดภัย",value:selectedData?.twbi?.safety},
                          {dim:"ธรรมาภิบาล",value:selectedData?.twbi?.governance},
                        ]}>
                          <PolarGrid stroke="#e5e7eb"/><PolarAngleAxis dataKey="dim" tick={{fontSize:10}}/>
                          <PolarRadiusAxis domain={[0,100]} tick={{fontSize:8}}/>
                          <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">แหล่ง Co-investment (ล้านบาท)</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={[
                            {name:"สปสช.",value:selectedData?.res?.nhsoFund},
                            {name:"สสส.",value:selectedData?.res?.thaiHealthFund},
                            {name:"พอช.",value:selectedData?.res?.codiFund},
                            {name:"งบจังหวัด/อบจ.",value:selectedData?.res?.provincialBudget},
                            {name:"สวัสดิการชุมชน",value:selectedData?.res?.communityWelfare},
                          ]} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                            {["#EF4444","#10B981","#8B5CF6","#F59E0B","#06B6D4"].map((c,i)=><Cell key={i} fill={c}/>)}
                          </Pie>
                          <Tooltip formatter={v=>`${v} ล.บ.`}/><Legend wrapperStyle={{fontSize:10}}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* NIDA Findings */}
                  {nidaFindings[selectedProvince] && (
                    <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                        <FileText size={13}/>ข้อค้นพบ DE (นิด้า) — ก.ค. 69
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><strong className="text-purple-600">โมเดล:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].model}</span></div>
                        <div><strong className="text-purple-600">กลยุทธ์:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].strategy}</span></div>
                        <div><strong className="text-purple-600">ขอบเขต:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].coverage}</span></div>
                        <div><strong className="text-purple-600">Key Action:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].keyAction}</span></div>
                        <div><strong className="text-green-600">จุดแข็ง:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].strength}</span></div>
                        <div><strong className="text-amber-600">ความท้าทาย:</strong> <span className="text-gray-700">{nidaFindings[selectedProvince].challenge}</span></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">ผลลัพธ์ O1–O4</h4>
                      {[{key:"O1_partnership",label:"O1: กลไกภาคีทำงานร่วม",color:"#3B82F6"},
                        {key:"O2_dataUsage",label:"O2: ใช้ข้อมูลนำการตัดสินใจ",color:"#10B981"},
                        {key:"O3_coInvestment",label:"O3: Co-investment",color:"#F59E0B"},
                        {key:"O4_wellbeing",label:"O4: สุขภาวะประชาชน",color:"#EF4444"}
                      ].map(o=>(
                        <div key={o.key} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{o.label}</span>
                            <span className="font-semibold" style={{color:o.color}}>{selectedData?.out?.[o.key]}%</span>
                          </div>
                          <ProgressBar value={selectedData?.out?.[o.key] || 0} max={100} color={o.color} height={6}/>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">สถานะเชิงปฏิบัติการ</h4>
                      <div className="space-y-1.5">
                        {[{label:"Decision Arena จังหวัด",ok:selectedData?.part?.decisionArena},
                          {label:"Node Manager ประจำการ",ok:selectedData?.part?.nodeManager},
                          {label:"เชื่อมต่อ SHARE Platform",ok:selectedData?.part?.shareConnected},
                          {label:"กำหนด Target Agenda",ok:selectedData?.part?.targetAgenda},
                          {label:"Milestone >= 3",ok:(selectedData?.part?.milestoneCompleted||0)>=3},
                          {label:"ตำบลดำเนินการ >= 50%",ok:selectedData?.part ? (selectedData.part.activeTambon/selectedData.part.targetTambon)>=0.5 : false},
                        ].map((item,i)=>(
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                            {item.ok ? <CheckCircle size={13} className="text-green-500"/> : <Clock size={13} className="text-amber-500"/>}
                            <span className="text-xs text-gray-700 flex-1">{item.label}</span>
                            <span className={`text-[10px] font-medium ${item.ok?'text-green-600':'text-amber-600'}`}>{item.ok?"ผ่าน":"รอดำเนินการ"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: TWBI & SHARE ==================== */}
        {activeTab === "twbi" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Database size={15} className="text-indigo-500"/>TWBI — 6 มิติสุขภาวะ</h3>
              <p className="text-[10px] text-gray-400 mb-3">ข้อมูลจาก SHARE Platform เชื่อมกับ HDC, NSO, TPMAP, สภาพัฒน์</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fTWBI} margin={{top:5,right:10,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="province" tick={{fontSize:8}} angle={-40} textAnchor="end" height={70}/>
                  <YAxis domain={[0,100]} tick={{fontSize:10}}/><Tooltip/><Legend wrapperStyle={{fontSize:10}}/>
                  <Bar dataKey="health" name="สุขภาพ" fill="#EF4444" stackId="a"/>
                  <Bar dataKey="education" name="การศึกษา" fill="#3B82F6" stackId="a"/>
                  <Bar dataKey="economy" name="เศรษฐกิจ" fill="#F59E0B" stackId="a"/>
                  <Bar dataKey="environment" name="สิ่งแวดล้อม" fill="#10B981" stackId="a"/>
                  <Bar dataKey="safety" name="ความปลอดภัย" fill="#8B5CF6" stackId="a"/>
                  <Bar dataKey="governance" name="ธรรมาภิบาล" fill="#06B6D4" stackId="a"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Shield size={15} className="text-cyan-500"/>SHARE Platform — สถานะรายจังหวัด</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left p-2 font-semibold text-gray-600">จังหวัด</th>
                    <th className="text-center p-2 font-semibold text-gray-600">Phase</th>
                    <th className="text-center p-2 font-semibold text-gray-600">เขต</th>
                    <th className="text-center p-2 font-semibold text-gray-600">Datasets</th>
                    <th className="text-center p-2 font-semibold text-gray-600">ผู้ใช้</th>
                    <th className="text-center p-2 font-semibold text-gray-600">รายงาน</th>
                    <th className="text-center p-2 font-semibold text-gray-600">อัปเดตล่าสุด</th>
                    <th className="text-center p-2 font-semibold text-gray-600">สถานะ</th>
                  </tr></thead>
                  <tbody>
                    {shareData.filter(d=>filteredProvinces.includes(d.province)).map((d,i) => {
                      const part = participationData.find(p=>p.province===d.province);
                      const meta = ALL_PROVINCE_META.find(p=>p.name===d.province);
                      return (
                        <tr key={i} className="border-t border-gray-50 hover:bg-blue-50">
                          <td className="p-2 font-medium text-gray-700">{d.province}</td>
                          <td className="p-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${part?.phase===1?'bg-blue-50 text-blue-600':'bg-orange-50 text-orange-600'}`}>P{part?.phase}</span></td>
                          <td className="p-2 text-center text-gray-500">{meta?.zone}</td>
                          <td className="p-2 text-center font-semibold text-indigo-600">{d.datasets}</td>
                          <td className="p-2 text-center">{d.users}</td>
                          <td className="p-2 text-center">{d.reports}</td>
                          <td className="p-2 text-center text-gray-500">{d.lastUpdate}</td>
                          <td className="p-2 text-center">{part?.shareConnected ? <CheckCircle size={13} className="text-green-500 mx-auto"/> : <AlertTriangle size={13} className="text-amber-500 mx-auto"/>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ทรัพยากร ==================== */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Layers size={15} className="text-yellow-500"/>Co-investment รายจังหวัด (ล้านบาท)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fRes} margin={{top:5,right:10,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="province" tick={{fontSize:8}} angle={-40} textAnchor="end" height={70}/>
                  <YAxis tick={{fontSize:10}}/><Tooltip formatter={v=>`${v} ล.บ.`}/><Legend wrapperStyle={{fontSize:10}}/>
                  <Bar dataKey="nhsoFund" name="สปสช." fill="#EF4444" stackId="a"/>
                  <Bar dataKey="thaiHealthFund" name="สสส." fill="#10B981" stackId="a"/>
                  <Bar dataKey="codiFund" name="พอช." fill="#8B5CF6" stackId="a"/>
                  <Bar dataKey="provincialBudget" name="งบจังหวัด/อบจ." fill="#F59E0B" stackId="a"/>
                  <Bar dataKey="communityWelfare" name="สวัสดิการชุมชน" fill="#06B6D4" stackId="a"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">สัดส่วนแหล่งทุนรวม</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={[
                      {name:"สปสช.",value:parseFloat(fRes.reduce((s,d)=>s+d.nhsoFund,0).toFixed(1))},
                      {name:"สสส.",value:parseFloat(fRes.reduce((s,d)=>s+d.thaiHealthFund,0).toFixed(1))},
                      {name:"พอช.",value:parseFloat(fRes.reduce((s,d)=>s+d.codiFund,0).toFixed(1))},
                      {name:"งบจังหวัด/อบจ.",value:parseFloat(fRes.reduce((s,d)=>s+d.provincialBudget,0).toFixed(1))},
                      {name:"สวัสดิการชุมชน",value:parseFloat(fRes.reduce((s,d)=>s+d.communityWelfare,0).toFixed(1))},
                    ]} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {["#EF4444","#10B981","#8B5CF6","#F59E0B","#06B6D4"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip formatter={v=>`${v} ล.บ.`}/><Legend wrapperStyle={{fontSize:10}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ทรัพยากรไม่ใช่ตัวเงิน (ทุนทางสังคม)</h3>
                <div className="space-y-2">
                  {[{label:"อสม.",value:"~1,040,000 คน",desc:"กำลังคนฐานราก"},
                    {label:"สภาองค์กรชุมชนตำบล",value:"7,800+ แห่ง",desc:"เวทีตัดสินใจชุมชน"},
                    {label:"กองทุนสวัสดิการชุมชน",value:"5,000+ แห่ง",desc:"ชุมชนเป็นเจ้าของ"},
                    {label:"เครือข่ายภาคประชาสังคม",value:"หลากหลาย",desc:"มูลนิธิ สมาคม อาสา"},
                    {label:"ภูมิปัญญาท้องถิ่น",value:"ไม่จำกัด",desc:"ทุนวัฒนธรรมและความรู้"},
                    {label:"พื้นที่สาธารณะ",value:"ทุกตำบล",desc:"วัด โรงเรียน อปท."},
                  ].map((item,i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <Users size={13} className="text-purple-400 flex-shrink-0"/>
                      <div className="flex-1"><span className="text-xs font-medium text-gray-700">{item.label}</span><span className="text-[10px] text-gray-400 ml-1">— {item.desc}</span></div>
                      <span className="text-xs font-medium text-indigo-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ฐานข้อมูลเปิด ==================== */}
        {activeTab === "opendata" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><Globe size={15} className="text-green-500"/>แหล่งข้อมูลเปิดภาครัฐ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {openDataSources.map((src,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{backgroundColor:COLORS[i]}}>{src.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{src.source}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${src.status==='connected'?'bg-green-50 text-green-600':'bg-amber-50 text-amber-600'}`}>
                          {src.status==='connected'?'เชื่อมต่อแล้ว':'รอเชื่อมต่อ'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{src.type}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-indigo-600 font-medium">{src.datasets} ชุดข้อมูล</span>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:underline"><ExternalLink size={9}/>เว็บ</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size={15} className="text-blue-500"/>สถาปัตยกรรมข้อมูล Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[{title:"ระดับ 1: Input",items:["HDC 43 แฟ้ม (กสธ.)","กองทุน กปท./LTC/จังหวัด (สปสช.)","สำมะโนประชากร (NSO)","TPMAP ความยากจนหลายมิติ","องค์กรชุมชน (พอช.)","GPP จังหวัด (สภาพัฒน์)"],bg:"#EFF6FF",bg2:"#E0E7FF",tc:"#1D4ED8"},
                  {title:"ระดับ 2: Process",items:["SHARE Platform รวมศูนย์","คำนวณ TWBI 6 มิติ","Mapping ทรัพยากร Co-invest","วิเคราะห์ Tiered Participation","ตัวชี้วัดผลลัพธ์ O1–O4","Milestone Gating Assessment"],bg:"#ECFDF5",bg2:"#D1FAE5",tc:"#047857"},
                  {title:"ระดับ 3: Output",items:["Dashboard ผู้บริหาร/รายจังหวัด","Radar Chart สุขภาวะ","แจ้งเตือนความเสี่ยง (Alert)","รายงานอัตโนมัติ (Auto Report)","ข้อเสนอเชิงนโยบาย","API สำหรับจังหวัดใช้ข้อมูลร่วม"],bg:"#F5F3FF",bg2:"#EDE9FE",tc:"#6D28D9"},
                ].map((sec,i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100" style={{background:`linear-gradient(135deg, ${sec.bg}, ${sec.bg2})`}}>
                    <h4 className="text-xs font-bold mb-2" style={{color:sec.tc}}>{sec.title}</h4>
                    <ul className="text-[11px] text-gray-600 space-y-1">
                      {sec.items.map((item,j) => <li key={j}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: แผนดำเนินงาน ==================== */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock size={15} className="text-orange-500"/>แผนดำเนินงาน ({PROJECT_PERIOD})</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-blue-300 to-gray-200"/>
                <div className="space-y-2">
                  {timelineData.map((item,i) => (
                    <div key={i} className="flex items-start gap-3 ml-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        item.status==='completed'?'bg-green-500':item.status==='in_progress'?'bg-blue-500 ring-4 ring-blue-100':'bg-gray-200'
                      }`}>
                        {item.status==='completed'?<CheckCircle size={13} className="text-white"/>:item.status==='in_progress'?<Activity size={13} className="text-white"/>:<Clock size={13} className="text-gray-400"/>}
                      </div>
                      <div className={`flex-1 p-2.5 rounded-xl border ${
                        item.status==='completed'?'bg-green-50 border-green-100':item.status==='in_progress'?'bg-blue-50 border-blue-200 shadow-sm':'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-500">{item.month}</span>
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              item.type==='milestone'?'bg-indigo-100 text-indigo-700':
                              item.type==='meeting'?'bg-orange-100 text-orange-700':
                              item.type==='km'?'bg-purple-100 text-purple-700':
                              'bg-gray-100 text-gray-600'
                            }`}>{item.type==='milestone'?'Milestone':item.type==='meeting'?'ภสพ.':item.type==='km'?'KM/DE':'กิจกรรม'}</span>
                          </div>
                          <span className={`text-[10px] font-medium ${item.status==='completed'?'text-green-600':item.status==='in_progress'?'text-blue-600':'text-gray-400'}`}>
                            {item.status==='completed'?'เสร็จสิ้น':item.status==='in_progress'?'กำลังดำเนินการ':'รอดำเนินการ'}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-gray-800 mt-1">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Target size={15} className="text-indigo-500"/>สรุป Milestone Gating รายจังหวัด</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left p-2 font-semibold text-gray-600">จังหวัด</th>
                    <th className="text-center p-2 font-semibold text-gray-600">Phase</th>
                    <th className="text-center p-2 font-semibold text-gray-600">เขต</th>
                    <th className="text-center p-2 font-semibold text-gray-600">Level</th>
                    {[1,2,3,4,5,6,7].map(n=><th key={n} className="text-center p-1.5 font-semibold text-gray-600 w-8">M{n}</th>)}
                    <th className="text-center p-2 font-semibold text-gray-600">ผ่าน</th>
                  </tr></thead>
                  <tbody>
                    {filtered(participationData).map((p,i) => {
                      const meta = ALL_PROVINCE_META.find(m=>m.name===p.province);
                      return (
                        <tr key={i} className="border-t border-gray-50 hover:bg-blue-50">
                          <td className="p-2 font-medium text-gray-700">{p.province}</td>
                          <td className="p-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.phase===1?'bg-blue-50 text-blue-600':'bg-orange-50 text-orange-600'}`}>P{p.phase}</span></td>
                          <td className="p-2 text-center text-gray-500">{meta?.zone}</td>
                          <td className="p-2 text-center"><LevelBadge level={p.level}/></td>
                          {[1,2,3,4,5,6,7].map(n=>(
                            <td key={n} className="p-1.5 text-center">
                              {n<=p.milestoneCompleted ? <CheckCircle size={14} className="text-green-500 mx-auto"/> : <div className="w-3.5 h-3.5 rounded-full bg-gray-200 mx-auto"/>}
                            </td>
                          ))}
                          <td className="p-2 text-center font-semibold text-indigo-600">{p.milestoneCompleted}/7</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">Dashboard กำกับติดตามโครงการสานพลังขับเคลื่อนจังหวัดเข้มแข็งและระบบนิเวศสุขภาวะเชิงพื้นที่ (Target Ecosystem) Phase 1 & 2</p>
          <p className="text-[10px] text-gray-400">สช. | SHARE | TWBI | สปสช. | สสส. | พอช. | สภาพัฒน์ | NSO | HDC | TPMAP | ระยะเวลา {PROJECT_PERIOD}</p>
        </div>
      </div>
    </div>
  );
}
