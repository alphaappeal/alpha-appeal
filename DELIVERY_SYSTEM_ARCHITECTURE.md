# 🏗️ DELIVERY SYSTEM ARCHITECTURE

**Alpha Appeal Platform**  
**Architecture Version:** 2.0  
**Last Updated:** March 31, 2026

---

## 📐 HIGH-LEVEL ARCHITECTURE

```mermaid
graph TB
    subgraph "Customer Layer"
        A[Customer Mobile/Web]
        B[Customer receives notifications]
    end
    
    subgraph "Frontend Application"
        C[Deliveries.tsx Page]
        D[Real-time Subscription]
        E[Live Map Tracking]
    end
    
    subgraph "Admin Interface"
        F[Admin Dashboard]
        G[DeliveriesTab Component]
        H[Manual Dispatch]
    end
    
    subgraph "Edge Functions"
        I[post-to-shipday]
        J[shipday-updates webhook]
        K[process-delivery-retries]
        L[notifications service]
    end
    
    subgraph "Database Layer"
        M[(user_deliveries)]
        N[(delivery_errors)]
        O[(delivery_retry_queue)]
        P[(delivery_notifications)]
        Q[analytics views]
    end
    
    subgraph "External Services"
        R[Shipday API]
        S[MailerLite Email]
        T[Twilio SMS]
        U[FCM Push]
    end
    
    A --> C
    C --> D
    D --> M
    C --> E
    F --> G
    G --> H
    H --> I
    I --> R
    R --> J
    J --> M
    J --> L
    L --> S
    L --> T
    L --> U
    L --> B
    K --> O
    O --> I
    M --> Q
    N --> Q
    P --> Q
```

---

## 🔄 DATA FLOW DIAGRAMS

### Flow 1: Order Creation to Delivery Assignment

```mermaid
sequenceDiagram
    participant C as Customer
    participant A as Admin
    participant PF as post-to-shipday FN
    participant S as Shipday API
    participant DB as Database
    
    C->>A: Places order in shop
    A->>PF: POST /functions/v1/post-to-shipday
    PF->>PF: Validate input (Zod)
    PF->>S: Create delivery order
    S-->>PF: Returns shipday_order_id
    PF->>DB: INSERT into user_deliveries
    DB-->>PF: Success
    PF-->>A: { success, shipday_order_id }
    A->>C: Order confirmation
```

### Flow 2: Webhook Status Updates

```mermaid
sequenceDiagram
    participant S as Shipday
    participant SU as shipday-updates FN
    participant DB as Database
    participant N as notifications FN
    participant C as Customer
    
    S->>SU: POST webhook { status: "ASSIGNED" }
    SU->>SU: Parse & validate payload
    SU->>DB: UPDATE user_deliveries
    DB-->>SU: Updated record
    SU->>N: sendDeliveryNotification()
    N->>DB: INSERT delivery_notifications
    N->>Email: Send via MailerLite
    N->>SMS: Send via Twilio
    N-->>SU: Notifications sent
    SU-->>S: 200 OK
    C->>DB: Real-time subscription triggers
    DB-->>C: UI updates automatically
```

### Flow 3: Error Handling & Retry

```mermaid
sequenceDiagram
    participant SU as shipday-updates FN
    participant DB as Database
    participant PDR as process-delivery-retries FN
    participant PF as post-to-shipday FN
    participant S as Shipday API
    
    SU->>DB: UPDATE fails
    DB-->>SU: Error
    SU->>DB: INSERT delivery_errors
    SU->>DB: INSERT delivery_retry_queue
    
    Note over PDR: Cron every 5 min
    PDR->>DB: SELECT pending retries
    DB-->>PDR: Queue items
    
    loop For each retry
        PDR->>PF: Re-execute operation
        PF->>S: POST to Shipday
        alt Success
            S-->>PF: OK
            PF->>DB: Mark resolved
        else Failure
            S-->>PF: Error
            PF->>DB: Increment attempts
        end
    end
```

---

## 🗄️ DATABASE SCHEMA DIAGRAM

```mermaid
erDiagram
    ORDERS ||--o{ USER_DELIVERIES : creates
    USERS ||--o{ USER_DELIVERIES : receives
    USERS ||--o{ DELIVERY_NOTIFICATIONS : receives
    USER_DELIVERIES ||--o{ DELIVERY_ERRORS : generates
    USER_DELIVERIES ||--o{ DELIVERY_RETRY_QUEUE : triggers_retry
    USER_DELIVERIES ||--o{ DELIVERY_NOTIFICATIONS : triggers_notification
    
    ORDERS {
        uuid id PK
        string order_number
        uuid user_id FK
        decimal amount
        string payment_status
        string product_name
    }
    
    USER_DELIVERIES {
        uuid id PK
        uuid order_id FK
        uuid user_id FK
        string shipday_order_id
        string status
        string driver_name
        string driver_phone
        decimal delivery_fee
        text tracking_url
        timestamptz created_at
    }
    
    DELIVERY_ERRORS {
        uuid id PK
        uuid delivery_id FK
        string error_type
        text error_message
        boolean resolved
        timestamptz occurred_at
    }
    
    DELIVERY_RETRY_QUEUE {
        uuid id PK
        uuid order_id FK
        string operation_type
        integer attempts
        timestamptz retry_after
        boolean resolved
    }
    
    DELIVERY_NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string notification_type
        string channel
        string status
        timestamptz sent_at
    }
    
    USERS {
        uuid id PK
        string email
        string phone
        string full_name
    }
```

---

## 🔧 COMPONENT BREAKDOWN

### Edge Functions Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        A[Mobile App]
        B[Web Browser]
        C[Admin Dashboard]
    end
    
    subgraph "API Gateway"
        D[Supabase Edge Router]
    end
    
    subgraph "Business Logic"
        E[post-to-shipday]
        F[shipday-updates]
        G[process-retries]
        H[notifications]
    end
    
    subgraph "Shared Utilities"
        I[cors.ts]
        J[validation.ts]
        K[notifications.ts]
        L[shipday.ts]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    E --> I
    E --> J
    F --> I
    F --> K
    G --> L
    H --> K
```

---

## 🌐 INTEGRATION POINTS

### Shipday Integration

```mermaid
graph TB
    subgraph "Alpha Appeal"
        A[Order System]
        B[post-to-shipday FN]
        C[shipday-updates FN]
        D[user_deliveries Table]
    end
    
    subgraph "Shipday Platform"
        E[Orders API]
        F[Webhook System]
        G[Driver Dispatch]
        H[Tracking System]
    end
    
    B -->|POST /orders| E
    E -->|Create Order| G
    G -->|Status Updates| F
    F -->|POST webhook| C
    C -->|Update| D
    
    style B fill:#667eea,color:#fff
    style C fill:#764ba2,color:#fff
    style E fill:#f47421,color:#fff
    style F fill:#f47421,color:#fff
```

### Notification Flow

```mermaid
graph TB
    A[Delivery Status Change]
    B{Determine Type}
    B -->|assigned| C[Driver Assigned Template]
    B -->|in_transit| D[Out for Delivery Template]
    B -->|delivered| E[Delivered Template]
    B -->|failed| F[Failed Template]
    
    C --> G{Select Channel}
    D --> G
    E --> G
    F --> G
    
    G -->|email| H[MailerLite]
    G -->|sms| I[Twilio]
    G -->|push| J[FCM]
    G -->|in_app| K[Supabase Realtime]
    
    H --> L[Customer Inbox]
    I --> M[Customer Phone]
    J --> N[Mobile Notification]
    K --> O[In-App Alert]
```

---

## 📊 MONITORING ARCHITECTURE

```mermaid
graph TB
    subgraph "Data Sources"
        A[user_deliveries]
        B[delivery_errors]
        C[delivery_retry_queue]
        D[delivery_notifications]
    end
    
    subgraph "Aggregation"
        E[delivery_metrics VIEW]
        F[Custom Queries]
    end
    
    subgraph "Visualization"
        G[Admin Dashboard]
        H[Grafana/Metabase]
    end
    
    subgraph "Alerting"
        I[Error Rate Alerts]
        J[SLA Breach Alerts]
        K[Retry Queue Alerts]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> G
    F --> H
    E --> I
    C --> J
    B --> K
    
    style I fill:#ff6b6b,color:#fff
    style J fill:#ffd93d,color:#000
    style K fill:#6bcb77,color:#fff
```

---

## 🔐 SECURITY ARCHITECTURE

```mermaid
graph TB
    subgraph "Request Flow"
        A[Client Request]
        B[CORS Validation]
        C[JWT Authentication]
        D[Input Validation Zod]
        E[Business Logic]
        F[Database Operation]
    end
    
    subgraph "Security Layers"
        G[Origin Allowlist]
        H[Role Checks]
        I[Schema Validation]
        J[RLS Policies]
        K[Error Sanitization]
    end
    
    A --> B
    B --> G
    B --> C
    C --> H
    C --> D
    D --> I
    D --> E
    E --> J
    E --> F
    F --> K
    
    style G fill:#6bcb77
    style H fill:#6bcb77
    style I fill:#6bcb77
    style J fill:#6bcb77
    style K fill:#6bcb77
```

---

## 🎯 DEPLOYMENT ARCHITECTURE

```mermaid
graph TB
    subgraph "Development"
        A[Local Dev]
        B[supabase start]
        C[Functions Serve]
    end
    
    subgraph "Staging"
        D[Staging Project]
        E[Test Data]
        F[Integration Tests]
    end
    
    subgraph "Production"
        G[Production Project]
        H[Real Shipday API]
        I[Live Customers]
    end
    
    subgraph "CI/CD"
        J[GitHub Actions]
        K[Automated Tests]
        L[Deployment Scripts]
    end
    
    A --> B
    B --> C
    J --> K
    K --> L
    L --> D
    L --> G
    
    style G fill:#ff6b6b,color:#fff
    style D fill:#ffd93d
    style A fill:#6bcb77,color:#fff
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Architecture
- **Single Database:** Supabase PostgreSQL
- **Edge Functions:** Serverless, auto-scaling
- **Webhooks:** Processed in real-time
- **Notifications:** Sent synchronously

### Scaling Strategy (Phase 2+)

```mermaid
graph TB
    subgraph "Read Scaling"
        A[Primary DB]
        B[Read Replica 1]
        C[Read Replica 2]
        D[Redis Cache]
    end
    
    subgraph "Write Scaling"
        E[Connection Pooler PgBouncer]
        F[Batch Inserts]
        G[Queue System]
    end
    
    subgraph "Processing Scaling"
        H[Separate Worker Service]
        I[Retry Processor]
        J[Notification Processor]
    end
    
    A --> B
    A --> C
    B --> D
    E --> A
    F --> A
    G --> H
    H --> I
    H --> J
    
    style D fill:#ffd93d
    style E fill:#6bcb77
    style G fill:#6bcb77
```

---

## 🔄 STATE MACHINE

### Delivery Status Flow

```mermaid
stateDiagram-v2
    [*] --> pending: Order Created
    pending --> assigned: Driver Assigned
    assigned --> in_transit: Driver En Route
    in_transit --> picked_up: Arrived at Pickup
    picked_up --> delivered: Delivery Complete
    picked_up --> failed: Delivery Failed
    in_transit --> failed: Issue Occurred
    assigned --> failed: Driver Cancelled
    failed --> [*]: Resolved/Refunded
    delivered --> [*]: Complete
    
    note right of pending
        Waiting for
        dispatch
    end note
    
    note right of assigned
        Driver identified
        ETA provided
    end note
    
    note right of in_transit
        Live tracking
        active
    end note
    
    note right of delivered
        POD captured
        Customer notified
    end note
    
    note right of failed
        Error logged
        Retry or refund
    end note
```

---

## 🧩 MODULE DEPENDENCIES

```mermaid
graph LR
    A[Core System]
    B[user_deliveries Table]
    C[Edge Functions]
    D[Frontend Components]
    E[External APIs]
    
    A --> B
    B --> C
    C --> D
    C --> E
    
    subgraph "Edge Functions Dependencies"
        C --> F[cors.ts]
        C --> G[validation.ts]
        C --> H[notifications.ts]
    end
    
    subgraph "Frontend Dependencies"
        D --> I[React Leaflet Map]
        D --> J[Date-fns Formatting]
        D --> K[Supabase Client]
    end
    
    subgraph "External Dependencies"
        E --> L[Shipday API]
        E --> M[MailerLite]
        E --> N[Twilio]
        E --> O[FCM]
    end
```

---

## 📱 MOBILE VS WEB ARCHITECTURE

```mermaid
graph TB
    subgraph "Mobile App"
        A[React Native/Flutter]
        B[Push Notifications]
        C[Native Maps]
        D[Biometric Auth]
    end
    
    subgraph "Web App"
        E[React SPA]
        F[Browser Push]
        G[Leaflet Maps]
        H[JWT Auth]
    end
    
    subgraph "Shared Backend"
        I[Supabase Edge Functions]
        J[Database]
        K[Shipday Integration]
    end
    
    A --> I
    E --> I
    B --> K
    F --> K
    C --> K
    G --> K
    
    style A fill:#667eea,color:#fff
    style E fill:#764ba2,color:#fff
    style I fill:#f47421,color:#fff
```

---

## 🎨 FEATURE ROADMAP ARCHITECTURE

### Phase 1 (Current) ✅
```
Basic Tracking → Webhook Handler → Error Logging → Retry Queue
```

### Phase 2 (Next) 🔄
```
Notifications → Live Map → Timeline View → Analytics Dashboard
```

### Phase 3 (Future) 📋
```
AI Route Optimization → Multi-Driver Support → International Shipping → Carbon Offset Tracking
```

---

**Architecture Review Schedule:** Quarterly  
**Next Review Date:** June 30, 2026  
**Architecture Owner:** Lead Systems Architect
