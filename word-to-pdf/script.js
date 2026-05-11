var convertedPages = [];   
var origName       = '';
 
function toggleTheme() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    var next   = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
}
 
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
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) convertFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function (e) {
        if (e.target.files[0]) convertFile(e.target.files[0]);
    });
})();

async function convertFile(file) {
    var validExts = ['.doc', '.docx', '.rtf', '.txt'];
    var fileName  = file.name.toLowerCase();
    var isValid   = validExts.some(function (ext) { return fileName.endsWith(ext); });
 
    if (!isValid) {
        alert('⚠️ Please select a .doc, .docx, .rtf, or .txt file.');
        return;
    }
 
    origName = file.name;
 
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('loadingBox').style.display   = 'block';
    document.getElementById('progressText').textContent   = 'Reading file…';
 
    try {
        var rawText = await file.text();
        var textContent = rawText;
        if (fileName.endsWith('.rtf')) {
            textContent = stripRTF(rawText);
        }
 
        document.getElementById('progressText').textContent = 'Rendering pages…';
 
        convertedPages = renderTextToPages(textContent);
 
        document.getElementById('loadingBox').style.display = 'none';
 
        document.getElementById('resultStats').innerHTML =
            '<p><strong>📄 Original File:</strong> ' + file.name + '</p>' +
            '<p><strong>Pages Created:</strong> ' + convertedPages.length + '</p>' +
            '<p><strong>Text Length:</strong> ' + (textContent.length / 1024).toFixed(1) + ' KB</p>' +
            '<p><strong>Status:</strong> Ready to download</p>';
        document.getElementById('resultBox').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        document.getElementById('loadingBox').style.display = 'none';
        alert('Conversion failed. Please try again.');
        location.reload();
    }
}