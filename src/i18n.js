(function () {
    'use strict';

    const translations = {
        zh: {
            htmlLang: 'zh-TW',
            meta: {
                title: 'RIVO — 企業級機器人營運平台',
                description: 'RIVO 是面向企業的機器人與 IoT 營運平台，整合即時監控、遠端控制、資料治理與車隊調度，協助團隊快速規模化部署。',
                keywords: 'RIVO, 企業機器人平台, 機器人車隊管理, IoT 營運平台, ROS 雲端, 遠端監控, 邊緣運算, 企業資安',
                ogTitle: 'RIVO — 企業級機器人營運平台',
                ogDescription: 'RIVO 是面向企業的機器人與 IoT 營運平台，整合即時監控、遠端控制、資料治理與車隊調度，協助團隊快速規模化部署。'
            },
            nav: {
                items: ['痛點', '解決方案', 'RIVO Node', '功能', '比較', '定價', 'FAQ'],
                docs: '技術文件 / Resources',
                cta: '預約諮詢',
                mobileMenu: '選單',
                langSwitch: '語言切換'
            },
            hero: {
                label: '企業級機器人營運雲平台',
                intro: 'Built for secure and scalable robotics operations',
                title: '快速部署<br>規模擴展<br>安全運行',
                description: '從 PoC 到正式上線，RIVO 整合即時影像、遠端控制、機隊調度與資安治理，協助團隊以標準化流程穩定擴展營運。',
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
            solution: {
                label: '運作方式',
                title: '2 分鐘完成平台接入',
                subtitle: '以標準 API 與節點代理，快速連線並開始營運監控',
                pills: [
                    'ROS1/ROS2 Topic 自動探索',
                    '2D/3D 地圖與狀態可視化',
                    '可配置控制元件與工作流',
                    '快速部署與擴展'
                ],
                widgets: ['電量', '速度', '狀態', '串流'],
                status: '上線',
                stream: '即時'
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
                title: '為企業營運打造的核心能力',
                subtitle: '從連線、監控到治理，完整支援機器人商用落地',
                titles: [
                    '多路即時影像串流',
                    '安全遠端指令控制',
                    '動態控制面板生成',
                    '多層級權限管理',
                    '企業級資安與稽核',
                    '事件告警與通知',
                    '地圖定位與軌跡追蹤',
                    '導入與技術顧問',
                    '可擴展高可用架構'
                ],
                descriptions: [
                    '提供低延遲第一視角與多機畫面管理，支援錄影回放與事件追溯',
                    '透過 Web 與行動端下達指令，搭配權限與審計機制保障操作安全',
                    '依裝置資料模型自動生成 UI，縮短前端開發與維護時間',
                    '支援角色、群組與資源範圍控管，符合企業內部治理需求',
                    'TLS 傳輸、資料加密與完整操作軌跡，滿足資安與稽核要求',
                    '針對電量、連線與關鍵指標設定閾值，異常即時推送通知',
                    '整合地圖與路徑資訊，快速掌握車隊位置與運行狀態',
                    '提供繁中技術文件、導入建議與客製整合服務，加速上線時程',
                    '面向多機並發與長時間運行設計，維持穩定服務品質'
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
                title: '讓機器人專案進入可規模化營運',
                listHtml: '專業導入支援包含：<br><span class="check">標準導入評估與架構建議</span><br><span class="check">PoC 目標與 KPI 定義</span><br><span class="check">技術顧問一對一諮詢</span>',
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
                resourceLinks: ['導入 FAQ', 'English Docs', '繁體中文 Docs', '預約諮詢'],
                contactSpans: ['Line: @rivo.dev', '台南市東區大學路1號', '週一至週五 09:00 - 18:00 (GMT+8)'],
                copyright: '&copy; 2026 RIVO. 保留所有權利。',
                policies: ['隱私權政策', '服務條款'],
                made: '台灣打造'
            }
        },
        en: {
            htmlLang: 'en',
            meta: {
                title: 'RIVO — Enterprise Robotics Operations Platform',
                description: 'RIVO is an enterprise robotics and IoT operations platform that unifies real-time monitoring, remote control, data governance, and fleet orchestration for scalable deployments.',
                keywords: 'RIVO, enterprise robotics platform, robot fleet management, IoT operations platform, ROS cloud, remote monitoring, edge computing, enterprise security',
                ogTitle: 'RIVO — Enterprise Robotics Operations Platform',
                ogDescription: 'RIVO is an enterprise robotics and IoT operations platform that unifies real-time monitoring, remote control, data governance, and fleet orchestration for scalable deployments.'
            },
            nav: {
                items: ['Challenges', 'Solution', 'RIVO Node', 'Features', 'Comparison', 'Pricing', 'FAQ'],
                docs: 'Resources',
                cta: 'Book a Call',
                mobileMenu: 'Menu',
                langSwitch: 'Language switcher'
            },
            hero: {
                label: 'Enterprise Robotics Operations Cloud',
                intro: 'Built for secure and scalable robotics operations',
                title: 'Deploy Faster.<br>Scale with Control.<br>Operate Securely.',
                description: 'From PoC to production, RIVO unifies live video, remote control, fleet orchestration, and security governance so your team can focus on product innovation and accelerate rollout.',
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
            solution: {
                label: 'How It Works',
                title: 'Go Live in 2 Minutes',
                subtitle: 'Connect quickly through standard APIs and node agents, then start operating at scale.',
                pills: [
                    'ROS1/ROS2 Topic Auto Discovery',
                    '2D/3D Map and Status Visualization',
                    'Configurable Control Components',
                    'Fast Deployment and Scaling'
                ],
                widgets: ['Battery', 'Speed', 'Status', 'Stream'],
                status: 'Online',
                stream: 'Live'
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
                title: 'Core Capabilities for Enterprise Operations',
                subtitle: 'From connectivity to governance, built for commercial robotics operations.',
                titles: [
                    'Multi-Stream Real-Time Video',
                    'Secure Remote Command Control',
                    'Dynamic Control Panel Generation',
                    'Multi-Level Access Control',
                    'Enterprise Security and Audit',
                    'Event Alerts and Notifications',
                    'Map Localization and Trajectory Tracking',
                    'Implementation and Technical Advisory',
                    'Scalable High-Availability Architecture'
                ],
                descriptions: [
                    'Low-latency first-person feeds with multi-robot view management, playback, and traceability.',
                    'Send commands from web and mobile with role-based access and operation audit trails.',
                    'Auto-generate interfaces from device schemas to reduce frontend development effort.',
                    'Apply role, group, and resource-scoped permissions aligned with enterprise governance.',
                    'TLS transport, encrypted storage, and complete operation traceability for compliance.',
                    'Define thresholds for battery, connection, and KPIs with real-time notifications.',
                    'Fuse map and route data to track fleet positions and movement status in one view.',
                    'Accelerate go-live with implementation guidance, docs, and custom integration support.',
                    'Designed for high concurrency and long-running workloads with stable service quality.'
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
                title: 'Scale Your Robotics Program with Confidence',
                listHtml: 'Implementation support includes:<br><span class="check">Architecture assessment and deployment planning</span><br><span class="check">PoC goals and KPI definition</span><br><span class="check">One-on-one technical advisory</span>',
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
                resourceLinks: ['Implementation FAQ', 'English Docs', 'Traditional Chinese Docs', 'Book a Call'],
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
        if (navLinks[7]) {
            navLinks[7].textContent = t.nav.docs;
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

        setOne('#solution .section-label', t.solution.label);
        setOne('#solution .section-title', t.solution.title);
        setOne('#solution .section-subtitle', t.solution.subtitle);
        setMany('#solution .feature-pill', t.solution.pills);
        setMany('#solution .widget-label', t.solution.widgets);
        setOne('#solution .browser-widget:nth-child(4) .widget-value', t.solution.status);
        setOne('#solution .browser-widget:nth-child(5) .widget-value', t.solution.stream);

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
