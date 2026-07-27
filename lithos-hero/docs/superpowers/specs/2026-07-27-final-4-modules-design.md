# FDC Next-Gen: Final 4 Modules Design Spec (Standalone & Visual-Heavy)

## 1. Linear Interpolation (เทียบบัญญัติไตรยางศ์)
- **Concept:** โมดูลคำนวณหามุมกระดกหรือเวลาที่แน่นอนสำหรับระยะยิงที่ไม่ได้มีบอกเป๊ะๆ ในตารางยิง
- **Visual Design:** กราฟเส้นแบบ Simple Line Chart หรือเส้นแกน X/Y จำลอง เพื่อให้เห็นจุดที่ 1 (ระยะใกล้กว่า) และจุดที่ 2 (ระยะไกลกว่า) พร้อมแสดงจุดหมาย (Target) อยู่ตรงกลาง
- **Input:** Range A, Elev A / Range B, Elev B / Target Range
- **Output:** Target Elevation ที่คำนวณได้ 

## 2. Vector Splitting & MET (แตกเวกเตอร์และชดเชยลม)
- **Concept:** แตกความเร็วและทิศทางลมออกเป็น ลมขวาง (Crosswind) และ ลมทวน/ลมตาม (Headwind/Tailwind) เมื่อเทียบกับทิศทางปืน
- **Visual Design:** **Dynamic Compass (เข็มทิศขยับได้)** แสดงลูกศรทิศทางเป้าหมาย (Target Azimuth) และลูกศรทิศทางลม (Wind Direction) สีต่างกัน เพื่อให้ ผตน. มองเห็นภาพได้ทันทีว่าลมพัดมาจากทิศไหน และจะโดนผลกระทบฝั่งไหน
- **Input:** Target Azimuth, Wind Direction, Wind Speed
- **Output:** 
  - Crosswind (Left/Right) + ความเร็ว (Knots)
  - Range Wind (Head/Tail) + ความเร็ว (Knots)

## 3. Individual Gun Corrections (ตัวแก้ปืนแยก 6 กระบอก)
- **Concept:** คำนวณค่าเผื่อแก้การตั้งปืนที่ไม่เท่ากันในแต่ละกระบอก (Battery Formation)
- **Visual Design:** **แผนผังที่ตั้งปืน 6 กระบอก (Top-Down Battery Diagram)** จัดเรียงเป็นรูปตัว U หรือแนวระนาบ เมื่อคลิกที่ปืนแต่ละกระบอกจะแสดงค่าตัวแก้ของปืนกระบอกนั้น
- **Input:** แตกต่างความสูงของแต่ละกระบอกเทียบกับจุดศูนย์กลาง (Base Piece)
- **Output:** ค่าแก้มุมทิศ (Deflection Correction) และ มุมกระดก (Elevation Correction) รายกระบอก

## 4. Firing Log & Ammo (ระบบบันทึกการยิงและคลังแสง)
- **Concept:** ระบบโลจิสติกส์บันทึกยอดกระสุนคงคลัง
- **Visual Design:** **Dashboard & Progress Bar** แสดงหลอดสถานะกระสุนแบบล้ำสมัย (เขียว, เหลือง, แดง เมื่อใกล้หมด) แบ่งตามประเภทกระสุน (HE, WP, Illumination)
- **Input:** ปุ่มกดลดยอดกระสุนตามภารกิจ
- **Output:** ยอดคงเหลือ, ประวัติการยิง (Log Table)

---
> **[Spec Self-Review]**
> - **Placeholder scan:** ไม่มี TBD
> - **Internal consistency:** รูปแบบตรงกับหมวดหมู่ Standalone และสไตล์ Visual-Heavy ที่ตกลงกันไว้
> - **Scope check:** ขอบเขตชัดเจนคือการสร้าง 4 component แยกกัน
> - **Ambiguity check:** ชัดเจนว่าไม่มีระบบผูกข้อมูลเชื่อมต่อกันแบบอัตโนมัติ (Automated flow) ตามคำขอของ User
