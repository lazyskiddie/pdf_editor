pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 
var pages         = [];   
var originalOrder = [];   // snapshot for reset
var origName      = '';
var draggedIdx    = null;
 
function toggleTheme() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}
(function () {
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
 

(function setupDrop() {
    var zone  = document.getElementById('dropZone');
    var input = document.getElementById('fileInput');
 
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) {
        e.preventDefault(); zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) loadPDF(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function (e) {
        if (e.target.files[0]) loadPDF(e.target.files[0]);
    });
})();

async function loadPDF(file) {
    if (file.type !== 'application/pdf') { alert('⚠️ Please select a PDF file.'); return; }
    origName = file.name;
 
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('loadingBox').style.display = 'block';
 
    try {
        var buf = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument(buf).promise;
        pages = [];
 
        for (var i = 1; i <= pdf.numPages; i++) {
            var page     = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: 1.5 });
            var canvas   = document.createElement('canvas');
            canvas.width  = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            pages.push({ pageNumber: i, origNum: i, dataUrl: canvas.toDataURL('image/jpeg', 0.88) });
        }
 
        originalOrder = pages.map(function (p) { return Object.assign({}, p); });
 
        document.getElementById('loadingBox').style.display = 'none';
        document.getElementById('totalCount').textContent = pages.length;
        renderGrid();
        document.getElementById('reorderArea').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        alert('Could not load PDF. Please try again.');
        location.reload();
    }
}
 
function renderGrid() {
    var html = '';
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i];
        html += '<div class="reorder-card" draggable="true" data-idx="' + i + '"' +
                ' ondragstart="onDragStart(event,' + i + ')"' +
                ' ondragover="onDragOver(event)"' +
                ' ondrop="onDrop(event,' + i + ')"' +
                ' ondragend="onDragEnd(event)">';
        html += '<div class="page-badge badge-top-left badge-green">Pos ' + (i + 1) + '</div>';
        html += '<div class="page-badge badge-top-right badge-gray">Orig ' + p.origNum + '</div>';
        html += '<img src="' + p.dataUrl + '" alt="Page ' + p.origNum + '">';
        html += '<div class="page-number" style="margin-top:0.6rem;">Page ' + p.origNum + '</div>';
        html += '<div style="text-align:center;color:var(--text-secondary);font-size:0.78rem;">drag to reorder</div>';
        html += '</div>';
    }
    document.getElementById('reorderGrid').innerHTML = html;
}