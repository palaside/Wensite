# UI_SPEC_TH.md

## 1. Project (โครงการ)
- ชื่อโปรเจกต์:
- เวอร์ชันของ UI:
- วันที่อัปเดตล่าสุด:
- เจ้าของสเปก:
- อ้างอิงจากเอกสาร:
  - PROJECT_STARTER_TH.md
  - DESIGN_STARTER_TH.md

---

## 2. Screen / View นี้คืออะไร
- ชื่อหน้าจอ:
- จุดประสงค์ของหน้าจอ:
- ใช้ใน Flow ไหน:
- ความสำคัญของหน้าจอ:
  - [ ] หลัก
  - [ ] รอง
  - [ ] ใช้เฉพาะกรณี

---

## 3. ผู้ใช้ของหน้าจอนี้
- ผู้ใช้หลัก:
- ระดับความชำนาญ:
- สิ่งที่ผู้ใช้ต้องการทำให้สำเร็จในหน้านี้:
- สิ่งที่ผู้ใช้ไม่ควรถูกบังคับให้ทำเกินจำเป็น:

---

## 4. Primary Goal ของหน้าจอ
- งานหลักที่หน้าจอนี้ต้องทำให้สำเร็จ:
- Success ของหน้าจอนี้วัดจากอะไร:
- ถ้าผู้ใช้เข้ามาหน้านี้แล้วต้องทำได้ทันทีคืออะไร:

---

## 5. Layout Structure (โครงร่างหน้าจอ)
- ประเภท Layout:
  - [ ] Dashboard
  - [ ] Document Tool
  - [ ] Form
  - [ ] Table / Data Review
  - [ ] Wizard / Step Flow
  - [ ] Detail View
- โครงหลักของหน้า:
  - Header:
  - Left Panel / Sidebar:
  - Main Content:
  - Right Panel / Inspector:
  - Footer:
- ลำดับความเด่นของพื้นที่:
  1.
  2.
  3.

---

## 6. Components ที่ต้องมี
| Component | หน้าที่ | Priority | Notes |
|---|---|---|---|
| Header |  | High |  |
| Search / Filter |  | Medium |  |
| Upload Area |  | High |  |
| Preview Area |  | High |  |
| Table / Result List |  | High |  |
| Action Buttons |  | High |  |
| Modal / Drawer |  | Medium |  |

---

## 7. Content Hierarchy (ลำดับข้อมูล)
- ข้อมูลที่ต้องเห็นทันที:
- ข้อมูลที่ควรเห็นเมื่อเลื่อนลง:
- ข้อมูลที่ซ่อนใน modal / drawer / expand:
- ข้อมูลที่เป็น secondary:
- ข้อมูลที่ไม่ควรแย่งความสนใจจากงานหลัก:

---

## 8. User Actions (สิ่งที่ผู้ใช้ทำได้)
| Action | Trigger | ผลลัพธ์ที่คาดหวัง | มี Confirm ไหม |
|---|---|---|---|
| Upload |  |  |  |
| Generate / Process |  |  |  |
| View Detail |  |  |  |
| Save / Export |  |  |  |
| Send / Submit |  |  |  |
| Reset / Clear |  |  |  |

---

## 9. Interaction Rules (กติกาการโต้ตอบ)
- ปุ่มหลักของหน้าคือ:
- ปุ่มรองของหน้าคือ:
- ปุ่มไหนกดไม่ได้จนกว่าจะมีข้อมูล:
- ต้องมี loading state ตอนไหน:
- ต้องมี success feedback ตอนไหน:
- ต้องมี error feedback ตอนไหน:
- การกดซ้ำต้องป้องกันอย่างไร:
- Keyboard / shortcut ที่จำเป็น:

---

## 10. States (สถานะที่ต้องออกแบบ)
### 10.1 Default State
- ตอนยังไม่มีข้อมูล ต้องเห็นอะไร:

### 10.2 Loading State
- ตอนระบบกำลังทำงาน ต้องเห็นอะไร:
- ซ่อนอะไร:
- ปิดอะไรชั่วคราว:

### 10.3 Success State
- ตอนทำงานสำเร็จ ต้องเห็นอะไร:
- action ถัดไปที่เด่นที่สุดคืออะไร:

### 10.4 Empty State
- ถ้าไม่มีผลลัพธ์ ต้องสื่อสารว่าอะไร:

### 10.5 Error State
- ถ้าเกิด error ต้องบอก:
  - เกิดอะไร
  - กระทบอะไร
  - ผู้ใช้ทำอะไรต่อได้

### 10.6 Partial Failure State
- ถ้าบางรายการสำเร็จ บางรายการล้มเหลว ต้องแสดงอย่างไร:

---

## 11. Data Presentation Rules (กติกาการแสดงข้อมูล)
- รูปแบบวันที่:
- รูปแบบเวลา:
- รูปแบบจำนวนเงิน:
- รูปแบบชื่อไฟล์:
- Text overflow:
- Column priority:
- Row height:
- Sticky header:
- Pagination / infinite scroll / page size:

---

## 12. Visual Direction (แนวทางภาพ)
- ธีม:
  - [ ] Light
  - [ ] Dark
  - [ ] Dual theme
- Mood:
- ระดับความเป็นทางการ:
- สีหลัก:
- สีรอง:
- สีสำหรับ success / warning / error:
- พื้นผิว:
  - [ ] Flat
  - [ ] Glassmorphism
  - [ ] Minimal bordered
  - [ ] Dense tool UI
- สิ่งที่ห้ามใช้:
  - gradient marketing style
  - hero landing style
  - decorative card stacking
  - blur หนักเกินจำเป็น

---

## 13. Typography (ตัวอักษร)
- Font family:
- Heading style:
- Body text style:
- Table text style:
- Caption / helper text style:
- ขนาดตัวอักษรขั้นต่ำที่ยอมรับได้:
- จุดที่ต้องใช้สีเข้มเพื่อให้อ่านชัด:

---

## 14. Spacing / Sizing (ระยะและขนาด)
- Grid / spacing system:
- ความสูง header:
- ความกว้าง sidebar:
- ความกว้าง panel ขวา:
- ระยะห่างระหว่าง section:
- Padding ของ card / panel:
- Minimum width ที่ยังใช้งานได้:
- Maximum content width:

---

## 15. Responsive Behavior (พฤติกรรมเมื่อย่อ/ขยาย)
### Desktop
- layout หลัก:
- panel ไหนต้องคงอยู่:

### Tablet
- panel ไหนย้าย:
- panel ไหน collapse:

### Mobile
- สิ่งที่ต้องคง:
- สิ่งที่ต้องซ่อน:
- action หลักต้องอยู่ตรงไหน:

---

## 16. Modal / Drawer / Popup Spec
| Surface | ใช้เมื่อไร | เนื้อหาหลัก | ปิดได้อย่างไร |
|---|---|---|---|
| Detail Modal |  |  |  |
| Confirm Dialog |  |  |  |
| Error Dialog |  |  |  |
| Side Drawer |  |  |  |

---

## 17. Validation / Guardrails
- input ไหนต้อง validate:
- ถ้า input ไม่ครบ ต้องเตือนอย่างไร:
- ถ้า data จาก backend ไม่ครบ ต้องแสดง fallback อะไร:
- ห้ามเดาข้อมูลใน field ไหน:
- field ไหนเว้นว่างได้ดีกว่าเดาผิด:

---

## 18. Accessibility / Readability
- contrast ขั้นต่ำ:
- keyboard navigation:
- focus state:
- screen-reader label ที่จำเป็น:
- icon ที่ต้องมี tooltip:
- จุดที่ห้ามใช้สีอย่างเดียวสื่อความหมาย:

---

## 19. UX Risks (จุดเสี่ยงที่ต้องกัน)
- จุดที่ผู้ใช้อาจสับสน:
- จุดที่อาจกดแล้ว “เหมือนไม่มีอะไรเกิดขึ้น”:
- จุดที่ข้อมูลอาจแน่นเกิน:
- จุดที่ต้องมี progress ชัดเจน:
- จุดที่ถ้าพลาดจะกระทบความน่าเชื่อถือของงาน:

---

## 20. Acceptance Criteria (เกณฑ์รับงาน UI)
- [ ] ผู้ใช้เข้าใจว่าหน้านี้ไว้ทำอะไรภายใน 5 วินาที
- [ ] งานหลักของหน้ากดทำได้ทันที
- [ ] ไม่มี component ชน/ล้น/ซ้อนกัน
- [ ] ข้อมูลสำคัญอ่านชัด
- [ ] loading / success / error / empty state ครบ
- [ ] ปุ่มหลักเด่นกว่าปุ่มรอง
- [ ] desktop / tablet / mobile ใช้งานได้จริง
- [ ] visual ตรงกับ design direction
- [ ] ไม่มีจุดที่กดแล้วเงียบโดยไม่มี feedback

---

## 21. Handoff Notes (โน้ตส่งต่อ Dev)
- component ที่ควร reuse:
- component ที่ต้องสร้างใหม่:
- logic ที่ห้ามเปลี่ยน:
- backend contract ที่อิง:
- test cases ที่ dev ต้องเช็ก:
- จุดที่ QA ต้องเฝ้าเป็นพิเศษ:

---

## 22. Open Questions (คำถามที่ยังไม่ปิด)
1.
2.
3.

---

## 23. Notes (หมายเหตุ)
- ข้อจำกัดพิเศษ:
- สิ่งที่ยอมลดได้:
- สิ่งที่ห้ามเสีย: