# EXPORT_SPEC_TH.md

## 1. Project (โครงการ)
- ชื่อโปรเจกต์:
- เวอร์ชันของ Export Spec:
- วันที่อัปเดตล่าสุด:
- เจ้าของเอกสาร:
- อ้างอิงจาก:
  - PROJECT_STARTER_TH.md
  - DESIGN_STARTER_TH.md
  - UI_SPEC_TH.md
  - FLOW_SPEC_TH.md
  - COMPONENT_SPEC_TH.md

---

## 2. Export Goal (เป้าหมายของการส่งออก)
- export นี้มีไว้เพื่อ:
- ผู้ใช้ต้องการเอาผลลัพธ์ไปใช้อะไร:
- เอกสาร / ไฟล์ที่ได้ต้องมีคุณสมบัติอะไร:
- สิ่งที่ห้ามเกิดในผลลัพธ์:
- ความน่าเชื่อถือของ export นี้สำคัญระดับไหน:
  - [ ] Critical
  - [ ] High
  - [ ] Medium
  - [ ] Low

---

## 3. Export Types (ประเภทผลลัพธ์ที่รองรับ)
| ประเภท | ใช้ทำอะไร | นามสกุลไฟล์ | ผู้ใช้หลัก |
|---|---|---|---|
| PDF |  | .pdf |  |
| Excel |  | .xlsx |  |
| ZIP |  | .zip |  |
| JSON Audit |  | .json |  |
| Image Export |  | .png / .jpg |  |

---

## 4. Source Data (แหล่งข้อมูลต้นทาง)
- export นี้ดึงข้อมูลจาก:
- ใช้ข้อมูลจาก frontend / backend / processed state / audit file:
- field สำคัญที่ต้องมี:
- field ไหน optional:
- field ไหนห้ามเดา:
- ถ้าข้อมูลไม่ครบ ต้อง:
  - [ ] เว้นว่าง
  - [ ] แจ้งเตือน
  - [ ] block export
- source of truth หลักคืออะไร:

---

## 5. Export Trigger (จุดเริ่มการ export)
- ผู้ใช้กด export จาก:
- ปุ่ม / เมนู / modal ที่ใช้:
- ก่อน export ต้องผ่านเงื่อนไขอะไร:
- export อัตโนมัติได้หรือไม่:
- ถ้ากดซ้ำระหว่างกำลัง export ต้องทำอย่างไร:

---

## 6. Preconditions (เงื่อนไขก่อน export)
- ต้องมีข้อมูลขั้นต่ำอะไร:
- ต้อง process สำเร็จก่อนหรือไม่:
- ต้องเลือก mode / batch / page / filter ก่อนหรือไม่:
- ถ้าไม่ครบ ต้อง block พร้อมข้อความว่าอะไร:
- ถ้าเป็น partial success อนุญาตให้ export หรือไม่:

---

## 7. File Naming Rules (กติกาการตั้งชื่อไฟล์)
- รูปแบบชื่อไฟล์หลัก:
- ต้องมี timestamp หรือไม่:
- ต้องมี project name / mode / batch id หรือไม่:
- ต้อง sanitize ตัวอักษรอะไร:
- ถ้าชื่อซ้ำ:
  - overwrite
  - add suffix
  - ask user
- ตัวอย่างชื่อไฟล์:

---

## 8. Output Structure (โครงสร้างผลลัพธ์)
### 8.1 ถ้าเป็น PDF
- จำนวนหน้าคาดหวัง:
- มีหน้าปกหรือไม่:
- มีหน้าสรุปท้ายหรือไม่:
- มี header / footer หรือไม่:
- มีเลขหน้าหรือไม่:

### 8.2 ถ้าเป็น Excel
- มีกี่ sheet:
- แต่ละ sheet ใช้ทำอะไร:
- header row หน้าตาอย่างไร:
- มี summary row หรือไม่:

### 8.3 ถ้าเป็น ZIP
- ภายใน ZIP ต้องมีอะไร:
- จัดโฟลเดอร์อย่างไร:
- ต้องมี password หรือไม่:

### 8.4 ถ้าเป็น JSON Audit
- เก็บ metadata อะไร:
- เก็บ raw result หรือไม่:
- ใช้เพื่อ review / trace / rerun ได้หรือไม่:

---

## 9. Layout Rules (กติกาการจัดวางผลลัพธ์)
- ขนาดกระดาษ:
  - [ ] A4 Portrait
  - [ ] A4 Landscape
  - [ ] Custom
- margin:
- safe area:
- header height:
- footer height:
- content frame:
- spacing ระหว่าง section:
- ถ้ามีตาราง:
  - rows ต่อหน้า:
  - sticky logic (เชิงเอกสาร):
  - repeat header หรือไม่

---

## 10. Data Mapping Rules (กติกาการแมปข้อมูล)
| Output Field | Source Field | Required | Fallback | Notes |
|---|---|---|---|---|
|  |  | Yes/No |  |  |
|  |  | Yes/No |  |  |
|  |  | Yes/No |  |  |

- field ไหนต้องแมปตรง:
- field ไหนต้อง normalize ก่อน:
- field ไหนห้าม fallback มั่ว:
- ถ้าข้อมูล conflict กัน ให้ยึดอะไรเป็นหลัก:

---

## 11. Pagination Rules (กติกาการแบ่งหน้า)
- แบ่งหน้าจากอะไร:
- กรณีเป็น document image:
- กรณีเป็น table:
- กรณีมี summary ท้าย:
- อะไรห้ามถูกตัดกลาง:
- ถ้าพอดีไม่ลงหน้า:
  - ย่อ
  - ย้ายทั้ง block
  - ขึ้นหน้าใหม่
- ถ้ามี object-aware rule ต้องระบุว่าอะไร:

---

## 12. Visual Rules (กติกาด้านภาพ)
- ใช้ theme ไหน:
- logo ต้องอยู่ตรงไหน:
- ฟอนต์ที่ใช้:
- ขนาดข้อความขั้นต่ำ:
- สีข้อความหลัก:
- สีสำหรับเน้นยอด / สถานะ:
- ความคมชัดขั้นต่ำ:
- พื้นหลังที่ยอมรับได้:
- สิ่งที่ห้ามเกิดใน output:
  - text ซ้อน
  - ภาพล้นกรอบ
  - margin แตก
  - footer ชน content
  - element ขาดกลางโดยผิดกติกา

---

## 13. Summary / Totals Rules (กติกาการสรุปข้อมูล)
- ต้องมียอดรวมไหม:
- สรุปที่หน้าไหน:
- รวมจาก field ไหน:
- ตัด duplicate ก่อนรวมไหม:
- round จำนวนเงินอย่างไร:
- ถ้ามีรายการ invalid:
  - ไม่นับรวม
  - แยกส่วน
  - แจ้งหมายเหตุ
- ต้องมี count summary อะไรบ้าง:
  - จำนวนรายการทั้งหมด
  - จำนวนรายการที่ใช้จริง
  - จำนวน duplicate
  - จำนวน failed / review required

---

## 14. Error Handling (การจัดการเมื่อ export ไม่สำเร็จ)
### Error Case 1
- สาเหตุ:
- ผลกระทบ:
- ต้องแจ้งผู้ใช้อย่างไร:
- retry ได้ไหม:

### Error Case 2
- สาเหตุ:
- ผลกระทบ:
- ต้องแจ้งผู้ใช้อย่างไร:
- retry ได้ไหม:

### Error Case 3
- สาเหตุ:
- ผลกระทบ:
- ต้องแจ้งผู้ใช้อย่างไร:
- retry ได้ไหม:

---

## 15. Save / Delivery Rules (กติกาการบันทึกและส่งมอบ)
- บันทึกลงที่ไหน:
- ให้ผู้ใช้เลือก path เองไหม:
- default path คืออะไร:
- ถ้า save สำเร็จ ต้องแจ้งอะไร:
- ถ้า save ไม่สำเร็จ ต้องแจ้งอะไร:
- ถ้าเป็น send to system:
  - ส่งไฟล์อะไร
  - ผ่าน API ไหน
  - ได้ response อะไรกลับ
- ต้องเปิดไฟล์ / โฟลเดอร์หลัง export หรือไม่:

---

## 16. Security / Privacy Rules
- export นี้มีข้อมูลอ่อนไหวหรือไม่:
- ต้อง mask field ไหน:
- ต้องเข้ารหัสหรือไม่:
- ถ้าเป็น ZIP ต้องใช้ password policy อะไร:
- ห้ามเขียนข้อมูลอะไรลง log:
- audit file ต้องเก็บอะไรได้ / ไม่ได้:

---

## 17. Performance Rules
- จำนวนไฟล์ / รายการที่คาดว่าจะรองรับ:
- export ควรใช้เวลาไม่เกิน:
- ถ้าเกิน threshold ต้องแสดง progress หรือไม่:
- ต้องรองรับ batch ใหญ่ไหม:
- ถ้า export ใหญ่มาก ต้อง:
  - queue
  - background job
  - split file
  - block พร้อมคำอธิบาย

---

## 18. Audit / Traceability
- ต้องเก็บ evidence ของการ export หรือไม่:
- ต้องเก็บเวลาที่ export:
- ต้องเก็บ input summary:
- ต้องเก็บ output path:
- ต้องเก็บ version ของ parser / OCR / template หรือไม่:
- audit นี้ใช้ rerun หรือ verify ย้อนหลังได้หรือไม่:

---

## 19. QA Checklist
- [ ] export เริ่มได้จาก trigger ที่ถูกต้อง
- [ ] precondition block ถูกต้อง
- [ ] file naming ถูกต้อง
- [ ] layout ไม่แตก
- [ ] data mapping ถูกต้อง
- [ ] totals คำนวณถูก
- [ ] duplicate handling ถูก
- [ ] save สำเร็จจริง
- [ ] error state แจ้งชัด
- [ ] output เปิดใช้งานได้จริง

---

## 20. Acceptance Criteria (เกณฑ์รับงาน)
- [ ] ผู้ใช้ export ได้ไฟล์ตรงตามประเภทที่กำหนด
- [ ] ข้อมูลใน output ตรงกับ source of truth
- [ ] ไม่มี field สำคัญหายโดยไม่แจ้ง
- [ ] ไม่มีการเดาข้อมูลผิดเพื่อเติมช่องว่าง
- [ ] layout อ่านได้จริงและพร้อมใช้งาน
- [ ] totals / summary ถูกต้อง
- [ ] save / delivery flow ทำงานจบ
- [ ] output ใช้งานต่อได้ในบริบทจริง

---

## 21. Test Scenarios (สถานการณ์ทดสอบ)
### Happy Path
1.
2.
3.

### Data Incomplete Path
1.
2.
3.

### Save Failure Path
1.
2.
3.

### Large Batch Path
1.
2.
3.

### Edge Case Path
1.
2.
3.

---

## 22. Handoff Notes (โน้ตส่งต่อ Dev / QA / Operator)
- logic ไหนห้ามเปลี่ยน:
- field ไหนห้ามเดา:
- output ไหนต้อง verify ด้วย runtime จริง:
- จุดที่ QA ต้องเช็กด้วยตา:
- จุดที่ต้องเทียบ source data กับ output:
- จุดที่ operator ต้องระวังเวลาส่งมอบ:

---

## 23. Open Questions (คำถามที่ยังไม่ปิด)
1.
2.
3.

---

## 24. Notes (หมายเหตุ)
- ข้อจำกัดพิเศษ:
- tradeoff ที่ยอมรับได้:
- สิ่งที่ห้ามเสีย: