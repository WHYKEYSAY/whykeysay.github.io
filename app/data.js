/* ============================================================================
   Kecheng Yao — personal page · content data (trilingual: EN / FR / 中文)
   Exposed as window.SITE_DATA. Dense technical copy stays English on purpose
   (proper nouns / tech terms); visible prose is translated.
   ========================================================================== */
window.SITE_DATA = (function () {
  // ---- UI strings ----------------------------------------------------------
  const ui = {
    en: {
      booting: "ESTABLISHING SIGNAL",
      bootSub: "decrypting carrier // void uplink",
      selectFighter: "SELECT YOUR FIGHTER",
      selectSub: "Your cursor becomes the ship. Collect cloud power-ups to arm weapons and light up the systems below.",
      engage: "ENGAGE",
      cursorOnly: "CURSOR ONLY",
      cursorOnlyName: "DRIFT",
      cursorOnlyDesc: "Just the void. Neon starfield, normal cursor — no ship, no game.",
      mainWeapon: "MAIN WEAPON",
      scroll: "SCROLL TO DESCEND",
      settings: "SETTINGS",
      controls: "CONTROLS",
      ctrlMove: "Move ship",
      ctrlMoveVal: "mouse / drag",
      ctrlFire: "Fire",
      ctrlFireVal: "automatic",
      ctrlBomb: "Photon bomb",
      ctrlBombVal: "SPACE / tap ◇",
      systems: "SYSTEMS",
      systemsHint: "collect power-ups to bring each online",
      locked: "OFFLINE",
      online: "ONLINE",
      onlineToast: "ONLINE",
      restart: "RE-SELECT FIGHTER",
      sound: "Audio",
      neon: "Neon intensity",
      density: "Enemy density",
      starspeed: "Starfield speed",
      scheme: "Colour cast",
      gametoggle: "Game layer",
      backToTop: "RETURN TO ORIGIN",
      present: "Present",
      bombReady: "PHOTON READY",
      bombUsed: "SCREEN CLEARED",
    },
    fr: {
      booting: "ÉTABLISSEMENT DU SIGNAL",
      bootSub: "déchiffrement porteuse // liaison du vide",
      selectFighter: "CHOISISSEZ VOTRE CHASSEUR",
      selectSub: "Votre curseur devient le vaisseau. Ramassez des bonus cloud pour armer vos armes et activer les systèmes ci-dessous.",
      engage: "ENGAGER",
      cursorOnly: "CURSEUR SEUL",
      cursorOnlyName: "DÉRIVE",
      cursorOnlyDesc: "Juste le vide. Champ d'étoiles néon, curseur normal — pas de vaisseau, pas de jeu.",
      mainWeapon: "ARME PRINCIPALE",
      scroll: "DÉFILER POUR DESCENDRE",
      settings: "RÉGLAGES",
      controls: "COMMANDES",
      ctrlMove: "Déplacer",
      ctrlMoveVal: "souris / glisser",
      ctrlFire: "Tir",
      ctrlFireVal: "automatique",
      ctrlBomb: "Bombe photon",
      ctrlBombVal: "ESPACE / ◇",
      systems: "SYSTÈMES",
      systemsHint: "ramassez des bonus pour les activer",
      locked: "HORS LIGNE",
      online: "EN LIGNE",
      onlineToast: "EN LIGNE",
      restart: "CHANGER DE CHASSEUR",
      sound: "Audio",
      neon: "Intensité néon",
      density: "Densité ennemie",
      starspeed: "Vitesse des étoiles",
      scheme: "Teinte",
      gametoggle: "Couche de jeu",
      backToTop: "RETOUR À L'ORIGINE",
      present: "Présent",
      bombReady: "PHOTON PRÊT",
      bombUsed: "ÉCRAN NETTOYÉ",
    },
    zh: {
      booting: "建立信号中",
      bootSub: "解密载波 // 虚空上行链路",
      selectFighter: "选择你的战机",
      selectSub: "你的鼠标即战机。拾取云服务道具来武装武器，并点亮下方的系统。",
      engage: "出击",
      cursorOnly: "仅光标",
      cursorOnlyName: "漂流",
      cursorOnlyDesc: "只有虚空。霓虹星空、普通光标——没有战机，没有游戏。",
      mainWeapon: "主武器",
      scroll: "向下滚动",
      settings: "设置",
      controls: "操作",
      ctrlMove: "移动战机",
      ctrlMoveVal: "鼠标 / 拖动",
      ctrlFire: "射击",
      ctrlFireVal: "自动",
      ctrlBomb: "光子炸弹",
      ctrlBombVal: "空格 / 点击 ◇",
      systems: "系统",
      systemsHint: "拾取道具以逐个上线",
      locked: "离线",
      online: "在线",
      onlineToast: "已上线",
      restart: "重新选择战机",
      sound: "音频",
      neon: "霓虹强度",
      density: "敌人密度",
      starspeed: "星空速度",
      scheme: "色调",
      gametoggle: "游戏层",
      backToTop: "返回起点",
      present: "至今",
      bombReady: "光子就绪",
      bombUsed: "全屏清除",
    },
  };

  // ---- fighters (start screen) --------------------------------------------
  const fighters = [
    {
      id: "aws", name: "VULCAN", vendor: "AWS", weaponKey: "vulcan",
      desc: {
        en: "Vulcan cannon — rapid fire that blooms into a wide fan-sweep as it levels.",
        fr: "Canon Vulcan — tir rapide qui s'ouvre en éventail à mesure qu'il monte en niveau.",
        zh: "火神炮——连发速度快，升级后形成大面积扇形扫射。",
      },
    },
    {
      id: "azure", name: "LANCE", vendor: "AZURE", weaponKey: "laser",
      desc: {
        en: "Laser lance — a straight, concentrated beam that thickens and pierces when upgraded.",
        fr: "Lance laser — un faisceau droit et concentré qui s'épaissit et transperce une fois amélioré.",
        zh: "激光——直线攻击，威力集中，升级后光束变粗并带穿透效果。",
      },
    },
    {
      id: "gcp", name: "PLASMA", vendor: "GOOGLE CLOUD", weaponKey: "plasma",
      desc: {
        en: "Plasma beam — auto-locks onto enemies and pours sustained, high damage.",
        fr: "Faisceau plasma — verrouillage automatique des ennemis et dégâts élevés soutenus.",
        zh: "等离子光束——自动锁定敌人并持续造成高额伤害。",
      },
    },
  ];

  // ---- hero ----------------------------------------------------------------
  const hero = {
    name: "KECHENG YAO",
    code: "ORIGIN",
    title: {
      en: "AI Infrastructure & DevOps Engineer · Forward-Deployed",
      fr: "Ingénieur Infrastructure IA & DevOps · Déploiement avancé",
      zh: "AI 基础设施 & DevOps 工程师 · 前线交付",
    },
    sub: {
      en: "DevOps @ Ericsson · Self-hosted LLM infra @ Telotia — Montréal",
      fr: "DevOps @ Ericsson · Infra LLM auto-hébergée @ Telotia — Montréal",
      zh: "Ericsson DevOps · Telotia 自托管 LLM 基础设施 — 蒙特利尔",
    },
    tagline: {
      en: "I deploy and own reliable infrastructure end-to-end — from multi-GPU clusters and self-hosted LLM serving to observability and the last-mile integration that makes AI systems trustworthy in production.",
      fr: "Je déploie et prends en charge des infrastructures fiables de bout en bout — des clusters multi-GPU et le service de LLM auto-hébergés jusqu'à l'observabilité et l'intégration du dernier kilomètre qui rend les systèmes IA dignes de confiance en production.",
      zh: "我端到端地部署并掌管可靠的基础设施——从多 GPU 集群、自托管 LLM 推理服务，到可观测性，再到让 AI 系统在生产中真正可信的「最后一公里」集成。",
    },
  };

  // ---- sections meta (codenames, Sidewave-style) --------------------------
  const sectionMeta = {
    about:      { code: "SIGNAL",    label: { en: "About",      fr: "À propos",   zh: "关于" } },
    experience: { code: "UPTIME",    label: { en: "Experience", fr: "Expérience", zh: "经历" } },
    projects:   { code: "PAYLOAD",   label: { en: "Projects",   fr: "Projets",    zh: "项目" } },
    skills:     { code: "ARSENAL",   label: { en: "Skills",     fr: "Compétences",zh: "技能" } },
    hobbies:    { code: "FREQUENCY", label: { en: "Hobbies",    fr: "Loisirs",    zh: "爱好" } },
    contact:    { code: "TRANSMIT",  label: { en: "Contact",    fr: "Contact",    zh: "联系" } },
  };

  // ---- about ---------------------------------------------------------------
  const about = {
    lede: {
      en: "Kecheng is a Montréal-based engineer who deploys and operates reliable infrastructure end-to-end — from enterprise cloud and Kubernetes to a self-hosted, multi-GPU LLM cluster he designed and runs from zero.",
      fr: "Kecheng est un ingénieur basé à Montréal qui déploie et exploite des infrastructures fiables de bout en bout — du cloud d'entreprise et Kubernetes jusqu'à un cluster LLM multi-GPU auto-hébergé qu'il a conçu et opère de zéro.",
      zh: "Kecheng 是一名常驻蒙特利尔的工程师，端到端地部署与运维可靠的基础设施——从企业云与 Kubernetes，到一套他从零设计并运维的多 GPU 自托管 LLM 集群。",
    },
    body: {
      en: "Computer Engineering grad from Concordia (now in the Cybersecurity & Intelligent Systems master's) and a DevOps engineer at Ericsson, he designs, ships and owns systems end-to-end — and runs Orion, a self-hosted AI cluster serving 35B–122B models, as the proving ground. He likes the forward-deployed parts: standing up complex infra in a messy real environment, integrating it the last mile, tuning it against hard physical constraints, and owning the incident response when it breaks.",
      fr: "Diplômé en génie informatique de Concordia (et en maîtrise Cybersécurité & Systèmes intelligents) et ingénieur DevOps chez Ericsson, il conçoit, livre et assume des systèmes de bout en bout — et opère Orion, un cluster IA auto-hébergé servant des modèles de 35B à 122B, comme terrain d'épreuve. Il aime le côté « forward-deployed » : monter une infra complexe dans un environnement réel et désordonné, l'intégrer jusqu'au dernier kilomètre, l'optimiser face à des contraintes physiques dures, et assumer la réponse aux incidents quand ça casse.",
      zh: "他毕业于 Concordia 计算机工程（现就读网络安全与智能系统硕士），是 Ericsson 的 DevOps 工程师；端到端地设计、交付并掌管系统——并以自托管 AI 集群 Orion（服务 35B–122B 模型）作为试验场。他偏爱「前线交付」的部分：在真实而混乱的环境里搭起复杂基础设施、做好最后一公里集成、在硬物理约束下调优，并在系统出事时扛起事件响应。",
    },
    keywords: [
      "Self-hosted LLM serving", "Multi-GPU inference", "Forward-deployed delivery",
      "Infrastructure reliability", "Cloud architecture", "Kubernetes operations",
      "Observability", "Incident response", "Software supply-chain security",
    ],
    education: [
      {
        school: "Concordia University", degree: "Master · Cybersecurity & Intelligent Systems Engineering (CISE)",
        meta: { en: "Sep 2025 — Present · Power Corporation Grad GCS Scholarship", fr: "Sep 2025 — Présent · Bourse Power Corporation Grad GCS", zh: "2025年9月 — 至今 · Power Corporation Grad GCS 奖学金" },
      },
      {
        school: "Concordia University", degree: "B.Eng · Computer Engineering",
        meta: { en: "Graduated 2022 · Montréal, QC", fr: "Diplômé 2022 · Montréal, QC", zh: "2022 年毕业 · 蒙特利尔" },
      },
    ],
  };

  // ---- experience ----------------------------------------------------------
  const experience = {
    role: "DevOps Engineer",
    org: "Ericsson",
    place: { en: "Montréal, Canada", fr: "Montréal, Canada", zh: "加拿大蒙特利尔" },
    period: { en: "Aug 2022 — Present", fr: "Août 2022 — Présent", zh: "2022年8月 — 至今" },
    intro: {
      en: "Enterprise cloud infrastructure, Kubernetes, automation, monitoring, CI/CD and platform reliability. Spearheaded an AWS platform migration to 99.9% uptime and 40% lower cost, cut manual operations ~90% through Kubernetes automation, and tripled deployment frequency across 50+ repositories.",
      fr: "Infrastructure cloud d'entreprise, Kubernetes, automatisation, supervision, CI/CD et fiabilité des plateformes. Mené une migration de plateforme AWS atteignant 99,9 % de disponibilité et 40 % de coûts en moins, réduit les opérations manuelles d'environ 90 % via l'automatisation Kubernetes, et triplé la fréquence de déploiement sur plus de 50 dépôts.",
      zh: "企业级云基础设施、Kubernetes、自动化、监控、CI/CD 与平台可靠性。主导了一次 AWS 平台迁移，达成 99.9% 可用性与 40% 成本下降；通过 Kubernetes 自动化把手工运维减少约 90%；并在 50+ 仓库上将部署频率提升至 3 倍。",
    },
    areas: [
      {
        t: { en: "Cloud & infrastructure", fr: "Cloud & infrastructure", zh: "云与基础设施" },
        d: { en: "AWS + Azure environments — EC2/EKS/S3/RDS/CloudWatch/KMS/IAM and AKS/ACR/VNet/NSG/Key Vault. Cluster monitoring, cert renewals, quotas, platform migration.",
             fr: "Environnements AWS + Azure — EC2/EKS/S3/RDS/CloudWatch/KMS/IAM et AKS/ACR/VNet/NSG/Key Vault. Supervision des clusters, renouvellement de certificats, quotas, migration de plateforme.",
             zh: "AWS 与 Azure 环境——EC2/EKS/S3/RDS/CloudWatch/KMS/IAM 及 AKS/ACR/VNet/NSG/Key Vault。集群监控、证书续期、配额、平台迁移。" },
      },
      {
        t: { en: "Automation & orchestration", fr: "Automatisation & orchestration", zh: "自动化与编排" },
        d: { en: "Kubernetes pod-management workflows, PostgreSQL reporting via cron + YAML, automated provisioning — cutting repetitive manual operations.",
             fr: "Flux de gestion de pods Kubernetes, rapports PostgreSQL via cron + YAML, provisionnement automatisé — réduisant les opérations manuelles répétitives.",
             zh: "Kubernetes Pod 管理流程、基于 cron + YAML 的 PostgreSQL 报表自动化、自动化环境部署——减少重复性手工操作。" },
      },
      {
        t: { en: "Monitoring & observability", fr: "Supervision & observabilité", zh: "监控与可观测性" },
        d: { en: "Prometheus, Grafana, Zabbix, Graylog, OpenSearch, ELK — alerting + dashboards that cut incident-detection time.",
             fr: "Prometheus, Grafana, Zabbix, Graylog, OpenSearch, ELK — alertes + tableaux de bord réduisant le temps de détection des incidents.",
             zh: "Prometheus、Grafana、Zabbix、Graylog、OpenSearch、ELK——告警与仪表盘，缩短故障检测时间。" },
      },
      {
        t: { en: "CI/CD & collaboration", fr: "CI/CD & collaboration", zh: "CI/CD 与协作" },
        d: { en: "GitLab + Jenkins pipelines for microservices / Spring Boot, repository administration, CAB processes, escalation support and knowledge-sharing.",
             fr: "Pipelines GitLab + Jenkins pour microservices / Spring Boot, administration de dépôts, processus CAB, support d'escalade et partage de connaissances.",
             zh: "面向微服务 / Spring Boot 的 GitLab 与 Jenkins 流水线、仓库管理、CAB 流程、升级支持与知识分享。" },
      },
    ],
  };

  // ---- projects (mapped to weapon colours) --------------------------------
  // sys: which HUD system this card belongs to (aws/azure/gcp/mlai/art/uiux/none)
  const projects = [
    {
      id: "orion", sys: "mlai", name: "Orion — Self-Hosted AI Inference Cluster",
      period: { en: "2026 — Present", fr: "2026 — Présent", zh: "2026 — 至今" },
      blurb: {
        en: "Designed, deployed and operate a 3-node self-hosted AI cluster (2 heterogeneous GPU workstations + a TrueNAS control plane) serving 35B–122B LLMs via llama.cpp over a home LAN — Caddy failover routing, Tailscale mesh, Cloudflare tunnel, and Dockerized Telegram-bot + web front-ends. Tuned a 122B MoE to ~22.5 tok/s on 48 GB of asymmetric consumer VRAM (+35%) by diagnosing host RAM — not VRAM — as the real bottleneck. Detected, contained and remediated a live Cobalt-Strike C2 compromise end-to-end.",
        fr: "Conçu, déployé et exploité un cluster IA auto-hébergé à 3 nœuds (2 stations GPU hétérogènes + un plan de contrôle TrueNAS) servant des LLM de 35B à 122B via llama.cpp sur un LAN — routage à bascule Caddy, maillage Tailscale, tunnel Cloudflare et front-ends conteneurisés (bot Telegram + tableau de bord web). Optimisé un modèle MoE 122B à ~22,5 tok/s sur 48 Go de VRAM grand-public asymétrique (+35 %) en diagnostiquant la RAM hôte — et non la VRAM — comme véritable goulot. Détecté, contenu et corrigé de bout en bout une compromission active de type Cobalt-Strike (C2).",
        zh: "独立设计、部署并运维一套 3 节点自托管 AI 集群（2 台异构 GPU 工作站 + TrueNAS 控制面），经 llama.cpp 在家庭 LAN 上提供 35B–122B 大模型——Caddy 故障转移路由、Tailscale 网格、Cloudflare 隧道，以及 Docker 化的 Telegram 机器人 + Web 前端。将 122B MoE 模型在 48GB 非对称消费级显存上调到 ~22.5 tok/s（+35%），关键是诊断出主机内存（而非显存）才是真正瓶颈。还端到端检测、遏制并修复了一次真实的 Cobalt-Strike C2 入侵。",
      },
      tags: ["llama.cpp", "Multi-GPU", "Caddy failover", "Tailscale", "Incident response", "TrueNAS"],
    },
    {
      id: "aws-migration", sys: "aws", name: "AWS Enterprise Platform Migration",
      period: { en: "Apr – May 2024", fr: "Avr – Mai 2024", zh: "2024年4–5月" },
      blurb: {
        en: "Migrated an enterprise platform to AWS for reliability and security — EC2, EKS, S3, RDS, CloudWatch, KMS, IAM — with backup/patch management and Zabbix/Grafana/Prometheus monitoring.",
        fr: "Migration d'une plateforme d'entreprise vers AWS pour la fiabilité et la sécurité — EC2, EKS, S3, RDS, CloudWatch, KMS, IAM — avec sauvegarde/correctifs et supervision Zabbix/Grafana/Prometheus.",
        zh: "将企业平台迁移到 AWS，提升可靠性与安全性——EC2、EKS、S3、RDS、CloudWatch、KMS、IAM——含备份/补丁管理与 Zabbix/Grafana/Prometheus 监控。",
      },
      tags: ["EKS", "IAM", "KMS", "CloudWatch", "OpenSearch", "Cloudflare"],
    },
    {
      id: "azure-platform", sys: "azure", name: "Azure Application & Monitoring Platform",
      period: { en: "Feb – Jun 2025", fr: "Fév – Juin 2025", zh: "2025年2–6月" },
      blurb: {
        en: "Designed a scalable AKS platform with a dedicated Zabbix monitoring VM — Key Vault, NSGs, NGINX Ingress and integrated CI/CD.",
        fr: "Conception d'une plateforme AKS évolutive avec une VM de supervision Zabbix dédiée — Key Vault, NSG, NGINX Ingress et CI/CD intégré.",
        zh: "设计可扩展的 AKS 平台，配备独立的 Zabbix 监控虚拟机——Key Vault、NSG、NGINX Ingress 与集成 CI/CD。",
      },
      tags: ["AKS", "Key Vault", "VNet", "NGINX Ingress", "Zabbix"],
    },
    {
      id: "opsplane", sys: "gcp", name: "OpsPlane — Architecture & Supply-Chain Security",
      period: { en: "Nov 2025 — Present", fr: "Nov 2025 — Présent", zh: "2025年11月 — 至今" },
      blurb: {
        en: "Standardized infrastructure blueprints and hardened the software supply chain — moving critical tooling and artifact registries to private repositories with automated lifecycle management.",
        fr: "Standardisation des blueprints d'infrastructure et durcissement de la chaîne d'approvisionnement logicielle — outils critiques et registres déplacés vers des dépôts privés avec gestion de cycle de vie automatisée.",
        zh: "标准化基础设施蓝图并加固软件供应链——将关键工具与制品仓库迁移到私有仓库，并实现自动化生命周期管理。",
      },
      tags: ["Blueprints", "Private registries", "Lifecycle", "Supply-chain"],
    },
    {
      id: "kiro", sys: "mlai", name: "KIRO — Architect-Level AI Assistant",
      period: { en: "Jan – Apr 2026", fr: "Jan – Avr 2026", zh: "2026年1–4月" },
      blurb: {
        en: "Enterprise AI assistant (CLI + IDE, Dockerized): AWS management, code intelligence, MR summarization, unused-resource detection, docs generation, Confluence sync and credential hygiene.",
        fr: "Assistant IA d'entreprise (CLI + IDE, conteneurisé) : gestion AWS, intelligence de code, résumé de MR, détection de ressources inutilisées, génération de docs, sync Confluence et hygiène des secrets.",
        zh: "企业级 AI 助手（CLI + IDE，Docker 化）：AWS 管理、代码智能、MR 摘要、闲置资源识别、文档生成、Confluence 同步与凭据安全。",
      },
      tags: ["AI assistant", "Docker", "CLI/IDE", "Code intelligence"],
    },
    {
      id: "anomaly", sys: "mlai", name: "Real-Time Anomaly Detection Platform",
      period: { en: "Apr 2026 — Present", fr: "Avr 2026 — Présent", zh: "2026年4月 — 至今" },
      blurb: {
        en: "OpenSearch ML for real-time infrastructure anomaly detection — proactive alerting and performance/security monitoring before user impact.",
        fr: "OpenSearch ML pour la détection d'anomalies d'infrastructure en temps réel — alertes proactives et supervision perf/sécurité avant tout impact utilisateur.",
        zh: "基于 OpenSearch ML 的实时基础设施异常检测——在影响用户之前进行主动告警与性能/安全监控。",
      },
      tags: ["OpenSearch ML", "Anomaly detection", "Alerting"],
    },
    {
      id: "eeg", sys: "none", name: "EEGToolbox — Neural Signal Analysis",
      period: { en: "Sep 2025 — Present", fr: "Sep 2025 — Présent", zh: "2025年9月 — 至今" },
      blurb: {
        en: "Diagnosed and fixed a results-invalidating bug in a 63-channel EEG microstate pipeline — dropping frontal channels had silently destroyed a canonical brain-state. Rebuilt it with Picard ICA + ICLabel artifact removal and GFP-peak clustering, unified a fragmented two-year cohort to a consistent N=32, and landed a result with four independent methods converging — shipped as reproducible scripts and a written manuscript.",
        fr: "Diagnostiqué et corrigé un bug invalidant les résultats dans un pipeline de micro-états EEG à 63 canaux — la suppression des canaux frontaux avait silencieusement détruit un état cérébral canonique. Reconstruit avec ICA Picard + suppression d'artefacts ICLabel et clustering sur pics de GFP, unifié une cohorte fragmentée sur deux ans à un N=32 cohérent, avec quatre méthodes indépendantes convergeant vers le même résultat — livré en scripts reproductibles et un manuscrit rédigé.",
        zh: "诊断并修复了一个 63 通道 EEG 微状态流水线中「使结果失效」的 bug——删除额叶通道悄悄破坏了一个标准脑状态。用 Picard ICA + ICLabel 去伪迹 + GFP 峰聚类重建，将跨两年的碎片化队列统一为一致的 N=32，并得到四种独立方法收敛的结论——以可复现脚本与撰写好的手稿交付。",
      },
      tags: ["Microstates", "Picard ICA · ICLabel", "N=32", "Reproducible", "Manuscript"],
    },
  ];

  // ---- skills matrix -------------------------------------------------------
  const skills = [
    { g: { en: "Cloud", fr: "Cloud", zh: "云平台" }, items: ["AWS", "Azure", "Google Cloud", "EC2 · EKS · S3 · RDS", "CloudWatch · KMS · IAM", "AKS · ACR · VNet · Key Vault"] },
    { g: { en: "Containers & DevOps", fr: "Conteneurs & DevOps", zh: "容器与 DevOps" }, items: ["Kubernetes", "Docker", "Helm", "NGINX Ingress", "Terraform · Ansible", "GitLab CI/CD · Jenkins · ArgoCD"] },
    { g: { en: "Monitoring", fr: "Supervision", zh: "监控" }, items: ["Prometheus", "Grafana", "Zabbix", "OpenSearch", "Elastic · Kibana · Logstash", "Graylog · OpenSearch ML"] },
    { g: { en: "AI infrastructure", fr: "Infrastructure IA", zh: "AI 基础设施" }, items: ["Self-hosted LLM serving", "llama.cpp · CUDA", "Multi-GPU / distributed inference", "Inference reliability · failover", "Prompt engineering · GenAI", "MQTT · Home-Assistant observability"] },
    { g: { en: "Security & reliability", fr: "Sécurité & fiabilité", zh: "安全与可靠性" }, items: ["IAM · KMS", "Supply-chain security", "Private registries", "Incident response · credential rotation", "Graceful degradation"] },
    { g: { en: "Languages & data", fr: "Langages & données", zh: "语言与数据" }, items: ["Python · Go · Bash", "Java · C++ · JS", "SQL · PostgreSQL · Redis", "Node.js · Three.js"] },
  ];

  // ---- hobbies (sub-weapons) ----------------------------------------------
  const hobbies = [
    {
      id: "art", sys: "art", missile: "M", name: { en: "Art & 3D Design", fr: "Art & design 3D", zh: "艺术与 3D 设计" },
      role: { en: "M-missile · heavy payload", fr: "Missile M · charge lourde", zh: "M 导弹 · 重型弹头" },
      desc: {
        en: "Slow but devastating — visual and 3D art across Photoshop, Blender, Maya, Unity, Unreal and AR (Meta Spark, Adobe Aero).",
        fr: "Lent mais dévastateur — art visuel et 3D sur Photoshop, Blender, Maya, Unity, Unreal et AR (Meta Spark, Adobe Aero).",
        zh: "缓慢却毁灭性十足——横跨 Photoshop、Blender、Maya、Unity、Unreal 与 AR（Meta Spark、Adobe Aero）的视觉与 3D 创作。",
      },
      tools: ["Photoshop", "Blender", "Maya", "Unity", "Unreal", "Meta Spark"],
    },
    {
      id: "uiux", sys: "uiux", missile: "H", name: { en: "UI / UX Design", fr: "Design UI / UX", zh: "UI / UX 设计" },
      role: { en: "H-missile · homing", fr: "Missile H · autoguidé", zh: "H 导弹 · 自动追踪" },
      desc: {
        en: "Auto-locks onto the problem — product and interaction design with Sketch, Justinmind, wireframing and PWA work.",
        fr: "Verrouillage automatique du problème — design produit et interaction avec Sketch, Justinmind, wireframing et PWA.",
        zh: "自动锁定问题——使用 Sketch、Justinmind、线框图与 PWA 的产品与交互设计。",
      },
      tools: ["Sketch", "Justinmind", "Wireframing", "PWA", "Figma"],
    },
  ];

  // ---- contact -------------------------------------------------------------
  const contact = {
    line: {
      en: "Open to building trustworthy systems. Reach out.",
      fr: "Disponible pour bâtir des systèmes dignes de confiance. Écrivez-moi.",
      zh: "乐于一起构建可信赖的系统。欢迎联系。",
    },
    links: [
      { label: "LinkedIn", value: "kecheng-yao", href: "https://www.linkedin.com/in/kecheng-yao/", icon: "linkedin" },
      { label: { en: "Location", fr: "Lieu", zh: "位置" }, value: "Montréal · QC · Canada", href: null, icon: "pin" },
    ],
  };

  // ---- HUD systems (power-up registry) ------------------------------------
  // kind: weapon = main, missile = sub, bomb = bomb. target = section id to scroll.
  const systems = [
    { id: "aws",   kind: "weapon",  glyph: "AWS",  full: "AWS · Vulcan",        target: "projects", colorVar: "--w-aws" },
    { id: "azure", kind: "weapon",  glyph: "AZ",   full: "Azure · Laser",       target: "projects", colorVar: "--w-azure" },
    { id: "gcp",   kind: "weapon",  glyph: "GCP",  full: "Google Cloud · Plasma", target: "skills", colorVar: "--w-gcp" },
    { id: "art",   kind: "missile", glyph: "M",    full: "Art Design · Missile", target: "hobbies", colorVar: "--w-art" },
    { id: "uiux",  kind: "missile", glyph: "H",    full: "UI/UX · Homing",      target: "hobbies",  colorVar: "--w-uiux" },
    { id: "mlai",  kind: "bomb",    glyph: "◇",    full: "ML/AI · Photon Bomb", target: "projects", colorVar: "--w-mlai" },
  ];

  return { ui, fighters, hero, sectionMeta, about, experience, projects, skills, hobbies, contact, systems };
})();
