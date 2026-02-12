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
                description: '從 PoC 到量產，RIVO 整合影像、控制、調度與資安治理——讓團隊專注核心產品。',
                primary: '預約架構諮詢',
                secondary: '查看平台示範',
                follow: '關注我們 - TW.'
            },
            problems: {
                label: '痛點',
                title: '機器人專案卡在商用化階段？',
                subtitle: '技術驗證完成，真正挑戰是可營運、可擴展、可維運',
                titles: [
                    'Demo 可行，但缺乏面向客戶的營運介面',
                    '設備散佈多地，遠端維運成本攀升',
                    '研發資源耗在後台基礎建設',
                    '節點規模成長，權限與管理複雜度劇增'
                ],
                needs: [
                    '需要客戶與管理層可直接使用的可視化看板',
                    '需要全時段雲端監控與遠端操控能力',
                    '需要現成平台，聚焦核心產品研發',
                    '需要多租戶、分級權限的車隊管理系統'
                ]
            },
            solution: {
                label: '運作方式',
                title: '2 分鐘完成平台接入',
                subtitle: '標準 API + 節點代理，快速接入即開始營運',
                pills: [
                    'Docker 一鍵部署',
                    '自訂 Schema 自動產生 API',
                    'WebRTC 即時影像',
                    'WebSocket 雙向指令'
                ],
                widgets: ['電量', '速度', '狀態', '串流'],
                status: '上線',
                stream: '即時'
            },
            rivoNode: {
                label: 'RIVO Node',
                title: '企業級邊緣資料節點',
                subtitle: '標準化接入現場設備，穩定上傳結構化數據',
                keyTitles: ['多協議接入', '低延遲回傳', '遠端配置', '開機自啟', '離線緩存', '工業穩定性'],
                keyDescriptions: [
                    '支援 UART / RS-485 / I2C 等常見工業介面',
                    '影像與遙測資料即時回傳，支援遠端決策',
                    '線上調整參數與策略，無需到場',
                    '裝置開機即自動連線，免人工介入',
                    '斷線自動緩存，恢復後補傳',
                    '7×24 長時間運轉設計，確保持續服務'
                ],
                primaryButtons: ['查看技術文件', '預約架構諮詢']
            },
            integration: {
                title: '彈性整合架構',
                subtitle: '既有設備、嵌入式系統與雲端平台的標準化串接',
                columnTitles: ['資料來源', '邊緣處理層', '管理平台'],
                placeholder: '外部設備輸入',
                sourceTitles: ['既有設備系統', '感測與控制模組'],
                sourceDescriptions: ['透過 UART / RS-485 快速接入', '支援 I2C / SPI / ADC 即時採集'],
                optionTabs: ['硬體閘道器', '軟體節點'],
                primaryDesc: '工業級邊緣閘道器，內建 RIVO-Node Runtime',
                primaryFeatures: [
                    '協議轉換與資料標準化',
                    '斷線緩存、自動重連',
                    '端對端 TLS 加密',
                    '雲端 / 私有部署'
                ],
                softwareDesc: '在既有 Linux 裝置上部署 RIVO-Node Agent',
                softwareFeatures: [
                    '免額外硬體',
                    '直連 RIVO-Center',
                    'ARM / x86、容器化',
                    '完整軟體定義能力'
                ],
                deployLabels: ['SaaS 雲端', '本地私有部署'],
                cloudDesc: '監控到控制的一站式營運中樞',
                cloudFeatures: [
                    '機器人狀態與歷史數據即時可見',
                    '低延遲影像，遠端操控如臨現場',
                    '異常自動告警，分級通知',
                    '自訂 Schema，API 自動擴展'
                ],
                scenariosTitle: '典型部署情境',
                scenarioTitles: ['既有設備協議橋接', '工廠感測資料上雲', '嵌入式軟體節點'],
                scenarioDescriptions: [
                    '既有控制器接入 NodeWare，協議轉換後直接上平台。',
                    '感測器連入 NodeWare，持續上傳遙測，即時告警與分析。',
                    'Linux SBC 部署 Node Agent，軟體定義連線與遠端維運。'
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
                subtitle: '連線 → 監控 → 治理，完整支援商用落地',
                titles: [
                    '多路即時影像串流',
                    '安全遠端指令控制',
                    '自訂資料模型，零開發擴展',
                    '多層級權限管理',
                    '企業級資安與稽核',
                    '智慧告警與即時日誌',
                    '地圖定位與軌跡追蹤',
                    '在地導入與技術顧問',
                    '雲端或私有，彈性部署'
                ],
                descriptions: [
                    '低延遲第一視角與多機同步，支援錄影回放與事件追溯',
                    'Web 與行動端即時下達指令，角色權限搭配操作審計',
                    '定義裝置資料格式，平台自動產生 API，免改後端',
                    '依角色、群組與資源範圍精細控管，安全協作',
                    '傳輸加密、落地加密、完整操作軌跡，滿足合規要求',
                    '分級自動通知、確認解決流程，即時日誌快速排障',
                    '導航地圖疊加即時軌跡，掌握車隊位置與路徑',
                    '台灣團隊，繁中文件、導入規劃與客製整合，PoC 到量產陪跑',
                    'SaaS 或私有部署，依營運規模靈活擴展'
                ]
            },
            comparison: {
                label: '比較',
                title: '為何企業選擇 RIVO',
                subtitle: '導入效率、擴展性與維運成本比較',
                headers: ['評估項目', '自建平台', '開源組合', '國際 SaaS', 'RIVO'],
                rows: [
                    ['導入時間', '3-6 個月', '4-10 週', '1-2 週設定', '<strong>2 天啟動 PoC</strong>'],
                    ['初期建置成本', '高（人力 + 架構）', '中（需客製）', '低（授權為主）', '<strong>可控（方案化）</strong>'],
                    ['內部技術負擔', '需長期維護', '需自行整合', '英文流程', '<strong>專注機器人應用開發</strong>'],
                    ['行動端支援', '需另外開發', '需另外開發', '部分支援', '內建'],
                    ['中文介面與文件', '-', '有限', '有限', '完整'],
                    ['在地導入服務', '-', '-', '通常遠端', '台灣團隊'],
                    ['月度營運成本', '維護 + 雲資源', '伺服器 + 維運', '$100+ USD / robot', '<strong>NT$ 3K 起</strong>']
                ],
                fitTitle: '適合你的團隊，如果你：',
                fitItems: [
                    '機器人原型已完成，準備商用化',
                    '需向客戶或管理層展示營運狀態',
                    '希望減少平台開發時間',
                    '跨據點管理多台機器人',
                    '重視資安治理與在地支援'
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
                subtitle: '研究、製造與新創團隊的導入回饋',
                badges: ['研究單位', '機器人新創', '智慧製造'],
                quotes: [
                    '「原本維護多套監控工具。導入 RIVO 後，影像、告警與操作紀錄統一平台，協作效率明顯提升。」',
                    '「展示前即完成遠端控制與儀表板上線，客戶在同一介面看到狀態與 KPI，溝通效率大幅提升。」',
                    '「多機調度最大痛點是可視性與異常回應。導入集中監控與權限管理後，維運流程明顯標準化。」'
                ],
                avatars: ['林', '陳', '張'],
                names: ['林教授', '陳執行長', '張技術總監'],
                roles: ['國立大學智慧機器人實驗室', '物流機器人新創團隊', '智慧製造系統整合商']
            },
            faq: {
                label: '常見問題',
                title: '常見問題',
                subtitle: '導入前常見關鍵問題',
                questions: [
                    '非標準 ROS 架構也能整合嗎？',
                    '資料存放位置與安全機制為何？',
                    '支援哪些 ROS 版本？',
                    'PoC 與正式上線流程需要多久？',
                    '與國際平台相比，RIVO 的差異是什麼？',
                    '可以做私有部署與客製整合嗎？'
                ],
                answers: [
                    '可以。只要系統提供可讀資料通道（topic / API / 協議輸出），即可對映接入。Legacy 協議亦提供導入服務。',
                    '雲端或私有部署皆可。傳輸 TLS 加密、儲存支援 AES-256，搭配權限控管與操作稽核。',
                    '支援 ROS1（Kinetic / Melodic / Noetic）與 ROS2（Foxy / Humble / Iron）。',
                    'PoC 接入一般 2–5 個工作天；正式上線視節點數、資安需求與部署模式而定。',
                    '聚焦亞太市場，繁中介面、在地支援與彈性部署，兼顧企業級擴展與治理。',
                    '可以。Enterprise 方案支援 On-Premise / VPC，可加入 SSO、權限模型與流程整合。'
                ]
            },
            cta: {
                badge: '企業級就緒',
                title: '讓機器人專案進入規模化營運',
                listHtml: '導入支援包含：<br><span class="check">導入評估與架構建議</span><br><span class="check">PoC 目標與 KPI 定義</span><br><span class="check">一對一技術諮詢</span>',
                buttons: ['預約 30 分鐘諮詢', '查看平台示範']
            },
            contact: {
                label: '聯絡',
                title: '聯絡我們',
                subtitle: '提交需求，技術顧問 1 個工作天內回覆',
                itemTitles: ['Email', '商務聯繫', '地址', '服務時間'],
                itemValues: ['@rivo.dev', '台南市東區大學路1號', '週一至週五 09:00 - 18:00 (GMT+8)'],
                formLabels: ['姓名 / 職稱', '商務聯絡 Email', '公司 / 單位名稱', '需求描述'],
                placeholders: {
                    name: '例如：王小明 / 技術經理',
                    email: 'name@company.com',
                    company: '例如：RIVO Robotics Team',
                    message: '機器人類型、部署場域、預期節點數與待解問題'
                },
                submit: '送出需求'
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
                title: 'Rapidly Deploy.<br>Scalably Control.<br>Securely Operate.',
                description: 'From PoC to production — RIVO unifies video, control, fleet ops, and security governance so your team can focus on what matters.',
                primary: 'Book Architecture Consultation',
                secondary: 'View Platform Demo',
                follow: 'Follow Us - TW. '
            },
            problems: {
                label: 'Pain Points',
                title: 'Robotics Stuck Before Commercialization?',
                subtitle: 'After technical validation, the real challenge is operations at scale.',
                titles: [
                    'Demo works, but no stakeholder-ready interface',
                    'Devices spread across sites, remote ops costs rising',
                    'Engineering time consumed by backend infrastructure',
                    'Node count growing, access control getting complex'
                ],
                needs: [
                    'Need dashboards customers and execs can use instantly',
                    'Need 24/7 cloud monitoring and remote control',
                    'Need a ready platform to focus on core product',
                    'Need multi-tenant fleet management with RBAC'
                ]
            },
            solution: {
                label: 'How It Works',
                title: 'Go Live in 2 Minutes',
                subtitle: 'Standard APIs + node agents — connect and start operating at scale.',
                pills: [
                    'One-Click Docker Deploy',
                    'Custom Schema Auto-Generates API',
                    'WebRTC Live Video',
                    'WebSocket Bidirectional Commands'
                ],
                widgets: ['Battery', 'Speed', 'Status', 'Stream'],
                status: 'Online',
                stream: 'Live'
            },
            rivoNode: {
                label: 'RIVO Node',
                title: 'Enterprise Edge Data Node',
                subtitle: 'Standardized field device connectivity with reliable structured data upload.',
                keyTitles: ['Multi-Protocol', 'Low-Latency Uplink', 'Remote Config', 'Auto Startup', 'Offline Buffer', 'Industrial Grade'],
                keyDescriptions: [
                    'Supports UART / RS-485 / I2C and common industrial interfaces.',
                    'Real-time video and telemetry uplink for remote decisions.',
                    'Update parameters and policies online — no site visit needed.',
                    'Auto-connects at boot, zero manual intervention.',
                    'Auto-buffers on disconnect, syncs on reconnect.',
                    '7×24 long-running design for continuous service.'
                ],
                primaryButtons: ['View Technical Docs', 'Book Architecture Call']
            },
            integration: {
                title: 'Flexible Integration Architecture',
                subtitle: 'Legacy equipment, embedded systems, and cloud platform — standardized connectivity.',
                columnTitles: ['Data Sources', 'Edge Processing', 'Management Platform'],
                placeholder: 'External Device Input',
                sourceTitles: ['Legacy Equipment Systems', 'Sensor and Control Modules'],
                sourceDescriptions: ['Integrate quickly via UART / RS-485.', 'Supports real-time collection through I2C / SPI / ADC.'],
                optionTabs: ['Hardware Gateway', 'Software Node'],
                primaryDesc: 'Industrial edge gateway with built-in RIVO-Node runtime.',
                primaryFeatures: [
                    'Protocol conversion and data normalization',
                    'Offline buffer, auto-reconnect',
                    'End-to-end TLS encryption',
                    'Cloud / private deployment'
                ],
                softwareDesc: 'Deploy RIVO-Node agent on existing Linux devices.',
                softwareFeatures: [
                    'No extra hardware',
                    'Direct to RIVO-Center',
                    'ARM / x86, containerized',
                    'Full software-defined capability'
                ],
                deployLabels: ['SaaS Cloud', 'On-Premise Deployment'],
                cloudDesc: 'Monitoring-to-control operations hub, ready out of the box.',
                cloudFeatures: [
                    'Real-time robot status and history visibility',
                    'Low-latency video, remote control as if on-site',
                    'Auto-escalating alerts by severity',
                    'Custom schemas, API auto-extends'
                ],
                scenariosTitle: 'Typical Deployment Scenarios',
                scenarioTitles: ['Legacy Protocol Bridge', 'Factory Sensor Data Uplink', 'Embedded Software Node'],
                scenarioDescriptions: [
                    'Legacy controller into NodeWare — protocol conversion, straight to platform.',
                    'Sensors into NodeWare — continuous telemetry, real-time alerts and analytics.',
                    'Node Agent on Linux SBC — software-defined connectivity and remote ops.'
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
                subtitle: 'Connectivity → monitoring → governance for commercial robotics.',
                titles: [
                    'Multi-Stream Real-Time Video',
                    'Secure Remote Command Control',
                    'Custom Data Models, Zero-Code Extension',
                    'Multi-Level Access Control',
                    'Enterprise Security and Audit',
                    'Smart Alerts and Real-Time Logs',
                    'Map Positioning and Trajectory Tracking',
                    'Local Onboarding and Technical Advisory',
                    'Cloud or On-Premise, Flexible Deployment'
                ],
                descriptions: [
                    'Low-latency FPV and multi-robot views with playback and event traceability.',
                    'Issue commands from web or mobile with role-based access and audit trails.',
                    'Define device data formats; platform auto-generates matching APIs — zero backend changes.',
                    'Fine-grained control by role, group, and resource scope for secure collaboration.',
                    'E2E encryption, at-rest encryption, and full audit trails for compliance.',
                    'Severity-based notifications with ack/resolve workflows; real-time log streaming.',
                    'Upload nav maps with live trajectory overlay — fleet positions at a glance.',
                    'Taiwan-based team, local docs, onboarding plans, and custom integrations — PoC to production.',
                    'SaaS or on-premise — scale flexibly as operations grow.'
                ]
            },
            comparison: {
                label: 'Comparison',
                title: 'Why Enterprises Choose RIVO',
                subtitle: 'Delivery speed, scalability, and operating cost compared.',
                headers: ['Criteria', 'In-House Platform', 'Open-Source Stack', 'Global SaaS', 'RIVO'],
                rows: [
                    ['Time to Launch', '3-6 months', '4-10 weeks', '1-2 weeks setup', '<strong>PoC in 2 days</strong>'],
                    ['Initial Build Cost', 'High (team + architecture)', 'Medium (customization needed)', 'Low (license-first)', '<strong>Predictable (plan-based)</strong>'],
                    ['Internal Technical Load', 'Long-term maintenance', 'Self-integration required', 'English workflow', '<strong>Focus on robotics application development</strong>'],
                    ['Mobile Support', 'Build separately', 'Build separately', 'Partial', 'Built-in'],
                    ['Chinese UI and Docs', '-', 'Limited', 'Limited', 'Complete'],
                    ['Local Delivery Support', '-', '-', 'Mostly remote', 'Taiwan-based team'],
                    ['Monthly Operating Cost', 'Maintenance + cloud', 'Server + ops', '$100+ USD / robot', '<strong>Starts at NT$ 3K</strong>']
                ],
                fitTitle: 'Best fit if your team:',
                fitItems: [
                    'Robot prototype ready, planning commercialization',
                    'Need operational visibility for customers and management',
                    'Want to reduce platform development time',
                    'Managing multi-robot deployments across locations',
                    'Require security governance and local support'
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
                subtitle: 'Feedback from research, manufacturing, and startup teams.',
                badges: ['Research Lab', 'Robotics Startup', 'Smart Manufacturing'],
                quotes: [
                    '"Previously maintained multiple monitoring tools. With RIVO, video, alerts, and logs unified on one platform — collaboration improved immediately."',
                    '"Launched remote control and dashboards before customer demos. Stakeholders see status and KPIs in a single view."',
                    '"Biggest pain point was visibility and exception response. Centralized monitoring and access control standardized our operations."'
                ],
                avatars: ['L', 'C', 'Z'],
                names: ['Prof. Lin', 'CEO Chen', 'Technical Director Chang'],
                roles: ['University Intelligent Robotics Lab', 'Logistics Robotics Startup', 'Smart Manufacturing Integrator']
            },
            faq: {
                label: 'FAQ',
                title: 'Frequently Asked Questions',
                subtitle: 'Key questions before implementation.',
                questions: [
                    'Can we integrate non-standard ROS architectures?',
                    'Where is data stored and how is it secured?',
                    'Which ROS versions are supported?',
                    'How long do PoC and production rollout take?',
                    'How is RIVO different from global platforms?',
                    'Do you support private deployment and custom integration?'
                ],
                answers: [
                    'Yes. Any readable data channel (topics / APIs / protocol output) can be mapped and integrated. Legacy protocol onboarding also available.',
                    'Cloud or private deployment. TLS transport, AES-256 at-rest encryption, with access control and audit logs.',
                    'ROS1 (Kinetic / Melodic / Noetic) and ROS2 (Foxy / Humble / Iron).',
                    'PoC onboarding in 2–5 business days. Production timeline depends on node count, security needs, and deployment model.',
                    'Optimized for APAC: local support, Chinese UI, flexible deployment — with enterprise-grade scalability and governance.',
                    'Yes. Enterprise plans support On-Premise / VPC, plus SSO, permission models, and workflow integration.'
                ]
            },
            cta: {
                badge: 'Enterprise Ready',
                title: 'Scale Your Robotics Program with Confidence',
                listHtml: 'Onboarding support includes:<br><span class="check">Architecture assessment and deployment planning</span><br><span class="check">PoC goals and KPI definition</span><br><span class="check">1-on-1 technical advisory</span>',
                buttons: ['Book a 30-Min Consultation', 'View Platform Demo']
            },
            contact: {
                label: 'Contact',
                title: 'Contact Us',
                subtitle: 'Submit requirements — our team responds within 1 business day.',
                itemTitles: ['Email', 'Business Chat', 'Address', 'Service Hours'],
                itemValues: ['@rivo.dev', 'No.1 University Rd., East District, Tainan, Taiwan', 'Mon - Fri, 09:00 - 18:00 (GMT+8)'],
                formLabels: ['Name / Role', 'Business Email', 'Company / Organization', 'Project Requirements'],
                placeholders: {
                    name: 'e.g. Alex Wang / Engineering Manager',
                    email: 'name@company.com',
                    company: 'e.g. RIVO Robotics Team',
                    message: 'Robot type, deployment environment, target node count, and key challenges.'
                },
                submit: 'Submit'
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
