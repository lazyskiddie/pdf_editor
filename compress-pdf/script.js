pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

var compressedPages = [];  
var origName        = '';
var chosenQuality   = 0.45; 
var chosenScale     = 0.65; 

function toggleTheme() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    var next   = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
}

(function initTheme() {
    var saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
})();

function showModal(id) { document.getElementById(id + 'Modal').classList.add('active'); }
function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('active'); }

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});

function showToast(msg, ms) {
    ms = ms || 3000;
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms);
}
function selectLevel(btn) {
    document.querySelectorAll('.quality-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    chosenQuality = parseFloat(btn.getAttribute('data-quality'));
    chosenScale   = parseFloat(btn.getAttribute('data-scale'));
}