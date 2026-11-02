const STORAGE_KEY_PREFIX = 'clarity_monthplan_v1_';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_HEADERS = [
  { name: 'Monday', icon: '🍏' },
  { name: 'Tuesday', icon: '🍎' },
  { name: 'Wednesday', icon: '🍐' },
  { name: 'Thursday', icon: '🍊' },
  { name: 'Friday', icon: '🍋' },
  { name: 'Saturday', icon: '🍉' },
  { name: 'Sunday', icon: '🍇' }
];

const REFLECTION_PROMPTS_MONTH = [
  'Điều gì tôi đã làm tốt và muốn tiếp tục phát huy?',
  'Bài học quan trọng nhất tôi rút ra được là gì?',
  'Tôi biết ơn về việc ...',
  'Ba mục tiêu tôi cần tập trung trong tháng tiếp theo là?'
];

const REFLECTION_PROMPTS_WEEK = [
  'Điều gì tôi đã làm tốt và muốn tiếp tục phát huy?',
  'Bài học quan trọng nhất tôi rút ra được là gì?',
  'Tôi biết ơn về việc ...',
  'Ba mục tiêu tôi cần tập trung trong tuần tiếp theo là?'
];

let state = {
  month: 11,
  year: 2026,
  currentWeek: 1,
  weekFilter: 'all', // 'all' or 1..5
  data: null
};

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function createEmptyTasks(count = 10) {
  return Array.from({ length: count }, () => ({ text: '', done: false }));
}

function createDefaultMonthData(month, year, withSample = true) {
  const daysCount = getDaysInMonth(month, year);

  const sampleMonthGoals = [
    { text: 'Hoàn thành 4 video youtube', done: true },
    { text: 'Hoàn thành 21 video ngắn', done: true },
    { text: 'Học xong khóa luyện phát âm TA', done: true },
    { text: 'Đọc 4 cuốn sách', done: true },
    { text: 'Tiết kiệm được 20 triệu', done: true },
    { text: 'Hoàn thành báo cáo công việc', done: true },
    { text: 'Thói quen viết đạt 100%', done: true },
    { text: 'Thói quen dậy sớm đạt 100%', done: true },
    { text: 'Gọi điện về nhà 4 lần', done: false },
    { text: 'Đi xem phim 1 lần', done: true }
  ];

  const sampleHabits = [
    { name: 'Dậy lúc 5H sáng', rate: 0.95 },
    { name: '1H đọc sách', rate: 0.95 },
    { name: 'Viết 1000 chữ', rate: 0.92 },
    { name: 'Workout', rate: 0.85 },
    { name: 'Thiền 1H', rate: 0.95 },
    { name: 'Viết nhật ký', rate: 0.95 },
    { name: 'Học Tiếng Anh', rate: 0.77 },
    { name: 'Học Tiếng Trung', rate: 0.45 },
    { name: 'Chạy bộ', rate: 0.74 },
    { name: 'Uống đủ nước', rate: 0.80 }
  ];

  const habits = sampleHabits.map((h, hIdx) => {
    const checks = Array.from({ length: 31 }, (_, dIdx) => {
      if (!withSample) return false;
      if (dIdx >= daysCount) return false;
      // Deterministic pattern that looks natural like the screenshot
      const seed = (hIdx * 7 + dIdx * 13 + 5) % 20;
      return (seed / 20) < h.rate;
    });
    return {
      name: withSample ? h.name : '',
      checks
    };
  });

  const weeks = Array.from({ length: 5 }, (_, wIdx) => {
    const wGoals = createEmptyTasks(10);
    if (withSample && wIdx === 0) {
      wGoals[0] = { text: 'Hoàn thành kịch bản & quay video 1', done: true };
      wGoals[1] = { text: 'Đọc xong cuốn Atomic Habits', done: true };
      wGoals[2] = { text: 'Hoàn thành 5 buổi tập Workout', done: true };
      wGoals[3] = { text: 'Dọn dẹp lại góc làm việc tối giản', done: false };
    } else if (withSample && wIdx === 1) {
      wGoals[0] = { text: 'Quay & dựng 5 video ngắn', done: true };
      wGoals[1] = { text: 'Hoàn thành 50% khóa phát âm TA', done: true };
      wGoals[2] = { text: 'Gọi điện hỏi thăm bố mẹ', done: false };
      wGoals[3] = { text: 'Tổng kết chi tiêu nửa đầu tháng', done: false };
    }

    const days = Array.from({ length: 7 }, (__, dIdx) => {
      const tasks = createEmptyTasks(10);
      if (withSample && wIdx === 0) {
        if (dIdx === 0) {
          tasks[0] = { text: 'Lên dàn ý chi tiết video tuần 1', done: true };
          tasks[1] = { text: 'Học 2 bài phát âm Tiếng Anh', done: true };
          tasks[2] = { text: 'Đọc 30 trang sách buổi sáng', done: true };
          tasks[3] = { text: 'Trả lời email đối tác', done: true };
        } else if (dIdx === 1) {
          tasks[0] = { text: 'Quay nháp phân cảnh chính', done: true };
          tasks[1] = { text: 'Tập gym 45 phút', done: true };
          tasks[2] = { text: 'Viết 1000 chữ cho blog', done: true };
          tasks[3] = { text: 'Mua đồ ăn healthy cho 3 ngày', done: false };
        } else if (dIdx === 2) {
          tasks[0] = { text: 'Dựng video chính trên CapCut/Premiere', done: true };
          tasks[1] = { text: 'Ôn tập từ vựng Tiếng Trung', done: false };
          tasks[2] = { text: 'Đọc 30 trang sách', done: true };
          tasks[3] = { text: 'Dọn bàn làm việc', done: false };
        } else if (dIdx === 3) {
          tasks[0] = { text: 'Xuất bản video & tối ưu thumbnail', done: true };
          tasks[1] = { text: 'Chạy bộ 5km công viên', done: true };
          tasks[2] = { text: 'Hoàn thành báo cáo tiến độ', done: true };
          tasks[3] = { text: 'Ghi chép sổ chi tiêu', done: true };
        } else if (dIdx === 4) {
          tasks[0] = { text: 'Quay 3 video ngắn (Reels/TikTok)', done: true };
          tasks[1] = { text: 'Luyện nghe Tiếng Anh 45 phút', done: true };
          tasks[2] = { text: 'Viết 1000 chữ', done: true };
          tasks[3] = { text: 'Sắp xếp lịch cuối tuần', done: true };
        } else if (dIdx === 5) {
          tasks[0] = { text: 'Đọc sách 1 tiếng buổi sáng', done: true };
          tasks[1] = { text: 'Tập trung xử lý việc tồn đọng', done: true };
          tasks[2] = { text: 'Đi cà phê đọc sách / thư giãn', done: true };
          tasks[3] = { text: 'Mua sắm đồ dùng cần thiết', done: false };
        } else if (dIdx === 6) {
          tasks[0] = { text: 'Lập kế hoạch chi tiết cho Tuần 2', done: true };
          tasks[1] = { text: 'Gọi điện về cho gia đình', done: false };
          tasks[2] = { text: 'Chuẩn bị đồ ăn cho tuần mới', done: false };
          tasks[3] = { text: 'Viết Reflection cuối tuần', done: false };
        }
      }
      return {
        tasks,
        note: withSample && wIdx === 0 && dIdx === 0
          ? 'Buổi sáng năng lượng rất tốt, cần duy trì ngủ trước 23h!'
          : ''
      };
    });

    return {
      goals: wGoals,
      reflection: withSample && wIdx === 0
        ? [
            'Hoàn thành đúng hạn các task ưu tiên (Priority) mỗi sáng.',
            'Làm việc quan trọng nhất ngay sau khi thức dậy giúp hiệu suất tăng gấp đôi.',
            'Cơ thể khỏe mạnh và tinh thần kỷ luật mỗi ngày.',
            'Tăng tốc độ dựng video, duy trì chuỗi habit 100%, ngủ đúng giờ.'
          ]
        : ['', '', '', ''],
      days
    };
  });

  return {
    monthlyGoals: withSample ? sampleMonthGoals : createEmptyTasks(10),
    monthlyReflection: withSample
      ? [
          'Duy trì thói quen dậy sớm và tập thể dục đều đặn, hoàn thành công việc quan trọng đúng deadline, đọc sách mỗi tuần và ghi chú lại, quản lý chi tiêu khá chặt chẽ.',
          'Việc lên kế hoạch chi tiết ngay từ đầu tháng giúp giảm căng thẳng, năng lượng buổi sáng quyết định hiệu quả cả ngày, ưu tiên ít việc nhưng quan trọng hơn là làm nhiều việc vụn vặt.',
          'Có sức khỏe tốt để làm việc và học tập, gia đình luôn động viên và hỗ trợ, có bạn bè chia sẻ kết nối trong công việc, có cơ hội được học hỏi và phát triển bản thân.',
          'Hoàn thành khóa học online đang dang dở, tiết kiệm thêm 15 triệu đồng, duy trì lịch tập thể dục tối thiểu 12 buổi trong tháng.'
        ]
      : ['', '', '', ''],
    habits,
    weeks
  };
}

function loadMonthData(month, year) {
  const key = `${STORAGE_KEY_PREFIX}${year}_${month}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse saved data:', e);
    }
  }
  const initial = createDefaultMonthData(month, year, true);
  saveMonthData(month, year, initial);
  return initial;
}

function saveMonthData(month, year, data = state.data) {
  const key = `${STORAGE_KEY_PREFIX}${year}_${month}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/* ==========================================
   STATISTICS & PROGRESS CALCULATIONS
   ========================================== */
function calcTaskListStats(taskList) {
  const active = taskList.filter(t => t.text.trim() !== '' || t.done);
  const total = active.length;
  const completed = active.filter(t => t.done).length;
  const inProgress = Math.max(0, total - completed);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, inProgress, total, pct };
}

function calcWeekProductivityPct(weekObj) {
  // Combines weekly goals + all daily tasks in that week if any exist
  const goalStats = calcTaskListStats(weekObj.goals);
  let dayCompleted = 0;
  let dayTotal = 0;
  weekObj.days.forEach(d => {
    const st = calcTaskListStats(d.tasks);
    dayCompleted += st.completed;
    dayTotal += st.total;
  });

  if (goalStats.total + dayTotal === 0) return 0;
  if (goalStats.total > 0 && dayTotal === 0) return goalStats.pct;
  return Math.round(((goalStats.completed + dayCompleted) / (goalStats.total + dayTotal)) * 100);
}

function getDateForWeekDay(month, year, weekIdx, dayIdx) {
  // Finds the calendar date for a given week (0..4) and day of week (0=Monday..6=Sunday)
  const firstDay = new Date(year, month - 1, 1);
  // Convert JS Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const firstDayMonIdx = (firstDay.getDay() + 6) % 7;
  const dayOfMonth = weekIdx * 7 + dayIdx - firstDayMonIdx + 1;
  const maxDays = getDaysInMonth(month, year);
  if (dayOfMonth < 1 || dayOfMonth > maxDays) {
    return null;
  }
  return {
    day: dayOfMonth,
    formatted: `${dayOfMonth}/${month}/${String(year).slice(-2)}`
  };
}

function getHabitPctColor(pct) {
  if (pct >= 80) return '#9ec3b0'; // soft sage/mint green like screenshot
  if (pct >= 60) return '#d6e3d8';
  if (pct > 0) return '#f4cbd2';   // soft rose pink for low % like 42% in screenshot
  return '#ead8c8';
}

/* ==========================================
   SVG MASCOTS (DUCK & CAPYBARA)
   ========================================== */
function getSlidingDuckSVG() {
  return `
    <svg width="36" height="34" viewBox="0 0 64 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="#FFE055" stroke="#3B322C" stroke-width="3.5"/>
      <circle cx="23" cy="28" r="3" fill="#3B322C"/>
      <circle cx="41" cy="28" r="3" fill="#3B322C"/>
      <ellipse cx="17" cy="33" rx="3.5" ry="2" fill="#FF9E9E"/>
      <ellipse cx="47" cy="33" rx="3.5" ry="2" fill="#FF9E9E"/>
      <path d="M27 32C27 30 37 30 37 32C37 35 27 35 27 32Z" fill="#FF9F43" stroke="#3B322C" stroke-width="2"/>
      <path d="M29 13C31 8 36 10 34 14" stroke="#3B322C" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
}

function getCapybaraSVG() {
  return `
    <svg width="68" height="76" viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Apple on head -->
      <circle cx="45" cy="17" r="9" fill="#E34C43" stroke="#2D2520" stroke-width="2.5"/>
      <path d="M45 8C46 4 50 3 52 5" stroke="#4E7C3E" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Ears -->
      <ellipse cx="25" cy="30" rx="6" ry="5" fill="#8C6747" stroke="#2D2520" stroke-width="2.5"/>
      <ellipse cx="65" cy="30" rx="6" ry="5" fill="#8C6747" stroke="#2D2520" stroke-width="2.5"/>
      <!-- Body/Head -->
      <path d="M16 95C16 55 20 26 45 26C70 26 74 55 74 95" fill="#B58B67" stroke="#2D2520" stroke-width="3"/>
      <!-- Snout patch -->
      <ellipse cx="45" cy="48" rx="13" ry="11" fill="#8C6747"/>
      <!-- Eyes -->
      <path d="M26 43H33" stroke="#2D2520" stroke-width="3" stroke-linecap="round"/>
      <path d="M57 43H64" stroke="#2D2520" stroke-width="3" stroke-linecap="round"/>
      <!-- Nose/Mouth -->
      <path d="M42 44H48M45 44V52M40 53C43 55 47 55 50 53" stroke="#2D2520" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Paws together -->
      <path d="M35 76C38 70 43 70 45 76C47 70 52 70 55 76" stroke="#2D2520" stroke-width="2.8" stroke-linecap="round"/>
    </svg>
  `;
}

/* ==========================================
   FULL DOM RENDERING
   ========================================== */
function renderApp() {
  const root = document.getElementById('app-root');
  const daysInMonth = getDaysInMonth(state.month, state.year);
  const monthName = MONTH_NAMES[state.month - 1];

  root.innerHTML = `
    <!-- TOP TOOLBAR -->
    <div class="app-toolbar">
      <div class="toolbar-brand">
        <span>🐥 Clarity Monthplan</span>
        <span class="badge">X3 Năng Suất & Kỷ Luật</span>
      </div>

      <div class="week-filter-group">
        <button class="btn-week-tab ${state.weekFilter === 'all' ? 'active' : ''}" data-weekfilter="all">Xem cả tháng</button>
        ${[1, 2, 3, 4, 5].map(w => `
          <button class="btn-week-tab ${state.weekFilter === w ? 'active' : ''}" data-weekfilter="${w}">Week ${w}</button>
        `).join('')}
      </div>

      <div class="toolbar-actions">
        <button class="btn-tool" id="btn-load-sample" title="Nạp dữ liệu mẫu giống bản gốc">✨ Dữ liệu mẫu</button>
        <button class="btn-tool" id="btn-export-json" title="Tải file lưu trữ về máy">💾 Xuất file</button>
        <button class="btn-tool" id="btn-import-json" title="Khôi phục từ file đã lưu">📂 Nhập file</button>
        <input type="file" id="file-import-input" accept=".json" style="display:none" />
        <button class="btn-tool danger" id="btn-clear-month" title="Xóa trắng tháng hiện tại để lập kế hoạch mới">🗑️ Làm trống tháng</button>
      </div>
    </div>

    <!-- MAIN SPREADSHEET BOARD -->
    <div class="planner-sheet">

      <!-- 1. TOP BANNER: MONTH PLANNER + WEEKLY BAR CHART + COZY SCENE -->
      <section class="top-banner-grid">
        <div class="planner-title-box">
          <h1 class="planner-main-heading" id="planner-month-title">${monthName} Planner</h1>
          <div class="planner-meta-wrap">
            <div style="font-size:34px; user-select:none;">🐥</div>
            <table class="meta-table">
              <tr>
                <td>Month</td>
                <td>
                  <select class="meta-select" id="select-month">
                    ${MONTH_NAMES.map((m, idx) => `
                      <option value="${idx + 1}" ${state.month === idx + 1 ? 'selected' : ''}>${idx + 1}</option>
                    `).join('')}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Year</td>
                <td>
                  <select class="meta-select" id="select-year">
                    ${[2025, 2026, 2027, 2028].map(y => `
                      <option value="${y}" ${state.year === y ? 'selected' : ''}>${y}</option>
                    `).join('')}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Current Week</td>
                <td>
                  <select class="meta-select" id="select-current-week">
                    ${[1, 2, 3, 4, 5].map(w => `
                      <option value="${w}" ${state.currentWeek === w ? 'selected' : ''}>Week ${w}</option>
                    `).join('')}
                  </select>
                </td>
              </tr>
            </table>
            <div style="font-size:34px; user-select:none;" title="Go Go!">🐣</div>
          </div>
        </div>

        <!-- Weekly Productivity Overview Chart -->
        <div class="weekly-overview-chart-box">
          <div class="v-chart-container">
            <div class="v-chart-yaxis">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div class="v-chart-bars" id="top-weekly-bars">
              ${[1, 2, 3, 4, 5].map(w => `
                <div class="v-bar-col">
                  <div class="v-bar-fill" id="top-wbar-fill-${w - 1}" style="height: 0%">
                    <span class="v-bar-pct" id="top-wbar-pct-${w - 1}">0%</span>
                  </div>
                  <span class="v-bar-label">Week ${w}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="v-chart-spacer"></div>
        </div>

        <!-- Cozy Art & Duck Parade -->
        <div class="cozy-art-box">
          <div class="cozy-scene">
            <div style="text-align:center;">
              <div style="font-size:38px; line-height:1;">🌳🏡🌿</div>
              <div style="font-size:11px; font-weight:700; color:#365327; margin-top:4px;">Tập trung 3–5 mục tiêu trọng tâm</div>
            </div>
            <div style="text-align:center; background:rgba(255,255,255,0.65); padding:8px 12px; border-radius:8px; border:1px solid #8ab072;">
              <div style="font-size:20px;">🪟☁️🍵</div>
              <div style="font-size:10.5px; font-weight:700; color:#3d4e34;" id="cozy-quote-box">Kỷ luật tạo nên tự do</div>
            </div>
          </div>
          <div class="duck-parade">
            ${Array.from({ length: 9 }, (_, i) => `
              <span class="duck-icon" title="Cố lên nhé!">${i % 2 === 0 ? '🐤' : '🐥'}</span>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 2. MONTHLY GOALS & REFLECTION -->
      <section class="monthly-goals-section">
        <!-- Left summary -->
        <div class="goal-summary-panel">
          <div class="duck-progress-track">
            <div class="duck-progress-bar" id="month-goal-prog-bar" style="width: 0%"></div>
            <div class="duck-progress-mascot" id="month-goal-duck" style="left: 10%">
              ${getSlidingDuckSVG()}
            </div>
            <span class="duck-progress-pct" id="month-goal-prog-pct">0%</span>
          </div>

          <div class="goal-panel-title">${monthName} Goals</div>

          <table class="stat-mini-table">
            <thead>
              <tr>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td id="month-stat-completed">0</td>
                <td id="month-stat-inprogress">0</td>
                <td id="month-stat-total">0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Donut Chart -->
        <div class="donut-panel">
          <div class="donut-ring" id="month-donut-ring">
            <div class="donut-hole" id="month-donut-text">0%</div>
          </div>
        </div>

        <!-- Tiered Priority / Regular Checklist -->
        <div class="tiered-checklist-box">
          <table class="tiered-table">
            <tbody>
              ${state.data.monthlyGoals.map((g, idx) => `
                <tr class="task-row">
                  ${idx === 0 ? `<td class="tier-badge-cell priority" rowspan="3">Priority</td>` : ''}
                  ${idx === 3 ? `<td class="tier-badge-cell regular" rowspan="7">Regular</td>` : ''}
                  <td class="task-check-cell">
                    <input type="checkbox" class="custom-chk" data-type="month-goal-chk" data-idx="${idx}" ${g.done ? 'checked' : ''} />
                  </td>
                  <td>
                    <input
                      type="text"
                      class="task-input ${g.done ? 'completed' : ''}"
                      data-type="month-goal-txt"
                      data-idx="${idx}"
                      placeholder="${idx < 3 ? `Mục tiêu ưu tiên ${idx + 1}...` : `Mục tiêu thường ${idx - 2}...`}"
                      value="${escapeHtml(g.text)}"
                    />
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Monthly Reflection -->
        <div class="reflection-panel">
          <div class="reflection-header">Reflection</div>
          <table class="reflection-table">
            <tbody>
              ${REFLECTION_PROMPTS_MONTH.map((prompt, idx) => `
                <tr>
                  <td class="reflection-prompt">${prompt}</td>
                  <td>
                    <textarea
                      class="reflection-textarea"
                      data-type="month-reflection"
                      data-idx="${idx}"
                      placeholder="Viết suy ngẫm của bạn..."
                    >${escapeHtml(state.data.monthlyReflection[idx] || '')}</textarea>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 3. HABIT TRACKER (CAPYBARA + 31 DAYS + HORIZONTAL BAR CHART) -->
      <section class="habit-section">
        <!-- Left column: Capybara + Habit names + % -->
        <div class="habit-left-col">
          <div class="habit-mascot-header">
            <div style="display:flex; align-items:center; gap:10px;">
              ${getCapybaraSVG()}
              <span class="habit-title-text">Habit</span>
            </div>
            <span class="habit-pct-col-label">%</span>
          </div>

          <table class="habit-name-table">
            <tbody>
              ${state.data.habits.map((h, hIdx) => `
                <tr>
                  <td>
                    <input
                      type="text"
                      class="habit-name-input"
                      data-type="habit-name"
                      data-hidx="${hIdx}"
                      placeholder="Thói quen ${hIdx + 1}..."
                      value="${escapeHtml(h.name)}"
                    />
                  </td>
                  <td class="habit-row-pct" id="habit-row-pct-${hIdx}">0%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Center column: 1..31 Days Matrix with top vertical bars -->
        <div class="habit-center-col">
          <table class="habit-matrix-table">
            <thead>
              <tr class="habit-day-bars-row">
                ${Array.from({ length: daysInMonth }, (_, dIdx) => `
                  <td>
                    <div class="day-mini-bar-wrap">
                      <div class="day-mini-bar" id="habit-day-bar-${dIdx}" style="height: 0%"></div>
                    </div>
                    <span class="day-mini-pct" id="habit-day-pct-${dIdx}">0%</span>
                  </td>
                `).join('')}
              </tr>
              <tr class="habit-day-num-row">
                ${Array.from({ length: daysInMonth }, (_, dIdx) => `
                  <th class="${isTodayDate(dIdx + 1, state.month, state.year) ? 'today-col' : ''}">${dIdx + 1}</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${state.data.habits.map((h, hIdx) => `
                <tr class="habit-matrix-row">
                  ${Array.from({ length: daysInMonth }, (_, dIdx) => `
                    <td>
                      <input
                        type="checkbox"
                        class="habit-chk"
                        data-type="habit-chk"
                        data-hidx="${hIdx}"
                        data-didx="${dIdx}"
                        ${h.checks[dIdx] ? 'checked' : ''}
                      />
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Right column: Horizontal Habit Bar Chart -->
        <div class="habit-right-col">
          <div class="habit-hchart-box">
            ${state.data.habits.map((h, hIdx) => `
              <div class="h-bar-row">
                <span class="h-bar-label" id="hbar-label-${hIdx}">${escapeHtml(h.name || `Habit ${hIdx + 1}`)}</span>
                <div class="h-bar-track">
                  <div class="h-bar-fill" id="hbar-fill-${hIdx}" style="width: 0%"></div>
                </div>
                <span class="h-bar-val" id="hbar-val-${hIdx}">0%</span>
              </div>
            `).join('')}
            <div class="h-axis-labels">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. WEEK GOALS & DAILY TASKS -->
      <div class="week-section-banner">
        🌻 Week Goals & Tasks 🌻
      </div>

      <div id="weeks-container">
        ${state.data.weeks.map((weekObj, wIdx) => {
          if (state.weekFilter !== 'all' && state.weekFilter !== wIdx + 1) {
            return '';
          }
          return renderWeekBlock(weekObj, wIdx);
        }).join('')}
      </div>

    </div>
  `;

  attachEvents();
  updateAllStatsUI();
}

function renderWeekBlock(weekObj, wIdx) {
  return `
    <section class="week-block" id="week-block-${wIdx}">
      <!-- Week Summary + Donut + Weekly Priority/Regular Goals + Weekly Reflection -->
      <div class="week-goals-row">
        <div class="week-summary-panel">
          <div class="week-progress-track">
            <div class="week-progress-bar" id="week-prog-bar-${wIdx}" style="width: 0%"></div>
            <div class="duck-progress-mascot" id="week-prog-duck-${wIdx}" style="left: 10%">
              ${getSlidingDuckSVG()}
            </div>
            <span class="duck-progress-pct" id="week-prog-pct-${wIdx}">0%</span>
          </div>

          <div class="week-panel-title">Week ${wIdx + 1}</div>

          <table class="stat-mini-table">
            <thead>
              <tr>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td id="week-stat-completed-${wIdx}">0</td>
                <td id="week-stat-inprogress-${wIdx}">0</td>
                <td id="week-stat-total-${wIdx}">0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Week Donut -->
        <div class="donut-panel" style="border-right: 1px solid #ead6c0;">
          <div class="donut-ring" id="week-donut-ring-${wIdx}">
            <div class="week-donut-hole" id="week-donut-text-${wIdx}">0%</div>
          </div>
        </div>

        <!-- Week Goals Checklist -->
        <div class="tiered-checklist-box" style="border-right: 1px solid #ead6c0;">
          <table class="tiered-table">
            <tbody>
              ${weekObj.goals.map((g, gIdx) => `
                <tr class="task-row">
                  ${gIdx === 0 ? `<td class="tier-badge-cell priority" rowspan="3">Priority</td>` : ''}
                  ${gIdx === 3 ? `<td class="tier-badge-cell regular" rowspan="7">Regular</td>` : ''}
                  <td class="task-check-cell">
                    <input
                      type="checkbox"
                      class="custom-chk"
                      data-type="week-goal-chk"
                      data-widx="${wIdx}"
                      data-gidx="${gIdx}"
                      ${g.done ? 'checked' : ''}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      class="task-input ${g.done ? 'completed' : ''}"
                      data-type="week-goal-txt"
                      data-widx="${wIdx}"
                      data-gidx="${gIdx}"
                      placeholder="${gIdx < 3 ? `Mục tiêu ưu tiên ${gIdx + 1}` : `Mục tiêu thường ${gIdx - 2}`}"
                      value="${escapeHtml(g.text)}"
                    />
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Weekly Reflection -->
        <div class="reflection-panel">
          <div class="week-reflection-header">Reflection</div>
          <table class="reflection-table">
            <tbody>
              ${REFLECTION_PROMPTS_WEEK.map((prompt, rIdx) => `
                <tr>
                  <td class="reflection-prompt">${prompt}</td>
                  <td>
                    <textarea
                      class="reflection-textarea"
                      data-type="week-reflection"
                      data-widx="${wIdx}"
                      data-ridx="${rIdx}"
                      placeholder="Tổng kết tuần ${wIdx + 1}..."
                    >${escapeHtml(weekObj.reflection[rIdx] || '')}</textarea>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 7-Day Columns (Monday .. Sunday) -->
      <div class="days-seven-grid">
        ${weekObj.days.map((dayObj, dIdx) => {
          const dayMeta = DAY_HEADERS[dIdx];
          const dateInfo = getDateForWeekDay(state.month, state.year, wIdx, dIdx);
          const isToday = dateInfo && isTodayDate(dateInfo.day, state.month, state.year);
          const parityClass = dIdx % 2 === 0 ? 'even-day' : 'odd-day';

          return `
            <div class="day-column ${parityClass} ${isToday ? 'is-today' : ''}">
              <div class="day-col-header">
                ${dayMeta.icon}${dayMeta.name}
              </div>
              <div class="day-date-sub">
                ${dateInfo ? dateInfo.formatted : ''}
              </div>

              <!-- Vertical Fill Pillar -->
              <div class="day-pillar-area">
                <div class="day-pillar-track">
                  <div class="day-pillar-fill" id="day-pillar-fill-${wIdx}-${dIdx}" style="height: 0%"></div>
                </div>
                <div class="day-pillar-pct" id="day-pillar-pct-${wIdx}-${dIdx}">0%</div>
              </div>

              <!-- Daily Priority (3) + Regular (7) Tasks -->
              <div class="day-tasks-wrap">
                <table class="day-tasks-table">
                  <tbody>
                    ${dayObj.tasks.map((task, tIdx) => `
                      <tr>
                        ${tIdx === 0 ? `<td class="tier-badge-cell priority" rowspan="3">Priority</td>` : ''}
                        ${tIdx === 3 ? `<td class="tier-badge-cell regular" rowspan="7">Regular</td>` : ''}
                        <td class="task-check-cell">
                          <input
                            type="checkbox"
                            class="custom-chk"
                            data-type="day-task-chk"
                            data-widx="${wIdx}"
                            data-didx="${dIdx}"
                            data-tidx="${tIdx}"
                            ${task.done ? 'checked' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            class="task-input ${task.done ? 'completed' : ''}"
                            data-type="day-task-txt"
                            data-widx="${wIdx}"
                            data-didx="${dIdx}"
                            data-tidx="${tIdx}"
                            placeholder="${tIdx < 3 ? `Task ưu tiên ${tIdx + 1}` : ''}"
                            value="${escapeHtml(task.text)}"
                          />
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Daily Note -->
              <div class="day-note-header">Note</div>
              <textarea
                class="day-note-area"
                data-type="day-note"
                data-widx="${wIdx}"
                data-didx="${dIdx}"
                placeholder="Ghi chú nhỏ trong ngày..."
              >${escapeHtml(dayObj.note || '')}</textarea>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

/* ==========================================
   LIVE REACTIVE CHART & PROGRESS UPDATER
   ========================================== */
function updateAllStatsUI() {
  const daysInMonth = getDaysInMonth(state.month, state.year);

  // 1. Monthly Goals stats
  const mStats = calcTaskListStats(state.data.monthlyGoals);
  setText('month-stat-completed', mStats.completed);
  setText('month-stat-inprogress', mStats.inProgress);
  setText('month-stat-total', mStats.total);
  setText('month-goal-prog-pct', `${mStats.pct}%`);
  setText('month-donut-text', `${mStats.pct}%`);

  const mProgBar = document.getElementById('month-goal-prog-bar');
  const mDuck = document.getElementById('month-goal-duck');
  if (mProgBar) mProgBar.style.width = `${mStats.pct}%`;
  if (mDuck) mDuck.style.left = `${Math.min(82, Math.max(8, mStats.pct))}%`;

  const mDonut = document.getElementById('month-donut-ring');
  if (mDonut) {
    mDonut.style.background = `conic-gradient(#636854 0% ${mStats.pct}%, rgba(255,255,255,0.35) ${mStats.pct}% 100%)`;
  }

  // 2. Habit Tracker row % + Horizontal chart
  const activeHabitIndices = [];
  state.data.habits.forEach((h, hIdx) => {
    const checksInMonth = h.checks.slice(0, daysInMonth);
    const doneCount = checksInMonth.filter(Boolean).length;
    const isActiveHabit = h.name.trim() !== '' || doneCount > 0;
    if (isActiveHabit) activeHabitIndices.push(hIdx);

    const pct = isActiveHabit ? Math.round((doneCount / daysInMonth) * 100) : 0;

    const rowPctEl = document.getElementById(`habit-row-pct-${hIdx}`);
    if (rowPctEl) {
      rowPctEl.textContent = `${pct}%`;
      rowPctEl.style.backgroundColor = getHabitPctColor(pct);
    }

    const hbarLabel = document.getElementById(`hbar-label-${hIdx}`);
    const hbarFill = document.getElementById(`hbar-fill-${hIdx}`);
    const hbarVal = document.getElementById(`hbar-val-${hIdx}`);
    if (hbarLabel) hbarLabel.textContent = h.name || `Thói quen ${hIdx + 1}`;
    if (hbarFill) hbarFill.style.width = `${pct}%`;
    if (hbarVal) hbarVal.textContent = `${pct}%`;
  });

  // 3. Habit Tracker daily vertical mini-bars (1..daysInMonth)
  const totalHabitsCount = Math.max(1, activeHabitIndices.length);
  for (let dIdx = 0; dIdx < daysInMonth; dIdx++) {
    let checkedToday = 0;
    activeHabitIndices.forEach(hIdx => {
      if (state.data.habits[hIdx].checks[dIdx]) checkedToday++;
    });
    const dayHabitPct = activeHabitIndices.length > 0
      ? Math.round((checkedToday / totalHabitsCount) * 100)
      : 0;
    const dayBar = document.getElementById(`habit-day-bar-${dIdx}`);
    const dayPct = document.getElementById(`habit-day-pct-${dIdx}`);
    if (dayBar) dayBar.style.height = `${dayHabitPct}%`;
    if (dayPct) dayPct.textContent = `${dayHabitPct}%`;
  }

  // 4. Weeks stats + Top Weekly Productivity Bar Chart + Daily Pillars
  state.data.weeks.forEach((weekObj, wIdx) => {
    const wGoalStats = calcTaskListStats(weekObj.goals);
    setText(`week-stat-completed-${wIdx}`, wGoalStats.completed);
    setText(`week-stat-inprogress-${wIdx}`, wGoalStats.inProgress);
    setText(`week-stat-total-${wIdx}`, wGoalStats.total);
    setText(`week-prog-pct-${wIdx}`, `${wGoalStats.pct}%`);
    setText(`week-donut-text-${wIdx}`, `${wGoalStats.pct}%`);

    const wProgBar = document.getElementById(`week-prog-bar-${wIdx}`);
    const wDuck = document.getElementById(`week-prog-duck-${wIdx}`);
    if (wProgBar) wProgBar.style.width = `${wGoalStats.pct}%`;
    if (wDuck) wDuck.style.left = `${Math.min(82, Math.max(8, wGoalStats.pct))}%`;

    const wDonut = document.getElementById(`week-donut-ring-${wIdx}`);
    if (wDonut) {
      wDonut.style.background = `conic-gradient(#f5b98c 0% ${wGoalStats.pct}%, #fde2ce ${wGoalStats.pct}% 100%)`;
    }

    // Daily pillars inside this week
    weekObj.days.forEach((dayObj, dIdx) => {
      const dStats = calcTaskListStats(dayObj.tasks);
      const pillarFill = document.getElementById(`day-pillar-fill-${wIdx}-${dIdx}`);
      const pillarPct = document.getElementById(`day-pillar-pct-${wIdx}-${dIdx}`);
      if (pillarFill) pillarFill.style.height = `${dStats.pct}%`;
      if (pillarPct) pillarPct.textContent = `${dStats.pct}%`;
    });

    // Top banner weekly productivity bar chart
    const overallWeekPct = calcWeekProductivityPct(weekObj);
    const topBarFill = document.getElementById(`top-wbar-fill-${wIdx}`);
    const topBarPct = document.getElementById(`top-wbar-pct-${wIdx}`);
    if (topBarFill) {
      topBarFill.style.height = `${Math.max(2, overallWeekPct)}%`;
    }
    if (topBarPct) {
      topBarPct.textContent = `${overallWeekPct}%`;
      topBarPct.className = overallWeekPct === 0 ? 'v-bar-pct zero' : 'v-bar-pct';
    }
  });
}

/* ==========================================
   EVENT LISTENERS
   ========================================== */
function attachEvents() {
  const root = document.getElementById('app-root');

  // Month / Year / Current Week selectors
  document.getElementById('select-month').addEventListener('change', (e) => {
    state.month = Number(e.target.value);
    state.data = loadMonthData(state.month, state.year);
    renderApp();
  });

  document.getElementById('select-year').addEventListener('change', (e) => {
    state.year = Number(e.target.value);
    state.data = loadMonthData(state.month, state.year);
    renderApp();
  });

  document.getElementById('select-current-week').addEventListener('change', (e) => {
    state.currentWeek = Number(e.target.value);
  });

  // Week filter tabs
  root.querySelectorAll('[data-weekfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-weekfilter');
      state.weekFilter = val === 'all' ? 'all' : Number(val);
      renderApp();
    });
  });

  // Toolbar buttons
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    state.data = createDefaultMonthData(state.month, state.year, true);
    saveMonthData(state.month, state.year);
    renderApp();
  });

  document.getElementById('btn-clear-month').addEventListener('click', () => {
    if (confirm(`Bạn có chắc muốn làm trống toàn bộ kế hoạch tháng ${state.month}/${state.year} để bắt đầu viết mới?`)) {
      state.data = createDefaultMonthData(state.month, state.year, false);
      saveMonthData(state.month, state.year);
      renderApp();
    }
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-monthplan-${state.year}-${state.month}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('file-import-input');
  document.getElementById('btn-import-json').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && imported.monthlyGoals && imported.habits && imported.weeks) {
          state.data = imported;
          saveMonthData(state.month, state.year);
          renderApp();
        } else {
          alert('File không đúng định dạng Clarity Monthplan.');
        }
      } catch (err) {
        alert('Không thể đọc file JSON.');
      }
    };
    reader.readAsText(file);
  });

  // Delegated checkbox & text input changes
  root.onchange = (e) => {
    const t = e.target;
    const type = t.getAttribute('data-type');
    if (!type) return;

    if (type === 'month-goal-chk') {
      const idx = Number(t.getAttribute('data-idx'));
      state.data.monthlyGoals[idx].done = t.checked;
      const txtInput = root.querySelector(`[data-type="month-goal-txt"][data-idx="${idx}"]`);
      if (txtInput) txtInput.classList.toggle('completed', t.checked);
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'habit-chk') {
      const hIdx = Number(t.getAttribute('data-hidx'));
      const dIdx = Number(t.getAttribute('data-didx'));
      state.data.habits[hIdx].checks[dIdx] = t.checked;
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'week-goal-chk') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const gIdx = Number(t.getAttribute('data-gidx'));
      state.data.weeks[wIdx].goals[gIdx].done = t.checked;
      const txtInput = root.querySelector(`[data-type="week-goal-txt"][data-widx="${wIdx}"][data-gidx="${gIdx}"]`);
      if (txtInput) txtInput.classList.toggle('completed', t.checked);
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'day-task-chk') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const dIdx = Number(t.getAttribute('data-didx'));
      const tIdx = Number(t.getAttribute('data-tidx'));
      state.data.weeks[wIdx].days[dIdx].tasks[tIdx].done = t.checked;
      const txtInput = root.querySelector(`[data-type="day-task-txt"][data-widx="${wIdx}"][data-didx="${dIdx}"][data-tidx="${tIdx}"]`);
      if (txtInput) txtInput.classList.toggle('completed', t.checked);
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    }
  };

  root.oninput = (e) => {
    const t = e.target;
    const type = t.getAttribute('data-type');
    if (!type) return;

    if (type === 'month-goal-txt') {
      const idx = Number(t.getAttribute('data-idx'));
      state.data.monthlyGoals[idx].text = t.value;
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'month-reflection') {
      const idx = Number(t.getAttribute('data-idx'));
      state.data.monthlyReflection[idx] = t.value;
      saveMonthData(state.month, state.year);
    } else if (type === 'habit-name') {
      const hIdx = Number(t.getAttribute('data-hidx'));
      state.data.habits[hIdx].name = t.value;
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'week-goal-txt') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const gIdx = Number(t.getAttribute('data-gidx'));
      state.data.weeks[wIdx].goals[gIdx].text = t.value;
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'week-reflection') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const rIdx = Number(t.getAttribute('data-ridx'));
      state.data.weeks[wIdx].reflection[rIdx] = t.value;
      saveMonthData(state.month, state.year);
    } else if (type === 'day-task-txt') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const dIdx = Number(t.getAttribute('data-didx'));
      const tIdx = Number(t.getAttribute('data-tidx'));
      state.data.weeks[wIdx].days[dIdx].tasks[tIdx].text = t.value;
      saveMonthData(state.month, state.year);
      updateAllStatsUI();
    } else if (type === 'day-note') {
      const wIdx = Number(t.getAttribute('data-widx'));
      const dIdx = Number(t.getAttribute('data-didx'));
      state.data.weeks[wIdx].days[dIdx].note = t.value;
      saveMonthData(state.month, state.year);
    }
  };
}

/* ==========================================
   HELPERS & INITIALIZATION
   ========================================== */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isTodayDate(day, month, year) {
  const now = new Date();
  return (
    now.getDate() === day &&
    now.getMonth() + 1 === month &&
    now.getFullYear() === year
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  state.month = now.getMonth() + 1;
  state.year = now.getFullYear();
  state.data = loadMonthData(state.month, state.year);
  renderApp();
});
