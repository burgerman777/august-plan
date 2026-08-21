// ═══════════════════════════════════════════════
// 八月计划 — 数据源（v1 参数驱动）
// 改计划只改这个文件，index.html 不用动
// 也可通过 ?plan=xxx.json 加载外部 JSON 覆盖默认数据
//
// 每天 = slots 时段数组，每个 slot = { time, text, type }
//   type: 'main'(主线) / 'express'(表达) / 'workout'(健身) / 'read'(阅读)
//   time: 该时段，可空（如健身与主线并行）
// ═══════════════════════════════════════════════
window.PLAN_DATA = {
  meta: {
    title: '八月过渡计划',
    subtitle: '2026 年 8 月 · 离职前 20 个可利用日 · 每天 21:00—23:00',
  },

  weeks: ['W1 搭架子', 'W2 启动', 'W3 Agent进阶', '收尾周'],

  days: [
    // Week 1: 搭架子 ✅
    { date:4,  wd:'周二', w:0, s:'done', tags:['闲鱼','表达'],
      slots:[
        { time:'21:10-22:10', text:'注册闲鱼，研究 AI 服务定价和描述', type:'main' },
        { time:'22:10-22:40', text:'写自我介绍，删到核心三句', type:'express' },
      ],
      result:'✅ 完成', rClass:'s-ok' },
    { date:5,  wd:'周三', w:0, s:'done', tags:['闲鱼','表达'],
      slots:[
        { time:'21:10-22:10', text:'写 3 个服务方案 + 掌厨展示图', type:'main' },
        { time:'22:10-22:40', text:'默写"客户问价"场景回复', type:'express' },
      ],
      result:'✅ 三商品全上架', rClass:'s-ok' },
    { date:6,  wd:'周四', w:0, s:'done', tags:['闲鱼','表达'],
      slots:[
        { time:'21:10-22:10', text:'发布第一条闲鱼服务', type:'main' },
        { time:'22:10-22:40', text:'戴耳机听演讲，口型跟读', type:'express' },
      ],
      result:'✅ 超额+修违规', rClass:'s-ok' },
    { date:7,  wd:'周五', w:0, s:'missed', type:'half-rest', tags:['半休'],
      slots:[
        { time:'', text:'🏃 健身 → ✍️ 自媒体第一篇 → 🎤 朗读 15min', type:'main' },
      ],
      result:'❌ 和朋友出去玩', rClass:'s-no' },
    { date:8,  wd:'周六', w:0, s:'warn', type:'full-rest', tags:['纯休'],
      slots:[
        { time:'', text:'彻底放松 🧘', type:'main' },
      ],
      result:'⚠️ 补了自媒体学习', rClass:'s-warn' },

    // Week 2: 启动 ⏸
    { date:9,  wd:'周日', w:1, s:'done', tags:['🆕NFC'],
      slots:[
        { time:'21:10-22:10', text:'原定：注册自媒体账号', type:'main' },
        { time:'22:10-22:40', text:'实际：NFC 好评立牌 MVP + 13项P0', type:'express' },
      ],
      result:'✅ NFC项目完成', rClass:'s-ok' },
    { date:10, wd:'周一', w:1, s:'done', tags:['AI','Agent'],
      slots:[
        { time:'21:10-22:10', text:'AI Agent：4天→1天速通', type:'main' },
        { time:'22:10-22:40', text:'掌厨：Agent 升级上线', type:'express' },
      ],
      result:'✅ Agent阶段全完成', rClass:'s-ok' },
    { date:11, wd:'周二', w:1, s:'done', tags:['🏋️健身','AI'],
      slots:[
        { time:'21:10-22:10', text:'Prompt工程系统化', type:'main' },
        { time:'22:10-22:40', text:'五要素+ Few-shot + CoT', type:'express' },
      ],
      result:'✅ 整理+网页+NFC+课程+健身·全完成', rClass:'s-ok' },
    { date:12, wd:'周三', w:1, s:'done', tags:['AI'],
      slots:[
        { time:'21:10-22:10', text:'Prompt工程系统化 ✅', type:'main' },
        { time:'', text:'Push 胸肩三头', type:'workout' },
      ],
      result:'✅ 10概念·Meta-Prompt·Push胸肩三头', rClass:'s-ok' },
    { date:13, wd:'周四', w:1, s:'done', tags:['AI'],
      slots:[
        { time:'21:10-22:10', text:'Prompt收尾 + RAG预习', type:'main' },
        { time:'', text:'Pull 背+二头', type:'workout' },
      ],
      result:'✅ 跨模型测试·反向集成·RAG预习', rClass:'s-ok' },
    { date:14, wd:'周五', w:1, s:'done', type:'half-rest', tags:['半休'],
      slots:[
        { time:'21:10-22:10', text:'RAG 入门', type:'main' },
        { time:'', text:'Legs 腿+核心', type:'workout' },
        { time:'22:10-22:40', text:'🎤 朗读 15min', type:'express' },
      ],
      result:'✅ RAG全完成·bge语义+混合检索·健身Legs', rClass:'s-ok' },
    { date:15, wd:'周六', w:1, s:'done', tags:['AI','RAG'],
      slots:[
        { time:'21:10-22:10', text:'混合检索(RRF) + 掌厨语义搜 + 同义词映射', type:'main' },
        { time:'', text:'Push 胸肩三头', type:'workout' },
      ],
      result:'✅ RAG混合检索+掌厨语义搜+同义词映射', rClass:'s-ok' },

    // Week 3: RAG+训练
    { date:16, wd:'周日', w:2, s:'done', tags:['RAG'],
      slots:[
        { time:'21:10-22:10', text:'Chunking + 课程体系同步 + 企业知识库', type:'main' },
        { time:'', text:'Pull 背+二头', type:'workout' },
      ],
      result:'✅ Chunking·kb-qa·bge·课程00-11全同步', rClass:'s-ok' },
    { date:17, wd:'周一', w:2, s:'done', tags:['Agent'],
      slots:[
        { time:'21:10-22:10', text:'八月计划大改造 + NFC企业知识库前端化', type:'main' },
        { time:'', text:'Legs 腿+核心', type:'workout' },
      ],
      result:'✅ 八月计划大改造上线·NFC知识库前端化·课程12号·Legs腿核心', rClass:'s-ok' },
    { date:18, wd:'周二', w:2, s:'done', tags:['Agent'],
      slots:[
        { time:'21:10-22:10', text:'ReAct 深入 + Plan-Execute 范式', type:'main' },
        { time:'', text:'Push 胸肩三头', type:'workout' },
      ],
      result:'✅ ReAct三练习+课程13号+PE预习·NFC上线', rClass:'s-ok' },
    { date:19, wd:'周三', w:2, s:'done', tags:['AI','Agent'],
      slots:[
        { time:'21:10-22:10', text:'Plan-Execute + Multi-Agent + CrewAI框架', type:'main' },
        { time:'', text:'Pull 背+二头+小臂 ✅', type:'workout' },
      ],
      result:'✅ 三范式+框架一天连学·沉淀14/15/16号课程·Pull背二头小臂', rClass:'s-ok' },
    { date:20, wd:'周四', w:2, s:'done', tags:['后端','FastAPI'],
      slots:[
        { time:'21:10-22:10', text:'FastAPI 后端：DeepSeek代理+流式SSE+藏key', type:'main' },
        { time:'22:10-22:40', text:'GitHub私有仓库push + 公网部署(Cloudflare Tunnel)', type:'express' },
        { time:'', text:'Legs 腿+核心（未练）', type:'workout' },
      ],
      result:'✅ 后端API服务化Day1·17号课程·公网穿透', rClass:'s-ok' },
    { date:21, wd:'周五', w:2, s:'', type:'half-rest', tags:['半休'],
      slots:[
        { time:'21:10-22:10', text:'综合练习', type:'main' },
        { time:'', text:'Push 胸肩三头', type:'workout' },
        { time:'22:10-22:40', text:'🎤 朗读 15min', type:'express' },
      ],
      result:'', rClass:'' },
    { date:22, wd:'周六', w:2, s:'', type:'full-rest', tags:['纯休'],
      slots:[
        { time:'', text:'彻底放松 🧘', type:'main' },
      ],
      result:'', rClass:'' },

    // 收尾周
    { date:23, wd:'周日', w:3, s:'', tags:['项目'],
      slots:[
        { time:'21:10-22:10', text:'项目打磨：掌厨/NFC/日历', type:'main' },
        { time:'', text:'Pull 背+二头', type:'workout' },
      ],
      result:'', rClass:'' },
    { date:24, wd:'周一', w:3, s:'', tags:['项目'],
      slots:[
        { time:'21:10-22:10', text:'项目打磨：作品整理', type:'main' },
        { time:'', text:'Legs 腿+核心', type:'workout' },
      ],
      result:'', rClass:'' },
    { date:25, wd:'周二', w:3, s:'', tags:['闲鱼'],
      slots:[
        { time:'21:10-22:10', text:'闲鱼维护 + 九月规划', type:'main' },
        { time:'', text:'Push 胸肩三头', type:'workout' },
      ],
      result:'', rClass:'' },
    { date:26, wd:'周三', w:3, s:'', tags:['总结'],
      slots:[
        { time:'21:10-22:10', text:'整理九月学习计划', type:'main' },
        { time:'', text:'Pull 背+二头（最后一练）', type:'workout' },
      ],
      result:'', rClass:'' },
    { date:27, wd:'周四', w:3, s:'milestone', tags:['🎉离职'],
      slots:[
        { time:'', text:'休息 · 给自己仪式感 · 回顾 20 天', type:'main' },
      ],
      result:'', rClass:'' },
  ],

  // ═══════════════ REST DAY DETAIL CARDS ═══════════════
  restDays: [
    { date:7,  wd:'周五', type:'half', emoji:'🟡', results:[
      '🏃 <b>健身</b>','✍️ <b>下午</b>：写自媒体第一篇完整内容','🎤 <b>傍晚</b>：去操场朗读 15 分钟','🌙 <b>晚上</b>：自由安排'
    ], outcome:'❌ 实际：和朋友出去玩，未执行', oc:'var(--red)' },
    { date:8,  wd:'周六', type:'full', emoji:'🟢', results:[
      '彻底放松，想干嘛干嘛','不碰任何任务'
    ], outcome:'⚠️ 实际：补了自媒体底层逻辑学习', oc:'var(--orange)' },
    { date:14, wd:'周五', type:'half', emoji:'🟡', results:[
      '🏋️ <b>Legs 腿+核心</b>：深蹲4×15→保加利亚蹲→臀桥→静蹲→平板→登山跑','🤖 <b>下午</b>：RAG 入门 — Embedding + 向量搜索','🎤 <b>傍晚</b>：朗读 15 分钟','🌙 <b>晚上</b>：自由安排'
    ], outcome:'✅ 实际：RAG + 健身全完成', oc:'var(--green)' },
    { date:15, wd:'周六', type:'full', emoji:'🟢', results:[
      '彻底放松 🧘'
    ], outcome:'✅ 实际：超额做 RAG 混合检索 + 掌厨语义搜 + 同义词映射', oc:'var(--green)' },
    { date:21, wd:'周五', type:'half', emoji:'🟡', results:[
      '🏃 <b>健身</b>','📊 <b>下午</b>：整体复盘 + 规划九月学习计划','🎤 <b>傍晚</b>：朗读 15 分钟','🌙 <b>晚上</b>：自由安排'
    ], outcome:'', oc:'' },
    { date:22, wd:'周六', type:'full', emoji:'🟢', results:[
      '彻底放松 🧘'
    ], outcome:'', oc:'' },
  ],

  // ═══════════════ MILESTONE CARDS ═══════════════
  milestones: [
    { emoji:'✅', dt:'8/10 一', tags:'', cls:'rest',
      lines:['🤖 <b>AI Agent 阶段全部完成</b>','4天课程一天速通，掌厨Agent上线','<span style="color:var(--green)">✅ 超前完成</span>'] },
    { emoji:'🏋️', dt:'8/12 起', tags:'', cls:'',
      lines:['<b>居家训练 Push/Pull/Legs</b>','每天45min · 臂力棒+拉力器+自重','食堂增肌餐：3蛋+2荤+4饭+加餐','<span style="color:var(--green)">→ 8/27 离职日</span>'] },
    { emoji:'🎉', dt:'8/27 四', tags:'', cls:'milestone',
      lines:['<b>离职日</b>','不安排任务','给自己仪式感','回顾这 20 天的成果'] },
    { emoji:'🆕', dt:'8/9 日', tags:'', cls:'nfc',
      lines:['<b>NFC 好评立牌 MVP 完成</b>','顾客端 + 演示页 + 商家向导','13 项 P0 优化全部完成','<span style="color:var(--green)">✅ 可地推</span>'] },
  ],

  // ═══════════════ 可选模块（有才显示，没有就整块隐藏）═══════════════
  modules: {
    diet: {
      title: '每日饮食清单',
      note: '外胚型增肌 · 不吃完 = 白练',
      items: [
        { emoji:'🥚', label:'早餐', text:'3蛋+2包子+豆浆' },
        { emoji:'🍗', label:'午餐', text:'1荤+1素+2两饭' },
        { emoji:'🥩', label:'晚餐', text:'1荤+1素+2两饭' },
        { emoji:'🍌', label:'加餐', text:'香蕉+坚果+面包花生酱+牛奶' },
        { emoji:'💧', label:'3L水', text:'' },
      ],
      footnote: '荤菜优先：<b>鸡腿·红烧肉·排骨·炸鸡排</b>｜避开：凉拌黄瓜·水煮白菜｜<a href="训练计划.md" style="color:var(--accent);">📋 完整方案</a>',
    },
    dailyTemplate: {
      title: '每日时间模板（工作日）',
      slots: [
        { time:'21:10 - 22:10', label:'主线任务', note:'🏋️ 同时练拉力器', type:'main' },
        { time:'22:10 - 22:40', label:'表达练习', note:'🤫 无声模式', type:'express' },
        { time:'22:40 - 23:00', label:'阅读 / 小结', note:'📖 Never Split the Difference', type:'read' },
      ],
    },
    checklist: {
      title: '20 天后你手里应该有的东西',
      items: [
        { text:'闲鱼店铺：三个 AI 服务已上架，标题+描述+图片到位', done:true },
        { text:'自媒体账号：开学后启动，过渡期只了解底层逻辑', done:false },
        { text:'AI Agent：4天课程一天完成，掌厨Agent已上线', done:true },
        { text:'AI 学习：Agent→Prompt→RAG→Agent进阶→后端API 全部完成', done:true },
        { text:'九月计划：一份开学后的详细学习路线图', done:false },
      ],
    },
    footer: {
      lines: [
        '💡 累了、加班了、状态不好 → <b>做 30 分钟就收工</b>，比不做强一百倍。',
        '别让完美主义杀死行动力。',
        '<span style="color:var(--green);">✅ Prompt 工程完成 · RAG 已完成 · Agent 进阶完成（ReAct→Plan-Execute→Multi-Agent→CrewAI） · 后端 API 服务化（FastAPI+公网部署） · 居家训练已启动</span>',
        '<a href="训练计划.md" style="color:var(--accent);">📋 完整训练计划（食堂饮食 + 45min 动作表）</a>',
      ],
    },
  },
};
