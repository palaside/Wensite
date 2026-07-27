# ARTY17 AIM "Next-Gen Tactical HUD" Spec

## Overview
ยกระดับโปรเจกต์ `lithos-hero` ในส่วนของ Forward Observer (FO) / Fire Direction (FD) ให้กลายเป็น **"Next-Gen Tactical HUD"** สไตล์ Military-Grade Cyberpunk (Dark Mode, Glassmorphism, Neon Accents) โดยเปลี่ยนหน้าตา UI ให้เหมือนห้องนักบิน (Cockpit) ควบคู่กับแผนที่ยุทธวิธีแบบ Interactive (Tactical Map) ที่มีระบบเรดาร์สแกนและอนิเมชันพล็อตจุดแบบ Real-time

## Architecture Decisions (Codebase Design)

### 1. `TacticalMap` (Deep Module)
- **Interface:** รับค่า `observer`, `targets` (array), `impacts` (array), `otLine` (boolean), `radarActive` (boolean)
- **Implementation:** จัดการเรื่อง Map Engine (Mapbox/Leaflet) ทั้งหมด ซ่อนความซับซ้อนของการวาดเส้น (Polyline), การวาง Marker, การทำวงแหวนเรดาร์ (CSS/WebGL animations) และ CEP circles ไว้ข้างใน

### 2. `FireCorrectionEngine` (Deep Module)
- **Interface:** รับพิกัด Observer, Target, Impact -> รีเทิร์นค่า Correction (ระยะเบี่ยง ซ้าย/ขวา, เพิ่ม/ลด), Delta H, ระยะทาง, Azimuth
- **Implementation:** ฟังก์ชันคำนวณคณิตศาสตร์บริสุทธิ์ (Pure functions) สำหรับงานปืนใหญ่ ไม่มีการเรียกใช้ UI ในนี้เด็ดขาด

### 3. `HudController` (The Adapter / Page)
- ทำหน้าที่เป็น Layout กั้นกลางระหว่างแผนที่และแผงควบคุม (Control Panel) จัดการ State กลางของภารกิจ (Active Target, History, Settings)
- นำ Framer Motion มาจัดการ Layout shift

## Vertical Slices (Task Breakdown)
1. **Foundation:** Setup Map Engine, Create Layout, Build `artilleryMath.ts`
2. **Setup:** Place Observer/Target pins, draw OT Line
3. **Fire Correction:** Place Impact pin, Calculate corrections, 4D Visualizations
4. **Integration:** MGRS Converter, PDF Export, QR Code, Persistence
