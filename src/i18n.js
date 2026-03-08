(function () {
    'use strict';

    const translations = {
        zh: {
            htmlLang: 'zh-TW',
            meta: {
                title: 'RIVO Server — 次世代機器人車隊管理後端',
                description: 'RIVO Server 是高效能 Go 後端平台，整合即時資料串流、AI 任務推理與安全優先架構，提供企業級機器人車隊管理能力。',
                keywords: 'RIVO, 企業機器人平台, 機器人車隊管理, IoT 營運平台, ROS 雲端, 遠端監控, 邊緣運算, 企業資安',
                ogTitle: 'RIVO Server — 次世代機器人車隊管理後端',
                ogDescription: 'RIVO Server 是高效能 Go 後端平台，整合即時資料串流、AI 任務推理與安全優先架構，提供企業級機器人車隊管理能力。'
            },
            nav: {
                items: ['痛點', '為何選擇', '解決方案', 'RIVO Node（敬請期待）', '功能', '比較', '定價', 'FAQ'],
                docs: '技術文件 / Resources',
                cta: '預約諮詢',
                mobileMenu: '選單',
                langSwitch: '語言切換'
            },
            hero: {
                label: 'RIVO Server',
                intro: 'Next-Generation Robot Fleet Management Backend',
                title: '即時可視化<br>AI 智能控制<br>企業級安全治理',
                description: 'RIVO Server 以 Go 打造高效能後端，整合 WebSocket/SSE 即時通訊、LiveKit 視訊、AI 指令推理與多租戶安全架構，為現代機器人營運提供可擴展基礎。',
                primary: '預約架構諮詢',
                secondary: '查看平台示範',
                follow: '關注我們 - TW.'
            },
            problems: {
                label: '痛點',
                title: '機器人專案卡在商用化階段？',
                subtitle: '技術驗證完成後，真正挑戰是可營運、可擴展、可維運',
                titles: [
                    'Demo 成功，但缺少對外展示等級的監控介面',
                    '設備分散多地，遠端維運成本快速上升',
                    '團隊把大量時間花在後台基礎建設',
                    '節點數量成長後，管理與權限控管變複雜'
                ],
                needs: [
                    '需要可讓客戶與管理層一眼理解的可視化儀表板',
                    '需要隨時可連線的雲端監控與遠端控制能力',
                    '需要現成平台，將研發資源集中在核心產品',
                    '需要具備多租戶與分級權限的 Fleet 管理系統'
                ]
            },
            whyRivo: {
                label: 'Why RIVO',
                title: '為何選擇 RIVO',
                subtitle: '以即時、智能、安全三大軸線，打造可商用的機器人營運後端',
                titles: [
                    '統一車隊可視化',
                    'AI 智能自治',
                    '高可用 OTA 更新',
                    '企業級安全模型',
                    '可擴展後端架構',
                    '開發者友善擴充'
                ],
                descriptions: [
                    '以次秒延遲掌握位置、電量與感測器狀態，支援多操作員同步監控。',
                    '自然語言下達任務，結合能力與狀態上下文推理可執行動作。',
                    '透過 updater 代理與健康檢查回滾機制，更新失敗可自動復原。',
                    'JWT 雙 Token、即時 session 撤銷、HKDF-SHA256 與多租戶隔離。',
                    '同時支援 SQLite(WAL) 與 PostgreSQL，從邊緣到雲端一致擴展。',
                    '以動態 JSON schema 快速接入新機型與感測器，無需重新編譯。'
                ]
            },
            solution: {
                label: '運作方式',
                title: '2 分鐘完成平台接入',
                subtitle: '連線後即可啟用即時遙測、控制通道與營運觀測視圖',
                terminalOutputs: [
                    'Registry loaded 3 UART protocols',
                    'loaded 2 actuator capabilities from actuators/',
                    'UART source \'uart0\' registered',
                    'starting command receiver for robot node-a1b2c3',
                    'status update successful (sensors: 6)',
                    '[client] telemetry WebSocket connected'
                ],
                browserUrl: '/dashboard',
                previewLabel: 'Dashboard 範圍',
                previewValue: '群組：所有機器人',
                videoTitle: '實際 Demo 影片',
                videoDescription: '此區預留給產品實拍或客戶導入展示影片。將影片檔案放到 <code>assets/demo/rivo-demo.mp4</code> 即可替換。',
                videoFallback: 'Demo Video Placeholder (16:9)',
                widgets: ['機器人總數', '目前活動中', '系統警報', '已解決警報'],
                widgetValues: ['12', '9', '3', '27'],
                pills: [
                    'SSE 扇出架構，支援多操作員同時監看不中斷',
                    'WebSocket 控制通道採 AES-GCM 端對端加密',
                    'LiveKit WebRTC 低延遲影像，遠端作業可視化',
                    'AI 指令皆經安全檢核，避免危險或未授權操作',
                    'OTA 失敗可自動回滾，降低停機風險',
                    '多租戶資料隔離與審計軌跡，滿足企業治理需求'
                ]
            },
            rivoNode: {
                label: 'RIVO Node',
                title: '企業級邊緣資料節點',
                subtitle: '以標準化方式接入現場設備，穩定上傳可用數據',
                keyTitles: ['多協議接入', '低延遲回傳', '遠端配置', '開機自啟', '離線緩存', '工業穩定性'],
                keyDescriptions: [
                    '支援常見工業介面與控制器，降低導入與整合成本',
                    '影像與遙測資料低延遲回傳，支援遠端運維決策',
                    '線上調整參數與策略，縮短維運迭代週期',
                    '裝置開機自動連線平台，減少人工作業風險',
                    '網路異常時本地緩存，連線恢復後自動補傳',
                    '針對長時間運轉場景設計，確保服務連續性'
                ],
                primaryButtons: ['查看技術文件', '預約架構諮詢']
            },
            integration: {
                title: '彈性整合架構',
                subtitle: '支援既有設備、嵌入式系統與雲端管理平台的標準化串接',
                columnTitles: ['資料來源', '邊緣處理層', '管理平台'],
                placeholder: '外部設備輸入',
                sourceTitles: ['既有設備系統', '感測與控制模組'],
                sourceDescriptions: ['透過 UART / RS-485 快速接入', '支援 I2C / SPI / ADC 即時採集'],
                optionTabs: ['硬體閘道器', '軟體節點'],
                primaryDesc: '工業級邊緣閘道器，內建 RIVO-Node Runtime',
                primaryFeatures: [
                    '多協議轉換與資料標準化',
                    '斷線緩存與自動重連機制',
                    '端到端 TLS 加密傳輸',
                    '支援雲端與私有網路部署'
                ],
                softwareDesc: '在既有 Linux 裝置上部署 RIVO-Node Agent',
                softwareFeatures: [
                    '無需新增閘道器硬體',
                    '與 RIVO-Center 直接通訊',
                    '支援 ARM / x86 與容器化部署',
                    '完整軟體定義節點能力'
                ],
                deployLabels: ['SaaS 雲端', '本地私有部署'],
                cloudDesc: '企業級統一營運管理平台',
                cloudFeatures: [
                    '即時儀表板與 KPI 監控',
                    '多據點與多節點集中管理',
                    '遠端配置、OTA 與版本治理',
                    'API / Webhook 整合與資料匯出'
                ],
                scenariosTitle: '典型部署情境',
                scenarioTitles: ['既有設備協議橋接', '工廠感測資料上雲', '嵌入式軟體節點'],
                scenarioDescriptions: [
                    '將既有控制器輸出接入 RIVO-NodeWare，完成協議轉換與資料標準化，快速接入管理平台。',
                    '將現場感測器直接連入 NodeWare，持續上傳遙測資料，支援即時告警與追蹤分析。',
                    '在既有 Linux SBC 內部署 RIVO-Node Agent，以軟體方式完成連線、監控與遠端維運。'
                ],
                scenarioFlows: [
                    ['既有控制器', 'NodeWare', 'Center'],
                    ['感測器網路', 'NodeWare', 'Center'],
                    ['Linux SBC + Agent', 'Center']
                ],
                ctaButtons: ['閱讀整合文件', '預約技術諮詢']
            },
            features: {
                label: '平台',
                title: 'RIVO Server 核心能力',
                subtitle: '從即時通訊到 AI 與資安治理，完整覆蓋企業級車隊運營需求',
                titles: [
                    '即時車隊狀態追蹤',
                    'E2E 加密控制通道',
                    '高效能日誌串流',
                    'LiveKit 低延遲影像',
                    '自然語言任務解讀',
                    '安全優先 AI 驗證',
                    '安全 OTA 與自我修復',
                    '身份治理與租戶隔離',
                    'Go 高效能可擴展後端'
                ],
                descriptions: [
                    '次秒級回傳機器人位置、電量與感測器資料，提升全域可視性。',
                    '控制指令透過 AES-GCM 端對端保護，防止中間攔截與竄改。',
                    'SSE fan-out 架構提供多訂閱者同時監看，維持穩定效能。',
                    '內建 WebRTC 串流整合，支援遠端巡檢與操作決策。',
                    '將操作員語意轉換為可執行動作，降低人機互動門檻。',
                    '所有 AI 產生指令先過安全過濾，避免危險動作與越權操作。',
                    'Server 與 updater 解耦，更新失敗自動回滾到穩定版本。',
                    'JWT access/refresh 與即時撤銷機制，搭配資料庫層級租戶隔離。',
                    '支援 Go 1.24+、SQLite WAL 與 PostgreSQL，兼顧邊緣與雲端規模。'
                ]
            },
            comparison: {
                label: '比較',
                title: '為何企業選擇 RIVO',
                subtitle: '以導入效率、可擴展性與維運成本進行比較',
                headers: ['評估項目', '自建平台', '開源組合', '國際 SaaS', 'RIVO'],
                rows: [
                    ['導入時間', '3-6 個月', '4-10 週', '1-2 週設定', '<strong>2 天啟動 PoC</strong>'],
                    ['初期建置成本', '高（人力 + 架構）', '中（需客製）', '低（授權為主）', '<strong>可控（方案化）</strong>'],
                    ['內部技術負擔', '需平台團隊長期維護', '需整合與前端能力', '需熟悉英文流程', '<strong>專注機器人應用開發</strong>'],
                    ['行動端支援', '需另外開發', '需另外開發', '部分支援', '內建'],
                    ['中文介面與文件', '-', '有限', '有限', '完整'],
                    ['在地導入服務', '-', '-', '通常遠端', '台灣團隊'],
                    ['月度營運成本', '維護與雲資源成本', '伺服器 + 維運', '$100+ USD / robot', '<strong>NT$ 3K 起</strong>']
                ],
                fitTitle: '適合你的團隊，如果你：',
                fitItems: [
                    '已完成機器人原型並準備商業化',
                    '需要對客戶與管理層提供即時營運視圖',
                    '希望縮短雲端平台開發時程',
                    '需要跨據點管理多台機器人',
                    '重視資安治理與在地技術支援'
                ]
            },
            pricing: {
                label: '定價',
                title: '清晰分級，支援成長',
                subtitle: '依場景與營運規模選擇，所有方案皆可升級',
                makerAmount: '免費',
                enterpriseAmount: '客製化',
                badge: '推薦方案',
                features: [
                    ['最多 5 個感測點', '1 Hz 指令頻率', '每月 30 分鐘串流', '7 天資料留存', '720p 視訊品質', '社群論壇支援'],
                    ['最多 15 個感測點', '10 Hz 指令頻率', '每月 5 小時串流', '30 天資料留存', '1080p 視訊品質', 'Email 支援（72hr）'],
                    ['最多 50 個感測點', '30 Hz 指令頻率', '每月 20 小時串流', '90 天資料留存', '自訂 Dashboard Widget', 'Email 支援（24hr）+ LINE 告警'],
                    ['最多 200 個感測點', '100 Hz 指令頻率', '每月 100 小時串流', '1 年資料留存', '白標與品牌化支援', '專人支援 + SLA 99.5%'],
                    ['無上限感測點', '無上限指令頻率', '無限串流時數', '支援私有部署', 'SLA 99.9%', '專屬客戶成功經理']
                ],
                buttons: ['申請試用', '選擇 Lite', '預約顧問評估', '聯絡業務', '洽談企業方案'],
                academicTitle: 'Academic 研究教育方案',
                academicDescription: '提供大學實驗室與研究團隊專屬折扣，功能等同 Pro 方案',
                academicNote: '需 .edu 或研究機構信箱驗證',
                addonsTitle: '企業導入加值服務（一次性）',
                addonNames: ['需求訪談與資料模型設計', '客製化營運儀表板', '行動端白標與品牌化', 'ROS Bridge / Legacy 系統整合']
            },
            testimonials: {
                label: '客戶回饋',
                title: '客戶實際導入成果',
                subtitle: '跨研究、製造與新創團隊的部署回饋',
                badges: ['研究單位', '機器人新創', '智慧製造'],
                quotes: [
                    '「過去我們需要自行維護多套監控工具。導入 RIVO 後，一個平台就整合即時影像、告警與操作紀錄，團隊協作效率明顯提升。」',
                    '「RIVO 讓我們在產品展示前完成遠端控制與儀表板上線，客戶能在同一介面看到機器人狀態與 KPI，溝通效率大幅提升。」',
                    '「工廠多機調度最大的痛點是可視性與異常回應。RIVO 提供集中監控與權限管理後，現場維運流程更標準化。」'
                ],
                avatars: ['林', '陳', '張'],
                names: ['林教授', '陳執行長', '張技術總監'],
                roles: ['國立大學智慧機器人實驗室', '物流機器人新創團隊', '智慧製造系統整合商']
            },
            faq: {
                label: '常見問題',
                title: '常見問題',
                subtitle: '導入前最常被詢問的關鍵問題',
                questions: [
                    '非標準 ROS 架構也能整合嗎？',
                    '資料存放位置與安全機制為何？',
                    '支援哪些 ROS 版本？',
                    'PoC 與正式上線流程需要多久？',
                    '與國際平台相比，RIVO 的差異是什麼？',
                    '可以做私有部署與客製整合嗎？'
                ],
                answers: [
                    '可以。只要可提供可讀取的資料通道（topic、API 或協議輸出），即可透過對映設定接入；若有 legacy 協議，我們可提供導入服務。',
                    '可選擇雲端或私有部署。傳輸採 TLS，加密儲存可支援 AES-256，並提供權限控管與操作稽核記錄。',
                    '支援 ROS1 與 ROS2。常見版本包含 ROS1 Kinetic / Melodic / Noetic，以及 ROS2 Foxy / Humble / Iron。',
                    '一般可在 2-5 個工作天完成 PoC 接入；正式上線時程會依節點數、資安需求與部署模式調整。',
                    'RIVO 聚焦亞太導入場景，提供繁中介面、在地支援與彈性部署，同時維持企業級擴展與治理能力。',
                    '可以。企業方案支援 On-Premise / VPC 部署，並可依需求提供 SSO、權限模型與流程整合。'
                ]
            },
            cta: {
                badge: '企業級就緒',
                title: '以 RIVO Server 建立新一代車隊管理基礎',
                listHtml: '技術導入重點包含：<br><span class="check">即時通訊與控制通道安全設計</span><br><span class="check">AI 指令治理與風險控管流程</span><br><span class="check">OTA 更新與回滾策略規劃</span>',
                buttons: ['預約 30 分鐘諮詢', '查看平台示範']
            },
            contact: {
                label: '聯絡',
                title: '聯絡我們',
                subtitle: '提交需求後，技術顧問將於 1 個工作天內與您聯繫',
                itemTitles: ['Email', '商務聯繫', '地址', '服務時間'],
                itemValues: ['@rivo.dev', '台南市東區大學路1號', '週一至週五 09:00 - 18:00 (GMT+8)'],
                formLabels: ['姓名 / 職稱', '商務聯絡 Email', '公司 / 單位名稱', '需求描述'],
                placeholders: {
                    name: '例如：王小明 / 技術經理',
                    email: 'name@company.com',
                    company: '例如：RIVO Robotics Team',
                    message: '請描述您的機器人類型、部署場域、預期節點數，以及目前希望解決的問題。'
                },
                submit: '送出需求，預約諮詢'
            },
            footer: {
                brand: '企業級機器人營運平台，協助團隊安全且可擴展地部署服務。',
                columnTitles: ['產品', '資源', '聯絡'],
                productLinks: ['平台能力', '方案與定價', '整合文件'],
                resourceLinks: ['Developer Manual', 'English Docs', '繁體中文 Docs', '預約諮詢'],
                contactSpans: ['Line: @rivo.dev', '台南市東區大學路1號', '週一至週五 09:00 - 18:00 (GMT+8)'],
                copyright: '&copy; 2026 RIVO. 保留所有權利。',
                policies: ['隱私權政策', '服務條款'],
                made: '台灣打造'
            }
        },
        en: {
            htmlLang: 'en',
            meta: {
                title: 'RIVO Server — Next-Generation Robot Fleet Management',
                description: 'RIVO Server is a high-performance Go backend that unifies real-time streaming, AI-assisted autonomy, and security-first architecture for enterprise robot fleets.',
                keywords: 'RIVO, enterprise robotics platform, robot fleet management, IoT operations platform, ROS cloud, remote monitoring, edge computing, enterprise security',
                ogTitle: 'RIVO Server — Next-Generation Robot Fleet Management',
                ogDescription: 'RIVO Server is a high-performance Go backend that unifies real-time streaming, AI-assisted autonomy, and security-first architecture for enterprise robot fleets.'
            },
            nav: {
                items: ['Challenges', 'Why RIVO', 'Solution', 'RIVO Node (Coming Soon)', 'Features', 'Comparison', 'Pricing', 'FAQ'],
                docs: 'Resources',
                cta: 'Book a Call',
                mobileMenu: 'Menu',
                langSwitch: 'Language switcher'
            },
            hero: {
                label: 'RIVO Server',
                intro: 'Next-Generation Robot Fleet Management Backend',
                title: 'Observe in Real Time.<br>Control with AI.<br>Operate Securely.',
                description: 'Built with Go for performance and reliability, RIVO Server combines WebSocket/SSE streaming, LiveKit video, AI reasoning, and enterprise security controls into one operations backend.',
                primary: 'Book Architecture Consultation',
                secondary: 'View Platform Demo',
                follow: 'Follow Us - TW. '
            },
            problems: {
                label: 'Pain Points',
                title: 'Is Your Robotics Program Stuck Before Commercialization?',
                subtitle: 'After technical validation, the real challenge is operations, scalability, and maintainability.',
                titles: [
                    'Your demo works, but your interface is not stakeholder-ready',
                    'Devices are distributed across sites, driving up remote operations cost',
                    'Engineering time is consumed by backend infrastructure work',
                    'As node count grows, management and access control become complex'
                ],
                needs: [
                    'You need dashboards that customers and executives can understand instantly',
                    'You need always-on cloud monitoring and remote control capabilities',
                    'You need a ready platform so your team can focus on core product value',
                    'You need fleet management with multi-tenant and role-based control'
                ]
            },
            whyRivo: {
                label: 'Why RIVO',
                title: 'Why Choose RIVO',
                subtitle: 'A practical architecture for real-time, intelligent, and secure fleet operations.',
                titles: [
                    'Unified Fleet Observability',
                    'AI-Powered Autonomy',
                    'Reliable OTA and Recovery',
                    'Enterprise Security Model',
                    'Scalable Backend Foundation',
                    'Developer-Centric Flexibility'
                ],
                descriptions: [
                    'Track robot position, battery, and sensor telemetry with sub-second latency.',
                    'Translate natural language intent into executable and context-aware robot actions.',
                    'Use updater-proxy isolation, health checks, and automatic rollback on failed updates.',
                    'Apply JWT token separation, immediate session revocation, HKDF-SHA256, and tenant isolation.',
                    'Run from edge to cloud with SQLite (WAL) and PostgreSQL deployment options.',
                    'Onboard new robot types through dynamic JSON schemas without recompilation.'
                ]
            },
            solution: {
                label: 'How It Works',
                title: 'Go Live in 2 Minutes',
                subtitle: 'Connect once, then immediately enable telemetry, secure control, and operations visibility.',
                terminalOutputs: [
                    'Registry loaded 3 UART protocols',
                    'loaded 2 actuator capabilities from actuators/',
                    'UART source \'uart0\' registered',
                    'starting command receiver for robot node-a1b2c3',
                    'status update successful (sensors: 6)',
                    '[client] telemetry WebSocket connected'
                ],
                browserUrl: '/dashboard',
                previewLabel: 'Dashboard Scope',
                previewValue: 'Group: All robots',
                videoTitle: 'Live Product Demo',
                videoDescription: 'Reserved for your product walkthrough or customer deployment video. Replace with <code>assets/demo/rivo-demo.mp4</code> when ready.',
                videoFallback: 'Demo Video Placeholder (16:9)',
                widgets: ['Total Robots', 'Active Now', 'System Alerts', 'Resolved Alerts'],
                widgetValues: ['12', '9', '3', '27'],
                pills: [
                    'Fan-out SSE log streaming for multiple concurrent operators',
                    'WebSocket control path protected by AES-GCM end-to-end encryption',
                    'Built-in LiveKit WebRTC for low-latency video operations',
                    'AI-generated actions are always validated by a safety filter',
                    'Secure OTA workflow with health-check rollback protection',
                    'Multi-tenant isolation and auditable governance by default'
                ]
            },
            rivoNode: {
                label: 'RIVO Node',
                title: 'Enterprise Edge Data Node',
                subtitle: 'Connect field devices through a standardized pipeline and upload reliable operational data.',
                keyTitles: ['Multi-Protocol Connectivity', 'Low-Latency Uplink', 'Remote Configuration', 'Auto Startup', 'Offline Buffering', 'Industrial Reliability'],
                keyDescriptions: [
                    'Supports common industrial interfaces and controllers to reduce integration cost.',
                    'Streams video and telemetry with low latency for remote operation decisions.',
                    'Update parameters and policies online to shorten operations iteration cycles.',
                    'Devices auto-connect at boot to reduce manual operational steps.',
                    'Buffers data locally during outages and syncs automatically after reconnection.',
                    'Designed for long-running industrial scenarios with service continuity in mind.'
                ],
                primaryButtons: ['View Technical Docs', 'Book Architecture Call']
            },
            integration: {
                title: 'Flexible Integration Architecture',
                subtitle: 'Standardized connectivity across legacy equipment, embedded systems, and cloud operations.',
                columnTitles: ['Data Sources', 'Edge Processing', 'Management Platform'],
                placeholder: 'External Device Input',
                sourceTitles: ['Legacy Equipment Systems', 'Sensor and Control Modules'],
                sourceDescriptions: ['Integrate quickly via UART / RS-485.', 'Supports real-time collection through I2C / SPI / ADC.'],
                optionTabs: ['Hardware Gateway', 'Software Node'],
                primaryDesc: 'Industrial edge gateway with built-in RIVO-Node runtime.',
                primaryFeatures: [
                    'Multi-protocol conversion and data normalization',
                    'Offline buffering and automatic reconnection',
                    'End-to-end TLS encrypted transport',
                    'Supports cloud and private network deployment'
                ],
                softwareDesc: 'Deploy the RIVO-Node agent directly on existing Linux devices.',
                softwareFeatures: [
                    'No additional gateway hardware required',
                    'Direct communication with RIVO-Center',
                    'Supports ARM / x86 and containerized deployment',
                    'Full software-defined node capabilities'
                ],
                deployLabels: ['SaaS Cloud', 'On-Premise Deployment'],
                cloudDesc: 'Enterprise-grade unified operations platform.',
                cloudFeatures: [
                    'Real-time dashboards and KPI monitoring',
                    'Centralized multi-site and multi-node management',
                    'Remote config, OTA, and version governance',
                    'API / webhook integration and data export'
                ],
                scenariosTitle: 'Typical Deployment Scenarios',
                scenarioTitles: ['Legacy Protocol Bridge', 'Factory Sensor Data Uplink', 'Embedded Software Node'],
                scenarioDescriptions: [
                    'Connect existing controller outputs to RIVO-NodeWare for protocol conversion and normalized data onboarding.',
                    'Connect on-site sensors directly to NodeWare for continuous telemetry upload, alerts, and analytics.',
                    'Deploy the RIVO-Node agent on Linux SBCs to enable software-defined connectivity and remote operations.'
                ],
                scenarioFlows: [
                    ['Legacy Controller', 'NodeWare', 'Center'],
                    ['Sensor Network', 'NodeWare', 'Center'],
                    ['Linux SBC + Agent', 'Center']
                ],
                ctaButtons: ['Read Integration Docs', 'Book Technical Consultation']
            },
            features: {
                label: 'Platform',
                title: 'Core Capabilities of RIVO Server',
                subtitle: 'Designed for enterprise robotics teams that need speed, safety, and scalability.',
                titles: [
                    'Real-Time Fleet State Tracking',
                    'E2E Encrypted Command Dispatch',
                    'High-Performance Log Streaming',
                    'Live Video via LiveKit',
                    'Natural Language Commanding',
                    'Safety-First AI Validation',
                    'Secure OTA with Self-Healing',
                    'Identity and Tenant Isolation',
                    'Go-Powered Scalable Runtime'
                ],
                descriptions: [
                    'Monitor location, battery, and sensor snapshots with sub-second responsiveness.',
                    'Protect robot control traffic with AES-GCM so intercepted packets remain unreadable.',
                    'Use SSE fan-out architecture to serve multiple real-time log subscribers efficiently.',
                    'Deliver low-latency teleoperation visibility through integrated WebRTC streaming.',
                    'Let operators issue intents in plain language and map them to executable actions.',
                    'Require policy and hazard checks before any AI-generated command is executed.',
                    'Decouple Docker socket access through rivo-updater and auto-rollback unhealthy releases.',
                    'Support JWT access/refresh tokens, instant session revocation, and strict tenant boundaries.',
                    'Built on Go 1.24+ for high throughput, low overhead, and container-friendly deployment.'
                ]
            },
            comparison: {
                label: 'Comparison',
                title: 'Why Enterprises Choose RIVO',
                subtitle: 'Compare delivery speed, scalability, and operating cost.',
                headers: ['Criteria', 'In-House Platform', 'Open-Source Stack', 'Global SaaS', 'RIVO'],
                rows: [
                    ['Time to Launch', '3-6 months', '4-10 weeks', '1-2 weeks setup', '<strong>PoC in 2 days</strong>'],
                    ['Initial Build Cost', 'High (team + architecture)', 'Medium (customization needed)', 'Low (license-first)', '<strong>Predictable (plan-based)</strong>'],
                    ['Internal Technical Load', 'Requires a long-term platform team', 'Needs integration and frontend capability', 'Requires an English-first workflow', '<strong>Focus on robotics application development</strong>'],
                    ['Mobile Support', 'Build separately', 'Build separately', 'Partial', 'Built-in'],
                    ['Chinese UI and Docs', '-', 'Limited', 'Limited', 'Complete'],
                    ['Local Delivery Support', '-', '-', 'Mostly remote', 'Taiwan-based team'],
                    ['Monthly Operating Cost', 'Maintenance + cloud resources', 'Server + operations', '$100+ USD / robot', '<strong>Starts at NT$ 3K</strong>']
                ],
                fitTitle: 'Best fit if your team:',
                fitItems: [
                    'Has a working robot prototype and plans to commercialize',
                    'Needs real-time operational visibility for customers and management',
                    'Wants to reduce cloud platform development timeline',
                    'Needs to manage multi-robot deployments across locations',
                    'Requires security governance and local technical support'
                ]
            },
            pricing: {
                label: 'Pricing',
                title: 'Clear Plans Built for Growth',
                subtitle: 'Choose by scenario and scale, then upgrade anytime as operations expand.',
                makerAmount: 'Free',
                enterpriseAmount: 'Custom',
                badge: 'Recommended',
                features: [
                    ['Up to 5 sensor points', '1 Hz command rate', '30 minutes streaming / month', '7-day data retention', '720p video quality', 'Community support'],
                    ['Up to 15 sensor points', '10 Hz command rate', '5 hours streaming / month', '30-day data retention', '1080p video quality', 'Email support (72hr)'],
                    ['Up to 50 sensor points', '30 Hz command rate', '20 hours streaming / month', '90-day data retention', 'Custom dashboard widgets', 'Email support (24hr) + LINE alerts'],
                    ['Up to 200 sensor points', '100 Hz command rate', '100 hours streaming / month', '1-year data retention', 'White-label branding support', 'Dedicated support + SLA 99.5%'],
                    ['Unlimited sensor points', 'Unlimited command rate', 'Unlimited streaming hours', 'Private deployment support', 'SLA 99.9%', 'Dedicated customer success manager']
                ],
                buttons: ['Start Trial', 'Choose Lite', 'Talk to Advisor', 'Contact Sales', 'Talk to Enterprise'],
                academicTitle: 'Academic Plan',
                academicDescription: 'Discounted pricing for universities and research teams with Pro-level capabilities.',
                academicNote: 'Requires .edu or research organization email verification',
                addonsTitle: 'Enterprise Onboarding Services (One-Time)',
                addonNames: ['Requirement workshops and data model design', 'Custom operations dashboard', 'Mobile white-label and branding', 'ROS Bridge / legacy system integration']
            },
            testimonials: {
                label: 'Testimonials',
                title: 'Proven Results Across Teams',
                subtitle: 'Deployment feedback from research, manufacturing, and startup teams.',
                badges: ['Research Lab', 'Robotics Startup', 'Smart Manufacturing'],
                quotes: [
                    '"We used to maintain multiple disconnected monitoring tools. With RIVO, we unified real-time video, alerts, and operation logs in one platform, and collaboration improved immediately."',
                    '"RIVO helped us launch remote control and dashboards before customer demos. Stakeholders can now see robot status and KPIs in a single view."',
                    '"In factory operations, visibility and exception response are critical. RIVO standardized our on-site operations through centralized monitoring and access control."'
                ],
                avatars: ['L', 'C', 'Z'],
                names: ['Prof. Lin', 'CEO Chen', 'Technical Director Chang'],
                roles: ['University Intelligent Robotics Lab', 'Logistics Robotics Startup', 'Smart Manufacturing Integrator']
            },
            faq: {
                label: 'FAQ',
                title: 'Frequently Asked Questions',
                subtitle: 'Key questions teams ask before implementation.',
                questions: [
                    'Can we integrate non-standard ROS architectures?',
                    'Where is data stored and how is it secured?',
                    'Which ROS versions are supported?',
                    'How long do PoC and production rollout take?',
                    'How is RIVO different from global platforms?',
                    'Do you support private deployment and custom integration?'
                ],
                answers: [
                    'Yes. As long as your system exposes readable data channels (topics, APIs, or protocol output), it can be mapped and integrated. We also support legacy protocol onboarding.',
                    'You can choose cloud or private deployment. Transport uses TLS, storage can use AES-256 encryption, and operation logs support auditability.',
                    'RIVO supports both ROS1 and ROS2, including ROS1 Kinetic/Melodic/Noetic and ROS2 Foxy/Humble/Iron.',
                    'PoC onboarding is typically completed in 2-5 business days. Production timeline depends on node count, security requirements, and deployment model.',
                    'RIVO is optimized for APAC implementation with local support, Chinese interface, and flexible deployment while maintaining enterprise scalability and governance.',
                    'Yes. Enterprise plans support On-Premise and VPC deployment, plus SSO, permission models, and workflow integration on demand.'
                ]
            },
            cta: {
                badge: 'Enterprise Ready',
                title: 'Deploy RIVO Server as Your Fleet Operations Backbone',
                listHtml: 'Implementation support includes:<br><span class="check">Secure real-time communication architecture</span><br><span class="check">AI safety guardrail and governance design</span><br><span class="check">OTA rollout and rollback strategy planning</span>',
                buttons: ['Book a 30-Min Consultation', 'View Platform Demo']
            },
            contact: {
                label: 'Contact',
                title: 'Contact Us',
                subtitle: 'Share your requirements and our solutions team will respond within one business day.',
                itemTitles: ['Email', 'Business Chat', 'Address', 'Service Hours'],
                itemValues: ['@rivo.dev', 'No.1 University Rd., East District, Tainan, Taiwan', 'Mon - Fri, 09:00 - 18:00 (GMT+8)'],
                formLabels: ['Name / Role', 'Business Email', 'Company / Organization', 'Project Requirements'],
                placeholders: {
                    name: 'e.g. Alex Wang / Engineering Manager',
                    email: 'name@company.com',
                    company: 'e.g. RIVO Robotics Team',
                    message: 'Tell us your robot type, deployment environment, target node count, and key challenges you want to solve.'
                },
                submit: 'Submit and Book Consultation'
            },
            footer: {
                brand: 'Enterprise robotics operations platform for secure, scalable deployments.',
                columnTitles: ['Product', 'Resources', 'Contact'],
                productLinks: ['Features', 'Plans and Pricing', 'Integration Docs'],
                resourceLinks: ['Developer Manual', 'English Docs', 'Traditional Chinese Docs', 'Book a Call'],
                contactSpans: ['Line: @rivo.dev', 'No.1 University Rd., East District, Tainan, Taiwan', 'Mon - Fri, 09:00 - 18:00 (GMT+8)'],
                copyright: '&copy; 2026 RIVO. All rights reserved.',
                policies: ['Privacy Policy', 'Terms of Service'],
                made: 'Built in Taiwan'
            }
        }
    };

    const qs = (selector) => document.querySelector(selector);
    const qsa = (selector) => Array.from(document.querySelectorAll(selector));

    function setOne(selector, value) {
        if (value === undefined || value === null) {
            return;
        }
        const element = qs(selector);
        if (element) {
            element.innerHTML = value;
        }
    }

    function setMany(selector, values) {
        if (!Array.isArray(values)) {
            return;
        }
        qsa(selector).forEach((element, index) => {
            if (values[index] !== undefined && values[index] !== null) {
                element.innerHTML = values[index];
            }
        });
    }

    function setInputPlaceholder(selector, value) {
        if (value === undefined || value === null) {
            return;
        }
        const input = qs(selector);
        if (input) {
            input.setAttribute('placeholder', value);
        }
    }

    function applyComparisonRows(rowsData) {
        const rows = qsa('#comparison tbody tr');
        rows.forEach((row, rowIndex) => {
            const rowValues = rowsData[rowIndex];
            if (!Array.isArray(rowValues)) {
                return;
            }
            Array.from(row.querySelectorAll('td')).forEach((cell, cellIndex) => {
                if (rowValues[cellIndex] !== undefined) {
                    cell.innerHTML = rowValues[cellIndex];
                }
            });
        });
    }

    function applyScenarioFlows(flowRows) {
        if (!Array.isArray(flowRows)) {
            return;
        }
        flowRows.forEach((flowValues, idx) => {
            if (!Array.isArray(flowValues)) {
                return;
            }
            const selector = `#rivo-node .scenario-card:nth-child(${idx + 1}) .scenario-flow span:not(.scenario-arrow)`;
            setMany(selector, flowValues);
        });
    }

    function applyPricingFeatureRows(featureRows) {
        if (!Array.isArray(featureRows)) {
            return;
        }
        const cards = qsa('#pricing .pricing-card');
        cards.forEach((card, cardIndex) => {
            const featureValues = featureRows[cardIndex];
            if (!Array.isArray(featureValues)) {
                return;
            }
            Array.from(card.querySelectorAll('.pricing-features li')).forEach((li, idx) => {
                if (featureValues[idx] !== undefined) {
                    li.innerHTML = featureValues[idx];
                }
            });
        });
    }

    function applyLanguage(language) {
        const currentLanguage = language === 'en' ? 'en' : 'zh';
        const t = translations[currentLanguage] || translations.zh;

        document.documentElement.setAttribute('lang', t.htmlLang);
        document.documentElement.setAttribute('data-lang', currentLanguage);
        document.documentElement.classList.remove('lang-zh', 'lang-en');
        document.documentElement.classList.add(`lang-${currentLanguage}`);
        if (document.body) {
            document.body.classList.remove('lang-zh', 'lang-en');
            document.body.classList.add(`lang-${currentLanguage}`);
        }
        document.title = t.meta.title;

        const descriptionMeta = qs('meta[name="description"]');
        const keywordsMeta = qs('meta[name="keywords"]');
        const ogTitleMeta = qs('meta[property="og:title"]');
        const ogDescriptionMeta = qs('meta[property="og:description"]');

        if (descriptionMeta) {
            descriptionMeta.setAttribute('content', t.meta.description);
        }
        if (keywordsMeta) {
            keywordsMeta.setAttribute('content', t.meta.keywords);
        }
        if (ogTitleMeta) {
            ogTitleMeta.setAttribute('content', t.meta.ogTitle);
        }
        if (ogDescriptionMeta) {
            ogDescriptionMeta.setAttribute('content', t.meta.ogDescription);
        }

        const navLinks = qsa('.nav-links > li > a');
        t.nav.items.forEach((value, idx) => {
            if (navLinks[idx]) {
                navLinks[idx].textContent = value;
            }
        });
        if (navLinks[t.nav.items.length]) {
            navLinks[t.nav.items.length].textContent = t.nav.docs;
        }

        setOne('.nav-cta .btn', t.nav.cta);

        const mobileMenu = qs('.mobile-menu-btn');
        if (mobileMenu) {
            mobileMenu.setAttribute('aria-label', t.nav.mobileMenu);
        }

        const langSwitch = qs('.lang-switch');
        if (langSwitch) {
            langSwitch.setAttribute('aria-label', t.nav.langSwitch);
        }

        setOne('.hero-label', t.hero.label);
        setOne('.hero-intro', t.hero.intro);
        setOne('.hero-content h1', t.hero.title);
        setOne('.hero-description', t.hero.description);
        setOne('.hero-buttons .btn-primary', t.hero.primary);
        setOne('.hero-buttons .btn-secondary', t.hero.secondary);
        setOne('.hero-follow', t.hero.follow);

        setOne('#problems .section-label', t.problems.label);
        setOne('#problems .section-title', t.problems.title);
        setOne('#problems .section-subtitle', t.problems.subtitle);
        setMany('#problems .problem-card h3', t.problems.titles);
        setMany('#problems .problem-need', t.problems.needs);

        setOne('#why-rivo .section-label', t.whyRivo.label);
        setOne('#why-rivo .section-title', t.whyRivo.title);
        setOne('#why-rivo .section-subtitle', t.whyRivo.subtitle);
        setMany('#why-rivo .why-rivo-card h3', t.whyRivo.titles);
        setMany('#why-rivo .why-rivo-card p', t.whyRivo.descriptions);

        setOne('#solution .section-label', t.solution.label);
        setOne('#solution .section-title', t.solution.title);
        setOne('#solution .section-subtitle', t.solution.subtitle);
        setMany('#solution .terminal-body .output', t.solution.terminalOutputs);
        setOne('#solution .browser-url', t.solution.browserUrl);
        setMany('#solution .feature-pill', t.solution.pills);

        setOne('#rivo-node > .container > .section-label', t.rivoNode.label);
        setOne('#rivo-node > .container > .section-title', t.rivoNode.title);
        setOne('#rivo-node > .container > .section-subtitle', t.rivoNode.subtitle);
        setMany('#rivo-node .fade-in[style*="margin-top: 48px"] h4', t.rivoNode.keyTitles);
        setMany('#rivo-node .fade-in[style*="margin-top: 48px"] p', t.rivoNode.keyDescriptions);
        setMany('#rivo-node .fade-in[style*="margin-top: 48px"] a.btn', t.rivoNode.primaryButtons);

        setOne('#rivo-node .integration-section .section-title', t.integration.title);
        setOne('#rivo-node .integration-section .section-subtitle', t.integration.subtitle);
        setMany('#rivo-node .arch-column-title', t.integration.columnTitles);
        setOne('#rivo-node .placeholder-label', t.integration.placeholder);
        setMany('#rivo-node .arch-source-item h4', t.integration.sourceTitles);
        setMany('#rivo-node .arch-source-item p', t.integration.sourceDescriptions);
        setMany('#rivo-node .arch-option-tab .tab-label', t.integration.optionTabs);
        setOne('#rivo-node .arch-node-primary .arch-node-desc', t.integration.primaryDesc);
        setMany('#rivo-node .arch-node-primary .arch-node-features li', t.integration.primaryFeatures);
        setOne('#rivo-node .arch-node-software .arch-node-desc', t.integration.softwareDesc);
        setMany('#rivo-node .arch-node-software .arch-node-features li', t.integration.softwareFeatures);
        setMany('#rivo-node .arch-deploy-option .deploy-label', t.integration.deployLabels);
        setOne('#rivo-node .arch-node-cloud .arch-node-desc', t.integration.cloudDesc);
        setMany('#rivo-node .arch-node-cloud .arch-node-features li', t.integration.cloudFeatures);
        setOne('#rivo-node .scenarios-title', t.integration.scenariosTitle);
        setMany('#rivo-node .scenario-content h4', t.integration.scenarioTitles);
        setMany('#rivo-node .scenario-content p', t.integration.scenarioDescriptions);
        applyScenarioFlows(t.integration.scenarioFlows);
        setMany('#rivo-node .integration-cta a', t.integration.ctaButtons);

        setOne('#features .section-label', t.features.label);
        setOne('#features .section-title', t.features.title);
        setOne('#features .section-subtitle', t.features.subtitle);
        setMany('#features .feature-card h3', t.features.titles);
        setMany('#features .feature-card p', t.features.descriptions);

        setOne('#comparison .section-label', t.comparison.label);
        setOne('#comparison .section-title', t.comparison.title);
        setOne('#comparison .section-subtitle', t.comparison.subtitle);
        setMany('#comparison thead th', t.comparison.headers);
        applyComparisonRows(t.comparison.rows);
        setOne('#comparison .fit-checklist h3', t.comparison.fitTitle);
        setMany('#comparison .fit-item', t.comparison.fitItems);

        setOne('#pricing .section-label', t.pricing.label);
        setOne('#pricing .section-title', t.pricing.title);
        setOne('#pricing .section-subtitle', t.pricing.subtitle);
        setOne('#pricing .pricing-card:nth-child(1) .amount', t.pricing.makerAmount);
        setOne('#pricing .pricing-card:nth-child(5) .amount', t.pricing.enterpriseAmount);
        setOne('#pricing .pricing-badge', t.pricing.badge);
        applyPricingFeatureRows(t.pricing.features);
        setMany('#pricing .pricing-card .btn', t.pricing.buttons);
        setOne('#pricing .academic-info h3', t.pricing.academicTitle);
        setOne('#pricing .academic-info p', t.pricing.academicDescription);
        setOne('#pricing .price-note', t.pricing.academicNote);
        setOne('#pricing .pricing-addons > h3', t.pricing.addonsTitle);
        setMany('#pricing .addon-name', t.pricing.addonNames);

        setOne('#testimonials .section-label', t.testimonials.label);
        setOne('#testimonials .section-title', t.testimonials.title);
        setOne('#testimonials .section-subtitle', t.testimonials.subtitle);
        setMany('#testimonials .testimonial-badge', t.testimonials.badges);
        setMany('#testimonials blockquote', t.testimonials.quotes);
        setMany('#testimonials .author-avatar', t.testimonials.avatars);
        setMany('#testimonials .author-info strong', t.testimonials.names);
        setMany('#testimonials .author-info span', t.testimonials.roles);

        setOne('#faq .section-label', t.faq.label);
        setOne('#faq .section-title', t.faq.title);
        setOne('#faq .section-subtitle', t.faq.subtitle);
        setMany('#faq .faq-question h3', t.faq.questions);
        setMany('#faq .faq-answer p', t.faq.answers);

        setOne('.cta-badge', t.cta.badge);
        setOne('.cta-banner .section-title', t.cta.title);
        setOne('.cta-offer-list', t.cta.listHtml);
        setMany('.cta-buttons a', t.cta.buttons);

        setOne('#contact .section-label', t.contact.label);
        setOne('#contact .section-title', t.contact.title);
        setOne('#contact .section-subtitle', t.contact.subtitle);
        setMany('#contact .contact-item h4', t.contact.itemTitles);
        setMany('#contact .contact-item span', t.contact.itemValues);
        setMany('#contact .contact-form .form-group label', t.contact.formLabels);
        setInputPlaceholder('#name', t.contact.placeholders.name);
        setInputPlaceholder('#email', t.contact.placeholders.email);
        setInputPlaceholder('#company', t.contact.placeholders.company);
        setInputPlaceholder('#message', t.contact.placeholders.message);
        setOne('#contact .contact-form button[type="submit"]', t.contact.submit);

        setOne('.footer-brand > p', t.footer.brand);
        setMany('.footer-links .footer-column h4', t.footer.columnTitles);
        setMany('.footer-links .footer-column:nth-child(1) ul li a', t.footer.productLinks);
        setMany('.footer-links .footer-column:nth-child(2) ul li a', t.footer.resourceLinks);
        setMany('.footer-links .footer-column:nth-child(3) ul li span', t.footer.contactSpans);
        setOne('.footer-bottom > p', t.footer.copyright);
        setMany('.footer-bottom-links a', t.footer.policies);
        setOne('.footer-made', t.footer.made);

        qsa('.lang-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.lang === currentLanguage);
        });

        try {
            localStorage.setItem('rivo_lang', currentLanguage);
        } catch (error) {
            // Ignore storage errors in private mode.
        }
    }

    function initI18n() {
        qsa('.lang-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const language = button.dataset.lang === 'en' ? 'en' : 'zh';
                applyLanguage(language);
            });
        });

        let savedLanguage = null;
        try {
            savedLanguage = localStorage.getItem('rivo_lang');
        } catch (error) {
            // Ignore storage errors in private mode.
        }

        const browserLanguage = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
        const initialLanguage = savedLanguage === 'zh' || savedLanguage === 'en' ? savedLanguage : browserLanguage;
        applyLanguage(initialLanguage);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
})();
