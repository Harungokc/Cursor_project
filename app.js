// ==================== VERİ TANIMLAMA ====================

/**
 * Oturum boyunca kullanıcı cevaplarını tutan global obje
 * Format: {'Matematik-Test 1': {1: 'correct', 2: 'wrong', ...}, ...}
 */
const USER_ANSWERS_SESSION = {};

/**
 * Oturum boyunca LLM analiz sonuçlarını tutan global obje
 * Format: {'Matematik-Test 1': '<div class="llm-feedback-box">...HTML...</div>', ...}
 */
const LLM_ANALYSIS_CACHE = {};

/**
 * Tüm dersler, alt konuları ve test sayıları
 */
const SUBJECT_DATA = {
    'Matematik': {
        topics: [
            'Üslü Sayılar',
            'Köklü Sayılar',
            'Denklemler',
            'Çarpanlara Ayırma',
            'Geometri Temel Kavramlar'
        ],
        tests: {
            'Test 1': 20,
            'Test 2': 20,
            'Test 3': 20
        }
    },
    'Türkçe': {
        topics: [
            'Cümle Türleri',
            'Anlatım Bozuklukları',
            'Sözcükte Anlam',
            'Fiilimsiler',
            'Yazım Kuralları'
        ],
        tests: {
            'Test 1': 20,
            'Test 2': 20,
            'Test 3': 20
        }
    },
    'Tarih': {
        topics: [
            'İlk Türk Devletleri',
            'Osmanlı Kuruluş Dönemi',
            'Osmanlı Yükselme Dönemi',
            'Kurtuluş Savaşı',
            'Atatürk İlkeleri'
        ],
        tests: {
            'Test 1': 20,
            'Test 2': 20,
            'Test 3': 20
        }
    },
    'Coğrafya': {
        topics: [
            'Türkiye\'nin Coğrafi Konumu',
            'İklim Özellikleri',
            'Doğal Afetler',
            'Nüfus ve Yerleşme',
            'Ekonomik Faaliyetler'
        ],
        tests: {
            'Test 1': 20,
            'Test 2': 20,
            'Test 3': 20
        }
    }
};

// Aktif test bilgileri
let currentSubject = null;
let currentTest = null;
let currentTopics = [];
let testQuestionMap = [];

// ==================== LOCALSTORAGE FONKSİYONLARI ====================

/**
 * Test sonucunu localStorage'a kaydeder
 * @param {Object} result - Kaydedilecek test sonucu
 */
function saveTestResult(result) {
    const key = `test_result_${result.subject}_${result.testName}`;
    const data = {
        subject: result.subject,
        testName: result.testName,
        analysis: result.analysis,
        timestamp: new Date().toISOString(),
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers
    };
    
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ Test sonucu kaydedildi:', key);
    } catch (error) {
        console.error('❌ localStorage kayıt hatası:', error);
    }
}

/**
 * Önceki test sonucunu localStorage'dan yükler
 * @param {string} subject - Ders adı
 * @param {string} testName - Test adı (örn: 'Test 2')
 * @returns {Object|null} Önceki test sonucu veya null
 */
function loadPreviousTestResult(subject, testName) {
    const key = `test_result_${subject}_${testName}`;
    
    try {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ localStorage okuma hatası:', error);
    }
    
    return null;
}

/**
 * Belirli bir test için önceki testi bulur
 * @param {string} testName - Mevcut test adı
 * @returns {string|null} Önceki test adı veya null
 */
function getPreviousTestName(testName) {
    const testNumber = parseInt(testName.replace('Test ', ''));
    if (testNumber > 1) {
        return `Test ${testNumber - 1}`;
    }
    return null;
}

/**
 * Tüm test geçmişini temizler (opsiyonel)
 */
function clearAllTestResults() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('test_result_')) {
            localStorage.removeItem(key);
        }
    });
    console.log('🗑️ Tüm test sonuçları temizlendi');
}

// ==================== SORU HARİTASI OLUŞTURMA ====================

/**
 * Seçili ders ve test için soru haritası oluşturur
 * @param {Array} topics - Alt konular dizisi
 * @param {number} totalQuestions - Toplam soru sayısı
 */
function generateQuestionMap(topics, totalQuestions) {
    testQuestionMap = [];
    
    // Her konuya en az birkaç soru düşmesini sağla
    const minPerTopic = Math.floor(totalQuestions / topics.length);
    const remaining = totalQuestions % topics.length;
    
    // Her konuya minimum sayıda soru ata
    topics.forEach(topic => {
        for (let i = 0; i < minPerTopic; i++) {
            testQuestionMap.push(topic);
        }
    });
    
    // Kalan soruları rastgele dağıt
    for (let i = 0; i < remaining; i++) {
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        testQuestionMap.push(randomTopic);
    }
    
    // Karıştır (shuffle)
    for (let i = testQuestionMap.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [testQuestionMap[i], testQuestionMap[j]] = [testQuestionMap[j], testQuestionMap[i]];
    }
}

// ==================== UI OLUŞTURMA ====================

/**
 * Ders seçim kutusunu doldurur
 */
function populateSubjectSelect() {
    const subjectSelect = document.getElementById('subject-select');
    
    Object.keys(SUBJECT_DATA).forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

/**
 * Test seçim kutusunu doldurur
 * @param {string} subject - Seçili ders
 */
function populateTestSelect(subject) {
    const testSelect = document.getElementById('test-select');
    testSelect.innerHTML = '<option value="">-- Test Seçin --</option>';
    
    if (subject && SUBJECT_DATA[subject]) {
        const tests = Object.keys(SUBJECT_DATA[subject].tests);
        tests.forEach(testName => {
            const option = document.createElement('option');
            option.value = testName;
            option.textContent = testName;
            testSelect.appendChild(option);
        });
        testSelect.disabled = false;
    } else {
        testSelect.disabled = true;
    }
}

/**
 * İlerleme bilgisini gösterir
 */
function showProgressInfo() {
    const progressInfo = document.getElementById('progress-info');
    
    if (!currentSubject || !currentTest) {
        progressInfo.style.display = 'none';
        return;
    }
    
    const previousTestName = getPreviousTestName(currentTest);
    
    if (previousTestName) {
        const previousResult = loadPreviousTestResult(currentSubject, previousTestName);
        
        if (previousResult) {
            const date = new Date(previousResult.timestamp).toLocaleDateString('tr-TR');
            progressInfo.innerHTML = `
                <div class="info-badge">
                    <span class="badge-icon">📊</span>
                    <strong>${currentSubject} - ${previousTestName}</strong> sonucunuz kayıtlı!
                    <br>
                    <small>Tarih: ${date} | Doğru: ${previousResult.correctAnswers}/${previousResult.totalQuestions}</small>
                    <br>
                    <em>Bu test analiz edildiğinde ilerlemeniz karşılaştırılacak.</em>
                </div>
            `;
            progressInfo.style.display = 'block';
        } else {
            progressInfo.innerHTML = `
                <div class="info-badge warning">
                    <span class="badge-icon">ℹ️</span>
                    <strong>${currentSubject} - ${previousTestName}</strong> sonucunuz bulunamadı.
                    <br>
                    <em>İlerleme karşılaştırması yapılamayacak.</em>
                </div>
            `;
            progressInfo.style.display = 'block';
        }
    } else {
        progressInfo.innerHTML = `
            <div class="info-badge success">
                <span class="badge-icon">🎯</span>
                Bu ilk testiniz! Başarılar dileriz.
            </div>
        `;
        progressInfo.style.display = 'block';
    }
}

/**
 * Mevcut test için session key oluşturur
 * @returns {string} Session key (örn: 'Matematik-Test 1')
 */
function getSessionKey() {
    return `${currentSubject}-${currentTest}`;
}

/**
 * Kullanıcı cevaplarını session'a kaydeder
 * @param {number} questionNumber - Soru numarası
 * @param {string} value - Cevap ('correct' veya 'wrong')
 */
function saveAnswerToSession(questionNumber, value) {
    const sessionKey = getSessionKey();
    
    if (!USER_ANSWERS_SESSION[sessionKey]) {
        USER_ANSWERS_SESSION[sessionKey] = {};
    }
    
    USER_ANSWERS_SESSION[sessionKey][questionNumber] = value;
    console.log(`💾 Cevap kaydedildi: ${sessionKey} - Soru ${questionNumber}: ${value}`);
}

/**
 * Session'dan kaydedilmiş cevapları yükler
 * @returns {Object} Kaydedilmiş cevaplar veya boş obje
 */
function loadAnswersFromSession() {
    const sessionKey = getSessionKey();
    return USER_ANSWERS_SESSION[sessionKey] || {};
}

/**
 * Tüm mevcut cevapları session'a toplu kaydet
 */
function saveAllAnswersToSession() {
    const sessionKey = getSessionKey();
    const totalQuestions = testQuestionMap.length;
    
    if (!USER_ANSWERS_SESSION[sessionKey]) {
        USER_ANSWERS_SESSION[sessionKey] = {};
    }
    
    for (let i = 1; i <= totalQuestions; i++) {
        const selectedRadio = document.querySelector(`input[name="question${i}"]:checked`);
        if (selectedRadio) {
            USER_ANSWERS_SESSION[sessionKey][i] = selectedRadio.value;
        }
    }
    
    console.log(`💾 Tüm cevaplar kaydedildi: ${sessionKey}`, USER_ANSWERS_SESSION[sessionKey]);
}

/**
 * LLM analiz sonucunu cache'e kaydeder
 * @param {string} htmlContent - Kaydedilecek HTML içeriği
 */
function saveAnalysisToCache(htmlContent) {
    const sessionKey = getSessionKey();
    LLM_ANALYSIS_CACHE[sessionKey] = htmlContent;
    console.log(`🧠 Analiz sonucu cache'e kaydedildi: ${sessionKey}`);
}

/**
 * Cache'den analiz sonucunu yükler
 * @returns {string|null} Kaydedilmiş analiz HTML'i veya null
 */
function loadAnalysisFromCache() {
    const sessionKey = getSessionKey();
    return LLM_ANALYSIS_CACHE[sessionKey] || null;
}

/**
 * Test formunu dinamik olarak oluşturur
 * Daha önce kaydedilmiş cevaplar varsa onları yükler
 */
function renderTestForm() {
    const container = document.getElementById('test-form-container');
    const testTitle = document.getElementById('test-title');
    
    container.innerHTML = '';
    testTitle.textContent = `${currentSubject} - ${currentTest} Sonuçları`;
    
    // Kaydedilmiş cevapları yükle
    const savedAnswers = loadAnswersFromSession();
    const hasSavedAnswers = Object.keys(savedAnswers).length > 0;
    
    if (hasSavedAnswers) {
        console.log(`📂 Kaydedilmiş cevaplar yükleniyor: ${getSessionKey()}`, savedAnswers);
    }
    
    testQuestionMap.forEach((topic, index) => {
        const questionNumber = index + 1;
        
        // Kaydedilmiş cevap var mı kontrol et
        const savedAnswer = savedAnswers[questionNumber] || 'correct'; // Varsayılan: correct
        
        // Soru satırı
        const rowDiv = document.createElement('div');
        rowDiv.className = 'question-row';
        
        // Soru etiketi
        const labelDiv = document.createElement('div');
        labelDiv.className = 'question-label';
        labelDiv.innerHTML = `
            <span class="question-number">Soru ${questionNumber}:</span>
            ${topic}
        `;
        
        // Radio butonları
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-group';
        
        // Doğru radio
        const correctOption = document.createElement('div');
        correctOption.className = 'radio-option';
        correctOption.innerHTML = `
            <input type="radio" id="q${questionNumber}-correct" 
                   name="question${questionNumber}" 
                   value="correct" 
                   ${savedAnswer === 'correct' ? 'checked' : ''}>
            <label for="q${questionNumber}-correct">Doğru</label>
        `;
        
        // Yanlış radio
        const wrongOption = document.createElement('div');
        wrongOption.className = 'radio-option';
        wrongOption.innerHTML = `
            <input type="radio" id="q${questionNumber}-wrong" 
                   name="question${questionNumber}" 
                   value="wrong"
                   ${savedAnswer === 'wrong' ? 'checked' : ''}>
            <label for="q${questionNumber}-wrong">Yanlış</label>
        `;
        
        radioGroup.appendChild(correctOption);
        radioGroup.appendChild(wrongOption);
        
        rowDiv.appendChild(labelDiv);
        rowDiv.appendChild(radioGroup);
        
        container.appendChild(rowDiv);
    });
    
    // Test bölümünü göster
    document.getElementById('test-section').style.display = 'block';
    document.getElementById('action-section').style.display = 'block';
    
    // Radio butonlara change event listener ekle
    attachRadioListeners();
    
    // Kaydedilmiş analiz sonucunu yükle
    loadAndDisplayCachedAnalysis();
}

/**
 * Radio butonlara change event listener'ı ekler
 */
function attachRadioListeners() {
    const totalQuestions = testQuestionMap.length;
    
    for (let i = 1; i <= totalQuestions; i++) {
        const radios = document.querySelectorAll(`input[name="question${i}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                saveAnswerToSession(i, this.value);
            });
        });
    }
}

/**
 * Cache'den kaydedilmiş analiz sonucunu yükler ve gösterir
 */
function loadAndDisplayCachedAnalysis() {
    const resultsContainer = document.getElementById('results-container');
    const cachedAnalysis = loadAnalysisFromCache();
    
    if (cachedAnalysis) {
        resultsContainer.innerHTML = cachedAnalysis;
        console.log(`📂 Kaydedilmiş analiz yüklendi: ${getSessionKey()}`);
    } else {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666; font-style: italic;">
                💡 Analizi başlatmak için "Gemma ile Analiz Et" butonuna tıklayın.
            </div>
        `;
    }
}

// ==================== VERİ TOPLAMA VE ANALİZ ====================

/**
 * Kullanıcı girişlerini toplar ve alt konulara göre analiz eder
 * @returns {Object} Alt konu bazında analiz sonuçları
 */
function collectAndAnalyzeData() {
    const analysis = {};
    let totalCorrect = 0;
    let totalQuestions = testQuestionMap.length;
    
    // Her alt konu için başlangıç değerleri
    currentTopics.forEach(topic => {
        analysis[topic] = {
            total: 0,
            correct: 0,
            wrong: 0,
            percentage: 0
        };
    });
    
    // Her soruyu kontrol et
    testQuestionMap.forEach((topic, index) => {
        const questionNumber = index + 1;
        const selectedValue = document.querySelector(
            `input[name="question${questionNumber}"]:checked`
        ).value;
        
        analysis[topic].total++;
        
        if (selectedValue === 'correct') {
            analysis[topic].correct++;
            totalCorrect++;
        } else {
            analysis[topic].wrong++;
        }
    });
    
    // Yüzdeleri hesapla
    Object.keys(analysis).forEach(topic => {
        if (analysis[topic].total > 0) {
            analysis[topic].percentage = 
                Math.round((analysis[topic].correct / analysis[topic].total) * 100);
        }
    });
    
    return {
        byTopic: analysis,
        totalCorrect: totalCorrect,
        totalQuestions: totalQuestions,
        overallPercentage: Math.round((totalCorrect / totalQuestions) * 100)
    };
}

// ==================== PROMPT HAZIRLAMA ====================

/**
 * Gemma modeli için Türkçe, yapıcı prompt oluşturur
 * İlerleme karşılaştırması varsa ekler ve 1 haftalık çalışma programı talep eder
 * @param {Object} currentAnalysis - Mevcut test analizi
 * @param {Object} previousAnalysis - Önceki test analizi (varsa)
 * @returns {string} LLM için hazırlanmış prompt
 */
function generateLlmPrompt(currentAnalysis, previousAnalysis = null) {
    let prompt = `Sen bir eğitim koçusun. Bir öğrencinin ${currentSubject} dersindeki ${currentTest} performansını analiz ediyorsun.\n\n`;
    
    prompt += `**MEVCUT TEST SONUÇLARI (${currentTest}):**\n`;
    prompt += `Genel Başarı: ${currentAnalysis.totalCorrect}/${currentAnalysis.totalQuestions} doğru (${currentAnalysis.overallPercentage}%)\n\n`;
    
    prompt += `Alt Konulara Göre Performans:\n`;
    Object.keys(currentAnalysis.byTopic).forEach(topic => {
        const data = currentAnalysis.byTopic[topic];
        prompt += `- ${topic}: ${data.correct}/${data.total} doğru (${data.percentage}%)\n`;
    });
    
    // Önceki test varsa karşılaştırma ekle
    if (previousAnalysis) {
        prompt += `\n**ÖNCEKİ TEST SONUÇLARI (${getPreviousTestName(currentTest)}):**\n`;
        prompt += `Genel Başarı: ${previousAnalysis.correctAnswers}/${previousAnalysis.totalQuestions} doğru\n\n`;
        
        prompt += `Önceki Test Alt Konu Performansı:\n`;
        Object.keys(previousAnalysis.analysis.byTopic).forEach(topic => {
            const data = previousAnalysis.analysis.byTopic[topic];
            prompt += `- ${topic}: ${data.correct}/${data.total} doğru (${data.percentage}%)\n`;
        });
        
        prompt += `\n**ÖNEMLİ:** Önceki teste göre hangi konularda ilerleme kaydedildiğini, hangi konularda gerileme olduğunu MUTLAKA belirt ve bu karşılaştırmaya özel çalışma önerileri sun.\n\n`;
    }
    
    prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    prompt += `\nLütfen bu sonuçlara göre öğrenciye Türkçe, yapıcı ve motive edici bir geri bildirim ver.\n`;
    prompt += `Geri bildirimini şu başlıklar altında sun:\n\n`;
    
    prompt += `**1. GENEL DEĞERLENDİRME:**\n`;
    prompt += `Öğrencinin genel performansı hakkında 2-3 cümle.${previousAnalysis ? ' Önceki teste göre genel ilerleme durumunu mutlaka değerlendir.' : ''}\n\n`;
    
    prompt += `**2. GÜÇLÜ YÖNLER:**\n`;
    prompt += `Öğrencinin başarılı olduğu konuları vurgula.${previousAnalysis ? ' İlerleyen konuları özellikle belirt.' : ''}\n\n`;
    
    prompt += `**3. GELİŞTİRİLMESİ GEREKEN ALANLAR:**\n`;
    prompt += `Hangi konularda daha fazla çalışması gerektiğini belirt.${previousAnalysis ? ' Gerileme gösteren konuları özellikle vurgula.' : ''}\n\n`;
    
    // Zayıf konuları tespit et
    const weakTopics = Object.keys(currentAnalysis.byTopic)
        .map(topic => ({
            name: topic,
            percentage: currentAnalysis.byTopic[topic].percentage,
            correct: currentAnalysis.byTopic[topic].correct,
            total: currentAnalysis.byTopic[topic].total
        }))
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3);
    
    prompt += `**4. KİŞİSELLEŞTİRİLMİŞ 1 HAFTALIK ÇALIŞMA PROGRAMI:**\n\n`;
    prompt += `Öğrencinin en zayıf olduğu konulara odaklanarak (özellikle: ${weakTopics.map(t => t.name).join(', ')}), `;
    prompt += `günde 1-2 saatlik çalışma süresini kapsayan, 7 günlük detaylı bir çalışma programı hazırla.\n\n`;
    
    prompt += `Program şu kriterlere uymalı:\n`;
    prompt += `- Her gün için spesifik konu ve hedef belirle\n`;
    prompt += `- Zayıf konulara öncelik ver\n`;
    prompt += `- Gerçekçi ve uygulanabilir hedefler koy (örn: "50 soru çöz", "3 video izle", "10 örnek uygulama yap")\n`;
    prompt += `- Hafta sonu hafif bir tekrar/pekiştirme günü ekle\n`;
    prompt += `- Kolay okunabilir tablo veya madde işaretli liste formatında sun\n\n`;
    
    prompt += `Örnek Format:\n`;
    prompt += `📅 **PAZARTESİ**\n`;
    prompt += `   • Konu: [Zayıf konu adı]\n`;
    prompt += `   • Hedef: [Spesifik çalışma hedefi]\n`;
    prompt += `   • Süre: 1-2 saat\n\n`;
    
    prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    prompt += `Samimi, teşvik edici ve profesyonel bir dil kullan. Öğrenciyi motive et!`;
    
    return prompt;
}

// ==================== OLLAMA API ÇAĞRISI ====================

/**
 * Ollama API'yi kullanarak Gemma modelinden analiz alır
 * @param {Object} currentAnalysis - Mevcut test analizi
 */
async function analyzeResultsWithGemma(currentAnalysis) {
    const resultsContainer = document.getElementById('results-container');
    const analyzeButton = document.getElementById('analyze-button');
    
    // Loading göster
    resultsContainer.innerHTML = '<div class="loading">Gemma analiz yapıyor ve ilerlemenizi değerlendiriyor</div>';
    analyzeButton.disabled = true;
    
    try {
        // Önceki test sonucunu kontrol et
        const previousTestName = getPreviousTestName(currentTest);
        let previousResult = null;
        
        if (previousTestName) {
            previousResult = loadPreviousTestResult(currentSubject, previousTestName);
        }
        
        // Prompt oluştur
        const prompt = generateLlmPrompt(currentAnalysis, previousResult);
        
        // Ollama API'ye istek gönder
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gemma3n:latest',
                prompt: prompt,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Hatası: ${response.status}`);
        }
        
        const data = await response.json();
        const llmResponse = data.response;
        
        // Sonucu localStorage'a kaydet
        saveTestResult({
            subject: currentSubject,
            testName: currentTest,
            analysis: currentAnalysis,
            totalQuestions: currentAnalysis.totalQuestions,
            correctAnswers: currentAnalysis.totalCorrect
        });
        
        // Karşılaştırma bilgisi ekle (varsa)
        let comparisonHtml = '';
        if (previousResult) {
            const currentPercentage = currentAnalysis.overallPercentage;
            const previousPercentage = Math.round((previousResult.correctAnswers / previousResult.totalQuestions) * 100);
            const difference = currentPercentage - previousPercentage;
            
            const icon = difference > 0 ? '📈' : difference < 0 ? '📉' : '➡️';
            const colorClass = difference > 0 ? 'success' : difference < 0 ? 'warning' : 'neutral';
            
            comparisonHtml = `
                <div class="comparison-badge ${colorClass}">
                    <span class="badge-icon">${icon}</span>
                    <strong>İlerleme Karşılaştırması:</strong><br>
                    ${previousTestName}: ${previousPercentage}% → ${currentTest}: ${currentPercentage}%
                    ${difference !== 0 ? `(${difference > 0 ? '+' : ''}${difference}%)` : '(Değişim yok)'}
                </div>
            `;
        }
        
        // Sonucu HTML olarak hazırla
        const resultHtml = `
            ${comparisonHtml}
            <div class="llm-feedback-box">
                <h3>Gemma AI Koçunuz</h3>
                <p>${llmResponse}</p>
            </div>
            <div class="save-confirmation">
                ✅ Test sonucunuz kaydedildi! Bir sonraki testte ilerlemeniz karşılaştırılacak.
            </div>
        `;
        
        // Sonucu göster
        resultsContainer.innerHTML = resultHtml;
        
        // Analiz sonucunu cache'e kaydet
        saveAnalysisToCache(resultHtml);
        
    } catch (error) {
        console.error('Ollama API Hatası:', error);
        
        // Hata mesajı göster
        resultsContainer.innerHTML = `
            <div class="weak">
                <h3>Bağlantı Hatası</h3>
                <p>
                    <strong>Ollama servisine bağlanılamadı.</strong><br><br>
                    
                    Lütfen aşağıdaki adımları kontrol edin:<br>
                    1. Ollama'nın yüklü ve çalışıyor olduğundan emin olun<br>
                    2. Terminal'de Ollama zaten çalışıyor olmalı (port 11434)<br>
                    3. <code>ollama pull gemma3n:latest</code> komutu ile modeli indirin<br>
                    4. Bu sayfayı yenileyin ve tekrar deneyin<br><br>
                    
                    <em>Hata Detayı: ${error.message}</em>
                </p>
            </div>
        `;
    } finally {
        analyzeButton.disabled = false;
    }
}

// ==================== OLAY YÖNETİMİ ====================

/**
 * Ders seçimi değiştiğinde çalışır
 */
function handleSubjectChange() {
    const subjectSelect = document.getElementById('subject-select');
    const loadButton = document.getElementById('load-test-button');
    
    currentSubject = subjectSelect.value;
    
    if (currentSubject) {
        populateTestSelect(currentSubject);
        loadButton.disabled = true;
    } else {
        populateTestSelect(null);
        loadButton.disabled = true;
    }
    
    // Test bölümünü gizle
    document.getElementById('test-section').style.display = 'none';
    document.getElementById('action-section').style.display = 'none';
    document.getElementById('results-container').innerHTML = '';
    document.getElementById('progress-info').style.display = 'none';
}

/**
 * Test seçimi değiştiğinde çalışır
 */
function handleTestChange() {
    const testSelect = document.getElementById('test-select');
    const loadButton = document.getElementById('load-test-button');
    
    currentTest = testSelect.value;
    
    if (currentTest) {
        loadButton.disabled = false;
    } else {
        loadButton.disabled = true;
    }
}

/**
 * Test yükle butonuna tıklanınca çalışır
 */
function handleLoadTest() {
    if (!currentSubject || !currentTest) {
        alert('Lütfen önce ders ve test seçin!');
        return;
    }
    
    // Alt konuları al
    currentTopics = SUBJECT_DATA[currentSubject].topics;
    const totalQuestions = SUBJECT_DATA[currentSubject].tests[currentTest];
    
    // Soru haritası oluştur
    generateQuestionMap(currentTopics, totalQuestions);
    
    // İlerleme bilgisini göster
    showProgressInfo();
    
    // Formu render et
    renderTestForm();
    
    console.log('🎯 Test yüklendi:', currentSubject, currentTest);
    console.log('📊 Soru Haritası:', testQuestionMap);
}

/**
 * Analiz butonuna tıklanınca çalışır
 */
function handleAnalyzeClick() {
    // Önce tüm cevapları session'a kaydet
    saveAllAnswersToSession();
    
    // Veriyi topla ve analiz et
    const analysis = collectAndAnalyzeData();
    
    // Gemma ile analiz yap
    analyzeResultsWithGemma(analysis);
}

// ==================== SAYFA YÜKLENME ====================

document.addEventListener('DOMContentLoaded', () => {
    // Ders seçimini doldur
    populateSubjectSelect();
    
    // Event listener'ları ekle
    document.getElementById('subject-select').addEventListener('change', handleSubjectChange);
    document.getElementById('test-select').addEventListener('change', handleTestChange);
    document.getElementById('load-test-button').addEventListener('click', handleLoadTest);
    document.getElementById('analyze-button').addEventListener('click', handleAnalyzeClick);
    
    console.log('🚀 Gemma AI Eğitim Koçu hazır!');
    console.log('📚 Mevcut Dersler:', Object.keys(SUBJECT_DATA));
    
    // Debug için: Tüm kayıtları görmek isterseniz
    // console.log('💾 localStorage:', localStorage);
});
