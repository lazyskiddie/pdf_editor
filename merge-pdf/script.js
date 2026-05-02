pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 

var mergeFiles  = [];   
var mergedPages = [];   
 

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
    var extra = document.getElementById('extraInput');
 
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        addFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', function (e) { addFiles(e.target.files); });
    extra.addEventListener('change', function (e) {
        if (e.target.files[0]) addFiles(e.target.files);
        e.target.value = '';
    });
})();

function addFiles(fileList) {
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
        var f = fileList[i];
        if (f.type !== 'application/pdf') continue;
        if (mergeFiles.length >= 10) { alert('⚠️ Maximum 10 files allowed.'); break; }
        mergeFiles.push(f);
        added++;
    }
    if (added > 0) showMergeInterface();
}
 
function addMore() {
    if (mergeFiles.length >= 10) { alert('⚠️ Maximum 10 files allowed.'); return; }
    document.getElementById('extraInput').click();
}
 
function showMergeInterface() {
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('mergeInterface').style.display = 'block';
    renderFileList();
}
 
function renderFileList() {
    var count = mergeFiles.length;
    document.getElementById('fileCount').textContent = count;
 
    var hint = document.getElementById('infoHint');
    hint.textContent = count < 2
        ? ' Add at least one more file to enable merge.'
        : ' Ready! Click "Merge All Files" below.';
    hint.style.color = count < 2 ? '#ef4444' : 'var(--text-secondary)';
 
    var mergeBtn = document.getElementById('mergeBtn');
    mergeBtn.style.display = count >= 2 ? 'inline-block' : 'none';
 
    var html = '';
    if (count === 0) {
        html = '<p style="text-align:center;color:var(--text-secondary);padding:1rem;">No files added yet.</p>';
    } else {
        html += '<div style="background:var(--bg-primary);border-radius:12px;padding:1.5rem;">';
        for (var i = 0; i < mergeFiles.length; i++) {
            var f = mergeFiles[i];
            var isFirst = i === 0;
            var isLast  = i === mergeFiles.length - 1;
            html += '<div class="merge-file-item">';
            html += '<div class="merge-file-meta">';
            html += '<span class="merge-file-index">' + (i + 1) + '</span>';
            html += '<div>';
            html += '<div class="merge-file-name">' + f.name + '</div>';
            html += '<div class="merge-file-size">' + (f.size / 1024 / 1024).toFixed(2) + ' MB</div>';
            html += '</div></div>';
            html += '<div class="merge-file-actions">';
            html += '<button class="btn-icon" onclick="moveFile(' + i + ',-1)" ' + (isFirst ? 'disabled' : '') + '>↑</button>';
            html += '<button class="btn-icon" onclick="moveFile(' + i + ',1)"  ' + (isLast  ? 'disabled' : '') + '>↓</button>';
            html += '<button class="btn-icon btn-icon-danger" onclick="removeFile(' + i + ')">🗑️</button>';
            html += '</div></div>';
        }
        html += '</div>';
    }
    document.getElementById('fileList').innerHTML = html;
}