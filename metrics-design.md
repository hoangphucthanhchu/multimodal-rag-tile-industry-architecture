# Metrics System Design - Multimodal RAG System

## Tổng quan

Metrics system được thiết kế để theo dõi, đo lường và phân tích hiệu năng, chất lượng và hoạt động của Multimodal RAG System. Hệ thống metrics cung cấp insights quan trọng cho cả technical team và business stakeholders để đảm bảo hệ thống hoạt động tối ưu và đáp ứng mục tiêu kinh doanh.

### Mục tiêu
- **Monitoring**: Theo dõi real-time health và performance của hệ thống
- **Alerting**: Cảnh báo sớm khi có vấn đề hoặc anomalies
- **Optimization**: Xác định bottlenecks và cơ hội tối ưu hóa
- **Business Intelligence**: Đo lường tác động kinh doanh và user engagement
- **Cost Management**: Theo dõi và quản lý chi phí vận hành

## 1. Performance Metrics

### 1.1. Retrieval Performance

**Latency Metrics**:
- `retrieval_latency_ms`: Thời gian từ khi nhận query đến khi trả về kết quả (p50, p95, p99)
- `vector_search_latency_ms`: Thời gian tìm kiếm similarity trong vector database
- `metadata_query_latency_ms`: Thời gian query metadata từ MetadataDB
- `total_retrieval_latency_ms`: Tổng thời gian retrieval (bao gồm encoding + search + metadata)

**Throughput Metrics**:
- `queries_per_second`: Số queries xử lý mỗi giây
- `concurrent_queries`: Số queries đang xử lý đồng thời
- `peak_queries_per_second`: Peak throughput trong khoảng thời gian

**Accuracy Metrics**:
- `retrieval_precision@k`: Độ chính xác của top-k results (k=5, 10, 20)
- `retrieval_recall@k`: Độ bao phủ của top-k results
- `mean_reciprocal_rank`: MRR - đánh giá chất lượng ranking
- `ndcg_score`: Normalized Discounted Cumulative Gain

### 1.2. Encoding Performance

- `vision_encoding_latency_ms`: Thời gian encode hình ảnh thành embeddings (CLIP vision encoder)
- `text_encoding_latency_ms`: Thời gian encode văn bản thành embeddings (CLIP text encoder)
- `encoding_throughput`: Số items encode được mỗi giây
- `encoding_queue_size`: Số items đang chờ encode
- `clip_model_version`: Version của CLIP model đang sử dụng (ViT-B/32, ViT-L/14, etc.)

### 1.3. LLM Generation Performance

- `llm_generation_latency_ms`: Thời gian generate response từ LLM (p50, p95, p99)
- `tokens_per_second`: Tốc độ generate tokens
- `llm_requests_per_second`: Số requests đến LLM mỗi giây
- `llm_context_length`: Độ dài context được gửi đến LLM
- `llm_response_length`: Độ dài response từ LLM

## 2. Business Metrics

### 2.1. User Engagement

- `daily_active_users`: Số user hoạt động mỗi ngày (DAU)
- `monthly_active_users`: Số user hoạt động mỗi tháng (MAU)
- `sessions_per_user`: Số sessions trung bình mỗi user
- `queries_per_session`: Số queries trung bình mỗi session
- `session_duration_seconds`: Thời lượng session trung bình
- `returning_users_percentage`: Tỷ lệ user quay lại

### 2.2. Search & Discovery

- `search_queries_total`: Tổng số search queries
- `search_queries_by_type`: Phân loại queries theo type (text/image/mixed)
- `search_success_rate`: Tỷ lệ queries trả về kết quả (có ít nhất 1 result)
- `zero_result_rate`: Tỷ lệ queries không có kết quả
- `click_through_rate`: Tỷ lệ click vào kết quả search
- `product_view_rate`: Tỷ lệ xem chi tiết sản phẩm từ search results
- `average_results_per_query`: Số kết quả trung bình mỗi query

### 2.3. Order Creation

- `draft_orders_created_total`: Tổng số đơn nháp được tạo
- `draft_order_creation_success_rate`: Tỷ lệ tạo đơn thành công
- `draft_order_creation_failure_reasons`: Phân loại lý do thất bại:
  - `out_of_stock_failures`: Số lần thất bại do hết hàng
  - `no_permission_failures`: Số lần thất bại do không có quyền
  - `validation_failures`: Số lần thất bại do validation errors
- `draft_order_creation_latency_ms`: Thời gian tạo đơn nháp
- `products_per_order`: Số sản phẩm trung bình mỗi đơn
- `order_value_total`: Tổng giá trị đơn hàng

### 2.4. Pricing & Inventory

- `price_inquiries_total`: Tổng số lần hỏi giá
- `inventory_inquiries_total`: Tổng số lần hỏi tồn kho
- `inventory_check_success_rate`: Tỷ lệ kiểm tra tồn kho thành công
- `real_time_inventory_check_latency_ms`: Thời gian check inventory real-time từ ERP
- `inventory_display_latency_ms`: Thời gian hiển thị inventory từ MetadataDB

## 3. Data Quality Metrics

### 3.1. Data Sync Metrics

**Price Sync**:
- `price_sync_success_rate`: Tỷ lệ sync giá thành công
- `price_sync_latency_seconds`: Thời gian sync giá từ ERP
- `price_sync_frequency`: Tần suất sync (mỗi 15-30 phút)
- `price_sync_errors`: Số lỗi khi sync giá

**Inventory Sync**:
- `inventory_sync_success_rate`: Tỷ lệ sync tồn kho thành công
- `inventory_sync_latency_seconds`: Thời gian sync tồn kho từ ERP
- `inventory_sync_frequency`: Tần suất sync (mỗi 5-10 phút)
- `inventory_sync_errors`: Số lỗi khi sync tồn kho

**Sales & Authorization Sync**:
- `sales_sync_success_rate`: Tỷ lệ sync sales data thành công
- `authorization_sync_success_rate`: Tỷ lệ sync authorization data thành công

**Data Freshness**:
- `data_freshness_seconds`: Độ "tươi" của dữ liệu (thời gian từ lần sync cuối)
- `stale_data_percentage`: Tỷ lệ dữ liệu quá cũ (vượt quá threshold)

### 3.2. Data Completeness

- `products_with_images_percentage`: Tỷ lệ sản phẩm có hình ảnh
- `products_with_embeddings_percentage`: Tỷ lệ sản phẩm đã được encode embeddings
- `products_with_pricing_percentage`: Tỷ lệ sản phẩm có thông tin giá
- `products_with_inventory_percentage`: Tỷ lệ sản phẩm có thông tin tồn kho
- `products_with_complete_data_percentage`: Tỷ lệ sản phẩm có đầy đủ dữ liệu (image + embedding + pricing + inventory)

### 3.3. Embedding Quality

- `embedding_dimension`: Kích thước embedding (768D, 1024D, etc.)
- `embedding_norm_distribution`: Phân bố norm của embeddings (để kiểm tra normalization)
- `embedding_similarity_distribution`: Phân bố similarity scores trong vector search
- `embedding_coverage`: Tỷ lệ products có embeddings trong vector DB

## 4. Authorization & Security Metrics

### 4.1. Authorization Performance

- `authorization_check_latency_ms`: Thời gian kiểm tra quyền truy cập
- `authorization_success_rate`: Tỷ lệ kiểm tra quyền thành công
- `unauthorized_access_attempts`: Số lần truy cập không được phép
- `authorization_cache_hit_rate`: Tỷ lệ cache hit cho authorization checks

### 4.2. Role-based Metrics

- `queries_by_user_role`: Số queries theo role (Sales/Customer/Admin)
- `inventory_access_by_role`: Số lần truy cập tồn kho theo role
- `draft_orders_by_role`: Số đơn nháp được tạo theo role
- `price_inquiries_by_role`: Số lần hỏi giá theo role

### 4.3. Company Authorization

- `sales_company_authorization_checks`: Số lần kiểm tra quyền Sales-Company
- `authorized_companies_per_sales`: Số công ty được phân quyền trung bình mỗi Sales user
- `authorization_denials_by_reason`: Số lần từ chối truy cập theo lý do:
  - `no_company_permission`: Không có quyền truy cập công ty
  - `invalid_role`: Role không hợp lệ
  - `expired_authorization`: Authorization đã hết hạn

## 5. Infrastructure Metrics

### 5.1. Database Metrics

**Vector Database**:
- `vector_db_query_latency_ms`: Thời gian query vector DB
- `vector_db_connection_pool_usage`: Tỷ lệ sử dụng connection pool
- `vector_db_connection_errors`: Số lỗi kết nối vector DB
- `vector_db_index_size`: Kích thước index trong vector DB

**Metadata Database**:
- `metadata_db_query_latency_ms`: Thời gian query metadata DB
- `metadata_db_connection_pool_usage`: Tỷ lệ sử dụng connection pool
- `metadata_db_connection_errors`: Số lỗi kết nối metadata DB
- `metadata_db_query_throughput`: Số queries mỗi giây

### 5.2. ERP Integration Metrics

- `erp_api_calls_total`: Tổng số API calls đến ERP
- `erp_api_latency_ms`: Thời gian response từ ERP (p50, p95, p99)
- `erp_api_error_rate`: Tỷ lệ lỗi khi gọi ERP API
- `erp_api_timeout_rate`: Tỷ lệ timeout khi gọi ERP API
- `erp_api_retry_attempts`: Số lần retry khi gọi ERP API
- `erp_connection_errors`: Số lỗi kết nối đến ERP

### 5.3. Storage Metrics

- `vector_db_size_gb`: Kích thước vector database (GB)
- `metadata_db_size_gb`: Kích thước metadata database (GB)
- `storage_usage_percentage`: Tỷ lệ sử dụng storage
- `storage_growth_rate`: Tốc độ tăng trưởng storage (GB/day)

## 6. Error & Reliability Metrics

### 6.1. Error Rates

- `error_rate_total`: Tỷ lệ lỗi tổng thể
- `error_rate_by_type`: Tỷ lệ lỗi theo loại:
  - `timeout_errors`: Lỗi timeout
  - `validation_errors`: Lỗi validation
  - `authorization_errors`: Lỗi authorization
  - `database_errors`: Lỗi database
  - `erp_integration_errors`: Lỗi tích hợp ERP
  - `llm_errors`: Lỗi LLM generation
- `retry_attempts`: Số lần retry trung bình
- `circuit_breaker_opens`: Số lần circuit breaker mở

### 6.2. Availability

- `service_uptime_percentage`: Tỷ lệ thời gian hoạt động (99.9%, 99.99%, etc.)
- `service_downtime_seconds`: Tổng thời gian downtime
- `mean_time_to_recovery_seconds`: MTTR - thời gian phục hồi trung bình
- `incident_count`: Số lượng incidents
- `critical_incident_count`: Số lượng critical incidents

## 7. Cost Metrics

### 7.1. LLM Costs

- `llm_tokens_used_total`: Tổng số tokens sử dụng
- `llm_tokens_per_query`: Số tokens trung bình mỗi query
- `llm_cost_per_query`: Chi phí trung bình mỗi query
- `llm_cost_by_model`: Chi phí theo model (GPT-4, Claude, etc.)
- `llm_cost_total_monthly`: Tổng chi phí LLM mỗi tháng

### 7.2. Infrastructure Costs

- `vector_db_cost_per_month`: Chi phí vector DB mỗi tháng
- `metadata_db_cost_per_month`: Chi phí metadata DB mỗi tháng
- `compute_cost_per_month`: Chi phí compute (encoding, processing) mỗi tháng
- `storage_cost_per_month`: Chi phí storage mỗi tháng
- `total_infrastructure_cost_per_month`: Tổng chi phí infrastructure mỗi tháng

### 7.3. Cost Efficiency

- `cost_per_query`: Chi phí trung bình mỗi query
- `cost_per_user`: Chi phí trung bình mỗi user
- `cost_per_order`: Chi phí trung bình mỗi đơn hàng

## 8. Recommendation Metrics

- `recommendations_shown_total`: Tổng số recommendations được hiển thị
- `recommendation_click_rate`: Tỷ lệ click vào recommendations
- `recommendation_conversion_rate`: Tỷ lệ chuyển đổi từ recommendation sang đơn hàng
- `recommendation_relevance_score`: Điểm relevance của recommendations (user feedback)
- `recommendations_per_product_view`: Số recommendations trung bình mỗi lần xem sản phẩm

## 9. Implementation Strategy

### 9.1. Metrics Collection Points

**Service Layer Instrumentation**:
- Retrieval Service: Track latency, throughput, accuracy
- Pricing Service: Track pricing resolution latency, success rate
- Authorization Service: Track authorization checks, denials
- Inventory Service: Track inventory queries, real-time checks
- LLM Generation: Track generation latency, token usage

**Database Instrumentation**:
- Vector DB queries: Track query latency, connection pool usage
- Metadata DB queries: Track query latency, errors
- ERP API calls: Track API latency, errors, timeouts

**User Interaction Points**:
- Search queries: Track query type, results, clicks
- Order creation: Track success/failure, latency
- Price/inventory inquiries: Track frequency, success rate

### 9.2. Metrics Storage

**Time-series Database**:
- **Primary**: Prometheus hoặc InfluxDB cho real-time metrics
- **Retention**: 30-90 ngày cho high-frequency metrics
- **Aggregation**: Pre-aggregate metrics theo giờ/ngày cho long-term storage

**Structured Logging**:
- **Format**: JSON logs với correlation IDs
- **Storage**: ELK stack (Elasticsearch, Logstash, Kibana) hoặc CloudWatch
- **Use cases**: Error tracking, audit logs, detailed debugging

**Analytics Data Warehouse**:
- **Storage**: BigQuery
- **Purpose**: Business intelligence, long-term trends, reporting
- **ETL**: Batch processing từ time-series DB và logs

### 9.3. Metrics Export & Visualization

**Real-time Dashboards**:
- **Tool**: Grafana với Prometheus/InfluxDB
- **Dashboards**:
  - Operational Dashboard: System health, latency, errors
  - Business Dashboard: User engagement, orders, revenue
  - Technical Dashboard: Infrastructure, costs, data quality

**Alerting**:
- **Tool**: AlertManager (với Prometheus) hoặc PagerDuty
- **Critical Alerts**:
  - High error rate (> 5%)
  - High latency (p95 > 2s)
  - Service downtime
  - Data sync failures
  - ERP integration failures

**Reporting**:
- **Business Reports**: Weekly/Monthly reports cho stakeholders
- **Technical Reports**: Performance trends, optimization opportunities
- **Cost Reports**: Monthly cost breakdown và forecasts

## 10. Key Metrics Dashboard

### 10.1. Operational Dashboard

**System Health**:
- Service uptime percentage
- Error rate (total và theo type)
- Request latency (p50, p95, p99)
- Throughput (queries per second)

**Data Sync Status**:
- Price sync success rate và latency
- Inventory sync success rate và latency
- Data freshness indicators

**Infrastructure Health**:
- Database connection pool usage
- ERP API latency và error rate
- Storage usage và growth rate

### 10.2. Business Dashboard

**User Engagement**:
- DAU/MAU trends
- Sessions per user
- Session duration

**Search Performance**:
- Total queries và queries by type
- Search success rate
- Click-through rate
- Zero result rate

**Order Creation**:
- Draft orders created
- Success rate
- Failure reasons breakdown
- Average order value

**Pricing & Inventory**:
- Price inquiries total
- Inventory inquiries total
- Real-time check performance

### 10.3. Technical Dashboard

**Performance Metrics**:
- Retrieval latency breakdown
- Encoding performance
- LLM generation latency và throughput

**Infrastructure Metrics**:
- Database query performance
- ERP integration health
- Storage metrics

**Cost Tracking**:
- LLM costs (tokens, cost per query)
- Infrastructure costs breakdown
- Cost efficiency metrics (cost per query, cost per user)

**Data Quality**:
- Data completeness metrics
- Embedding quality indicators
- Sync success rates

## 11. Alerting Rules

### Critical Alerts (Immediate Action Required)

- **Service Down**: Service uptime < 99%
- **High Error Rate**: Error rate > 5% trong 5 phút
- **High Latency**: p95 latency > 2 giây trong 10 phút
- **Data Sync Failure**: Sync success rate < 90% trong 30 phút
- **ERP Integration Failure**: ERP API error rate > 10% trong 5 phút

### Warning Alerts (Monitor Closely)

- **Elevated Error Rate**: Error rate > 2% trong 15 phút
- **Elevated Latency**: p95 latency > 1 giây trong 15 phút
- **Data Staleness**: Data freshness > 1 giờ
- **Storage Usage**: Storage usage > 80%
- **High Cost**: Daily cost > 150% của average daily cost

### Info Alerts (Track Trends)

- **Zero Results**: Zero result rate > 20% trong 1 giờ
- **Low Engagement**: DAU giảm > 10% so với tuần trước
- **Order Creation Issues**: Order creation success rate < 95% trong 1 giờ

