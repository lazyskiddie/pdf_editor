pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 
var allPages    = [];        // [{ pageNumber, dataUrl, deleted }]
var pendingSet  = new Set(); // page numbers currently ticked for deletion
var finalPages  = [];        // pages remaining after confirmed deletes
var origName    = '';
 
// THEME
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
 
// MODALS
function showModal(id) { document.getElementById(id + 'Modal').classList.add('active'); }
function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('active'); }
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});
 
// TOAST NOTIFICATIONS
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
        allPages = [];
 
        for (var i = 1; i <= pdf.numPages; i++) {
            var page     = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: 1.5 });
            var canvas   = document.createElement('canvas');
            canvas.width  = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            allPages.push({ pageNumber: i, dataUrl: canvas.toDataURL('image/jpeg', 0.88), deleted: false });
        }
 
        document.getElementById('loadingBox').style.display = 'none';
        renderGrid();
        document.getElementById('deleteArea').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        alert('Could not load PDF. Please try again.');
        location.reload();
    }
}

function renderGrid() {
    var visible   = allPages.filter(function (p) { return !p.deleted; });
    var total     = allPages.length;
    var selected  = pendingSet.size;
    var remaining = visible.length - selected;
 
    document.getElementById('totalCount').textContent = total;
    document.getElementById('selCount').textContent   = selected;
    document.getElementById('remCount').textContent   = remaining;
    document.getElementById('delCount').textContent   = selected;
 
    var deletedCount = allPages.filter(function (p) { return p.deleted; }).length;
 
    document.getElementById('deleteBtn').disabled   = selected === 0;
    document.getElementById('downloadBtn').disabled = deletedCount === 0;
 
    var html = '';
    for (var i = 0; i < visible.length; i++) {
        var p    = visible[i];
        var isSel = pendingSet.has(p.pageNumber);
        html += '<div class="page-card ' + (isSel ? 'selected-delete' : '') + '" onclick="togglePage(' + p.pageNumber + ')">';
        html += '<div style="position:relative;">';
        html += '<img src="' + p.dataUrl + '" class="page-preview" alt="Page ' + p.pageNumber + '">';
        if (isSel) {
            html += '<div class="page-badge badge-center badge-red">✓ Selected</div>';
        }
        html += '</div>';
        html += '<div class="page-number">Page ' + p.pageNumber + '</div>';
        html += '</div>';
    }
    document.getElementById('pageGrid').innerHTML = html;
}
 
function togglePage(num) {
    if (pendingSet.has(num)) pendingSet.delete(num); else pendingSet.add(num);
    renderGrid();
}

// CONFIRM AND APPLY DELETIONS section
function deleteSelected() {
    if (!pendingSet.size) return;
 
    var visible   = allPages.filter(function (p) { return !p.deleted; });
    var remaining = visible.length - pendingSet.size;
 
    if (remaining === 0) {
        alert('⚠️ At least one page must remain. You cannot delete all pages.');
        return;
    }
 
    if (!confirm('Delete ' + pendingSet.size + ' page(s)? ' + remaining + ' page(s) will remain.')) return;
 
    allPages.forEach(function (p) {
        if (pendingSet.has(p.pageNumber)) p.deleted = true;
    });
    pendingSet.clear();
    renderGrid();
    showToast('Pages deleted! Click "Download Remaining Pages" to save.');
}