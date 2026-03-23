![libre-akademi](https://github.com/Reend21/libre-akademi/blob/saglam/libre-akademi-minimal.jpg)
# libre akademi
Topluluk tarafından oluşturulmuş teknoloji kursları için aracı olan açık kaynak bir çevrimiçi öğrenme platformu.

libre-akademi topluluk tarafından oluşturulmuş, programlama, işletim sistemleri, arduino, yapay zeka, yazılım ve daha bir çok kategoride oluşturulan kurslar barındıran bir çevrimiçi öğrenme platformudur.  
Kullanıcılar libre-akademi'de kursları tamamlayabilir, profillerini özelleştirebilir, kurslara puan verebilir veya dilerlerse kendileri bir kurs yayınlayabilir. **libre akademi** olarak önceliklerimiz şunlardır: 

- AGPL Lisansı ile tamamen özgür yazılım olup kullanıcılara şeffaf bir deneyim sunmak
- Kullanıcılara hızlı ve pratik bir arayüz sunmak
- Kullanıcı deneyimine önem vermek ve site üzerindeki geliştirmeleri bunları göz önünde bulunarak yapmak
- Sitede reklam ve izleyici barındırmamak
- Kullanıcıları öğrenmeye teşvik etmek

## Geliştirmeye katkı sağlamak
libre akademi'nin gelişimine katkı sağlamak isityorsanız aşağıdaki adımları takip edebilirsiniz.
1. Depoyu Klonlamak

Projeyi kendi bilgisayarına almak için:

git clone https://github.com/Reend21/libre-akademi.git
cd proje-adi

2. Bağımlılıkları Yüklemek

npm install

3. Geliştirme Ortamını Çalıştırmak

Projeyi localde çalıştırmak için:

npm run serve

4. Prod Build Almak

Projeyi üretim ortamı için build etmek:

npm run build

5. Katkıda Bulunmak

Projeye katkı sağlamak için önerilen yol şudur:

Yeni branch aç:
git checkout -b ozellik-ismi
Değişiklikleri yap.
Commit et:
git add .
git commit -m "Yeni özellik eklendi: X"
Branch’i remote’a gönder ve pull request oluştur:
git push origin ozellik-ismi
6. Ek Notlar
Eğer proje .env.example dosyası içeriyorsa, bunu .env olarak kopyalayın ve gerekli API anahtarlarını girin.

## Lisans
libre-akademi **GNU Affero General Public License | AGPL-3.0-or-later** ile lisanslanmıştır bir özgür yazılımdır. Lisans anlaşmasını okumak için **LICENSE.md**'yi inceleyin.
