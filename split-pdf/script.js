pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 

var allPages    = [];        
var file1Set    = new Set(); 
var origName    = '';
var splitFile1  = [];
var splitFile2  = [];
 
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
        allPages = [];
 
        for (var i = 1; i <= pdf.numPages; i++) {
            var page     = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: 1.5 });
            var canvas   = document.createElement('canvas');
            canvas.width  = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            allPages.push({ pageNumber: i, dataUrl: canvas.toDataURL('image/jpeg', 0.88) });
        }
 
        document.getElementById('loadingBox').style.display = 'none';
        renderGrid();
        document.getElementById('selectionArea').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        alert('Could not load PDF. Please try again.');
        location.reload();
    }
}
 
function renderGrid() {
    var total = allPages.length;
    var f1    = file1Set.size;
    var f2    = total - f1;
 
    document.getElementById('totalCount').textContent = total;
    document.getElementById('f1Count').textContent    = f1;
    document.getElementById('f2Count').textContent    = f2;
    document.getElementById('splitBtn').disabled      = f1 === 0 || f2 === 0;
 
    var html = '';
    for (var i = 0; i < allPages.length; i++) {
        var p    = allPages[i];
        var isF1 = file1Set.has(p.pageNumber);
        html += '<div class="split-card ' + (isF1 ? 'file1' : '') + '" onclick="togglePage(' + p.pageNumber + ')">';
        html += '<div class="page-badge badge-top-right ' + (isF1 ? 'badge-green' : 'badge-gray') + '">' + (isF1 ? '✓ File 1' : 'File 2') + '</div>';
        html += '<img src="' + p.dataUrl + '" alt="Page ' + p.pageNumber + '" style="width:100%;border-radius:8px;margin-top:2.6rem;">';
        html += '<div class="page-number" style="margin-top:0.6rem;">Page ' + p.pageNumber + '</div>';
        html += '</div>';
    }
    document.getElementById('pageGrid').innerHTML = html;
}
 
function togglePage(num) {
    if (file1Set.has(num)) file1Set.delete(num); else file1Set.add(num);
    renderGrid();
}
 
function doSplit() {
    splitFile1 = allPages.filter(function (p) { return  file1Set.has(p.pageNumber); });
    splitFile2 = allPages.filter(function (p) { return !file1Set.has(p.pageNumber); });
 
    if (!splitFile1.length || !splitFile2.length) {
        alert('Both files must contain at least one page.');
        return;
    }
 
    document.getElementById('selectionArea').style.display = 'none';
 
    var f1Pages = splitFile1.map(function (p) { return p.pageNumber; }).join(', ');
    var f2Pages = splitFile2.map(function (p) { return p.pageNumber; }).join(', ');
 
    document.getElementById('splitResults').innerHTML =
        '<div class="split-result-card" style="border-color:var(--accent-color);background:rgba(16,185,129,0.07);">' +
            '<div style="font-size:3rem;margin-bottom:1rem;">📄</div>' +
            '<h4 style="margin-bottom:1rem;">File 1 (Selected)</h4>' +
            '<p style="color:var(--text-secondary);margin-bottom:1.5rem;"><strong>' + splitFile1.length + '</strong> page(s)<br><small>Pages: ' + f1Pages + '</small></p>' +
            '<button class="btn" style="width:100%;" onclick="downloadSplit(1)">💾 Download File 1</button>' +
        '</div>' +
        '<div class="split-result-card" style="border-color:var(--text-secondary);background:rgba(108,117,125,0.07);">' +
            '<div style="font-size:3rem;margin-bottom:1rem;">📄</div>' +
            '<h4 style="margin-bottom:1rem;">File 2 (Remaining)</h4>' +
            '<p style="color:var(--text-secondary);margin-bottom:1.5rem;"><strong>' + splitFile2.length + '</strong> page(s)<br><small>Pages: ' + f2Pages + '</small></p>' +
            '<button class="btn btn-secondary" style="width:100%;" onclick="downloadSplit(2)">💾 Download File 2</button>' +
        '</div>';
 
    document.getElementById('resultBox').style.display = 'block';
}
 
function downloadSplit(num) {
    var pages = num === 1 ? splitFile1 : splitFile2;
    if (!pages.length) return;
    var a = document.createElement('a');
    a.download = origName.replace('.pdf', '_part' + num + '.jpg');
    a.href = pages[0].dataUrl;
    a.click();
    showToast('File ' + num + ' downloaded! (' + pages.length + ' pages)');
}