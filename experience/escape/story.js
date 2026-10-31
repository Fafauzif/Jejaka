/** Authored civilian fiction. Dialogue is not a historical quotation.
 * The shared source ledger supports batik technique; no named motif or actual
 * workshop is claimed. See STORY.fiction and experience/docs/CULTURAL_RECORD.md.
 */
const line = (speaker, text, duration = 5) => Object.freeze({ speaker, text, duration });

export const LINES = Object.freeze({
  opening: [
    line('SARI', 'Ini canting, Di. Buat meneteskan malam, lilin batik.', 6),
    line('ADI', 'Habis itu dicelup, Mbak?', 3),
    line('SARI', 'Iya. Malamnya menahan warna. Garis ini tetap putih.', 4),
  ],
  firstWarning: [
    line('RAKA', 'Sar, suara dari pasar!', 2),
    line('SARI', 'Di, sini! Rak, ikuti aku!', 2),
  ],
  firstBlast: [
    line('SARI', 'Jalan depan ketutup! Ke kanan, lewat gang!', 4.5),
    line('WARGA', 'Awas! Mundur dari depan toko!', 3.5),
  ],
  alley: [
    line('SARI', 'Ke gang kanan! Di, tetap dekat Mbak.', 4),
    line('WARGA', 'Merunduk! Tunggu di balik tembok!', 3.5),
  ],
  workshopLost: [
    line('ADI', 'Mbak, kainnya ketinggalan.', 4),
    line('SARI', 'Jangan balik. Aku masih bisa ngajarin kamu. Jalan terus.', 5),
  ],
  helpChild: [
    line('ADI', 'Rak! Kakiku nyangkut!', 3.5),
    line('SARI', 'Angkat kayunya, Rak! Aku tarik Adi!', 4),
  ],
  helpChildProgress: [line('SARI', 'Sedikit lagi. Pelan, Rak. Adi, tarik kakimu.', 4)],
  childFreed: [
    line('SARI', 'Bisa berdiri? Sini, dekat Mbak.', 4),
    line('ADI', 'Bisa. Ayo, Mbak.', 4),
  ],
  childRerouted: [line('SARI', 'Aku bawa Adi lewat belakang. Rak, cari jalan ke jembatan!', 5)],
  square: [
    line('WARGA', 'Jangan lewat tengah! Ikut pinggir kiri!', 4),
    line('SARI', 'Jembatannya di kiri, Rak. Sekolahnya setelah itu.', 5),
  ],
  bridge: [
    line('PAK WIRYO', 'Sebentar! Gerobaknya nyangkut di sini.', 4.5),
    line('SARI', 'Rak, bantu dorong. Biar yang di belakang bisa lewat.', 4.5),
  ],
  bridgeProgress: [line('PAK WIRYO', 'Satu, dua… dorong! Ya, ke situ!', 3.5)],
  bridgeCleared: [
    line('PAK WIRYO', 'Sudah! Jalan dulu, bawa anaknya!', 4),
    line('SARI', 'Ayo, Di. Sedikit lagi.', 3.5),
  ],
  bridgeRerouted: [line('WARGA', 'Gerobaknya biar kami urus. Ambil sisi satunya!', 4)],
  refuge: [
    line('PENJAGA', 'Masuk! Anak-anak ke dalam. Airnya di sebelah sana.', 5),
    line('SARI', 'Di, duduk dulu. Rak, makasih sudah nemenin kami.', 5),
  ],
  finalIntact: [
    line('ADI', 'Cantingnya masih ada, Mbak?', 3.5),
    line('SARI', 'Ada. Nanti kamu coba. Sekarang duduk dulu.', 4.5),
  ],
  finalLost: [
    line('ADI', 'Kainnya nggak bisa diambil, Mbak?', 4),
    line('SARI', 'Jangan balik, Di. Kita di sini dulu.', 4),
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
  opening: 'Pertempuran mendekati pasar. Temani Sari dan adiknya, Adi, menuju sekolah tempat warga berlindung di seberang sungai.',
  startLabel: 'Masuk ke jalan',
  resume: ['Rak, bantu pegang kainnya sebentar.', 'Jalan depannya ketutup. Ke gang kanan, Rak!', 'Di gang ini, Rak. Adi, dekat Mbak.', 'Rak, Adi masih terjepit. Bantu angkat kayunya!', 'Lewat pinggir kiri. Jembatannya di depan.', 'Kita menyeberang di sini, Rak.', 'Masuk! Anak-anak ke dalam.', 'Di, duduk dulu. Kita tunggu di sini.'],
  chapters: [
    { id: 'workshop', title: 'Sebelum jalan ditutup', objective: 'Dekati Sari dan Adi di tempat membatik.', target: { x: -3, z: 4 }, lines: LINES.opening },
    { id: 'market', title: 'Pasar terpecah', objective: 'Ikuti Sari. Cari jalan keluar dari pasar.', target: { x: 0, z: -20 }, lines: LINES.firstWarning },
    { id: 'alley', title: 'Lewat gang sebelah', objective: 'Jalan depan tertutup. Belok kanan ke gang.', target: { x: 24, z: -46 }, lines: LINES.firstBlast },
    { id: 'courtyard', title: 'Jangan tinggalkan Adi', objective: 'Cari Adi di halaman. Angkat kayu yang menjepit kakinya.', target: { x: 24, z: -93 }, lines: LINES.helpChild },
    { id: 'square', title: 'Di tepi lapangan', objective: 'Tetap di pinggir. Menuju jembatan di sebelah kiri.', target: { x: -20, z: -160 }, lines: LINES.square },
    { id: 'bridge', title: 'Buka jalan', objective: 'Bantu dorong gerobak. Buka jalan bagi warga di belakang.', target: { x: -20, z: -179 }, lines: LINES.bridge },
    { id: 'refuge', title: 'Di seberang sungai', objective: 'Bawa Sari dan Adi ke sekolah.', target: { x: -20, z: -220 }, lines: LINES.refuge },
    { id: 'safe', title: 'Mereka sampai', objective: 'Temani Sari dan Adi sebentar.', target: { x: -20, z: -223 }, lines: LINES.finalIntact },
  ].map(Object.freeze),
  ending: {
    title: 'Sari dan Adi sampai di sekolah.',
    text: 'Sari dan Adi mendapat tempat duduk di sekolah. Mereka belum tahu kapan bisa pulang ke pasar.',
    intact: 'Cantingnya masih dibawa Sari. Kain yang belum selesai tertinggal di pasar.',
    lost: 'Kain yang tertinggal belum bisa diambil. Sari dan Adi harus menunggu di tempat berlindung.',
  },
  learning: [
    { title: 'Mengapa lilin dipakai?', text: 'Pada batik, malam menahan zat warna. Bagian kain yang ditutup malam tidak menyerap warna saat dicelup.' },
    { title: 'Apa fungsi canting?', text: 'Canting menyalurkan malam panas untuk membentuk garis dan titik pada kain. Dalam cerita, Sari memperlihatkan alat dan langkahnya kepada Adi.' },
    { title: 'Apa yang diselamatkan?', text: 'Bukan hanya satu kain. Orang yang menguasai keterampilan, alat untuk bekerja, dan kesempatan mengajarkannya juga perlu tetap ada.' },
  ],
  history: {
    title: 'Cerita rekaan, latar sejarah nyata',
    text: 'Pada 10 November 1945, pasukan Inggris melancarkan serangan besar di Surabaya. Pasukan Inggris dan India dalam komando Inggris berhadapan dengan pejuang Indonesia dalam konflik mempertahankan kemerdekaan. Perjalanan Raka, Sari, dan Adi dalam pengalaman ini adalah rekaan, bukan kesaksian arsip.',
    culture: 'Penjelasan tentang malam dan canting merujuk pada catatan Museum Batik Indonesia dan UNESCO. Pola kain dalam pengalaman ini adalah gambar asli untuk produksi, bukan motif sejarah yang diklaim berasal dari suatu kampung.',
    sources: [
      { label: 'National Army Museum — November 1945: Surabaya', url: 'https://www.nam.ac.uk/explore/november-1945' },
      { label: 'UTS Library — P. R. S. Mani: dispatches and diary, 1945', url: 'https://opus.lib.uts.edu.au/handle/10453/28090' },
      { label: 'Museum Batik Indonesia — Batik Indonesia 101', url: 'https://artsandculture.google.com/story/batik-indonesia-101-museum-batik-indonesia/CwWRz0YynMZ-yQ?hl=id' },
      { label: 'UNESCO — Indonesian Batik', url: 'https://ich.unesco.org/en/RL/indonesian-batik-00170' },
    ],
  },
  fiction: 'Raka, Sari, Adi, Pak Wiryo, hubungan keluarga, rute, sekolah, pola kain, dan percakapan adalah rekaan. Tidak ada klaim rekonstruksi alamat, motif setempat, serangan tertentu, atau kesaksian warga nyata.',
});
