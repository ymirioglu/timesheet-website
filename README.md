# 🕒 Timesheet Web Uygulaması

Çalışanların günlük olarak hangi projede kaç saat çalıştıklarını kaydedebileceği, yöneticilerin ise tüm kayıtları görüntüleyip analiz edebileceği, Excel çıktısı alabileceği modern bir full-stack web uygulamasıdır.

---

## 📁 Proje Yapısı

timesheet-app/
* backend/ # Node.js + Express API (JWT ile kimlik doğrulama, MongoDB)
* frontend/ # React + Material UI istemcisi (rol bazlı yönlendirme)


---

## 🔐 Özellikler

### 👤 Çalışanlar için

- Kayıt olma / Giriş yapma (JWT Authentication)
- Günlük timesheet ekleme (Proje, Saat, Tarih, Açıklama)
- Kayıtları listeleme, silme, güncelleme
- Projelere göre grafiklerle görselleştirme
- Giriş sonrası otomatik `/dashboard` yönlendirmesi

### 🧑‍💼 Yöneticiler için

- Tüm kullanıcıları görüntüleyebilme
- Kullanıcı bazlı timesheet filtreleme
- Tarih aralığına göre veri filtreleme
- Proje dağılımını grafikle gösterme
- Seçili kullanıcı için Excel dışa aktarımı (`.xlsx`)
- Tüm kullanıcılar için ZIP içinde Excel export (`.zip`)
- Giriş sonrası otomatik `/manager` yönlendirmesi

---

## 🧰 Kullanılan Teknolojiler

| Katman     | Teknoloji                              |
|------------|-----------------------------------------|
| Frontend   | React, Material UI, Recharts            |
| Backend    | Node.js, Express, MongoDB, Mongoose     |
| Kimlik Doğrulama | JWT (JSON Web Token)              |
| Grafikler  | Recharts                                |
| Export     | xlsx, file-saver, jszip                 |

---

## 🚀 Kurulum

### 1. Repozitoriyi klonla

```
git clone https://github.com/kullaniciadi/timesheet-app.git
cd timesheet-app
```

### 2. Bağımlılıkları yükle
```
cd backend && npm install
cd ../frontend && npm install
```
### 3. .env dosyasını oluştur (backend/ içinde)
```
PORT=5000
MONGO_URI=MongoDB bağlantı adresin
JWT_SECRET=Gizli anahtar
```

### 4. Uygulamayı başlat
```
# Terminal 1'de backend
cd backend
node server.js

# Terminal 2'de frontend
cd frontend
npm start
```

