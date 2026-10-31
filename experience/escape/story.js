/** Authored civilian dialogue, never a historical quotation.
 * Cultural claims and observed source access: docs/GROUNDED_CULTURE.md.
 * Named exchanges are queued by the app at visible, safe story beats.
 */
import {LAYOUT} from './layout.js';
const line = (speaker, text, duration = 5, fact = null) => Object.freeze({ speaker, text, duration, ...(fact ? { fact } : {}) });

export const LINES = Object.freeze({
  preparation: [
    line('RAKA', 'Sar, sudah siap berangkat?', 3.5),
    line('SARI', 'Sebentar. Rak, bantu pegang ujung kainnya, ya.', 5),
    line('ADI', 'Mbak, yang kecil itu jangan ketinggalan.', 4),
  ],
  opening: [
    line('SARI', 'Ini canting, Di. Isinya malam, lilin batik yang dipanaskan.', 6, 'canting'),
    line('ADI', 'Jadi bukan buat ngasih warna?', 3.5),
    line('SARI', 'Bukan. Buat bikin garis malam di kain. Panas, jangan dipegang ujungnya.', 6),
  ],
  clothDye: [
    line('SARI', 'Lihat contoh yang ini. Tadi sudah kucelup ke warna biru.', 5.5),
    line('ADI', 'Tapi garisnya nggak ikut biru.', 3.5),
    line('SARI', 'Iya. Bagian yang tertutup malam nggak kena warna celupnya.', 6, 'wax-resist'),
  ],
  clothFinish: [
    line('SARI', 'Yang ini sudah bersih malamnya. Lihat garis kainnya.', 4.5),
    line('ADI', 'Malamnya ke mana, Mbak?', 3.5),
    line('SARI', 'Dilepas pakai air panas. Prosesnya disebut nglorod.', 5.5, 'wax-removal'),
    line('ADI', 'Baru kelihatan garis kainnya?', 3.5),
    line('SARI', 'Iya. Kalau mau beberapa warna, tahap malam dan warnanya bisa diulang.', 6, 'multiple-colours'),
  ],
  firstWarning: [
    line('RAKA', 'Sar, tembakannya makin dekat. Ayo berangkat.', 4),
    line('SARI', 'Di, sini! Rak, ikuti aku!', 3),
  ],
  firstBlast: [
    line('SARI', 'Depan tokonya runtuh! Jauhi bagian tengah!', 4.5),
    line('WARGA', 'Awas! Mundur dari depan toko!', 3.5),
  ],
  alley: [
    line('SARI', 'Lewat tepi sini! Di, tetap dekat Mbak.', 4),
    line('WARGA', 'Merunduk! Tunggu di balik tembok!', 3.5),
  ],
  workshopLost: [
    line('ADI', 'Mbak, kain yang besar masih di sana.', 4),
    line('SARI', 'Jangan balik, Di. Dekat Mbak dulu.', 4),
    line('RAKA', 'Cantingnya sudah masuk buntalan?', 4),
    line('SARI', 'Masih kupegang. Kain yang lain tinggal dulu.', 4.5),
  ],
  shelteredHistory: [
    line('ADI', 'Katanya sudah merdeka. Kok masih perang?', 4.5),
    line('RAKA', 'Iya, kita sudah merdeka. Tapi pertempurannya belum berhenti.', 6, 'independence-conflict'),
    line('SARI', 'Sekarang cari tempat aman dulu. Nanti kita cari kabar yang lain.', 5.5),
  ],
  shelteredMemory: [
    line('ADI', 'Kalau tempatnya terbakar, Mbak nggak bisa kerja lagi?', 5),
    line('SARI', 'Belum tahu, Di. Kain, pewarna, tempat buat kerja... banyak yang tertinggal.', 6),
    line('RAKA', 'Pelan-pelan dulu. Kita sampai seberang dulu.', 4),
    line('SARI', 'Iya. Cantingnya masih ada. Kalau sudah dapat tempat, kita mulai lagi pelan-pelan.', 5.5),
  ],
  helpChild: [
    line('ADI', 'Rak! Kakiku nyangkut!', 3.5),
    line('SARI', 'Angkat rangkanya, Rak! Aku bantu Adi keluar!', 4.5),
  ],
  helpChildProgress: [line('SARI', 'Tahan, Rak. Adi, tarik kakimu. Pelan.', 4)],
  childFreed: [
    line('SARI', 'Bisa berdiri? Coba pelan-pelan.', 4),
    line('ADI', 'Bisa. Tunggu, Mbak.', 3.5),
    line('SARI', 'Iya, Mbak tunggu. Rak, di sebelah kami dulu.', 4.5),
  ],
  childRerouted: [line('SARI', 'Aku bawa Adi lewat belakang. Rak, cari jalan ke jembatan!', 5)],
  square: [
    line('WARGA', 'Jangan lewat tengah! Ikut pinggir kiri!', 4),
    line('SARI', 'Ke Jembatan Merah, Rak. Habis menyeberang, kita ikut tepi kali.', 6),
  ],
  bridge: [
    line('PAK WIRYO', 'Sebentar! Rodanya nyangkut. Yang belakang belum bisa lewat.', 5),
    line('SARI', 'Rak, bantu dorong. Kami tunggu di tepi.', 4),
  ],
  bridgeProgress: [line('PAK WIRYO', 'Satu, dua... dorong! Ya, terus ke situ!', 4)],
  bridgeCleared: [
    line('PAK WIRYO', 'Sudah! Terima kasih, Nak. Bawa adiknya dulu.', 4.5),
    line('SARI', 'Ayo, Di. Pelan, jalannya sudah terbuka.', 4),
  ],
  bridgeRerouted: [line('WARGA', 'Gerobaknya biar kami urus. Ambil sisi satunya!', 4)],
  refuge: [
    line('PENJAGA', 'Masuk! Anak-anak ke dalam. Airnya di sebelah sana.', 5),
    line('SARI', 'Di, duduk dulu. Rak, makasih sudah nemenin kami.', 5),
  ],
  refugeRecall: [
    line('ADI', 'Mbak dulu belajar batik dari siapa?', 4),
    line('SARI', 'Dari Ibu. Awalnya garis lurus saja susah. Malamnya putus-putus.', 6, 'transmission'),
    line('ADI', 'Kalau aku, boleh mulai dari titik-titik?', 4),
    line('SARI', 'Boleh. Nanti kalau sudah ada tempat buat kerja.', 4.5),
  ],
  finalIntact: [
    line('ADI', 'Cantingnya masih ada, Mbak?', 3.5),
    line('SARI', 'Ada. Yang kain belum selesai itu kita tinggal dulu.', 5),
    line('ADI', 'Nanti aku coba bikin garis yang nggak kena warna itu.', 5),
    line('SARI', 'Iya. Sekarang minum dulu. Mbak di sini.', 4.5),
  ],
  finalLost: [
    line('ADI', 'Kainnya nggak bisa diambil, Mbak?', 4),
    line('SARI', 'Belum bisa. Jangan balik ke sana dulu.', 4),
    line('ADI', 'Kalau sudah aman, aku bantu bikin lagi.', 4),
    line('SARI', 'Iya, Di. Sekarang istirahat dulu.', 4),
  ],
  separated: [line('SARI', 'Rak, kami di sini! Jangan ambil jalan depan!', 4)],
  cover: [line('WARGA', 'Tahan dulu! Berlindung di situ!', 3.5)],
  exposed: [line('SARI', 'Rak, ke tembok! Jangan berhenti di tengah jalan!', 4)],
});

export const STORY = Object.freeze({
  title: 'JEJAKA',
  subtitle: 'Jangan lepaskan tangan Adi.',
  place: 'Surabaya · November 1945',
  role: 'Kamu Raka, tetangga Sari.',
  opening: 'Pertempuran makin dekat. Sari sedang membereskan kain dan alat batiknya. Bantu ia dan adiknya, Adi, mencapai tempat warga berlindung di seberang Kali Mas.',
  startLabel: 'Temui Sari dan Adi',
  resume: ['Rak, bantu pegang kainnya sebentar.', 'Jauhi depan toko. Cari tempat berlindung, Rak!', 'Di tepi sini, Rak. Adi, dekat Mbak.', 'Rak, Adi masih terjepit. Bantu angkat rangkanya!', 'Lewat pinggir kiri. Jembatannya di depan.', 'Kita menyeberang di sini, Rak.', 'Masuk! Anak-anak ke dalam.', 'Di, duduk dulu. Kita tunggu di sini.'],
  // Integration targets, not measured human playtime or compulsory timer gates.
  pacing: Object.freeze({
    targetNormalSeconds: Object.freeze([240, 300]),
    workshopSeconds: 54,
    shelteredExchangeSeconds: 16,
    arrivalExchangeSeconds: 28,
    noPunishingCountdown: true,
    criticalFacts: Object.freeze(['canting', 'wax-resist', 'wax-removal']),
  }),
  chapters: [
    { id: 'workshop', title: 'Sebelum meninggalkan pasar', objective: 'Bantu Sari membereskan kain. Lihat canting dan contoh warna celupnya.', target: LAYOUT.helpPoints.workshop, lines: LINES.opening },
    { id: 'market', title: 'Keluar dari pasar', objective: 'Ikuti Sari dan Adi. Cari jalan ke seberang Kali Mas.', target: LAYOUT.actorRoute[2], lines: LINES.firstWarning },
    { id: 'alley', title: 'Di tepi Kembang Djepoen', objective: 'Ikuti tepian Kembang Djepoen. Cari perlindungan sebelum bergerak lagi.', target: LAYOUT.cover, lines: LINES.firstBlast },
    { id: 'courtyard', title: 'Jangan tinggalkan Adi', objective: 'Cari Adi di halaman. Angkat rangka yang menjepit kakinya.', target: LAYOUT.helpPoints.rescue, lines: LINES.helpChild },
    { id: 'square', title: 'Tetap di tepi jalan', objective: 'Ikuti tepi jalan menuju Jembatan Merah. Berlindung saat ada tembakan.', target: LAYOUT.plaza, lines: LINES.square },
    { id: 'bridge', title: 'Beri jalan bagi warga', objective: 'Bantu dorong gerobak. Warga di belakang sedang menunggu.', target: LAYOUT.cart, lines: LINES.bridge },
    { id: 'refuge', title: 'Di seberang Kali Mas', objective: 'Ikuti tepi Kali Mas bersama Sari dan Adi menuju tempat berlindung.', target: LAYOUT.quayBreather, lines: LINES.refuge },
    { id: 'safe', title: 'Mereka sampai', objective: 'Temani Sari dan Adi. Dengarkan mereka sebentar.', target: LAYOUT.refugeApproach, lines: LINES.finalIntact },
  ].map(Object.freeze),
  ending: {
    title: 'Sari dan Adi sampai di tempat berlindung.',
    text: 'Mereka mendapat tempat duduk dan air minum. Belum ada kabar kapan jalan pulang aman.',
    intact: 'Sari masih membawa canting dan sebagian kain. Kain yang belum selesai, pewarna, dan tempat kerjanya tertinggal.',
    lost: 'Kain yang tertinggal belum bisa diambil. Sari dan Adi menunggu kabar sambil beristirahat.',
  },
  learning: [
    { title: 'Canting membawa malam', text: 'Pada batik tulis, canting menyalurkan malam panas untuk membuat titik dan garis pada kain. Alat itu membawa lilin batik, bukan zat warna.' },
    { title: 'Malam merintangi warna', text: 'Bagian yang tertutup malam terlindung dari warna celup pada tahap itu. Garis pada contoh Sari tetap pucat karena bagian itu dilindungi malam.' },
    { title: 'Warna dan pelepasan malam', text: 'Malam kemudian dapat dilepas dengan air panas; proses ini disebut nglorod. Pembuatan batik dapat melibatkan pengulangan tahap malam dan pewarnaan. Contoh di awal cerita sudah disiapkan sebelumnya, bukan satu kain yang selesai dibuat dalam beberapa detik.' },
    { title: 'Keterampilan perlu tempat untuk berlanjut', text: 'Sari membawa alat dan pengetahuannya, tetapi bahan serta tempat kerjanya tertinggal. Ia masih ingin mengajari Adi. Orang, hubungan belajar, bahan, alat, dan kesempatan bekerja sama-sama berarti.' },
  ],
  history: {
    title: 'Surabaya nyata. Perjalanan ini rekaan.',
    text: 'Indonesia memproklamasikan kemerdekaan pada 17 Agustus 1945. Perang Dunia II berakhir, tetapi perjuangan mempertahankan kemerdekaan masih berlangsung. Pada 10 November 1945, pasukan Inggris melancarkan serangan besar di Surabaya. Pasukan Inggris dan India dalam komando Inggris berhadapan dengan pejuang Indonesia. Perjalanan Raka, Sari, dan Adi bukan kesaksian arsip.',
    culture: 'Penjelasan canting dan malam merujuk pada Museum Batik Indonesia. Pelepasan malam dengan air panas juga dijelaskan oleh Balai Besar Kerajinan dan Batik. Pola kain Sari adalah gambar asli untuk cerita, bukan motif setempat yang telah dibuktikan ada di alamat ini pada 1945. Hubungan belajar Sari dan Adi adalah rekaan.',
    sources: [
      { label: 'National Army Museum — November 1945: Surabaya', url: 'https://www.nam.ac.uk/explore/november-1945' },
      { label: 'UTS Library — P. R. S. Mani: dispatches and diary, 1945', url: 'https://opus.lib.uts.edu.au/handle/10453/28090' },
      { label: 'Museum Batik Indonesia — Batik Indonesia 101', url: 'https://artsandculture.google.com/story/batik-indonesia-101-museum-batik-indonesia/CwWRz0YynMZ-yQ?hl=id' },
      { label: 'BBKB — Malam bekas dan proses pelorodan', url: 'https://bbkb.kemenperin.go.id/index.php/post/read/malam_bekas__daur_ulang_aja__rahasia_ramah_lingkungan_para_pembatik_0' },
      { label: 'UNESCO — Indonesian Batik', url: 'https://ich.unesco.org/en/RL/indonesian-batik-00170' },
    ],
  },
  fiction: 'Tokoh, percakapan, kegiatan membatik di lokasi ini, pola kain, dan pemakaian sekolah sebagai tempat berlindung adalah rekaan. Jarak perjalanan dipadatkan. Gerobak yang tersangkut, runtuhan, serta serangan setempat merupakan adegan cerita, bukan rekonstruksi kejadian tertentu. Nama tempat nyata tidak membuktikan bahwa keluarga atau peristiwa ini tercatat di sana.',
});
