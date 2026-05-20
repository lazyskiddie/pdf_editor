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

(function setupDrop() {
    var zone  = document.getElementById('dropZone');
    var input = document.getElementById('fileInput');

    zone.addEventListener('click', function () { input.click(); });

    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function () {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) compressFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', function (e) {
        if (e.target.files[0]) compressFile(e.target.files[0]);
    });
})();

async function compressFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }

    origName = file.name;
    var originalSize = file.size;

    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('loadingBox').style.display   = 'block';

    try {
        var buf = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument(buf).promise;

        compressedPages = [];

        for (var i = 1; i <= pdf.numPages; i++) {
            document.getElementById('progressText').textContent =
                'Compressing page ' + i + ' of ' + pdf.numPages + '…';

            var page     = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: chosenScale });

            var canvas  = document.createElement('canvas');
            canvas.width  = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport:      viewport
            }).promise;

            compressedPages.push(canvas.toDataURL('image/jpeg', chosenQuality));
        }

        var totalB64Chars = compressedPages.reduce(function (acc, dataUrl) {
            return acc + dataUrl.split(',')[1].length;
        }, 0);
        var compressedBytes = Math.round(totalB64Chars * 0.75);

        var origMB = (originalSize    / 1024 / 1024).toFixed(2);
        var compMB = (compressedBytes / 1024 / 1024).toFixed(2);
        var saved  = Math.max(0, Math.round((1 - compressedBytes / originalSize) * 100));

        document.getElementById('loadingBox').style.display = 'none';
        document.getElementById('resultStats').innerHTML =
            '<p><strong>📄 Original Size:</strong> ' + origMB + ' MB</p>' +
            '<p><strong>📦 Compressed Size:</strong> ' + compMB + ' MB</p>' +
            '<p class="stat-highlight"><strong>💾 Space Saved:</strong> ~' + saved + '%</p>' +
            '<p><strong>Pages Processed:</strong> ' + pdf.numPages + '</p>';
        document.getElementById('resultBox').style.display = 'block';

    } catch (err) {
        console.error(err);
        document.getElementById('loadingBox').style.display = 'none';
        document.getElementById('errorBox').style.display   = 'block';
    }
}
