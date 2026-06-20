# COMPONENT_SPEC_TH.md

## 1. Project (โครงการ)
- ชื่อโปรเจกต์:
- เวอร์ชันของ Component Spec:
- วันที่อัปเดตล่าสุด:
- เจ้าของเอกสาร:
- อ้างอิงจาก:
  - PROJECT_STARTER_TH.md
  - DESIGN_STARTER_TH.md
  - UI_SPEC_TH.md
  - FLOW_SPEC_TH.md

---

## 2. Component Name (ชื่อคอมโพเนนต์)
- ชื่อคอมโพเนนต์:
- ประเภท:
  - [ ] Layout
  - [ ] Form
  - [ ] Upload
  - [ ] Preview
  - [ ] Data Display
  - [ ] Table
  - [ ] Modal
  - [ ] Drawer
  - [ ] Action Bar
  - [ ] Status / Feedback
- ระดับความสำคัญ:
  - [ ] Critical
  - [ ] High
  - [ ] Medium
  - [ ] Low

---

## 3. Purpose (หน้าที่ของคอมโพเนนต์)
- คอมโพเนนต์นี้มีไว้เพื่อ:
- ผู้ใช้ใช้คอมโพเนนต์นี้เพื่อทำอะไร:
- ถ้าคอมโพเนนต์นี้หายไป จะกระทบอะไร:
- สิ่งที่คอมโพเนนต์นี้ไม่ควรรับผิดชอบ:

---

## 4. Placement (ตำแหน่งที่อยู่ในระบบ)
- อยู่ในหน้าจอ / route ไหน:
- อยู่ตำแหน่งไหนของ layout:
  - [ ] Header
  - [ ] Sidebar
  - [ ] Main Content
  - [ ] Right Panel
  - [ ] Footer
  - [ ] Overlay
- แสดงตลอดหรือแสดงตามเงื่อนไข:
- ถูกเรียกจาก flow ไหน:

---

## 5. Inputs / Props (ข้อมูลที่รับเข้า)
| ชื่อ | ชนิดข้อมูล | Required | Default | คำอธิบาย |
|---|---|---|---|---|
|  |  | Yes/No |  |  |
|  |  | Yes/No |  |  |
|  |  | Yes/No |  |  |

---

## 6. Outputs / Events (สิ่งที่ส่งออก)
| Event / Output | Trigger เมื่อไร | Payload | ปลายทาง |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## 7. Data Contract (สัญญาข้อมูล)
- field สำคัญที่คอมโพเนนต์ต้องใช้:
- field ไหนต้องมีแน่:
- field ไหนหายได้:
- field ไหนห้ามเดา:
- fallback ถ้าข้อมูลไม่ครบ:
- ถ้าข้อมูลผิดรูป ต้องจัดการอย่างไร:

---

## 8. Visual Structure (โครงสร้างภาพ)
- ส่วนประกอบย่อยภายในคอมโพเนนต์:
  1.
  2.
  3.
- ลำดับความเด่นของข้อมูล:
  1.
  2.
  3.
- สิ่งที่ต้องเห็นทันที:
- สิ่งที่ซ่อนได้:
- สิ่งที่ต้อง collapse / expand ได้:

---

## 9. Visual Style (แนวทางหน้าตา)
- พื้นผิว:
  - [ ] Flat
  - [ ] Glass
  - [ ] Bordered
  - [ ] Elevated
- สีพื้น:
- สีข้อความ:
- สี accent:
- สี border:
- สีใน state success / warning / error:
- ความโค้งมุม:
- เงา:
- blur:
- สิ่งที่ห้ามใช้กับคอมโพเนนต์นี้:

---

## 10. Content Rules (กติกาเนื้อหา)
- หัวข้อหลัก:
- label ที่ต้องมี:
- helper text ที่ต้องมี:
- placeholder ที่ควรใช้:
- ข้อความเตือนที่ต้องมี:
- ข้อความที่ห้ามใช้:
- ภาษา / tone ของข้อความ:
- ถ้าข้อความยาวเกิน ต้องทำอย่างไร:

---

## 11. Interaction Rules (กติกาการโต้ตอบ)
- ผู้ใช้กด / เลือก / พิมพ์อะไรได้บ้าง:
- action หลักของคอมโพเนนต์:
- action รอง:
- action ที่ต้อง confirm ก่อน:
- action ที่ห้ามกดซ้ำ:
- จุดที่ต้องมี hover / focus / active state:
- จุดที่ต้องมี tooltip:
- keyboard interaction ที่รองรับ:

---

## 12. States (สถานะที่ต้องรองรับ)
### Default
- หน้าตา:
- behavior:

### Hover
- หน้าตา:
- behavior:

### Focus
- หน้าตา:
- behavior:

### Active
- หน้าตา:
- behavior:

### Disabled
- หน้าตา:
- behavior:

### Loading
- หน้าตา:
- behavior:

### Empty
- หน้าตา:
- behavior:

### Success
- หน้าตา:
- behavior:

### Error
- หน้าตา:
- behavior:

---

## 13. Validation / Guardrails
- input ไหนต้อง validate:
- validate ตอนไหน:
- ถ้า invalid ต้องแสดงตรงไหน:
- block action หรือไม่:
- ถ้าข้อมูลเสี่ยงเดาผิด ต้องเว้นว่างหรือเตือน:
- จุดไหนห้าม fallback มั่ว:

---

## 14. Responsive Behavior (พฤติกรรม responsive)
### Desktop
- ขนาด:
- การวาง:
- สิ่งที่แสดง:

### Tablet
- ขนาด:
- การวาง:
- สิ่งที่ย่อ / ย้าย:

### Mobile
- ขนาด:
- การวาง:
- สิ่งที่ซ่อน:
- action หลักยังอยู่ตรงไหน:

---

## 15. Accessibility (การเข้าถึง)
- aria / label ที่ต้องมี:
- tab order:
- focus ring:
- contrast requirement:
- icon-only button ต้องมีอะไร:
- รองรับ screen reader อย่างไร:
- จุดที่ห้ามใช้สีอย่างเดียวสื่อความหมาย:

---

## 16. Dependencies (สิ่งที่คอมโพเนนต์นี้พึ่งพา)
- parent component:
- child component:
- shared hooks / utils:
- API / backend dependency:
- external library:
- asset / icon / image ที่ใช้:

---

## 17. Reuse Rules (กติกาการนำกลับใช้)
- ใช้ซ้ำที่ไหนได้:
- ใช้ซ้ำที่ไหนไม่ได้:
- ส่วนไหน configurable:
- ส่วนไหน fixed:
- ถ้าจะแตก variant ควรแตกแบบไหน:

---

## 18. Failure Modes (รูปแบบความพังที่ต้องกัน)
### Failure 1
- ปัญหา:
- เกิดจาก:
- ผลกระทบ:
- วิธีป้องกัน:

### Failure 2
- ปัญหา:
- เกิดจาก:
- ผลกระทบ:
- วิธีป้องกัน:

### Failure 3
- ปัญหา:
- เกิดจาก:
- ผลกระทบ:
- วิธีป้องกัน:

---

## 19. QA Checklist
- [ ] แสดงผลถูกใน default state
- [ ] แสดงผลถูกใน loading state
- [ ] แสดงผลถูกใน empty state
- [ ] แสดงผลถูกใน error state
- [ ] interaction หลักทำงานครบ
- [ ] disabled state ใช้งานถูก
- [ ] responsive ไม่พัง
- [ ] text ไม่ล้น / ไม่ชน
- [ ] contrast อ่านชัด
- [ ] ไม่มีจุดที่กดแล้วไม่เกิด feedback

---

## 20. Acceptance Criteria (เกณฑ์รับงาน)
- [ ] คอมโพเนนต์ทำหน้าที่ตรงตาม purpose
- [ ] รับ props ครบและไม่พึ่งข้อมูลเกินจำเป็น
- [ ] state สำคัญครบ
- [ ] interaction ไม่กำกวม
- [ ] รองรับ error / empty / loading
- [ ] reuse ได้ตามที่ออกแบบ
- [ ] ไม่ทับความรับผิดชอบกับ component อื่น
- [ ] ใช้งานจริงใน flow ที่เกี่ยวข้องได้

---

## 21. Handoff Notes (โน้ตส่งต่อ Dev / QA / Design)
- Design intent ที่ห้ามหลุด:
- Logic ที่ต้องยึด:
- Backend contract ที่อิง:
- จุดที่ QA ต้องเช็กเป็นพิเศษ:
- จุดที่ dev ห้าม simplify เอง:
- performance concern:

---

## 22. Open Questions (คำถามที่ยังไม่ปิด)
1.
2.
3.

---

## 23. Notes (หมายเหตุ)
- ข้อจำกัดพิเศษ:
- จุดที่ยอมยืดหยุ่นได้:
- จุดที่ห้ามเสีย: