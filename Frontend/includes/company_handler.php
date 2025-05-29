<?php
// SikmaV3 - includes/company_handler.php

// db_connect.php dan session_utils.php di-include oleh auth.php
// config.php juga sudah di-include

function handle_get_company_details($pdo) {
    // requireLogin(); // Detail perusahaan bisa dilihat publik, jadi tidak perlu login
    $companyId = $_GET['company_id'] ?? null;

    if (!$companyId) {
        return ['status' => 'error', 'message' => 'ID Perusahaan tidak diberikan.'];
    }

    // Data dummy yang diperbarui dengan field "relevant_tech"
    $dummyCompanies = [
        '1' => [
            'id' => 1, 'name' => 'PT Anjas Sejati', 'category' => 'Teknologi', 'type' => 'PT',
            'description' => 'PT Anjas Sejati adalah perusahaan yang bergerak di bidang pengembangan solusi kecerdasan buatan (AI) inovatif untuk berbagai industri.',
            'long_description' => 'Didirikan pada tahun 2015, PT Anjas Sejati telah menjadi pelopor dalam aplikasi AI di Indonesia. Visi kami adalah untuk memberdayakan bisnis dengan teknologi cerdas yang dapat meningkatkan efisiensi dan produktivitas. Kami menawarkan berbagai layanan mulai dari konsultasi, pengembangan model AI kustom, hingga implementasi solusi AI terintegrasi.',
            'image_url' => WEB_UPLOADS_PATH . '/company_banners/anjas_sejati_banner.jpg', // Contoh path jika ada gambar asli
            'logo_url' => WEB_UPLOADS_PATH . '/company_logos/anjas_sejati_logo.png',   // Contoh path
            'address' => 'Jl. Teknologi Raya No. 123, Jakarta Selatan, DKI Jakarta 12345',
            'website' => 'https://anjassejati.example.com',
            'email' => 'hr@anjassejati.example.com',
            'phone' => '021-1234567',
            'why_intern_here' => [
                "Kesempatan belajar langsung dari para ahli di bidang AI dan Machine Learning.",
                "Terlibat dalam proyek-proyek inovatif dan berdampak nyata bagi klien.",
                "Budaya kerja yang kolaboratif, suportif, dan mendorong perkembangan diri.",
                "Lingkungan yang dinamis dan mengikuti perkembangan teknologi terkini."
            ],
            'internship_application_info' => "Kami mencari talenta muda yang bersemangat di bidang AI, Data Science, dan Software Engineering. Kirimkan CV, surat lamaran, dan portofolio (jika ada) Anda ke email HR kami. Jelaskan mengapa Anda tertarik bergabung dan bagaimana Anda dapat berkontribusi pada tim kami. Proses seleksi meliputi review aplikasi, tes teknis (tergantung posisi), dan wawancara.",
            'relevant_tech' => ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker', 'Git'] // Field baru
        ],
        '2' => [
            'id' => 2, 'name' => 'PT Maju Bersama', 'category' => 'Keuangan', 'type' => 'BUMN',
            'description' => 'Lembaga keuangan terpercaya sejak 1980, menyediakan berbagai layanan perbankan dan investasi.',
            'long_description' => 'PT Maju Bersama adalah salah satu Badan Usaha Milik Negara (BUMN) yang bergerak di sektor keuangan. Dengan pengalaman lebih dari empat dekade, kami berkomitmen untuk menyediakan layanan keuangan yang inklusif dan berkelanjutan bagi masyarakat Indonesia. Produk kami meliputi tabungan, pinjaman, investasi, dan layanan digital banking.',
            'image_url' => 'https://placehold.co/600x400/A2D9CE/1E8449?text=Maju+Bersama+Detail&font=Roboto',
            'logo_url' => 'https://placehold.co/100x100/A2D9CE/1E8449?text=MB&font=Roboto',
            'address' => 'Jl. Keuangan Utama No. 45, Surabaya, Jawa Timur 67890',
            'website' => 'https://majubersama.example.com',
            'email' => 'rekrutmen@majubersama.example.com',
            'phone' => '031-7654321',
            'why_intern_here' => [
                "Pemahaman mendalam tentang industri keuangan dan perbankan nasional.",
                "Pengalaman praktis dalam operasional lembaga keuangan besar dan terstruktur.",
                "Jaringan profesional yang luas dan kesempatan mentoring.",
                "Kontribusi dalam program-program yang mendukung literasi keuangan masyarakat."
            ],
            'internship_application_info' => "Mahasiswa dengan minat di bidang keuangan, akuntansi, manajemen risiko, atau layanan nasabah dipersilakan untuk mengirimkan lamaran magang. Tunjukkan inisiatif dan semangat belajar Anda. Lamaran dapat dikirim melalui portal karir kami atau email rekrutmen. Sertakan transkrip nilai terakhir.",
            'relevant_tech' => ['Java', 'Spring Boot', 'Oracle DB', 'React', 'Microservices']
        ],
         '3' => [
            'id' => 3, 'name' => 'PT Cipta Karya', 'category' => 'Manufaktur', 'type' => 'Swasta',
            'description' => 'Produsen barang konsumsi berkualitas tinggi dengan jaringan distribusi nasional.',
            'long_description' => 'PT Cipta Karya adalah perusahaan manufaktur swasta terkemuka yang menghasilkan berbagai produk konsumsi sehari-hari. Sejak berdiri, kami selalu mengutamakan kualitas, inovasi produk, dan kepuasan pelanggan. Fasilitas produksi kami dilengkapi dengan teknologi modern dan standar operasional yang tinggi.',
            'image_url' => 'https://placehold.co/600x400/F5B7B1/922B21?text=Cipta+Karya+Detail&font=Roboto',
            'logo_url' => 'https://placehold.co/100x100/F5B7B1/922B21?text=CK&font=Roboto',
            'address' => 'Jl. Industri Bersama No. 78, Bandung, Jawa Barat 54321',
            'website' => 'https://ciptakarya.example.com',
            'email' => 'karir@ciptakarya.example.com',
            'phone' => '022-9876543',
            'why_intern_here' => [
                "Mempelajari proses produksi dari hulu ke hilir secara komprehensif.",
                "Terlibat dalam quality control, pengembangan produk baru, dan efisiensi operasional.",
                "Pengalaman di perusahaan manufaktur dengan standar kualitas internasional.",
                "Kesempatan untuk melihat langsung penerapan lean manufacturing."
            ],
            'internship_application_info' => "Jika Anda tertarik dengan dunia manufaktur, supply chain, atau R&D produk, kirimkan aplikasi magang Anda. Kami menghargai mahasiswa yang detail, proaktif, dan memiliki kemampuan problem-solving yang baik. Cek ketersediaan posisi magang di website kami.",
            'relevant_tech' => ['SAP', 'AutoCAD', 'PLC Programming', 'Quality Management Systems']
        ],
        'dummy-pertamina' => [
            'id' => 'dummy-pertamina', 'name' => 'Pertamina', 'category' => 'Energi & Pertambangan', 'type' => 'BUMN',
            'description' => 'Kesempatan emas berkarir di salah satu BUMN terbesar Indonesia.',
            'long_description' => 'Sebagai perusahaan energi nasional, Pertamina berkomitmen untuk menyediakan energi bagi negeri dan berkontribusi pada pembangunan berkelanjutan. Magang di Pertamina memberikan wawasan unik tentang industri energi dari eksplorasi hingga distribusi, serta berbagai aspek bisnis pendukungnya.',
            'image_url' => 'https://placehold.co/600x400/E67E22/FFFFFF?text=Pertamina+Detail&font=Poppins',
            'logo_url' => 'https://placehold.co/100x100/E67E22/FFFFFF?text=P&font=Poppins',
            'address' => 'Jl. Medan Merdeka Timur 1A, Jakarta Pusat, DKI Jakarta 10110',
            'website' => 'https://www.pertamina.com',
            'email' => 'recruitment@pertamina.com',
            'phone' => '(021) 3815111',
             'why_intern_here' => [
                "Kontribusi nyata bagi ketahanan energi nasional.",
                "Skala operasional yang besar dan beragam, mencakup berbagai disiplin ilmu.",
                "Program pengembangan diri yang terstruktur untuk peserta magang.",
                "Mengenal budaya kerja BUMN energi terkemuka."
            ],
            'internship_application_info' => "Pertamina secara berkala membuka program magang untuk berbagai jenjang pendidikan dan jurusan. Kunjungi website karir resmi kami untuk informasi terbaru mengenai persyaratan dan jadwal pendaftaran, atau kirimkan inquiry ke email rekrutmen.",
            'relevant_tech' => ['Process Simulation (Aspen HYSYS)', 'GIS', 'Data Analytics', 'Project Management Tools']
        ],
         'dummy-kai' => [
            'id' => 'dummy-kai', 'name' => 'PT. KAI', 'category' => 'Transportasi & Logistik', 'type' => 'BUMN',
            'description' => 'Bergabung dengan tulang punggung transportasi kereta api nasional.',
            'long_description' => 'PT Kereta Api Indonesia (Persero) adalah operator utama perkeretaapian di Indonesia. Kami terus berinovasi untuk memberikan layanan transportasi yang aman, nyaman, efisien, dan terjangkau bagi seluruh lapisan masyarakat. Magang di KAI akan memberikan pengalaman di industri transportasi massal yang vital.',
            'image_url' => 'https://placehold.co/600x400/2980B9/FFFFFF?text=KAI+Detail&font=Poppins',
            'logo_url' => 'https://placehold.co/100x100/2980B9/FFFFFF?text=KAI&font=Poppins',
            'address' => 'Jl. Perintis Kemerdekaan No. 1, Bandung, Jawa Barat 40117',
            'website' => 'https://www.kai.id',
            'email' => 'contact@kai.id',
            'phone' => '121',
            'why_intern_here' => [
                "Memahami operasional sistem transportasi massal yang kompleks.",
                "Terlibat dalam proyek peningkatan layanan, infrastruktur, atau teknologi perkeretaapian.",
                "Budaya kerja yang dinamis dan berorientasi pada pelayanan publik.",
                "Kesempatan belajar tentang manajemen aset dan keselamatan transportasi."
            ],
            'internship_application_info' => "Informasi program magang PT KAI dapat ditemukan di situs resmi kai.id atau melalui pengumuman di media sosial kami. Tunjukkan minat Anda pada sektor transportasi dan perkeretaapian. Program magang biasanya dibuka untuk berbagai disiplin ilmu teknik, operasional, dan manajemen.",
            'relevant_tech' => ['Signaling Systems', 'Fleet Management Software', 'Ticketing Systems API', 'Network Infrastructure']
        ],
        'dummy-mandiri' => [
            'id' => 'dummy-mandiri', 'name' => 'Bank Mandiri', 'category' => 'Keuangan & Perbankan', 'type' => 'BUMN',
            'description' => 'Karir di salah satu bank terbesar dengan jaringan luas.',
            'long_description' => 'Bank Mandiri adalah salah satu bank terkemuka di Indonesia yang menyediakan beragam layanan keuangan untuk nasabah individu maupun korporasi. Kami berkomitmen pada pertumbuhan berkelanjutan, inovasi digital, dan inklusi keuangan. Magang di Bank Mandiri membuka pintu ke dunia perbankan modern.',
            'image_url' => 'https://placehold.co/600x400/3498DB/FFFFFF?text=Mandiri+Detail&font=Poppins',
            'logo_url' => 'https://placehold.co/100x100/3498DB/FFFFFF?text=BMRI&font=Poppins',
            'address' => 'Jl. Jend. Gatot Subroto Kav. 36-38, Jakarta Selatan, DKI Jakarta 12190',
            'website' => 'https://www.bankmandiri.co.id',
            'email' => 'mandiricare@bankmandiri.co.id',
            'phone' => '14000',
            'why_intern_here' => [
                "Eksposur ke berbagai aspek industri perbankan modern, dari ritel hingga korporat.",
                "Kesempatan untuk belajar dari profesional berpengalaman di bidangnya.",
                "Pengembangan soft skills dan hard skills yang relevan untuk karir di sektor keuangan.",
                "Terlibat dalam proyek-proyek yang mendukung transformasi digital bank."
            ],
            'internship_application_info' => "Bank Mandiri memiliki berbagai program magang untuk mahasiswa dari berbagai jurusan, terutama Ekonomi, Bisnis, IT, dan Hukum. Cek halaman karir kami secara berkala untuk lowongan magang dan siapkan diri Anda dengan baik untuk proses seleksi.",
            'relevant_tech' => ['Core Banking Systems', 'Fintech APIs', 'Cybersecurity Tools', 'Data Warehouse']
        ]
    ];

    if (isset($dummyCompanies[$companyId])) {
        // Simulasi pengambilan dari DB
        // Di aplikasi nyata, Anda akan melakukan query ke tabel 'companies'
        // $stmt = $pdo->prepare("SELECT * FROM companies WHERE id = :id");
        // $stmt->bindParam(':id', $companyId, PDO::PARAM_STR); // atau PDO::PARAM_INT jika ID numerik
        // $stmt->execute();
        // $company = $stmt->fetch(PDO::FETCH_ASSOC);
        // if ($company) {
        //     // Jika 'relevant_tech' disimpan sebagai JSON di DB:
        //     // $company['relevant_tech'] = json_decode($company['relevant_tech_json'], true) ?: [];
        //     return ['status' => 'success', 'company' => $company];
        // } else {
        //     return ['status' => 'error', 'message' => 'Perusahaan tidak ditemukan.'];
        // }
        return ['status' => 'success', 'company' => $dummyCompanies[$companyId]];
    } else {
        return ['status' => 'error', 'message' => 'Perusahaan tidak ditemukan (data dummy).'];
    }
}

// Fungsi untuk mengambil daftar semua perusahaan (untuk halaman Home)
// Ini juga bisa menggunakan data dummy untuk saat ini
function handle_get_company_list($pdo) {
    // requireLogin(); // Bisa dilihat publik
    
    // Untuk saat ini, kita bisa hardcode beberapa data yang akan ditampilkan di Home
    // atau ambil sebagian dari $dummyCompanies di atas.
    // Idealnya, ini akan query ke tabel 'companies' dengan pagination jika perlu.
    $companyList = [
        [
            'id' => '1', 'name' => 'PT Anjas Sejati', 'category' => 'Teknologi', 'type' => 'PT',
            'description' => 'Pengembangan solusi AI inovatif.',
            'imageUrl' => WEB_UPLOADS_PATH . '/company_logos/anjas_sejati_logo.png', // Atau thumbnail banner
            'logo_url' => WEB_UPLOADS_PATH . '/company_logos/anjas_sejati_logo.png'
        ],
        [
            'id' => '2', 'name' => 'PT Maju Bersama', 'category' => 'Keuangan', 'type' => 'BUMN',
            'description' => 'Lembaga keuangan terpercaya.',
            'imageUrl' => 'https://placehold.co/325x200/A2D9CE/1E8449?text=Maju+Bersama&font=Roboto',
            'logo_url' => 'https://placehold.co/100x100/A2D9CE/1E8449?text=MB&font=Roboto'
        ],
        [
            'id' => 'dummy-pertamina', 'name' => 'Pertamina', 'category' => 'Energi & Pertambangan', 'type' => 'BUMN',
            'description' => 'Kesempatan emas berkarir.',
            'imageUrl' => 'https://placehold.co/325x200/E67E22/FFFFFF?text=Pertamina&font=Poppins',
            'logo_url' => 'https://placehold.co/100x100/E67E22/FFFFFF?text=P&font=Poppins'
        ],
         [
            'id' => 'dummy-kai', 'name' => 'PT. KAI', 'category' => 'Transportasi & Logistik', 'type' => 'BUMN',
            'description' => 'Tulang punggung transportasi.',
            'imageUrl' => 'https://placehold.co/325x200/2980B9/FFFFFF?text=KAI&font=Poppins',
            'logo_url' => 'https://placehold.co/100x100/2980B9/FFFFFF?text=KAI&font=Poppins'
        ],
    ];
    // Filter berdasarkan kategori jika ada parameter
    $categoryFilter = strtolower(trim($_GET['category'] ?? ''));
    if (!empty($categoryFilter) && $categoryFilter !== 'semua kategori') {
        $companyList = array_filter($companyList, function($company) use ($categoryFilter) {
            return strtolower($company['category']) === $categoryFilter;
        });
        $companyList = array_values($companyList); // Re-index array
    }


    // Di aplikasi nyata:
    // $sql = "SELECT id, name, category, type, short_description, logo_url, banner_thumbnail_url FROM companies WHERE status = 'active'";
    // if (!empty($categoryFilter) && $categoryFilter !== 'semua kategori') {
    //     $sql .= " AND LOWER(category) = :category";
    // }
    // $sql .= " ORDER BY name ASC";
    // $stmt = $pdo->prepare($sql);
    // if (!empty($categoryFilter) && $categoryFilter !== 'semua kategori') {
    //    $stmt->bindParam(':category', $categoryFilter, PDO::PARAM_STR);
    // }
    // $stmt->execute();
    // $companyList = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['status' => 'success', 'companies' => $companyList];
}

?>
