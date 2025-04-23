const calendar = document.getElementById('calendar');
const modal = document.getElementById('moodModal');
const closeBtn = document.querySelector('.close');
const saveBtn = document.getElementById('saveMood');
const selectedDateEl = document.getElementById('selectedDate');
const colorPicker = document.getElementById('modalColorPicker');
const noteInput = document.getElementById('modalNote');
const toggleThemeBtn = document.getElementById('toggleTheme');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const monthLabel = document.getElementById('monthLabel');

let selectedDate = null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function generateCalendar(year, month) {
  const date = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = date.getDay();
  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day');
    calendar.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('day');

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    dayCell.innerHTML = `<div class="date-number">${day}</div>`;
    if (moodData[dateString]) {
      const moodOverlay = document.createElement('div');
      moodOverlay.className = 'mood-color';
      moodOverlay.style.backgroundColor = moodData[dateString].color;
      dayCell.appendChild(moodOverlay);
    }

    dayCell.addEventListener('click', () => openModal(dateString));
    calendar.appendChild(dayCell);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  monthLabel.textContent = `${monthNames[month]} ${year}`;
}

function openModal(dateStr) {
  selectedDate = dateStr;
  selectedDateEl.textContent = dateStr;
  const data = moodData[dateStr] || { color: '#ffffff', note: '' };
  colorPicker.value = data.color;
  noteInput.value = data.note;
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
}

function saveMood() {
  moodData[selectedDate] = {
    color: colorPicker.value,
    note: noteInput.value.trim()
  };
  localStorage.setItem('moodData', JSON.stringify(moodData));
  generateCalendar(currentYear, currentMonth);
  closeModal();
}

closeBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveMood);
window.addEventListener('click', (e) => {
  if (e.target == modal) closeModal();
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentYear, currentMonth);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar(currentYear, currentMonth);
});

// Set dark mode if previously selected
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

generateCalendar(currentYear, currentMonth);
