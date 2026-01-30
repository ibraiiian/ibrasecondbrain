# 🧠 IbraBrain - Second Brain Lo

> *"Otak kedua buat lo yang sering lupa atau kebanyakan ide!"*

IbraBrain tuh aplikasi personal knowledge management yang gua bikin buat nyimpen semua hal penting - dari catetan, password, sampe dokumen kuliah atau kerjaan. Intinya, ini digital brain lo yang bisa diakses kapan aja, dimana aja.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

---

## ✨ Fitur Yang Ada

### 📝 Notes & Passwords
- Rich text editor pake TipTap (bisa bold, italic, list, dll)
- Simpen password dengan toggle visibility
- Auto-save, jadi lo ga perlu takut ilang

### 🎨 Creative Hub
- **AI Prompt Library** - Simpen prompt ChatGPT/Gemini lo biar ga ilang
- **Asset Gallery** - Upload gambar, moodboard, visual references

### 📁 Documents
- Upload dokumen (PDF, DOC, PPT, XLS, TXT) sampe 25MB
- Kategori: Kuliah, Pekerjaan, Pribadi, Lainnya
- Download, edit, delete sesuka lo
- Filter berdasarkan kategori

### 🔐 Security
- Login pake Google (OAuth)
- Data lo aman di Firebase
- Masing-masing user punya data sendiri

---

## 🚀 Cara Jalanin

### 1. Clone dulu
```bash
git clone https://github.com/ibraiiian/ibrasecondbrain.git
cd ibrasecondbrain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Firebase
Bikin file `.env.local` terus isi kayak gini:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### 4. Gas!
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) - login pake Google, langsung bisa dipake!

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Firebase (Auth, Firestore, Storage) |
| Editor | TipTap Rich Text Editor |
| Icons | Lucide React |

---

## 📱 Screenshots

*Coming soon - lagi males screenshot* 😅

---

## 🤝 Kontribusi

Mau kontribusi? Gas aja:
1. Fork repo ini
2. Bikin branch baru (`git checkout -b fitur-keren`)
3. Commit perubahan lo (`git commit -m 'Nambahin fitur keren'`)
4. Push ke branch (`git push origin fitur-keren`)
5. Bikin Pull Request

---

## 📄 License

MIT License - Bebas dipake, dimodif, di-share. Yang penting kasih credit ya! 🙏

---

<p align="center">
  <b>Developed with ☕ by Ibra</b><br>
  <i>Kalo ada bug, ya wajar... namanya juga manusia</i> 😂
</p>
