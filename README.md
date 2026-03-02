## Multimodal RAG System cho Sản phẩm Gạch

Hệ thống này thiết kế một **Multimodal RAG** cho sản phẩm gạch, hỗ trợ tìm kiếm, hỏi đáp và gợi ý sản phẩm dựa trên **text + image + thông số kỹ thuật**, tích hợp chặt với **ERP** để xử lý giá, tồn kho và tạo đơn nháp.

### High-Level Architecture

Sơ đồ kiến trúc tổng thể:

![High-Level Architecture](diagrams/High-Level%20Architecture.png)

### Tài liệu chi tiết

- **System Design chi tiết**: xem `system-design.md`  
  - Data ingestion, enrichment, CLIP encoding, vector search  
  - Pricing, authorization, inventory, draft order flow  
  - Data sync strategy với ERP

- **Metrics & Observability**: xem `metrics-design.md`  
  - Performance metrics (retrieval, encoding, LLM)  
  - Business metrics (engagement, search, orders)  
  - Data quality, infra, cost & alerting

### Cấu trúc thư mục chính

- `system-design.md`: Thiết kế kiến trúc hệ thống Multimodal RAG
- `metrics-design.md`: Thiết kế hệ thống metrics/observability
- `diagrams/`: Chứa các sơ đồ kiến trúc & flow (PNG/SVG)
- `scripts/`: Script hỗ trợ (ví dụ: `mermaid-to-svg.mjs`)

### Tác giả

- **Author**: chuhoangphucthanh

### License

Project này sử dụng **MIT License** (xem file `LICENSE`).

