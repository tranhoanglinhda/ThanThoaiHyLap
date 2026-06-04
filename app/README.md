# PANTHEON — web 3D thần thoại Hy Lạp (production)

Bản production dựng theo `../handoff/README.md` §6: **Vite + React + TypeScript +
React Three Fiber**. Gallery 20 pho tượng marble (xoay/zoom) + cây gia phả tương tác,
song ngữ Việt–Anh.

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + bundle vào dist/
npm run preview  # xem thử bản build
```

## Dữ liệu — nguồn chân lý duy nhất

App import **thẳng** `../handoff/pantheon.json` qua `src/data/pantheon.ts` (Vite
`server.fs.allow: ['..']` cho phép đọc file ngoài thư mục app). Thêm/sửa thần →
chỉ sửa `pantheon.json`. Nhớ giữ `parents`/`children` đối xứng.

## Model 3D

- Đặt `<id>.glb` vào `public/models/` (trường `model` trong JSON đã trỏ sẵn).
- Thiếu model → fallback tượng marble placeholder (`src/components/Placeholder.tsx`).
- Kéo–thả `.glb`/`.gltf` lên một niche để xem ngay (tạm thời, không lưu).
- Model được chuẩn hóa khi nạp: căn giữa X/Z, hạ chân chạm sàn, scale chiều cao
  đồng nhất (`src/components/Statue.tsx`).

## Kiến trúc 3D

Đúng kỹ thuật README §3: **một `<Canvas>` duy nhất**, mỗi niche là một
`<View>` của `@react-three/drei` (bản đóng gói sẵn của "một renderer, nhiều scene,
vẽ bằng scissor") — vượt giới hạn ~16 WebGL context. OrbitControls mỗi tượng:
`enableDamping`, `enablePan=false`, `enableZoom=false` (zoom qua nút +/−), giới hạn
`polarAngle`.

## Cấu trúc

```
src/
  data/pantheon.ts        # import pantheon.json + types
  hooks/useTweaks.ts      # settings (theme/font/auto-rotate/light) → localStorage
  hooks/useReveal.ts      # reveal-on-scroll
  components/
    TopBar, Hero, Footer, SettingsPanel
    Gallery.tsx           # shared Canvas + Views + group bands
    GodRow.tsx            # niche (3D) + text + relation chips + drop .glb
    StatueScene.tsx       # camera + lighting + OrbitControls + zoom/reset
    Statue.tsx            # GLTF loader + normalise, fallback placeholder
    Placeholder.tsx       # procedural marble bust
    FamilyTree.tsx        # SVG node-link, click để highlight quan hệ
  styles.css              # theme marble (ported), light/dark via [data-theme]
```

## Tinh chỉnh (nút ⚙ góc dưới phải)

Theme sáng/tối · font tiêu đề (Cinzel/Cormorant/Playfair/EB Garamond) · tự xoay ·
ánh sáng kịch tính. Lưu vào `localStorage`.
