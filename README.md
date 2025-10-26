# 🎓 Gemma AI Eğitim Koçu

> **Yapay Zeka Destekli Kişiselleştirilmiş Öğrenme Asistanı**

Gemma AI Eğitim Koçu, öğrencilerin test performanslarını analiz ederek **yerel olarak çalışan yapay zeka** ile tamamen kişiselleştirilmiş eğitim geri bildirimi ve 1 haftalık çalışma programı oluşturan yenilikçi bir web uygulamasıdır.

## 🌟 Projenin Amacı

Eğitimde bireyselleştirilmiş öğrenme deneyimi sunmak, her öğrencinin güçlü ve zayıf yönlerini belirleyerek **hedef odaklı çalışma stratejileri** geliştirmelerini sağlamaktır. Proje, **gizlilik odaklı** ve **düşük donanım gereksinimli** bir çözüm sunarak, internet bağlantısı olmadan bile çalışabilir.

---

## ✨ Öne Çıkan Özellikler

### 🤖 **Yerel Yapay Zeka Entegrasyonu**
- **Gemma 2B** modeli ile %100 yerel çalışma
- İnternet bağlantısı gerektirmez
- Öğrenci verileri sunuculara gönderilmez (gizlilik garantisi)
- Düşük donanım gereksinimi (CPU üzerinde çalışabilir)

### 📊 **Akıllı Konu Analizi**
- 4 farklı ders desteği: Matematik, Türkçe, Tarih, Coğrafya
- Her derste 3 test (toplam 12 test)
- Alt konu bazında detaylı performans analizi
- Testler arası ilerleme karşılaştırması

### 📅 **Kişiselleştirilmiş Çalışma Programı**
- Zayıf olunan konulara odaklanan 7 günlük plan
- Günlük hedefler ve spesifik çalışma önerileri
- Gerçekçi ve uygulanabilir program yapısı
- Öğrenci motivasyonunu artıran yapıcı geri bildirim

### 💾 **Akıllı Veri Yönetimi**
- Oturum bazlı cevap hafızası (testler arası geçişte kaybolmaz)
- Analiz sonuçlarının otomatik cache'lenmesi
- localStorage ile kalıcı ilerleme takibi
- Tarayıcı yenilense bile veriler korunur

### 🎨 **Modern ve Kullanıcı Dostu Arayüz**
- Minimalist ve sezgisel tasarım
- Responsive yapı (mobil uyumlu)
- Gerçek zamanlı form validasyonu
- Görsel geri bildirimler ve animasyonlar

---

## 🚀 Kurulum

### Ön Gereksinimler

1. **Ollama Kurulumu**
   
   Ollama'yı resmi websitesinden indirin ve kurun:
   ```bash
   # macOS / Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Windows
   # https://ollama.com/download adresinden installer'ı indirin
   ```

2. **Gemma 2B Modelini İndirin**
   
   Terminal'de şu komutu çalıştırın:
   ```bash
   ollama pull gemma3n:latest
   ```
   
   > **Not:** İlk indirme yaklaşık 2-3 GB olacaktır. Sabırlı olun! 😊

### Projeyi Çalıştırma

1. **Repository'yi Klonlayın**
   ```bash
   git clone https://github.com/Harungokce/Cursor_project.git
   cd Cursor_project
   ```

2. **Ollama Servisini Başlatın**
   ```bash
   ollama serve
   ```
   
   > **İpucu:** Eğer `address already in use` hatası alırsanız, Ollama zaten çalışıyor demektir. Bu adımı atlayın! ✅

3. **Web Sunucusunu Başlatın**
   
   Yeni bir terminal penceresi açın ve şu komutlardan birini çalıştırın:
   
   ```bash
   # Python 3 kullanarak
   python3 -m http.server 8000
   
   # Alternatif: Node.js serve paketi
   npx serve .
   
   # Alternatif: PHP kullanarak
   php -S localhost:8000
   ```

4. **Tarayıcınızı Açın**
   
   Adres çubuğuna şunu yazın:
   ```
   http://localhost:8000
   ```

🎉 **Tebrikler!** Gemma AI Eğitim Koçu artık çalışıyor!

---

## 📖 Nasıl Kullanılır?

### Adım 1️⃣: Ders ve Test Seçimi
1. Ana sayfada **"Ders Seçin"** dropdown'undan dersinizi seçin (örn: Matematik)
2. **"Test Seçin"** dropdown'undan test numaranızı seçin (örn: Test 1)
3. **"✅ Testi Yükle"** butonuna tıklayın

### Adım 2️⃣: Test Sonuçlarını Girin
- Ekranda 20 soru görünecektir
- Her soru için **"Doğru"** veya **"Yanlış"** seçeneğini işaretleyin
- Cevaplarınız otomatik olarak kaydedilir (test değiştirseniz bile kaybolmaz!)

### Adım 3️⃣: Analiz ve Geri Bildirim
1. **"🤖 Gemma ile Analiz Et"** butonuna tıklayın
2. Yapay zeka analizi başlatılır (bu birkaç saniye sürebilir ⏳)
3. Aşağıdaki bölümler görüntülenir:
   - ✅ **Genel Değerlendirme**: Performans özeti
   - 💪 **Güçlü Yönler**: Başarılı olunan konular
   - 📈 **Geliştirilmesi Gereken Alanlar**: Çalışılması gereken konular
   - 📅 **1 Haftalık Çalışma Programı**: Kişiselleştirilmiş detaylı plan

### Adım 4️⃣: İlerleme Takibi
- Test 2 ve Test 3'ü çözdüğünüzde, önceki testlerle **otomatik karşılaştırma** yapılır
- İlerlemeleriniz ve gerilemeleriniz detaylı olarak gösterilir
- Testler arası geçiş yaptığınızda tüm analizler korunur 🔒

---

## 🛠️ Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| **AI Model** | Gemma 3N (2B parametreli) |
| **AI Runtime** | Ollama |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **API** | Fetch API (REST) |
| **Veri Saklama** | localStorage + Session Memory |
| **Sunucu** | Python HTTP Server / Node.js Serve |

---

## 💡 Avantajlar

### 🔒 **Gizlilik ve Güvenlik**
- Tüm verileriniz cihazınızda kalır
- İnternet bağlantısı gerektirmez
- Üçüncü parti sunuculara veri gönderilmez

### ⚡ **Performans**
- Yerel çalışma sayesinde hızlı yanıt süreleri
- Düşük donanım gereksinimi (4GB RAM yeterli)
- GPU gerektirmez (CPU ile çalışır)

### 🌍 **Erişilebilirlik**
- Çevrimdışı kullanım desteği
- Ücretsiz ve açık kaynak
- Platform bağımsız (Windows, macOS, Linux)

### 🎯 **Eğitimsel Değer**
- Bireyselleştirilmiş öğrenme deneyimi
- Hedef odaklı çalışma stratejileri
- Sürekli ilerleme takibi
- Motivasyon artırıcı geri bildirimler

---

## 📊 Proje İstatistikleri

```
📚 Dersler: 4 (Matematik, Türkçe, Tarih, Coğrafya)
📝 Testler: 12 (Her derste 3 test)
❓ Sorular: 240 (Her test 20 soru)
🎯 Alt Konular: 60 (Her derste 15 konu)
💾 Kod Satırları: 1440+
🤖 AI Model Boyutu: ~2 GB
```

---

## 🎥 Demo ve Ekran Görüntüleri

### Ana Sayfa
Ders ve test seçim arayüzü ile kullanıcı dostu tasarım.

### Analiz Sonuçları
Gemma AI tarafından oluşturulan detaylı geri bildirim ve çalışma programı.

### İlerleme Karşılaştırması
Testler arası performans karşılaştırması ile ilerleme takibi.

---

## 🔮 Gelecek Planları

- [ ] Daha fazla ders ve konu eklenmesi
- [ ] PDF rapor oluşturma özelliği
- [ ] Soru bankası entegrasyonu
- [ ] Öğretmen paneli (sınıf yönetimi)
- [ ] Grafik ve istatistik gösterimleri
- [ ] Çoklu dil desteği
- [ ] Gemma 7B model desteği (daha detaylı analizler)

---

## 🤝 Katkıda Bulunma

Bu proje açık kaynak ve katkılara açıktır! Katkıda bulunmak için:

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

---

## 👨‍💻 Geliştirici

**Harun Gökçe**

- 📧 Email: [İletişim için GitHub profilinden ulaşabilirsiniz]
- 🐙 GitHub: [@Harungokc](https://github.com/Harungokc)
- 🔗 Repository: [Cursor_project](https://github.com/Harungokc/Cursor_project)

---

## 🙏 Teşekkürler

- **Google DeepMind** - Gemma modeli için
- **Ollama Team** - Yerel AI runtime için
- **Hackathon Organizatörleri** - Bu projeyi geliştirme fırsatı için

---

## 🐛 Sorun Bildirimi

Bir hata mı buldunuz? Öneriniz mi var?

[Issue açın](https://github.com/Harungokc/Cursor_project/issues) ve bize bildirin!

---

## ⭐ Destek

Eğer bu projeyi beğendiyseniz, lütfen GitHub'da bir ⭐ vererek destek olun!

---

<div align="center">

**🚀 Gemma AI Eğitim Koçu ile Öğrenme Yolculuğunuzu Başlatın! 🎓**

Made with ❤️ for Students

</div>

