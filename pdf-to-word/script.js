pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 
var rtfContent = '';    
var origName   = '';
 
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

(function setupDrop() {
    var zone  = document.getElementById('dropZone');
    var input = document.getElementById('fileInput');
 
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) convertPDF(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function (e) {
        if (e.target.files[0]) convertPDF(e.target.files[0]);
    });
})();

async function convertPDF(file) {
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }
 
    origName = file.name;
 
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('loadingBox').style.display   = 'block';
 
    try {
        var buf = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument(buf).promise;
 
        var fullText = '';
 
        for (var i = 1; i <= pdf.numPages; i++) {
            document.getElementById('progressText').textContent =
                'Extracting page ' + i + ' of ' + pdf.numPages + '…';
 
            var page    = await pdf.getPage(i);
            var content = await page.getTextContent();
 
            var pageText  = '';
            var lastY     = null;
            for (var j = 0; j < content.items.length; j++) {
                var item = content.items[j];
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                }
                pageText += item.str;
                if (item.hasEOL) pageText += '\n';
                lastY = item.transform[5];
            }
 
            fullText += '\n\n── Page ' + i + ' ──\n\n' + pageText.trim();
        }
 
        rtfContent = buildRTF(fullText);
 
        document.getElementById('loadingBox').style.display = 'none';
 
        document.getElementById('textPreview').textContent = fullText.trim();
        document.getElementById('previewArea').style.display = 'block';
 
        document.getElementById('resultStats').innerHTML =
            '<p><strong>📄 Original:</strong> ' + file.name + '</p>' +
            '<p><strong>Pages Extracted:</strong> ' + pdf.numPages + '</p>' +
            '<p><strong>Text Size:</strong> ' + (fullText.length / 1024).toFixed(1) + ' KB</p>' +
            '<p><strong>Format:</strong> RTF (opens in Word, LibreOffice, Google Docs)</p>';
 
    } catch (err) {
        console.error(err);
        document.getElementById('loadingBox').style.display = 'none';
        alert('Conversion failed. Please try again.');
        location.reload();
    }
}

function buildRTF(plainText) {
    var escaped = plainText
        .replace(/\\/g, '\\\\')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}');
 
    var rtfBody = escaped.replace(/\n/g, '\\par\n');
 
    return '{\\rtf1\\ansi\\deff0\n' +
           '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\n' +
           '{\\colortbl;\\red44\\green62\\blue80;}\n' +
           '\\viewkind4\\uc1\\pard\\cf1\\f0\\fs24\n' +
           rtfBody +
           '\n}';
}
function downloadWord() {
    if (!rtfContent) return;
 
    var blob = new Blob([rtfContent], { type: 'application/rtf' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.download = origName.replace('.pdf', '.rtf');
    a.href     = url;
    a.click();
    URL.revokeObjectURL(url);
 
    showToast('Word document downloaded!');
}