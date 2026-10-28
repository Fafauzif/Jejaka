/** Authored fictional encounters in a researched, approximate November 1945 setting.
 * Positions: Three.js [x,z] metres. Blender (x,y,z) becomes Three (x,z,-y).
 * Duration is a suggested reading/listening allowance, not a forced wait.
 */
export const storyMeta = {
  title: "JEJAKA",
  subtitle: "Catatan yang tertinggal",
  subtitleEn: "The unfinished account",
  protagonist: "Raka Pradana",
  role: "Wartawan",
  period: "Surabaya · November 1945",
  disclaimer:
    "Raka, percakapan, pilihan, dan rangkaian kejadian dalam cerita ini adalah fiksi. Lingkungan mengacu pada peta dan foto sejarah dengan bagian yang direkonstruksi.",
  disclaimerEn:
    "Raka, the conversations, choices, and sequence of events are fictional. The environment draws on historical maps and photographs, with reconstructed elements.",
  content:
    "Suara pertempuran, bangunan terbakar, cedera, dan kematian tanpa gambar luka terbuka.",
  contentEn:
    "Battle sounds, burning buildings, injury, and a death without graphic wounds.",
  assignment:
    "Temui warga di sekitar Jembatan Merah. Catat nama dan cerita mereka. Jangan menuliskan dugaan sebagai kesaksian.",
  assignmentEn:
    "Meet residents around Jembatan Merah. Record their names and accounts. Do not write an assumption as an eyewitness fact.",
  plannedDuration: "10–12 menit · dapat dipercepat",
  plannedDurationEn: "10–12 minutes · self-paced",
  notebookTitle: "Buku catatan Raka",
  notebookTitleEn: "Raka’s notebook",
  ending:
    "Raka meninggal akibat lukanya. Pilihanmu mengubah isi catatan dan apa yang sempat ia lakukan, bukan hasil pertempuran.",
  endingEn:
    "Raka dies of his injuries. Your choices change his account and what he manages to do, not the outcome of the battle.",
};

export const beats = [
  {
    id: "arrival",
    title: "01 / Sampai di kota",
    subtitle: "Pendekatan barat · Jembatan Merah",
    position: [-140, 4],
    look: [-92, 4],
    duration: 45,
    target: "Mulai catatan lapangan",
    description:
      "Raka tiba di kawasan Jembatan Merah untuk menemui warga. Ia sudah mendengar kabar pertempuran; ia belum tahu keadaan jalan di depannya.",
    descriptionEn:
      "Raka enters the Jembatan Merah district to meet residents. He has heard reports of fighting, but does not know the conditions on the street ahead.",
    speaker: "Raka",
    line: "Tugas dari redaksi: nama orang, tempat tinggal, apa yang mereka alami. Aku mulai dari jalan menuju jembatan.",
    lineEn:
      "The editor’s assignment: names, homes, what people have experienced. I will begin on the road to the bridge.",
    note: "Surabaya, November 1945. Aku tiba di kawasan Jembatan Merah membawa buku catatan dan kamera. Dari pendekatan barat, aku mulai mencari orang yang bersedia bicara.",
    noteEn:
      "Surabaya, November 1945. I enter the Jembatan Merah district with a notebook and camera. From the western approach, I begin looking for someone willing to talk.",
    dialogue: [
      {
        at: 8,
        speaker: "Raka",
        id: "Aku perlu mencatat yang kulihat. Kabar yang belum jelas kutandai sebagai kabar.",
        en: "I need to record what I see. Anything uncertain stays marked as a report.",
      },
      {
        at: 23,
        speaker: "Suara dari depan",
        id: "Kalau mencari jalan ke seberang, terus saja ke jembatan.",
        en: "If you need to cross, keep going to the bridge.",
      },
    ],
  },
  {
    id: "sari",
    title: "02 / Sebelum menutup toko",
    subtitle: "Pendekatan barat · tempat Sari menunggu",
    position: [-92, 4],
    look: [-88, 8],
    duration: 65,
    target: "Dengarkan Bu Sari",
    description:
      "Sari menunggu di pendekatan barat jembatan. Ia bersedia bicara tentang toko dan keluarganya.",
    descriptionEn:
      "Sari waits by the western bridge approach. She agrees to talk about her shop and family.",
    speaker: "Bu Sari",
    line: "Sari. Tulis Sari saja. Kalau toko tutup, orang sering mengira kami sudah pergi. Kadang kami hanya menunggu kabar keluarga.",
    lineEn:
      "Sari. Just write Sari. When a shop closes, people think we have left. Sometimes we are only waiting for news of our family.",
    note: "Di pendekatan barat, kutemui Sari. Ia mengatakan sebagian warga menunggu kabar keluarga sebelum pergi. Ia menyebut tokonya, lalu kembali melihat jalan.",
    noteEn:
      "I meet Sari by the western approach. She says some residents wait for family news before leaving. She mentions her shop, then looks back at the road.",
    choices: [
      {
        id: "testimony",
        label: "Catat perkataannya",
        labelEn: "Write down her account",
        note: "Sari: “Kadang kami hanya menunggu kabar keluarga.” Kutulis namanya sebelum berangkat.",
        noteEn:
          "Sari: “Sometimes we are only waiting for news of our family.” I write her name before leaving.",
      },
      {
        id: "place",
        label: "Catat pertemuan ini",
        labelEn: "Describe the encounter",
        note: "Sari menunggu di dekat jembatan. Katanya, toko yang tutup belum tentu ditinggalkan pemiliknya. Ia masih menunggu kabar keluarga.",
        noteEn:
          "Sari waits near the bridge. She says a closed shop does not always mean its owner has left. She is still waiting for family news.",
      },
    ],
    dialogue: [
      {
        at: 12,
        speaker: "Raka",
        id: "Saya catat, Bu. Masih ada yang ingin Ibu sampaikan?",
        en: "I will write that down. Is there anything else you would like to tell me?",
      },
      {
        at: 28,
        speaker: "Bu Sari",
        id: "Jangan tulis tokoku aman. Saya sendiri tidak tahu sampai kapan.",
        en: "Do not write that my shop is safe. I do not know how long it will be.",
      },
      {
        at: 44,
        speaker: "Raka",
        id: "Saya tulis yang Ibu katakan.",
        en: "I will write what you told me.",
      },
    ],
  },
  {
    id: "bridge",
    title: "03 / Di atas Kali Mas",
    subtitle: "Jembatan Merah · menyeberang ke timur",
    position: [-25, 0],
    look: [16, 0],
    duration: 55,
    target: "Amati sungai dari jembatan",
    description:
      "Dari jembatan, Raka menghubungkan suara di belakangnya dengan jalan di seberang. Tidak ada pandangan utuh atas kota.",
    descriptionEn:
      "On the bridge, Raka places the sounds behind him against the street ahead. He has no complete view of the city.",
    speaker: "Raka",
    line: "Kali Mas di bawahku. Orang menyeberang sambil membawa barang. Aku tidak tahu mereka hendak ke mana.",
    lineEn:
      "Kali Mas below me. People cross carrying belongings. I do not know where they are going.",
    note: "Di atas Jembatan Merah, kuberhenti melihat Kali Mas. Orang lewat di dekat pagar. Aku mengambil satu foto sebelum meneruskan perjalanan.",
    noteEn:
      "On Jembatan Merah, I stop to look at Kali Mas. People pass beside the railings. I take one photograph before continuing.",
    dialogue: [
      {
        at: 15,
        speaker: "Raka",
        id: "Aku mengambil waktu sebentar untuk melihat kedua tepi sungai.",
        en: "I take a moment to look at both banks.",
      },
      {
        at: 34,
        speaker: "Damar",
        id: "Mas, kalau mau ke pertokoan, ikut sisi sini.",
        en: "If you are heading to the shops, take this side.",
      },
    ],
  },
  {
    id: "damar",
    title: "04 / Orang yang tahu jalan",
    subtitle: "Kembang Djepoen · dekat kepala jembatan",
    position: [48, 6],
    look: [51, 11],
    duration: 65,
    target: "Temui Damar",
    description:
      "Damar membawa kain dan sebuah tas kecil. Ia membantu orang mencari anggota keluarganya; ia tidak mengaku tahu jalan keluar yang aman.",
    descriptionEn:
      "Damar carries cloth and a small bag. He helps people find relatives; he does not claim to know a safe way out.",
    speaker: "Damar",
    line: "Aku menunggu orang dari ujung jalan. Kalau suara itu dekat lagi, kita masuk dulu. Jangan tunggu aku kalau jalanmu masih terbuka.",
    lineEn:
      "I am waiting for someone from the far end of the street. If that sound comes closer, we take cover. Do not wait for me if your way is still open.",
    note: "Damar menunggu adiknya. Ia menyuruhku tetap dekat tepi jalan kalau suara itu terdengar lagi. Kami berbicara sebentar sebelum aku melanjutkan catatan.",
    noteEn:
      "Damar is waiting for his younger brother. He tells me to stay near the street edge if that sound returns. We talk briefly before I continue my notes.",
    dialogue: [
      {
        at: 13,
        speaker: "Raka",
        id: "Aku Raka. Wartawan. Aku mau mendengar keadaan di sini.",
        en: "I am Raka, a journalist. I want to hear what is happening here.",
      },
      {
        at: 29,
        speaker: "Damar",
        id: "Kalau menulis, bilang ada orang yang belum sempat pulang.",
        en: "If you write about this, say there are people who have not been able to get home.",
      },
      {
        at: 46,
        speaker: "Raka",
        id: "Siapa yang sedang kautunggu?",
        en: "Who are you waiting for?",
      },
      {
        at: 54,
        speaker: "Damar",
        id: "Adikku. Dia sudah tahu tempat ini.",
        en: "My younger brother. He knows this place.",
      },
    ],
  },
  {
    id: "street",
    title: "05 / Halaman berikutnya",
    subtitle: "Kembang Djepoen · deret pertokoan",
    position: [106, 22],
    look: [158, 42],
    duration: 70,
    target: "Tambahkan pengamatan",
    description:
      "Raka mencatat satu bagian jalan. Ia mendengar suara jauh, lalu percakapan terputus. Orang di dekatnya mulai memperhatikan arah yang sama.",
    descriptionEn:
      "Raka records one stretch of street. He hears a distant sound, then conversations stop. People nearby begin looking in the same direction.",
    speaker: "Raka",
    line: "Aku belum mendapat cerita lengkap. Di halaman ini kutulis yang ada di depan mata: barang yang ditinggal, pintu yang ditutup, orang yang masih menunggu.",
    lineEn:
      "I do not have the whole story. On this page I write what is in front of me: belongings left behind, doors closing, people still waiting.",
    note: "Kembang Djepoen. Percakapan di sebelahku berhenti setelah suara dari kejauhan. Orang-orang mulai bergerak. Pensil masih kupegang.",
    noteEn:
      "Kembang Djepoen. The conversation beside me stops after a sound in the distance. People begin to move. I am still holding the pencil.",
    dialogue: [
      {
        at: 18,
        speaker: "Warga",
        id: "Sudah, bawa yang bisa dibawa.",
        en: "Enough. Take what you can carry.",
      },
      {
        at: 37,
        speaker: "Raka",
        id: "Aku berhenti menulis ketika percakapan di sebelahku berhenti.",
        en: "I stop writing when the conversation beside me stops.",
      },
      {
        at: 55,
        speaker: "Damar",
        id: "Raka. Ke tepi, sekarang.",
        en: "Raka. Get to the side. Now.",
      },
    ],
  },
  {
    id: "impact",
    title: "06 / Suara yang dekat",
    subtitle: "Kembang Djepoen · jalan terpapar",
    position: [132, 30],
    look: [147, 38],
    duration: 45,
    target: "Bergerak ke tempat berteduh",
    description:
      "Sebuah ledakan terdengar di luar pandangan. Debu melewati jalan. Raka menunduk dan mengikuti Damar ke tepi bangunan.",
    descriptionEn:
      "An explosion sounds beyond view. Dust passes across the street. Raka ducks and follows Damar toward the buildings.",
    speaker: "Damar",
    line: "Tunduk! Jangan berhenti di tengah jalan!",
    lineEn: "Get down! Do not stop in the street!",
    note: "Ledakan dekat. Debu melintas di jalan. Aku menutup buku dan mengikuti Damar. Asal serangan tidak terlihat.",
    noteEn:
      "A nearby explosion. Dust crosses the street. I close the notebook and follow Damar. The attack comes from beyond view.",
    dialogue: [
      {
        at: 10,
        speaker: "Raka",
        id: "Buku ini masih di tanganku. Aku harus menutupnya.",
        en: "The notebook is still in my hand. I need to close it.",
      },
      {
        at: 24,
        speaker: "Damar",
        id: "Ikut aku. Dekat dinding.",
        en: "Follow me. Stay by the wall.",
      },
    ],
  },
  {
    id: "shelter",
    title: "07 / Di tepi jalan",
    subtitle: "Kembang Djepoen · tempat berteduh",
    position: [118, 28],
    look: [110, 30],
    duration: 70,
    target: "Pilih tindakanmu",
    description:
      "Damar berusaha memindahkan barang yang menghalangi tempat berteduh. Seorang warga menahan daun pintu. Raka dapat membantu atau memeriksa jalan kembali.",
    descriptionEn:
      "Damar tries to move belongings blocking the shelter. A resident holds a door. Raka can help or check the way back.",
    speaker: "Damar",
    line: "Bantu geser ini, kalau bisa. Atau lihat jalan ke jembatan. Aku tidak bisa melihat dari sini.",
    lineEn:
      "Help me move this, if you can. Or check the way to the bridge. I cannot see it from here.",
    note: "Kami berteduh di tepi bangunan. Aku memilih satu pekerjaan yang bisa kulakukan dari sini.",
    noteEn:
      "We take shelter beside a building. I choose one thing I can do from here.",
    choices: [
      {
        id: "help",
        label: "Bantu Damar memindahkan barang",
        labelEn: "Help Damar clear the shelter",
        note: "Kubantu Damar menggeser barang. Ada ruang bagi satu orang lagi untuk masuk. Aku tidak melihat apa yang terjadi di jalan selama itu.",
        noteEn:
          "I help Damar move the belongings. There is room for one more person to shelter. I do not see what happens in the street while I do it.",
      },
      {
        id: "check",
        label: "Periksa arah jembatan",
        labelEn: "Check the way to the bridge",
        note: "Kulihat arah jembatan dari tepi bangunan. Sebagian jalan tampak terbuka. Debu membuatku tidak bisa memastikan keadaan di seberang.",
        noteEn:
          "I look toward the bridge from beside the building. Part of the street appears open. Dust prevents me from checking the far side.",
      },
    ],
    dialogue: [
      {
        at: 16,
        speaker: "Raka",
        id: "Apa adikmu sudah datang?",
        en: "Has your brother arrived?",
      },
      {
        at: 30,
        speaker: "Damar",
        id: "Belum. Aku akan menunggu sebentar lagi.",
        en: "Not yet. I will wait a little longer.",
      },
      {
        at: 49,
        speaker: "Damar",
        id: "Kau bisa kembali ke jembatan dari sisi yang tadi. Pelan. Lihat dulu sebelum keluar.",
        en: "You can head back to the bridge along the side we came from. Slowly. Look before you step out.",
      },
    ],
  },
  {
    id: "return",
    title: "08 / Jalan yang tadi",
    subtitle: "Kembali ke kepala jembatan timur",
    position: [66, 15],
    look: [20, 0],
    duration: 65,
    target: "Kembali ke arah sungai",
    description:
      "Raka kembali melewati muka toko yang tadi ia lihat. Kini ada asap dan benda jatuh. Ia hanya dapat menilai beberapa meter di depannya.",
    descriptionEn:
      "Raka passes the shopfronts he saw earlier. Now there is smoke and fallen material. He can judge only the few metres ahead.",
    speaker: "Raka",
    line: "Aku mengenali jalan ini. Tadi aku masih bisa melihat sampai ujung. Sekarang aku mencari tepi bangunannya.",
    lineEn:
      "I recognise this street. Earlier I could see to the end. Now I am finding my way along the buildings.",
    note: "Kembali ke jembatan melalui jalan yang tadi. Asap menutup beberapa muka bangunan. Aku berusaha tetap melihat tepian jalan.",
    noteEn:
      "Back toward the bridge along the street we came from. Smoke hides some of the building fronts. I try to keep the street edge in view.",
    dialogue: [
      {
        at: 17,
        speaker: "Raka",
        id: "Nama Sari masih terbaca. Halaman berikutnya terkena debu.",
        en: "Sari’s name is still legible. Dust covers the next page.",
      },
      {
        at: 36,
        speaker: "Damar",
        id: "Raka, berhenti dulu!",
        en: "Raka, wait!",
      },
      {
        at: 52,
        speaker: "Raka",
        id: "Aku mendengar benturan. Setelah itu, aku kesulitan berdiri.",
        en: "I hear an impact. After it, I struggle to stand.",
      },
    ],
  },
  {
    id: "wounded",
    title: "09 / Catatan terakhir",
    subtitle: "Dekat tepian timur Kali Mas",
    position: [29, 3],
    look: [-28, 8],
    duration: 65,
    target: "Buka catatan untuk terakhir kali",
    description:
      "Raka berlindung di sisi pendekatan jembatan. Luka tidak diperlihatkan. Damar datang mendekat, lalu memanggil orang lain.",
    descriptionEn:
      "Raka takes cover beside the bridge approach. His wound is not shown. Damar comes closer and calls for someone else.",
    speaker: "Raka",
    line: "Damar, buku ini. Namanya ada di halaman depan. Jangan biarkan halaman-halamannya tercecer.",
    lineEn:
      "Damar, this notebook. Her name is on the first page. Do not let the pages scatter.",
    note: "Tanganku sulit menahan buku. Damar berada di dekatku. Aku menyerahkan catatan yang sempat kubuat.",
    noteEn:
      "My hand struggles to hold the notebook. Damar is nearby. I pass on the account I managed to write.",
    choices: [
      {
        id: "notebook",
        label: "Serahkan buku catatan",
        labelEn: "Pass on the notebook",
        note: "Kuserahkan buku kepada Damar. “Di halaman depan,” kataku. Ia menyelipkannya ke dalam tas.",
        noteEn:
          "I pass the notebook to Damar. “On the first page,” I say. He slips it into his bag.",
      },
      {
        id: "page",
        label: "Titipkan pesan di halaman depan",
        labelEn: "Leave a message on the first page",
        note: "Kutulis singkat di halaman depan: “Nama dan ucapan di dalam ini belum lengkap.” Damar mengambil buku dari tanganku.",
        noteEn:
          "I write a brief message on the first page: “The names and accounts here are incomplete.” Damar takes the notebook from my hand.",
      },
    ],
    dialogue: [
      {
        at: 16,
        speaker: "Damar",
        id: "Tetap di sini. Aku panggil orang.",
        en: "Stay here. I will call someone.",
      },
      {
        at: 37,
        speaker: "Raka",
        id: "Aku ingin menulis lagi. Pensilnya terlepas.",
        en: "I want to write again. The pencil slips.",
      },
      {
        at: 52,
        speaker: "Damar",
        id: "Bukunya sudah kubawa, Raka.",
        en: "I have the notebook, Raka.",
      },
    ],
  },
  {
    id: "lastview",
    recordable: false,
    title: "10 / Dari tempat ia jatuh",
    subtitle: "Kali Mas · pandangan terakhir",
    position: [24, 2],
    look: [-44, 10],
    duration: 55,
    target: "Tetap melihat dari tempat Raka berada",
    description:
      "Pandangan turun ke dekat permukaan jalan. Api dan asap terlihat di seberang. Napas Raka melemah, lalu berhenti. Kamera tidak meninggalkan tempatnya.",
    descriptionEn:
      "The view settles near the street. Fire and smoke are visible across the river. Raka’s breathing weakens, then stops. The camera stays where he is.",
    speaker: "Raka",
    line: "",
    lineEn: "",
    note: "",
    noteEn: "",
    dialogue: [
      { at: 9, speaker: "Damar", id: "Aku di sini.", en: "I am here." },
    ],
  },
  {
    id: "afterword",
    recordable: false,
    title: "11 / Yang sempat ditulis",
    subtitle: "Sesudah cerita",
    position: [24, 2],
    look: [-44, 10],
    duration: 60,
    target: "Baca catatan yang tersisa",
    description:
      "Raka, Sari, dan Damar adalah tokoh fiksi. Pertempuran di Surabaya pada November 1945 adalah peristiwa sejarah. Catatan ini memperlihatkan satu sudut pandang rekaan, bukan riwayat lengkap kota.",
    descriptionEn:
      "Raka, Sari, and Damar are fictional. The fighting in Surabaya in November 1945 is historical. This account presents one imagined perspective, not a complete history of the city.",
    speaker: "Catatan sejarah",
    line: "Serangan besar dimulai pada 10 November 1945. Pertempuran berlanjut selama November. Kisah Raka tidak menetapkan tanggal, sasaran serangan, atau keadaan bangunan tertentu sebagai fakta.",
    lineEn:
      "The major offensive began on 10 November 1945. Fighting continued through November. Raka’s story does not establish the date, target of an attack, or condition of a particular building as fact.",
    note: "",
    noteEn: "",
    dialogue: [],
  },
];

export const historicalSources = [
  {
    title: "P. R. S. Mani: dispatches and diary, 1945",
    institution: "UTS Library",
    url: "https://opus.lib.uts.edu.au/handle/10453/28090",
    note: "Wartime documents and collection context; a situated account, not a complete record.",
  },
  {
    title: "On This Day: November 1945",
    institution: "National Army Museum",
    url: "https://www.nam.ac.uk/explore/november-1945",
    note: "Modern British museum interpretation; chronology and wider battle context.",
  },
  {
    title: "Replika Surat Ultimatum Sekutu 9 November 1945",
    institution: "Musea Surabaya",
    url: "https://musea.surabaya.go.id/replika-pamflet-selebaran-ultimatum-sekutu/",
    note: "Municipal exhibit record; distinguishes the November ultimatum from earlier events.",
  },
  {
    title: "Java: Soerabaja, wartime map",
    institution: "Survey Production Centre SEA",
    url: "https://commons.wikimedia.org/wiki/File:Java_Soerabaja.jpg",
    note: "Map revised from March 1943 aerial photographs; approximate source for the district layout.",
  },
];
