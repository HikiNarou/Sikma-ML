-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2025 at 12:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sikma_dbv3`
--

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `type_id` int(10) UNSIGNED DEFAULT NULL,
  `description_short` text DEFAULT NULL,
  `description_long` text DEFAULT NULL,
  `logo_url` varchar(512) DEFAULT NULL,
  `banner_image_url` varchar(512) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website_url` varchar(512) DEFAULT NULL,
  `email_contact` varchar(255) DEFAULT NULL,
  `phone_contact` varchar(50) DEFAULT NULL,
  `why_intern_here` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of strings' CHECK (json_valid(`why_intern_here`)),
  `internship_application_info` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Untuk menonaktifkan sementara',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `category_id`, `type_id`, `description_short`, `description_long`, `logo_url`, `banner_image_url`, `address`, `website_url`, `email_contact`, `phone_contact`, `why_intern_here`, `internship_application_info`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PT Anjas Sejati', 1, 1, 'Pengembangan solusi AI inovatif.', 'Didirikan pada tahun 2015, PT Anjas Sejati telah menjadi pelopor dalam aplikasi AI di Indonesia...', 'https://placehold.co/100x100/A9CCE3/2C3E50?text=AS&font=Roboto', 'https://placehold.co/600x400/A9CCE3/2C3E50?text=Anjas+Sejati+Detail&font=Roboto', 'Jl. Teknologi Raya No. 123, Jakarta', 'https://anjassejati.example.com', 'hr@anjassejati.example.com', '021-1234567', '[\"Kesempatan belajar langsung dari para ahli di bidang AI.\", \"Terlibat dalam proyek-proyek inovatif dan berdampak.\"]', 'Kirimkan CV dan portofolio Anda ke email HR kami.', 1, '2025-05-16 03:56:40', '2025-05-16 03:56:40'),
(2, 'PT Maju Bersama', 2, 2, 'Lembaga keuangan terpercaya sejak 1980.', 'PT Maju Bersama adalah salah satu Badan Usaha Milik Negara (BUMN) yang bergerak di sektor keuangan...', 'https://placehold.co/100x100/A2D9CE/1E8449?text=MB&font=Roboto', 'https://placehold.co/600x400/A2D9CE/1E8449?text=Maju+Bersama+Detail&font=Roboto', 'Jl. Keuangan Utama No. 45, Surabaya', 'https://majubersama.example.com', 'rekrutmen@majubersama.example.com', '031-7654321', '[\"Pemahaman mendalam tentang industri keuangan.\", \"Pengalaman praktis dalam operasional lembaga keuangan besar.\"]', 'Mahasiswa dengan minat di bidang keuangan dipersilakan melamar.', 1, '2025-05-16 03:56:40', '2025-05-16 03:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `company_categories`
--

CREATE TABLE `company_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL COMMENT 'Untuk URL-friendly filter',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_categories`
--

INSERT INTO `company_categories` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Teknologi', 'teknologi', '2025-05-16 03:56:40'),
(2, 'Keuangan', 'keuangan', '2025-05-16 03:56:40'),
(3, 'Manufaktur', 'manufaktur', '2025-05-16 03:56:40'),
(4, 'Energi & Pertambangan', 'energi-pertambangan', '2025-05-16 03:56:40'),
(5, 'Transportasi & Logistik', 'transportasi-logistik', '2025-05-16 03:56:40'),
(6, 'Pendidikan', 'pendidikan', '2025-05-16 03:56:40'),
(7, 'Kesehatan', 'kesehatan', '2025-05-16 03:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `company_types`
--

CREATE TABLE `company_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'e.g., PT, BUMN, Swasta, Startup',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_types`
--

INSERT INTO `company_types` (`id`, `name`, `created_at`) VALUES
(1, 'PT (Perseroan Terbatas)', '2025-05-16 03:56:40'),
(2, 'BUMN (Badan Usaha Milik Negara)', '2025-05-16 03:56:40'),
(3, 'Swasta Nasional', '2025-05-16 03:56:40'),
(4, 'Swasta Asing (PMA)', '2025-05-16 03:56:40'),
(5, 'Startup', '2025-05-16 03:56:40'),
(6, 'Lembaga Pemerintah', '2025-05-16 03:56:40'),
(7, 'Organisasi Nirlaba', '2025-05-16 03:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nim` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Path to avatar file or URL',
  `bio` text DEFAULT NULL,
  `semester` int(2) DEFAULT NULL,
  `ipk` decimal(3,2) DEFAULT NULL,
  `kota_asal` varchar(100) DEFAULT NULL,
  `kecamatan` varchar(100) DEFAULT NULL,
  `kelurahan` varchar(100) DEFAULT NULL,
  `is_profile_complete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = Not complete, 1 = Complete',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `email`, `nim`, `password`, `avatar`, `bio`, `semester`, `ipk`, `kota_asal`, `kecamatan`, `kelurahan`, `is_profile_complete`, `created_at`, `updated_at`) VALUES
(1, 'RAIHAN NURHADI', 'kanami.etou21@gmail.com', '062340833117', '$2y$10$HMRqRg/FZC34x5ylyxtrLuqwqMG9.65zbIy1Eekn.jDil7mhV.4.m', 'https://i.ibb.co/gFJHyVxw/profile-merah.jpg', 'RAIHAN WOI', 4, 3.58, 'PALEMBANG', '16 ULU', 'SEBERANG ULU II', 1, '2025-05-16 03:58:58', '2025-05-26 10:20:54'),
(2, 'NOVAL FADILLAH', 'novalanjay@gmail.com', '062340833119', '$2y$10$gvCknMBykOCajjnm9PMZDOZ6ZH/4t7A3UX699NaA3fgXWAcd3xasu', 'https://placehold.co/80x80/3498db/ffffff?text=N', '', NULL, NULL, NULL, NULL, NULL, 0, '2025-05-16 06:36:00', '2025-05-16 06:36:20'),
(3, 'Lutfi Ramadhan', 'lutfi@gmail.com', '062340833116', '$2y$10$wGNCwS/U15qQe1R9G4jT.eQAYb/7fL7Lg9I1qXQpt0Oaw6tiAWtpK', 'https://placehold.co/80x80/3498db/ffffff?text=L', NULL, 5, NULL, NULL, NULL, NULL, 0, '2025-05-18 18:33:46', '2025-05-18 18:33:46'),
(4, 'AIDIL PACE', 'pace@gmail.com', '062340833115', '$2y$10$HMcndsiSxq5fsS76J3AXI.Mdos1tPs4WiMyK2ErQ7qEOHn3GNUq0e', 'https://placehold.co/80x80/3498db/ffffff?text=A', NULL, 5, NULL, NULL, NULL, NULL, 0, '2025-05-19 12:53:36', '2025-05-19 12:53:36');

-- --------------------------------------------------------

--
-- Table structure for table `user_education_history`
--

CREATE TABLE `user_education_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `degree` varchar(100) DEFAULT NULL COMMENT 'e.g., S1, D3, SMA/SMK',
  `field_of_study` varchar(255) DEFAULT NULL COMMENT 'e.g., Teknik Informatika',
  `start_date` varchar(7) DEFAULT NULL COMMENT 'Format YYYY-MM',
  `end_date` varchar(7) DEFAULT NULL COMMENT 'Format YYYY-MM, NULL if ongoing',
  `description` text DEFAULT NULL COMMENT 'Nilai, kegiatan, pencapaian',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_frameworks`
--

CREATE TABLE `user_frameworks` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `framework_name` varchar(100) NOT NULL,
  `skill_level` varchar(50) DEFAULT NULL,
  `experience_duration` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_industry_preferences`
--

CREATE TABLE `user_industry_preferences` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `industry_name` varchar(150) NOT NULL COMMENT 'e.g., Fintech, E-commerce, Edukasi',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_other_skills`
--

CREATE TABLE `user_other_skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `skill_name` varchar(150) NOT NULL,
  `skill_level` varchar(50) DEFAULT NULL,
  `experience_duration` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_programming_skills`
--

CREATE TABLE `user_programming_skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `skill_level` varchar(50) DEFAULT NULL COMMENT 'e.g., Dasar, Menengah, Mahir',
  `experience_duration` varchar(100) DEFAULT NULL COMMENT 'e.g., 1 tahun, 6 bulan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_programming_skills`
--

INSERT INTO `user_programming_skills` (`id`, `user_id`, `skill_name`, `skill_level`, `experience_duration`, `created_at`, `updated_at`) VALUES
(7, 1, 'R', 'Menengah', '2 Bulan', '2025-05-26 10:20:54', '2025-05-26 10:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `user_remember_tokens`
--

CREATE TABLE `user_remember_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `selector` varchar(32) NOT NULL,
  `validator_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_social_links`
--

CREATE TABLE `user_social_links` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `platform_name` varchar(100) NOT NULL COMMENT 'e.g., LinkedIn, GitHub, Portfolio',
  `url` varchar(512) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_tools`
--

CREATE TABLE `user_tools` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `tool_name` varchar(150) NOT NULL,
  `skill_level` varchar(50) DEFAULT NULL COMMENT 'e.g., Dasar, Menengah, Mahir, Sering Digunakan',
  `experience_duration` varchar(100) DEFAULT NULL COMMENT 'e.g., 1 tahun, 6 bulan, >2 tahun',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_work_experience`
--

CREATE TABLE `user_work_experience` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `start_date` varchar(7) DEFAULT NULL COMMENT 'Format YYYY-MM',
  `end_date` varchar(7) DEFAULT NULL COMMENT 'Format YYYY-MM, NULL if current',
  `description` text DEFAULT NULL COMMENT 'Tanggung jawab, proyek, pencapaian',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id_idx` (`category_id`),
  ADD KEY `type_id_idx` (`type_id`);

--
-- Indexes for table `company_categories`
--
ALTER TABLE `company_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_unique` (`name`),
  ADD UNIQUE KEY `slug_unique` (`slug`);

--
-- Indexes for table `company_types`
--
ALTER TABLE `company_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_unique` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`),
  ADD UNIQUE KEY `nim_unique` (`nim`);

--
-- Indexes for table `user_education_history`
--
ALTER TABLE `user_education_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- Indexes for table `user_frameworks`
--
ALTER TABLE `user_frameworks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_framework_unique` (`user_id`,`framework_name`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- Indexes for table `user_industry_preferences`
--
ALTER TABLE `user_industry_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_industry_preference_unique` (`user_id`,`industry_name`),
  ADD KEY `user_id_idx_industry_pref` (`user_id`);

--
-- Indexes for table `user_other_skills`
--
ALTER TABLE `user_other_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_other_skill_unique` (`user_id`,`skill_name`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- Indexes for table `user_programming_skills`
--
ALTER TABLE `user_programming_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_skill_unique` (`user_id`,`skill_name`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- Indexes for table `user_remember_tokens`
--
ALTER TABLE `user_remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `selector` (`selector`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_social_links`
--
ALTER TABLE `user_social_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_platform_unique` (`user_id`,`platform_name`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- Indexes for table `user_tools`
--
ALTER TABLE `user_tools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_tool_unique` (`user_id`,`tool_name`),
  ADD KEY `user_id_idx_tools` (`user_id`);

--
-- Indexes for table `user_work_experience`
--
ALTER TABLE `user_work_experience`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `company_categories`
--
ALTER TABLE `company_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `company_types`
--
ALTER TABLE `company_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_education_history`
--
ALTER TABLE `user_education_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_frameworks`
--
ALTER TABLE `user_frameworks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_industry_preferences`
--
ALTER TABLE `user_industry_preferences`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_other_skills`
--
ALTER TABLE `user_other_skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_programming_skills`
--
ALTER TABLE `user_programming_skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_remember_tokens`
--
ALTER TABLE `user_remember_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_social_links`
--
ALTER TABLE `user_social_links`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_tools`
--
ALTER TABLE `user_tools`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_work_experience`
--
ALTER TABLE `user_work_experience`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `fk_company_category` FOREIGN KEY (`category_id`) REFERENCES `company_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_company_type` FOREIGN KEY (`type_id`) REFERENCES `company_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_education_history`
--
ALTER TABLE `user_education_history`
  ADD CONSTRAINT `fk_education_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_frameworks`
--
ALTER TABLE `user_frameworks`
  ADD CONSTRAINT `fk_framework_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_industry_preferences`
--
ALTER TABLE `user_industry_preferences`
  ADD CONSTRAINT `fk_industry_preference_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_other_skills`
--
ALTER TABLE `user_other_skills`
  ADD CONSTRAINT `fk_other_skill_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_programming_skills`
--
ALTER TABLE `user_programming_skills`
  ADD CONSTRAINT `fk_prog_skill_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_remember_tokens`
--
ALTER TABLE `user_remember_tokens`
  ADD CONSTRAINT `user_remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_social_links`
--
ALTER TABLE `user_social_links`
  ADD CONSTRAINT `fk_social_link_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_tools`
--
ALTER TABLE `user_tools`
  ADD CONSTRAINT `fk_tool_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_work_experience`
--
ALTER TABLE `user_work_experience`
  ADD CONSTRAINT `fk_experience_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
