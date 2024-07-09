graph TB
    subgraph "フロントエンド (Next.js)"
        A[ページコンポーネント]
        B[Vueコンポーネント]
        C[カスタムフック]
        D[API通信]
    end
    subgraph "バックエンド (Laravel)"
        E[APIコントローラー]
        F[モデル]
        G[ミドルウェア]
        H[認証]
    end
    subgraph "インフラ (AWS + Docker)"
        I[ECSクラスター]
        J[RDS]
        K[S3]
        L[CloudFront]
    end
    A --> D
    B --> D
    D --> E
    E --> F
    E --> G
    E --> H
    I --> J
    I --> K
    I --> L