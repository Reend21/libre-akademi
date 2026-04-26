![libre-akademi](https://github.com/Reend21/libre-akademi/blob/saglam/client/src/assets/logos/libre-akademi.png)
# libre akademi
Topluluk tarafından oluşturulmuş teknoloji kursları için aracı olan açık kaynak bir çevrimiçi öğrenme platformu.

**libre-akademi** topluluk tarafından oluşturulmuş, **programlama, işletim sistemleri, arduino, yapay zeka, yazılım** ve daha bir çok kategoride oluşturulan kurslar barındıran bir çevrimiçi öğrenme platformudur.  
Kullanıcılar **libre-akademi**'de kursları tamamlayabilir, profillerini özelleştirebilir, kurslara puan verebilir veya dilerlerse kendileri bir kurs yayınlayabilir. **libre akademi** olarak önceliklerimiz şunlardır: 

- **AGPL Lisansı** ile tamamen özgür yazılım olup kullanıcılara şeffaf bir deneyim sunmak
- Kullanıcılara **hızlı ve pratik** bir arayüz sunmak
- **Kullanıcı deneyimine önem vermek** ve site üzerindeki geliştirmeleri bunları göz önünde bulunarak yapmak
- Sitede **reklam ve izleyici barındırmamak**
- Kullanıcıları **öğrenmeye teşvik** etmek

## Geliştirmeye katkı sağlamak
libre akademi'nin gelişimine katkı sağlamak isityorsanız aşağıdaki adımları takip edebilirsiniz.

Bu rehber, projeye katkıda bulunmak ve projeyi kendi bilgisayarında çalıştırmak için adım adım yönerge sağlar.

### Ön hazırlıklar
libre-akademiyi sisteminizde docker benzeri bir araç ile çalıştırmayacaksanız şu bağımlılıklara ihtiyacınız vardır:
  - Node.js & npm
  - MySQL

### 1. Depoyu Klonlamak

Projeyi kendi bilgisayarına almak için:

```bash
git clone https://github.com/Reend21/libre-akademi.git
cd libre-akademi
```
### 2. Bağımlılıkları Yüklemek
```
cd client
npm install
cd server
npm install
```
3. Geliştirme Ortamını Çalıştırmak
```
cd client && npm run dev
cd server && npm run dev
```
4. Build Almak
```
npm run build
```
5. Katkıda Bulunmak

Projeye katkı sağlamak için önerilen yol şudur:
```
git checkout -b ozellik-ismi
git add .
git commit -m "Yeni özellik eklendi: X"
git push origin ozellik-ismi
``` 

## Lisans
libre akademi **GNU Affero General Public License v3.0** ile lisanslanmıştır ve bir özgür yazılımdır. Lisans anlaşmasını okumak için **LICENSE** dosyasını inceleyin.
