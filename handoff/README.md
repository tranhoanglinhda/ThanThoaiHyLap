# PANTHEON — Gói bàn giao cho Claude Code

Mục tiêu: dựng một **web 3D tương tác** về thần thoại Hy Lạp — gallery các pho tượng
3D (xoay/zoom) kèm mô tả song ngữ Việt–Anh, và một **cây gia phả tương tác**.

Prototype HTML đi kèm (`index.html` ở thư mục gốc) đã hiện thực hóa toàn bộ ý tưởng
bằng Three.js — bạn có thể chạy ngay, hoặc dùng nó như "spec sống" để build lại bằng
stack hiện đại (Vite + React Three Fiber chẳng hạn).

---

## 1. Dữ liệu — nguồn chân lý duy nhất

`pantheon.json` chứa toàn bộ 20 vị thần. Lược đồ mỗi phần tử:

```jsonc
{
  "id": "zeus",                 // khóa duy nhất, dùng cho quan hệ & tên file model
  "name": "Zeus",               // tên hiển thị (Hy Lạp)
  "roman": "Jupiter",           // tên La Mã ("—" nếu không có)
  "group": "olympian",          // "primordial" | "titan" | "olympian"
  "generation": 3,              // 0 = cổ nhất → dùng để xếp tầng cây gia phả
  "accent": "#d9a441",          // màu nhấn riêng (ánh đèn, viền, chấm)
  "epithet": { "vi": "...", "en": "..." },
  "domain":  { "vi": "...", "en": "..." },
  "symbol":  { "vi": "...", "en": "..." },
  "desc":    { "vi": "...", "en": "..." },
  "parents":  ["cronus", "rhea"],   // mảng id
  "consorts": ["hera"],             // mảng id
  "children": ["athena", "apollo"], // mảng id
  "model": "models/zeus.glb"        // SLOT: đường dẫn model sẽ gắn vào
}
```

`groups` trong JSON là nhãn song ngữ cho 3 nhóm.

> **Tính nhất quán quan hệ:** `parents` / `children` được khai báo đối xứng để vẽ cây
> gia phả. Nếu thêm thần mới, nhớ cập nhật cả hai chiều.

---

## 2. "Slot" model 3D — phần quan trọng nhất

Mỗi vị thần là một **chỗ trống chờ model**. Prototype đang hiển thị tượng marble
*placeholder* dựng bằng code (bệ + thân tượng + đầu). Việc của bản web thật:

1. Đặt các file model vào `public/models/` theo đúng tên: `models/<id>.glb`
   (ví dụ `zeus.glb`, `athena.glb`, `hades.glb`…). Trường `model` trong JSON đã trỏ sẵn.
2. Ưu tiên định dạng **`.glb`** (gộp 1 file). `.gltf` + textures rời cũng được.
3. Nếu thiếu model cho vị nào → **fallback về tượng placeholder** (giữ logic trong
   `js/statue-viewer.js` → `_buildPlaceholder`). Đừng để trống niche.

**Nguồn model CC0/miễn phí gợi ý** (kiểm tra giấy phép trước khi dùng thương mại):
- *Scan the World* (MyMiniFactory) — scan tượng bảo tàng thật, rất hợp chủ đề.
- *Sketchfab* (lọc Downloadable + CC0/CC-BY).
- *Poly Pizza*, *Quaternius* — model phong cách thấp đa giác nếu muốn nhẹ.

**Chuẩn hóa khi nạp model** (đã làm trong `_replace`): căn giữa theo trục X/Z, hạ chân
tượng chạm "sàn", rồi fit camera theo bounding sphere. Áp dụng tương tự để mọi model
to/nhỏ khác nhau đều khung hình đẹp.

---

## 3. Kiến trúc 3D — lưu ý hiệu năng

Gallery có 20 tượng. **KHÔNG** tạo 20 `<canvas>`/20 WebGL context (vượt giới hạn ~16
context của trình duyệt → vỡ). Prototype dùng kỹ thuật chuẩn của Three.js:

> **Một renderer duy nhất, nhiều scene, vẽ bằng scissor.**
> Canvas full màn hình cố định phía sau nội dung; mỗi niche là 1 `<div>`; vòng lặp render
> đọc `getBoundingClientRect()` của từng niche đang hiển thị, set `viewport` + `scissor`
> đúng vùng đó rồi render scene tương ứng. (Xem `js/statue-viewer.js`.)

Nếu build lại bằng **React Three Fiber**: dùng `<View>` của `@react-three/drei`
(`View.Port`) — đây chính là bản đóng gói sẵn của kỹ thuật trên. Mỗi god card bọc 1
`<View>`, dùng chung 1 `<Canvas eventSource>`.

OrbitControls mỗi tượng: `enableDamping`, `enablePan=false`, `enableZoom=false`
(giữ cuộn trang mượt — zoom qua nút +/−), giới hạn `polarAngle`.

---

## 4. Cây gia phả tương tác

- Xếp node theo **tầng = `generation`** (0 trên cùng → 4 dưới cùng).
- Trong mỗi tầng, phân bố đều theo chiều ngang.
- Cạnh = quan hệ **cha mẹ → con** (vẽ Bézier dọc từ đáy node cha tới đỉnh node con).
- **Tương tác:** click 1 node → làm nổi bật node đó (`sel`), các quan hệ
  (`parents ∪ children ∪ consorts` = `kin`) và các cạnh liên quan; phần còn lại mờ đi.
- Click vùng trống → bỏ chọn.

Logic đầy đủ ở `js/family-tree.jsx`.

---

## 5. Thẩm mỹ & theme

- Phong cách: **bảo tàng marble cổ điển** — trắng/kem, vàng đồng (`--gold`).
- 2 theme qua `[data-theme="light|dark"]` (xem `assets/css/styles.css`, biến `--*`).
- Font tiêu đề: **Cinzel** (chữ La Mã khắc đá). Thân: **Noto Serif** (hỗ trợ tiếng Việt
  tốt — *tránh* Lora vì dấu thanh chồng bị rời). Nhấn nghiêng: **Cormorant Garamond**.
- Có sẵn các tweak: theme sáng/tối, đổi font tiêu đề, bật/tắt tự xoay & ánh sáng kịch tính.

---

## 6. Gợi ý stack cho bản production

```
Vite + React + TypeScript
@react-three/fiber, @react-three/drei   // <View>, useGLTF, OrbitControls, Environment
three
```

- `useGLTF('/models/zeus.glb')` + `<Suspense>` fallback = tượng placeholder.
- `<Environment preset="studio">` cho phản chiếu marble đẹp hơn key/fill thủ công.
- Dữ liệu: import thẳng `pantheon.json`.
- Song ngữ: render cả `vi` và `en`, hoặc thêm toggle ngôn ngữ.

Nội dung tham khảo trực quan: mở `index.html` của prototype này.
```
