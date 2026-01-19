# Multimodal RAG System Design - Sản phẩm Gạch

## Tổng quan

Hệ thống RAG (Retrieval Augmented Generation) multimodal cho sản phẩm gạch, được thiết kế để hỗ trợ tìm kiếm thông minh, hỏi đáp và gợi ý sản phẩm dựa trên hình ảnh, mô tả văn bản và thông số kỹ thuật. Hệ thống tích hợp với ERP để quản lý giá cả theo đối tác/công ty thành viên, kiểm tra tồn kho, và tạo đơn nháp tự động.

### Mục tiêu chính
- **Tìm kiếm đa phương thức**: Hỗ trợ tìm kiếm sản phẩm bằng văn bản, hình ảnh, hoặc kết hợp cả hai
- **Cá nhân hóa giá cả**: Hiển thị giá sản phẩm theo đối tác/công ty thành viên của người dùng
- **Quản lý tồn kho**: Hiển thị trạng thái tồn kho và kiểm tra real-time khi tạo đơn
- **Tự động hóa đơn hàng**: Tạo đơn nháp tự động với thông tin sales và đối tác
- **Hỏi đáp thông minh**: Trả lời câu hỏi về sản phẩm dựa trên RAG context

### Tính năng nổi bật
1. **Multimodal Search**: Tìm kiếm sản phẩm bằng text, image, hoặc mixed query
2. **Personalized Pricing**: Giá cả được cá nhân hóa theo đối tác/công ty thành viên
3. **Real-time Inventory**: Kiểm tra tồn kho real-time khi tạo đơn nháp
4. **Role-based Access Control**: Phân quyền truy cập tồn kho theo role (Sales chỉ xem công ty được phân quyền, Customer chỉ biết còn hàng/hết hàng)
5. **Draft Order Creation**: Tạo đơn nháp tự động với sales info và partner context
6. **Intelligent Q&A**: Hỏi đáp về sản phẩm với context-aware responses
7. **Product Recommendations**: Gợi ý sản phẩm tương tự dựa trên sản phẩm hiện tại

### Kiến trúc kỹ thuật
- **CLIP Pre-trained Model**: Sử dụng CLIP để encode hình ảnh và văn bản vào cùng embedding space
- **Dual Embedding Storage**: Lưu riêng image và text embeddings, merge results cho mixed queries
- **Vector Search**: Tìm kiếm similarity trong vector database
- **Hybrid Sync Strategy**: Kết hợp sync định kỳ và real-time check
- **Role-based Authorization**: Hệ thống phân quyền kiểm soát quyền truy cập tồn kho theo role và company authorization
- **Context-Aware Generation**: LLM generation với retrieved context và metadata
- **ERP Integration**: Tích hợp sâu với ERP system cho pricing, inventory, order management, và authorization

## Kiến trúc hệ thống

Diagram tổng quan dưới đây hiển thị các layer chính và flow chính của hệ thống. Các flow chi tiết được mô tả trong các section riêng biệt:

- **Data Ingestion Flow**: Chi tiết flow từ Data Sources qua Ingestion, Enrichment, Processing đến Storage
- **Retrieval & Search Flow**: Chi tiết flow từ User Query qua Retrieval, Pricing, Authorization, Inventory đến Generation
- **Authorization & Inventory Flow**: Chi tiết flow authorization và inventory filtering theo role
- **Draft Order Creation Flow**: Chi tiết flow tạo đơn nháp với authorization và validation

```mermaid
flowchart TB
    subgraph dataSources [Data Sources]
        ERP[ERP System]
        S3[S3 Storage]
    end

    subgraph ingestion [Data Ingestion Layer]
        IngestionServices[Connectors & Sync Jobs]
    end

    subgraph processing [Processing Layer]
        ProcessingServices[CLIP Encoding]
    end

    subgraph storage [Storage Layer]
        VectorDB[(Vector Database)]
        MetadataDB[(Metadata DB)]
    end

    subgraph services [Service Layer]
        RetrievalService[Retrieval Service]
        PricingService[Pricing Service]
        AuthService[Authorization Service]
        InventoryService[Inventory Service]
    end

    subgraph generation [Generation Layer]
        LLM[LLM]
    end

    subgraph output [Output Layer]
        OutputResults[Search, Q&A, Recommendations, Prices, Draft Orders]
    end

    subgraph users [Users]
        UserInput[User Queries & Requests]
    end

    %% Main flows
    ERP --> IngestionServices
    S3 --> IngestionServices
    IngestionServices --> ProcessingServices
    ProcessingServices --> VectorDB
    ProcessingServices --> MetadataDB
    
    UserInput --> RetrievalService
    VectorDB --> RetrievalService
    MetadataDB --> RetrievalService
    
    UserInput --> PricingService
    MetadataDB --> PricingService
    
    UserInput --> AuthService
    MetadataDB --> AuthService
    
    UserInput --> InventoryService
    MetadataDB --> InventoryService
    AuthService --> InventoryService
    
    RetrievalService --> LLM
    PricingService --> LLM
    InventoryService --> LLM
    LLM --> OutputResults
    
    InventoryService -.->|Real-time Check| ERP
    OutputResults -.->|Draft Orders| ERP

    %% Styling
    classDef dataSource fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef ingestion fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef processing fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef services fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    classDef generation fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef output fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef users fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class ERP,S3 dataSource
    class IngestionServices ingestion
    class ProcessingServices processing
    class VectorDB,MetadataDB storage
    class RetrievalService,PricingService,AuthService,InventoryService services
    class LLM generation
    class OutputResults output
    class UserInput users
```

## Data Ingestion Flow

Flow chi tiết từ Data Sources qua Ingestion, Enrichment, Processing đến Storage:

```mermaid
flowchart TB
    subgraph dataSources [Data Sources]
        ERP[ERP System<br/>Product Data, Prices, Inventory, Sales, Partners, User Roles, Authorization]
        S3[S3 Storage<br/>Product Images]
    end

    subgraph ingestion [Data Ingestion Layer]
        ERPConnector[ERP Connector]
        S3Connector[S3 Connector]
        CronSyncJobs[Cron Sync Jobs<br/>Price: 15-30min<br/>Inventory: 5-10min<br/>Sales: on-demand]
    end

    subgraph enrichment [Enrichment Layer]
        EnrichmentEntity[Enrichment Entity<br/>Data Enrichment & Validation]
    end

    subgraph processing [Processing Layer]
        CLIPModel[CLIP Model<br/>Vision & Text Encoder]
    end

    subgraph storage [Storage Layer]
        VectorDB[(Vector Database)]
        MetadataDB[(Metadata DB)]
    end

    %% Data Flow
    ERP -->|Product Data, Prices, Inventory, Sales, Partners, User Roles, Authorization| ERPConnector
    S3 -->|Product Images| S3Connector
    
    ERPConnector -->|Raw Data| CronSyncJobs
    CronSyncJobs -->|Sync Data| MetadataDB
    
    ERPConnector -->|Raw Product Data| EnrichmentEntity
    S3Connector -->|Image URLs/Paths| EnrichmentEntity
    
    EnrichmentEntity -->|Images| CLIPModel
    EnrichmentEntity -->|Text & Specs| CLIPModel
    
    CLIPModel -->|Image Embeddings| VectorDB
    CLIPModel -->|Text Embeddings| VectorDB
    EnrichmentEntity -->|Product Metadata, Prices, Partners| MetadataDB

    %% Styling
    classDef dataSource fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef ingestion fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef enrichment fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef processing fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class ERP,S3 dataSource
    class ERPConnector,S3Connector,CronSyncJobs ingestion
    class EnrichmentEntity enrichment
    class CLIPModel processing
    class VectorDB,MetadataDB storage
```

## Retrieval & Search Flow

Flow chi tiết từ User Query qua Retrieval, Pricing, Authorization, Inventory đến Generation:

```mermaid
flowchart TB
    subgraph users [Users]
        UserQuery[User Query<br/>Text/Image/Mixed]
        UserContext[User Context<br/>Partner/Company/Sales Info]
    end

    subgraph retrieval [Retrieval Layer]
        RetrievalEngine[Retrieval Engine<br/>Similarity Search & Ranking]
    end

    subgraph pricing [Pricing Service]
        PartnerContext[Partner Context Manager]
        PricingResolver[Pricing Resolver]
    end

    subgraph authorization [Authorization Service]
        AuthorizationService[Authorization Service]
        CompanyAuthManager[Company Authorization Manager]
    end

    subgraph inventory [Inventory Service]
        InventoryResolver[Inventory Resolver]
    end

    subgraph storage [Storage Layer]
        VectorDB[(Vector Database)]
        MetadataDB[(Metadata DB)]
    end

    subgraph generation [Generation Layer]
        LLM[LLM]
    end

    subgraph output [Output Layer]
        SearchResults[Search Results]
        QAResults[Q&A Answers]
        Recommendations[Recommendations]
        PriceResults[Price Results]
    end

    %% Query Flow
    UserQuery -->|Query Embedding| RetrievalEngine
    VectorDB -->|Similarity Search| RetrievalEngine
    MetadataDB -->|Product Context| RetrievalEngine
    
    %% Pricing Flow
    UserContext -->|Partner/Company Info| PartnerContext
    PartnerContext -->|User Context| PricingResolver
    MetadataDB -->|Pricing Data| PricingResolver
    RetrievalEngine -->|Product Info| PricingResolver
    
    %% Authorization Flow
    UserContext -->|User Role & Info| AuthorizationService
    MetadataDB -->|User Roles, Sales-Company Authorization| AuthorizationService
    AuthorizationService -->|User Permissions| CompanyAuthManager
    MetadataDB -->|Sales-Company Authorization| CompanyAuthManager
    CompanyAuthManager -->|Authorized Companies| AuthorizationService
    
    %% Inventory Flow
    MetadataDB -->|Inventory Data| InventoryResolver
    AuthorizationService -->|User Permissions| InventoryResolver
    
    %% Generation Flow
    RetrievalEngine -->|Retrieved Context| LLM
    PricingResolver -->|Price Context| LLM
    InventoryResolver -->|Filtered Inventory Status| LLM
    
    %% Output Flow
    LLM -->|Generated Response| SearchResults
    LLM -->|Generated Response| QAResults
    LLM -->|Generated Response| Recommendations
    LLM -->|Generated Response| PriceResults

    %% Styling
    classDef users fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef retrieval fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    classDef pricing fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef authorization fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef inventory fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef generation fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef output fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px

    class UserQuery,UserContext users
    class RetrievalEngine retrieval
    class PartnerContext,PricingResolver pricing
    class AuthorizationService,CompanyAuthManager authorization
    class InventoryResolver inventory
    class VectorDB,MetadataDB storage
    class LLM generation
    class SearchResults,QAResults,Recommendations,PriceResults output
```

## Authorization & Inventory Flow

Flow chi tiết về authorization và inventory filtering theo role:

```mermaid
flowchart TB
    subgraph users [Users]
        UserContext[User Context<br/>User Role, Partner/Company Info]
    end

    subgraph authorization [Authorization Service Layer]
        AuthorizationService[Authorization Service<br/>Role-based Access Control]
        CompanyAuthManager[Company Authorization Manager<br/>Sales-Company Authorization]
    end

    subgraph inventory [Inventory Service Layer]
        InventoryResolver[Inventory Resolver<br/>Get Inventory from MetadataDB]
        InventoryValidator[Inventory Validator<br/>Real-time Check from ERP]
    end

    subgraph storage [Storage Layer]
        MetadataDB[(Metadata DB<br/>User Roles, Sales-Company Authorization, Inventory)]
    end

    subgraph erp [ERP System]
        ERP[ERP System<br/>Real-time Inventory]
    end

    subgraph output [Output]
        InventoryDisplay[Filtered Inventory Status]
        ValidationResult[Validation Result]
    end

    %% Authorization Flow
    UserContext -->|User Role & Info| AuthorizationService
    MetadataDB -->|User Roles, Sales-Company Authorization| AuthorizationService
    AuthorizationService -->|Check Permissions| CompanyAuthManager
    MetadataDB -->|Sales-Company Authorization| CompanyAuthManager
    CompanyAuthManager -->|Authorized Companies| AuthorizationService
    
    %% Inventory Display Flow
    MetadataDB -->|Inventory Data| InventoryResolver
    AuthorizationService -->|User Permissions| InventoryResolver
    InventoryResolver -->|Filtered by Role| InventoryDisplay
    
    %% Inventory Validation Flow
    AuthorizationService -->|User Permissions| InventoryValidator
    InventoryValidator -->|Real-time Check| ERP
    ERP -->|Inventory Status| InventoryValidator
    InventoryValidator -->|Validated Result| ValidationResult

    %% Styling
    classDef users fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef authorization fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef inventory fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef erp fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef output fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px

    class UserContext users
    class AuthorizationService,CompanyAuthManager authorization
    class InventoryResolver,InventoryValidator inventory
    class MetadataDB storage
    class ERP erp
    class InventoryDisplay,ValidationResult output
```

## Draft Order Creation Flow

Flow chi tiết tạo đơn nháp với authorization và validation:

```mermaid
flowchart TB
    subgraph users [Users]
        DraftOrderRequest[Draft Order Request<br/>Product List]
        UserContext[User Context<br/>Sales Info, Partner/Company]
    end

    subgraph authorization [Authorization Service]
        AuthorizationService[Authorization Service]
        CompanyAuthManager[Company Authorization Manager]
    end

    subgraph inventory [Inventory Service]
        InventoryValidator[Inventory Validator<br/>Real-time Check]
        SalesContext[Sales Context Manager<br/>User-Sales Mapping]
    end

    subgraph storage [Storage Layer]
        MetadataDB[(Metadata DB<br/>Sales Mapping, Authorization)]
    end

    subgraph erp [ERP System]
        ERP[ERP System<br/>Real-time Inventory]
    end

    subgraph output [Output]
        DraftOrder[Draft Order<br/>with Sales Info]
        ErrorResponse[Error Response<br/>No Permission / Out of Stock]
    end

    %% Request Flow
    DraftOrderRequest -->|Product List| InventoryValidator
    UserContext -->|Sales Info| SalesContext
    MetadataDB -->|Sales Mapping| SalesContext
    
    %% Authorization Check
    UserContext -->|User Role & Info| AuthorizationService
    MetadataDB -->|User Roles, Sales-Company Authorization| AuthorizationService
    AuthorizationService -->|Check Permissions| CompanyAuthManager
    MetadataDB -->|Sales-Company Authorization| CompanyAuthManager
    CompanyAuthManager -->|Authorized Companies| AuthorizationService
    AuthorizationService -->|User Permissions| InventoryValidator
    
    %% Validation Flow
    InventoryValidator -->|Real-time Check| ERP
    ERP -->|Inventory Status| InventoryValidator
    
    %% Success Path
    SalesContext -->|Sales Info| DraftOrder
    InventoryValidator -->|Validated Products| DraftOrder
    DraftOrder -->|Draft Order with Sales Info| ERP
    
    %% Error Path
    AuthorizationService -.->|No Permission| ErrorResponse
    InventoryValidator -.->|Out of Stock| ErrorResponse

    %% Styling
    classDef users fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef authorization fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef inventory fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef erp fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef output fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px

    class DraftOrderRequest,UserContext users
    class AuthorizationService,CompanyAuthManager authorization
    class InventoryValidator,SalesContext inventory
    class MetadataDB storage
    class ERP erp
    class DraftOrder output
    class ErrorResponse error
```

## Chi tiết các thành phần

### 1. Data Sources
- **ERP System**: Chứa dữ liệu sản phẩm (metadata, thông số kỹ thuật, mô tả), bảng giá sản phẩm theo đối tác, bảng giá sản phẩm theo công ty thành viên, thông tin đối tác và công ty thành viên, inventory data (bao gồm số lượng, vị trí kho, đuôi màu), sales data (bao gồm thông tin sales và user-sales mapping), user roles, và sales-company authorization
- **S3 Storage**: Lưu trữ hình ảnh sản phẩm

### 2. Data Ingestion Layer
- **ERP Connector**: Pull dữ liệu sản phẩm, bảng giá theo đối tác/công ty thành viên, thông tin đối tác và công ty thành viên, inventory data, sales data, user roles, và sales-company authorization từ ERP system
- **S3 Connector**: Fetch hình ảnh sản phẩm từ S3 storage
- **Cron Sync Jobs**: 
  - **Price Sync**: Đồng bộ bảng giá từ ERP → MetadataDB định kỳ mỗi 15-30 phút
  - **Inventory Sync**: Đồng bộ inventory từ ERP → MetadataDB định kỳ mỗi 5-10 phút (dùng cho hiển thị)
  - **Sales Sync**: Đồng bộ sales data và user-sales mapping từ ERP → MetadataDB (có thể sync định kỳ hoặc on-demand)
  - **User Roles & Authorization Sync**: Đồng bộ user roles và sales-company authorization từ ERP → MetadataDB (có thể sync định kỳ hoặc on-demand)

### 3. Enrichment Layer
- **Enrichment Entity**: 
  - Kết hợp dữ liệu từ ERP (sản phẩm, giá, đối tác, công ty thành viên) và S3
  - Bổ sung metadata, tags, categories
  - Chuẩn hóa và validate dữ liệu
  - Tạo enriched product entities

### 4. Processing Layer
- **CLIP Model**: Sử dụng CLIP pre-trained model (ViT-B/32 hoặc ViT-L/14) để encode cả hình ảnh và văn bản
  - **Vision Encoder**: CLIP vision encoder chuyển đổi hình ảnh thành embeddings
    - Output dimension: 512D (ViT-B/32) hoặc 768D (ViT-L/14)
    - Preprocessing: CLIP image preprocessing (resize, normalize)
  - **Text Encoder**: CLIP text encoder chuyển đổi văn bản và thông số kỹ thuật thành embeddings
    - Output dimension: Cùng dimension với vision encoder (512D hoặc 768D)
    - Tokenization: CLIP text tokenization
  - **Embedding Space**: Cả vision và text embeddings đều trong cùng embedding space (đã được align bởi CLIP training)
  - **Normalization**: L2 normalize embeddings sau encoding để đảm bảo embeddings có cùng scale
  - **No Fusion Layer**: Không cần fusion layer vì CLIP đã align embeddings trong cùng space, có thể so sánh trực tiếp bằng cosine similarity

### 5. Storage Layer
- **Vector Database**: Lưu trữ embeddings để tìm kiếm similarity (Pinecone, Weaviate, Qdrant, etc.)
  - **Storage Structure**: Lưu **riêng** image embeddings và text embeddings cho mỗi sản phẩm
  - Mỗi sản phẩm có 2 embeddings:
    - `product_{id}_image`: Image embedding (512D hoặc 768D tùy CLIP model)
    - `product_{id}_text`: Text embedding (cùng dimension với image embedding)
  - Sử dụng metadata để đánh dấu loại embedding (image/text) và product_id
  - Cả hai embeddings đều trong cùng embedding space, có thể so sánh trực tiếp bằng cosine similarity
- **Metadata DB**: Lưu trữ:
  - Thông tin sản phẩm gốc
  - Bảng giá sản phẩm theo đối tác và công ty thành viên (sync từ ERP)
  - Inventory data (sync từ ERP, dùng cho hiển thị) - bao gồm: số lượng, vị trí kho, đuôi màu (color_card)
  - Sales data (sync từ ERP)
  - User → Sales mapping table (cập nhật để bao gồm user role)
  - **User Roles Table**: Lưu thông tin role của user (Sales, Customer, Admin, etc.)
  - **Sales-Company Authorization Table**: Mapping Sales user → danh sách công ty được phân quyền (many-to-many relationship)
  - Thông tin đối tác và công ty thành viên
  - Sales info trong draft orders
  (PostgreSQL, MongoDB, etc.)

### 6. Retrieval Layer
- **Retrieval Engine**: 
  - **Query Processing**: 
    - **Text-only query**:
      - Encode text qua CLIP text encoder
      - L2 normalize embedding
      - Search trong text embeddings collection
      - Return top-k results
    - **Image-only query**:
      - Encode image qua CLIP vision encoder
      - L2 normalize embedding
      - Search trong image embeddings collection
      - Return top-k results
    - **Mixed query** (cả text và image):
      - Encode text qua CLIP text encoder → `text_query_emb`
      - Encode image qua CLIP vision encoder → `image_query_emb`
      - L2 normalize cả hai embeddings
      - Search riêng:
        - Search `text_query_emb` trong text embeddings collection → `results_text`
        - Search `image_query_emb` trong image embeddings collection → `results_image`
      - Merge và rerank:
        - Combine results từ cả hai searches
        - Deduplicate products (nếu cùng product xuất hiện trong cả hai)
        - Rerank bằng cách:
          - Nếu product xuất hiện trong cả hai: `final_score = (score_text + score_image) / 2` (average)
          - Hoặc weighted combination: `final_score = w_text * score_text + w_image * score_image` (ví dụ: w_text=0.5, w_image=0.5)
        - Return top-k final results
  - **Similarity Search**: 
    - Tìm kiếm similarity trong vector database bằng cosine similarity (vì embeddings đã L2 normalized)
    - Hỗ trợ hybrid search (vector + metadata filtering)
  - **Ranking và Filtering**: 
    - Ranking kết quả theo similarity score
    - Filtering theo metadata (category, price range, availability, etc.)
  - **Context Building**: 
    - Kết hợp retrieved embeddings với metadata để tạo context
    - Bao gồm product info, pricing, inventory status

### 7. Pricing Service Layer
- **Pricing Resolver**: 
  - Xác định đối tác/công ty thành viên của user từ user context
  - Truy vấn giá tương ứng từ Metadata DB
  - Áp dụng các quy tắc giá (discount, tier pricing, etc.)
  - Trả về giá đã được cá nhân hóa theo đối tác/công ty thành viên
- **Partner Context Manager**: 
  - Quản lý context về đối tác/công ty thành viên của user
  - Xác thực quyền truy cập giá theo đối tác
  - Mapping user → partner/company

### 7.1. Authorization Service Layer
- **Authorization Service**: 
  - Xác định role của user từ user context
  - Kiểm tra quyền truy cập tồn kho theo role và company authorization
  - Filter inventory data theo quyền của user
  - Áp dụng authorization rules cho từng loại user (Sales, Customer, Admin, etc.)
- **Company Authorization Manager**: 
  - Quản lý mapping Sales → danh sách công ty được phân quyền
  - Validate quyền truy cập tồn kho của Sales theo công ty
  - Lấy danh sách công ty được phân quyền cho Sales user từ MetadataDB
  - Kiểm tra xem Sales user có quyền truy cập tồn kho của công ty cụ thể hay không

### 7.2. Inventory Service Layer
- **Inventory Resolver**: 
  - Lấy inventory từ MetadataDB cho hiển thị trong search results, Q&A, recommendations
  - Dữ liệu được sync định kỳ từ ERP (5-10 phút)
  - Tích hợp với Authorization Service để filter inventory theo quyền của user
  - Với Sales: Chỉ trả về inventory của các công ty được phân quyền (số lượng, vị trí, đuôi màu)
  - Với Customer: Chỉ trả về trạng thái còn hàng/hết hàng (boolean), không trả về chi tiết
- **Inventory Validator**: 
  - Real-time check inventory từ ERP khi user tạo đơn nháp
  - Validate inventory trước khi tạo đơn để đảm bảo sản phẩm còn hàng
  - Tránh tạo đơn cho sản phẩm đã hết hàng
  - Tích hợp với Authorization Service để đảm bảo Sales chỉ validate inventory của các công ty được phân quyền
- **Sales Context Manager**: 
  - Quản lý thông tin sales/user tạo đơn nháp
  - Mapping user → sales từ MetadataDB (đã sync từ ERP)
  - Lấy sales info từ MetadataDB khi tạo đơn nháp
  - Đảm bảo đơn nháp có thông tin sales chính xác

### 8. Draft Order Creation Flow
- **Flow tạo đơn nháp**:
  1. User yêu cầu tạo đơn nháp với danh sách sản phẩm
  2. **Authorization Check**: Authorization Service kiểm tra quyền của user
     - Với Sales: Company Authorization Manager kiểm tra quyền truy cập tồn kho của các công ty trong đơn
     - Nếu Sales không có quyền truy cập công ty → trả về lỗi "Không có quyền truy cập"
  3. **Inventory Validator** thực hiện real-time check inventory từ ERP cho từng sản phẩm
     - Với Sales: Chỉ validate inventory của các công ty được phân quyền
  4. **Sales Context Manager** lấy thông tin sales từ user context → sales mapping trong MetadataDB
  5. Validate inventory: Nếu sản phẩm hết hàng → thông báo lỗi, không tạo đơn
  6. Nếu tất cả sản phẩm còn hàng và user có quyền → tạo đơn nháp với:
     - Danh sách sản phẩm và số lượng
     - Thông tin sales (lấy từ user context)
     - Thông tin partner/company của user
  7. Gửi đơn nháp về ERP system với đầy đủ thông tin (sản phẩm, sales, partner/company)
- **Integration với ERP**: Đơn nháp được tạo trực tiếp trong ERP system, đảm bảo dữ liệu đồng bộ

### 9. Authorization Rules

Hệ thống phân quyền kiểm soát quyền truy cập tồn kho dựa trên role của user:

#### 9.1. Sales User
- **Quyền truy cập tồn kho**:
  - Xem đầy đủ chi tiết tồn kho: số lượng, vị trí kho, đuôi màu (color_card)
  - Chỉ xem tồn kho của các công ty trong danh sách được phân quyền (lưu trong Sales-Company Authorization Table)
  - Một Sales user có thể được phân quyền nhiều công ty (one-to-many relationship)
- **Hành vi khi không có quyền**:
  - Nếu hỏi tồn kho của công ty không được phân quyền → trả về lỗi "Không có quyền truy cập"
  - Nếu tạo đơn nháp cho công ty không được phân quyền → trả về lỗi "Không có quyền truy cập"
- **Cấu trúc dữ liệu tồn kho trả về**:
  ```json
  {
    "product_id": "xxx",
    "company_id": "yyy",
    "quantity": 100,
    "location": "Kho A",
    "color_card": "1"
  }
  ```

#### 9.2. Customer User
- **Quyền truy cập tồn kho**:
  - Chỉ biết còn hàng/hết hàng (boolean: `in_stock: true/false`)
  - Không xem số lượng cụ thể, vị trí kho, đuôi màu, hoặc bất kỳ chi tiết nào khác
- **Hành vi**:
  - Có thể tạo đơn nháp nhưng không thấy chi tiết tồn kho trong quá trình tạo đơn
  - Chỉ nhận được thông báo còn hàng/hết hàng khi kiểm tra
- **Cấu trúc dữ liệu tồn kho trả về**:
  ```json
  {
    "product_id": "xxx",
    "in_stock": true
  }
  ```

#### 9.3. Admin/Other Roles
- **Quyền truy cập tồn kho**:
  - Có thể xem đầy đủ tồn kho của tất cả công ty (tùy cấu hình)
  - Xem tất cả chi tiết: số lượng, vị trí kho, đuôi màu
- **Cấu trúc dữ liệu tồn kho trả về**: Tương tự Sales User (full inventory data)

#### 9.4. Implementation Notes
- **Authorization Service** xác định role của user từ user context và MetadataDB
- **Company Authorization Manager** quản lý mapping Sales → danh sách công ty được phân quyền
- **Inventory Resolver** filter inventory data theo quyền của user trước khi trả về
- **Inventory Validator** kiểm tra quyền khi validate inventory cho đơn nháp

### 10. CLIP Implementation Details
- **Model Version**: CLIP ViT-B/32 (512D embeddings) hoặc ViT-L/14 (768D embeddings)
  - ViT-B/32: Nhẹ hơn, nhanh hơn, phù hợp cho production với latency thấp
  - ViT-L/14: Chính xác hơn, phù hợp khi cần accuracy cao
- **Library**: 
  - `openai/clip` (official CLIP implementation)
  - Hoặc `transformers` library với CLIP models từ Hugging Face
- **Preprocessing**:
  - **Image**: CLIP image preprocessing (resize to 224x224, normalize với CLIP mean/std)
  - **Text**: CLIP text tokenization (BPE tokenizer, max length 77 tokens)
- **Similarity Metric**: Cosine similarity (vì embeddings đã L2 normalized)
- **Performance**:
  - Encoding latency: ~10-50ms per image/text (tùy model size và hardware)
  - Có thể batch processing để tăng throughput
  - Có thể cache embeddings để giảm encoding overhead

### 11. Generation Layer
- **LLM**: Nhận retrieved context và generate response (GPT-4, Claude, Llama, etc.)

### 12. Output Layer
- **Search Results**: Kết quả tìm kiếm sản phẩm
- **Q&A Answers**: Câu trả lời cho câu hỏi về sản phẩm
- **Product Recommendations**: Gợi ý sản phẩm tương tự
- **Price Inquiry Results**: Kết quả hỏi giá sản phẩm theo đối tác/công ty thành viên

## Use Cases

1. **Tìm kiếm sản phẩm**: User có thể tìm kiếm bằng text, hình ảnh, hoặc kết hợp
2. **Hỏi đáp**: User đặt câu hỏi về sản phẩm, hệ thống trả lời dựa trên RAG context
3. **Gợi ý sản phẩm**: Hệ thống gợi ý sản phẩm tương tự dựa trên sản phẩm hiện tại
4. **Hỏi giá sản phẩm**: User hỏi giá sản phẩm, hệ thống trả về giá theo đối tác/công ty thành viên của user
   - Hỗ trợ hỏi giá theo đối tác cụ thể
   - Hỗ trợ hỏi giá theo công ty thành viên
   - Hỗ trợ so sánh giá giữa các đối tác/công ty thành viên
5. **Tạo đơn nháp**: User có thể tạo đơn nháp về ERP system
   - Hệ thống hiển thị inventory từ MetadataDB (sync định kỳ) - đã được filter theo quyền của user
   - Khi tạo đơn nháp, hệ thống thực hiện authorization check và real-time inventory validation từ ERP
   - Với Sales: Chỉ có thể tạo đơn cho các công ty được phân quyền
   - Hệ thống tự động lấy thông tin sales từ user context → sales mapping
   - Đơn nháp được tạo trong ERP với đầy đủ thông tin: sản phẩm, số lượng, sales, partner/company
   - Nếu sản phẩm hết hàng hoặc user không có quyền, hệ thống thông báo và không tạo đơn
6. **Hỏi tồn kho**: User có thể hỏi tồn kho sản phẩm
   - **Sales**: Xem đầy đủ chi tiết tồn kho (số lượng, vị trí, đuôi màu) nhưng chỉ của các công ty được phân quyền
   - **Customer**: Chỉ biết còn hàng/hết hàng, không xem chi tiết
   - Nếu Sales hỏi tồn kho của công ty không được phân quyền → trả về lỗi "Không có quyền truy cập"

## Data Flow

### Data Ingestion & Sync Flow
1. **Ingestion**: Pull dữ liệu từ ERP (bao gồm sản phẩm, giá, đối tác, công ty thành viên, inventory, sales data, user roles, sales-company authorization) và fetch images từ S3
2. **Cron Sync Jobs**: 
   - Price sync: Định kỳ 15-30 phút từ ERP → MetadataDB
   - Inventory sync: Định kỳ 5-10 phút từ ERP → MetadataDB (dùng cho hiển thị)
   - Sales sync: Định kỳ hoặc on-demand từ ERP → MetadataDB (sales data và user-sales mapping)
   - User Roles & Authorization sync: Định kỳ hoặc on-demand từ ERP → MetadataDB (user roles và sales-company authorization)
3. **Enrichment**: Kết hợp và làm giàu dữ liệu
4. **Processing**: Encode thành embeddings bằng CLIP model (riêng image embeddings và text embeddings)
5. **Storage**: Lưu embeddings vào vector DB (riêng image và text embeddings) và metadata (bao gồm pricing, inventory, sales data, user roles, sales-company authorization) vào DB

### Retrieval Flow
6. **Query Processing**: 
   - **Text-only query**: Encode text qua CLIP text encoder → L2 normalize → Search trong text embeddings
   - **Image-only query**: Encode image qua CLIP vision encoder → L2 normalize → Search trong image embeddings
   - **Mixed query**: 
     - Encode text và image riêng qua CLIP encoders → L2 normalize
     - Search riêng trong text embeddings và image embeddings
     - Merge và rerank results (average hoặc weighted combination scores)
7. **Retrieval**: Query embedding(s) → similarity search trong vector database (cosine similarity) → retrieve relevant context
8. **Pricing Resolution**: Xác định đối tác/công ty thành viên của user → truy vấn giá tương ứng từ Metadata DB
9. **Authorization Check**: 
   - Authorization Service xác định role của user từ user context
   - Company Authorization Manager kiểm tra quyền truy cập tồn kho (với Sales: kiểm tra công ty được phân quyền)
10. **Inventory Display**: 
   - Lấy inventory từ MetadataDB (đã sync) 
   - Inventory Resolver filter inventory theo quyền của user:
     - Sales: Chỉ trả về inventory của các công ty được phân quyền (số lượng, vị trí, đuôi màu)
     - Customer: Chỉ trả về trạng thái còn hàng/hết hàng (boolean), không có chi tiết
   - Hiển thị inventory đã được filter trong kết quả
11. **Generation**: LLM generate response với retrieved context, pricing information, và inventory status (đã được filter theo quyền)
12. **Output**: Trả về kết quả cho user (bao gồm giá theo đối tác/công ty thành viên và inventory status phù hợp với quyền của user)

### Draft Order Creation Flow
11. **User Request**: User yêu cầu tạo đơn nháp với danh sách sản phẩm
12. **Authorization Check**: 
   - Authorization Service xác định role của user
   - Với Sales: Company Authorization Manager kiểm tra quyền truy cập tồn kho của các công ty trong đơn
   - Nếu Sales không có quyền truy cập công ty → trả về lỗi "Không có quyền truy cập"
13. **Sales Context Resolution**: Sales Context Manager lấy thông tin sales từ user context → sales mapping trong MetadataDB
14. **Real-time Inventory Validation**: 
   - Inventory Validator thực hiện real-time check inventory từ ERP cho từng sản phẩm
   - Với Sales: Chỉ validate inventory của các công ty được phân quyền
15. **Validation**: 
   - Nếu sản phẩm hết hàng → thông báo lỗi, không tạo đơn
   - Với Sales: Nếu công ty không được phân quyền → thông báo lỗi, không tạo đơn
16. **Draft Order Creation**: Nếu tất cả sản phẩm còn hàng và user có quyền → tạo đơn nháp với đầy đủ thông tin (sản phẩm, sales, partner/company)
17. **ERP Integration**: Gửi đơn nháp về ERP system

## Data Sync Strategy

Hệ thống sử dụng chiến lược sync đơn giản để đảm bảo hiệu năng và độ chính xác:

### Price Data
- **Strategy**: Sync định kỳ 15-30 phút từ ERP → MetadataDB
- **Lý do**: 
  - Price không thay đổi liên tục, delay 15-30 phút là chấp nhận được
  - Đảm bảo retrieval nhanh, không phụ thuộc ERP
  - Đơn giản, dễ maintain
- **Usage**: Pricing Resolver đọc trực tiếp từ MetadataDB khi retrieval

### Inventory Data
- **Strategy**: Hybrid approach đơn giản
  - **Hiển thị**: Sync định kỳ 5-10 phút từ ERP → MetadataDB (dùng cho search results, Q&A, recommendations)
  - **Tạo đơn nháp**: Real-time check từ ERP khi user tạo đơn (đảm bảo chính xác)
- **Lý do**:
  - Inventory thay đổi thường xuyên hơn price
  - Cần chính xác khi tạo đơn, nhưng có thể chấp nhận delay nhỏ cho hiển thị
  - Không làm chậm retrieval flow (dùng cached data)
- **Usage**: 
  - Inventory Resolver đọc từ MetadataDB cho hiển thị
  - Inventory Validator check real-time từ ERP khi tạo đơn nháp

### Sales Data
- **Strategy**: Sync từ ERP → MetadataDB (có thể sync định kỳ hoặc on-demand)
- **Lý do**:
  - Sales data và user-sales mapping không thay đổi thường xuyên
  - Cần có sẵn trong MetadataDB để mapping nhanh khi tạo đơn nháp
- **Usage**: 
  - Sales Context Manager đọc từ MetadataDB khi cần mapping user → sales
  - Được sử dụng khi tạo đơn nháp để gắn sales info vào đơn

### User Roles & Authorization Data
- **Strategy**: Sync từ ERP → MetadataDB (có thể sync định kỳ hoặc on-demand)
- **Lý do**:
  - User roles và sales-company authorization không thay đổi thường xuyên
  - Cần có sẵn trong MetadataDB để kiểm tra quyền nhanh khi truy vấn tồn kho
- **Usage**: 
  - Authorization Service đọc từ MetadataDB để xác định role của user
  - Company Authorization Manager đọc từ MetadataDB để kiểm tra quyền truy cập tồn kho của Sales

### Tổng kết
- **Approach đơn giản**: Không sử dụng event-driven hay webhook phức tạp
- **Hiệu năng**: Retrieval flow nhanh nhờ cached data trong MetadataDB
- **Chính xác**: Real-time check khi cần thiết (tạo đơn nháp)
- **Maintainability**: Dễ maintain và debug với cron jobs đơn giản

