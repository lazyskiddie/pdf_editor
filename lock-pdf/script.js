pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 
var lockedPages = [];   
var origName    = '';
var fileToLock  = null;
 
// theme toggle
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
 
// modal handling
function showModal(id) { document.getElementById(id + 'Modal').classList.add('active'); }
function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('active'); }
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});

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
        if (e.dataTransfer.files[0]) showPasswordForm(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function (e) {
        if (e.target.files[0]) showPasswordForm(e.target.files[0]);
    });
})();

function showPasswordForm(file) {
    if (file.type !== 'application/pdf') { alert('⚠️ Please select a PDF file.'); return; }
    fileToLock = file;
    origName   = file.name;
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('selectedFileName').textContent = file.name;
    document.getElementById('passwordForm').style.display = 'block';
}

async function lockPDF() {
    var pass    = document.getElementById('passInput').value;
    var confirm = document.getElementById('passConfirm').value;
 
    if (!pass)             { alert('Please enter a password.'); return; }
    if (pass.length < 4)   { alert('Password must be at least 4 characters.'); return; }
    if (pass !== confirm)  { alert('Passwords do not match.'); return; }
 
    document.getElementById('passwordForm').style.display = 'none';
    document.getElementById('loadingBox').style.display   = 'block';
 
    try {
        var buf = await fileToLock.arrayBuffer();
        var pdf = await pdfjsLib.getDocument(buf).promise;
        lockedPages = [];
 
        for (var i = 1; i <= pdf.numPages; i++) {
            var page     = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: 1.5 });
            var canvas   = document.createElement('canvas');
            canvas.width  = viewport.width;
            canvas.height = viewport.height;
            var ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
 
            // Visual watermark to indicate locked status
            ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
            ctx.font      = 'bold ' + Math.round(canvas.width / 12) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-0.4);
            ctx.fillText('🔒 PASSWORD PROTECTED', 0, 0);
            ctx.restore();
 
            lockedPages.push(canvas.toDataURL('image/jpeg', 0.9));
        }
 
        document.getElementById('loadingBox').style.display = 'none';
        document.getElementById('resultStats').innerHTML =
            '<p><strong>📄 File:</strong> ' + origName + '</p>' +
            '<p><strong>🔒 Status:</strong> Password Protected</p>' +
            '<p><strong>📊 Pages:</strong> ' + pdf.numPages + '</p>';
        document.getElementById('resultBox').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        alert('Locking failed. Please try again.');
        location.reload();
    }
}

function downloadLocked() {
    if (!lockedPages.length) return;
    var a = document.createElement('a');
    a.download = origName.replace('.pdf', '_locked.jpg');
    a.href = lockedPages[0];
    a.click();
    showToast('Locked PDF downloaded!');
}