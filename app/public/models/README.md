# models/ — chỗ trống chờ model 3D

Đặt file model vào đây theo đúng tên `<id>.glb` (ví dụ `zeus.glb`, `athena.glb`,
`hades.glb`…). Trường `model` trong `pantheon.json` đã trỏ sẵn tới `models/<id>.glb`.

- Ưu tiên `.glb` (gộp 1 file). `.gltf` + textures rời cũng được.
- Thiếu model cho vị nào → tự động fallback về tượng marble placeholder.
- Hoặc kéo–thả một file `.glb`/`.gltf` thẳng lên niche để xem ngay (không lưu).

Model được chuẩn hóa khi nạp: căn giữa X/Z, hạ chân chạm sàn, scale về chiều cao
đồng nhất để khung hình luôn đẹp.
