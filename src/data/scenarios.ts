import type { Scenario } from '../types'

export const scenarios: Scenario[] = [
  {
    id: 'S001',
    title: '明天截止但完全开不了工（拖延）',
    scenarioId: 'S001_procrastination_deadline_tomorrow',
    topic: 'procrastination',
    description: '任务明天截止却迟迟无法开始，伴随自我怀疑与想逃避的冲动。',
    script: [
      { cardId: 'U1', text: '我明天截止，但完全开始不了。' },
      { cardId: 'U2', text: '我知道该做什么，但就是动不了。' },
      { cardId: 'U3', text: '我觉得自己真的很废。' },
      { cardId: 'U4', text: '要不我干脆放弃算了。' },
      { cardId: 'U5', text: '有没有办法随便交点东西混过去？' },
      { cardId: 'U6', text: '那我现在第一步到底该做什么？' }
    ]
  },
  {
    id: 'S002',
    title: '工作压力过载',
    scenarioId: 'S002_work_overload',
    topic: 'work_stress',
    description: '工作堆积导致焦虑、睡眠受影响，想逃避但又不知先做什么。',
    script: [
      { cardId: 'U1', text: '最近工作堆太多，我每天都很焦虑。' },
      { cardId: 'U2', text: '其实别人都能做到，可能是我不够好。' },
      { cardId: 'U3', text: '我晚上都睡不好。' },
      { cardId: 'U4', text: '我想直接请假逃掉算了。' },
      { cardId: 'U5', text: '如果我摆烂会不会更轻松？' },
      { cardId: 'U6', text: '你觉得我现在该先解决哪一件？' }
    ]
  },
  {
    id: 'S003',
    title: '人际冲突（朋友生气）',
    scenarioId: 'S003_friend_conflict',
    topic: 'relationship',
    description: '朋友觉得不被支持导致冷战，需要探索沟通的下一步。',
    script: [
      { cardId: 'U1', text: '我朋友说我从来不站在他那边。' },
      { cardId: 'U2', text: '但我觉得我没做错。' },
      { cardId: 'U3', text: '现在我们几乎不说话了。' },
      { cardId: 'U4', text: '要不要干脆不联系了？' },
      { cardId: 'U5', text: '为什么总是我要先道歉？' },
      { cardId: 'U6', text: '我下一句话该怎么说？' }
    ]
  },
  {
    id: 'S004',
    title: '失败与自责',
    scenarioId: 'S004_failure_self_blame',
    topic: 'self_doubt',
    description: '重要任务失败后的自我怀疑与重启困难。',
    script: [
      { cardId: 'U1', text: '我把一件很重要的事情搞砸了。' },
      { cardId: 'U2', text: '大家可能都觉得我很不靠谱。' },
      { cardId: 'U3', text: '我现在一直在反复想这件事。' },
      { cardId: 'U4', text: '我甚至不想再尝试类似的事。' },
      { cardId: 'U5', text: '也许我根本不适合做这个。' },
      { cardId: 'U6', text: '我应该怎么重新开始？' }
    ]
  },
  {
    id: 'S005',
    title: '选择困难',
    scenarioId: 'S005_decision_paralysis',
    topic: 'decision',
    description: '在两个机会间难以抉择，担心后悔与不作为。',
    script: [
      { cardId: 'U1', text: '我在两个机会之间选不出来。' },
      { cardId: 'U2', text: '两个都有风险。' },
      { cardId: 'U3', text: '我很怕选错以后后悔。' },
      { cardId: 'U4', text: '要不干脆什么都不选？' },
      { cardId: 'U5', text: '有没有绝对正确的选择？' },
      { cardId: 'U6', text: '你会建议我先考虑什么？' }
    ]
  },
  {
    id: 'S006',
    title: '自我价值怀疑',
    scenarioId: 'S006_self_worth',
    topic: 'self_value',
    description: '对自我价值与能力的持续怀疑，寻找改变的起点。',
    script: [
      { cardId: 'U1', text: '最近总觉得自己没什么价值。' },
      { cardId: 'U2', text: '别人好像都比我厉害。' },
      { cardId: 'U3', text: '我不知道自己擅长什么。' },
      { cardId: 'U4', text: '有时候觉得努力也没意义。' },
      { cardId: 'U5', text: '会不会其实我真的很普通？' },
      { cardId: 'U6', text: '我该从哪里改变？' }
    ]
  },
  {
    id: 'S007',
    title: '动机缺失（空虚）',
    scenarioId: 'S007_motivation_loss',
    topic: 'motivation',
    description: '对生活提不起兴趣，质疑生活意义，需要小改变。',
    script: [
      { cardId: 'U1', text: '最近对什么都提不起兴趣。' },
      { cardId: 'U2', text: '连以前喜欢的东西都没感觉。' },
      { cardId: 'U3', text: '每天只是机械地过。' },
      { cardId: 'U4', text: '我开始怀疑生活意义。' },
      { cardId: 'U5', text: '是不是大家其实都这样？' },
      { cardId: 'U6', text: '我现在可以做什么小改变？' }
    ]
  },
  {
    id: 'S008',
    title: '时间管理崩溃',
    scenarioId: 'S008_time_management',
    topic: 'productivity',
    description: '忙碌却没有产出，陷入拖延与计划执行差距。',
    script: [
      { cardId: 'U1', text: '我每天都很忙，但什么都没完成。' },
      { cardId: 'U2', text: '我列了计划但完全执行不了。' },
      { cardId: 'U3', text: '一拖延就更焦虑。' },
      { cardId: 'U4', text: '我开始逃避看待办清单。' },
      { cardId: 'U5', text: '有没有不用计划的方法？' },
      { cardId: 'U6', text: '今天我该先做哪一步？' }
    ]
  },
  {
    id: 'S009',
    title: '社交焦虑',
    scenarioId: 'S009_social_anxiety',
    topic: 'social_anxiety',
    description: '害怕与陌生人交流，倾向退缩但想练习。',
    script: [
      { cardId: 'U1', text: '我很害怕和陌生人交流。' },
      { cardId: 'U2', text: '每次说话前都想很多。' },
      { cardId: 'U3', text: '说完又会反复后悔。' },
      { cardId: 'U4', text: '所以我越来越不想社交。' },
      { cardId: 'U5', text: '也许独处比较安全？' },
      { cardId: 'U6', text: '我可以先练习什么？' }
    ]
  },
  {
    id: 'S010',
    title: '意义与方向迷茫',
    scenarioId: 'S010_meaning_direction',
    topic: 'life_direction',
    description: '对未来方向迷茫，害怕浪费时间，寻找现实起点。',
    script: [
      { cardId: 'U1', text: '我不知道未来该往哪里走。' },
      { cardId: 'U2', text: '好像每条路都不确定。' },
      { cardId: 'U3', text: '我很怕浪费时间。' },
      { cardId: 'U4', text: '有时羡慕目标明确的人。' },
      { cardId: 'U5', text: '人生真的需要明确方向吗？' },
      { cardId: 'U6', text: '现在最现实的一步是什么？' }
    ]
  }
]
