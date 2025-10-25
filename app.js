// ==================== VERİ TANIMLAMA ====================

// 5 Farklı Alt Konu (Matematik - Üslü Sayılar örneği)
const SUB_TOPICS = [
    'Üslü Sayılarda Toplama',
    'Üslü Sayılarda Çarpma',
    'Üslü Sayılarda Bölme',
    'Üslü Sayılarda Üs Alma',
    'Üslü Sayılarda Karma İşlemler'
];

const TOTAL_QUESTIONS = 20;

// Her sorunun hangi alt konuya ait olduğunu belirten harita
let testQuestionMap = [];

// ==================== SORU HARİTASI OLUŞTURMA ====================

/**
 * 20 soruyu 5 alt konuya rastgele dağıtır
 */
function generateQuestionMap() {
    testQuestionMap = [];
    
    // Her konuya en az 2-3 soru düşmesini sağla
    const minPerTopic = Math.floor(TOTAL_QUESTIONS / SUB_TOPICS.length);
    const remaining = TOTAL_QUESTIONS % SUB_TOPICS.length;
    
    // Her konuya minimum sayıda soru ata
    SUB_TOPICS.forEach(topic => {
        for (let i = 0; i < minPerTopic; i++) {
            testQuestionMap.push(topic);
        }
    });
    
    // Kalan soruları rastgele dağıt
    for (let i = 0; i < remaining; i++) {
        const randomTopic = SUB_TOPICS[Math.floor(Math.random() * SUB_TOPICS.length)];
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
 * Test formunu dinamik olarak oluşturur
 */
function renderTestForm() {
    const container = document.getElementById('test-form-container');
    container.innerHTML = '';
    
    testQuestionMap.forEach((topic, index) => {
        const questionNumber = index + 1;
        
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
                   checked>
            <label for="q${questionNumber}-correct">Doğru</label>
        `;
        
        // Yanlış radio
        const wrongOption = document.createElement('div');
        wrongOption.className = 'radio-option';
        wrongOption.innerHTML = `
            <input type="radio" id="q${questionNumber}-wrong" 
                   name="question${questionNumber}" 
                   value="wrong">
            <label for="q${questionNumber}-wrong">Yanlış</label>
        `;
        
        radioGroup.appendChild(correctOption);
        radioGroup.appendChild(wrongOption);
        
        rowDiv.appendChild(labelDiv);
        rowDiv.appendChild(radioGroup);
        
        container.appendChild(rowDiv);
    });
}

// ==================== VERİ TOPLAMA VE ANALİZ ====================

/**
 * Kullanıcı girişlerini toplar ve alt konulara göre analiz eder
 * @returns {Object} Alt konu bazında analiz sonuçları
 */
function collectAndAnalyzeData() {
    const analysis = {};
    
    // Her alt konu için başlangıç değerleri
    SUB_TOPICS.forEach(topic => {
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
    
    return analysis;
}

// ==================== PROMPT HAZIRLAMA ====================

/**
 * Gemma modeli için Türkçe, yapıcı prompt oluşturur
 * @param {Object} analysis - Alt konu bazında analiz sonuçları
 * @returns {string} LLM için hazırlanmış prompt
 */
function generateLlmPrompt(analysis) {
    let prompt = `Sen bir eğitim koçusun. Bir öğrencinin matematik testindeki performansını analiz ediyorsun. 
Aşağıda öğrencinin alt konulara göre test sonuçları var:

`;
    
    // Her alt konu için detayları ekle
    Object.keys(analysis).forEach(topic => {
        const data = analysis[topic];
        prompt += `- ${topic}: ${data.correct}/${data.total} doğru (${data.percentage}%)\n`;
    });
    
    prompt += `
Lütfen bu sonuçlara göre öğrenciye Türkçe, yapıcı ve motive edici bir geri bildirim ver. 
Geri bildirimini şu üç başlık altında sun:

1. **Genel Değerlendirme:** Öğrencinin genel performansı hakkında 2-3 cümle.
2. **Güçlü Yönler:** Öğrencinin başarılı olduğu konuları vurgula.
3. **Çalışma Tavsiyesi:** Hangi konularda daha fazla çalışması gerektiğini ve nasıl çalışabileceğini öner.

Samimi, teşvik edici ve profesyonel bir dil kullan.`;
    
    return prompt;
}

// ==================== OLLAMA API ÇAĞRISI ====================

/**
 * Ollama API'yi kullanarak Gemma modelinden analiz alır
 * @param {Object} analysis - Alt konu bazında analiz sonuçları
 */
async function analyzeResultsWithGemma(analysis) {
    const resultsContainer = document.getElementById('results-container');
    const analyzeButton = document.getElementById('analyze-button');
    
    // Loading göster
    resultsContainer.innerHTML = '<div class="loading">Gemma analiz yapıyor</div>';
    analyzeButton.disabled = true;
    
    try {
        const prompt = generateLlmPrompt(analysis);
        
        // Ollama API'ye istek gönder
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gemma:2b',
                prompt: prompt,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Hatası: ${response.status}`);
        }
        
        const data = await response.json();
        const llmResponse = data.response;
        
        // Sonucu göster
        resultsContainer.innerHTML = `
            <div class="llm-feedback-box">
                <h3>Gemma AI Koçunuz</h3>
                <p>${llmResponse}</p>
            </div>
        `;
        
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
                    2. Terminal'de <code>ollama serve</code> komutunu çalıştırın<br>
                    3. <code>ollama pull gemma:2b</code> komutu ile modeli indirin<br>
                    4. Bu sayfayı yenileyin ve tekrar deneyin<br><br>
                    
                    <em>Hata Detayı: ${error.message}</em>
                </p>
            </div>
        `;
    } finally {
        analyzeButton.disabled = false;
    }
}

// ==================== ANA AKIŞ ====================

/**
 * Analiz butonuna tıklanınca çalışır
 */
function handleAnalyzeClick() {
    // Veriyi topla ve analiz et
    const analysis = collectAndAnalyzeData();
    
    // Gemma ile analiz yap
    analyzeResultsWithGemma(analysis);
}

// ==================== SAYFA YÜKLENME ====================

document.addEventListener('DOMContentLoaded', () => {
    // Soru haritasını oluştur
    generateQuestionMap();
    
    // Test formunu render et
    renderTestForm();
    
    // Buton event listener'ı ekle
    const analyzeButton = document.getElementById('analyze-button');
    analyzeButton.addEventListener('click', handleAnalyzeClick);
    
    console.log('🚀 Gemma AI Eğitim Koçu hazır!');
    console.log('📊 Soru Haritası:', testQuestionMap);
});
