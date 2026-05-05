-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: erp_travel_umroh
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `kode_agent` varchar(10) NOT NULL,
  `nama_agent` varchar(150) NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `persentase_bonus` decimal(5,2) NOT NULL DEFAULT 0.00,
  `nominal_bonus_per_jamaah` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tipe_bonus` enum('persentase','nominal') NOT NULL DEFAULT 'nominal',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agents_kode_agent_unique` (`kode_agent`),
  KEY `agents_user_id_foreign` (`user_id`),
  CONSTRAINT `agents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,NULL,'A-00001','RAIHAN','081299887766','Jakarta',0.00,2000000.00,'nominal','aktif','2026-04-29 09:26:28','2026-04-29 09:26:28',NULL);
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bonus_agent`
--

DROP TABLE IF EXISTS `bonus_agent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bonus_agent` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agent_id` bigint(20) unsigned NOT NULL,
  `booking_id` bigint(20) unsigned NOT NULL,
  `nominal_bonus` decimal(15,2) NOT NULL,
  `status` enum('pending','dibayar') NOT NULL DEFAULT 'pending',
  `tgl_bayar` datetime DEFAULT NULL,
  `paid_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bonus_agent_agent_id_foreign` (`agent_id`),
  KEY `bonus_agent_booking_id_foreign` (`booking_id`),
  KEY `bonus_agent_paid_by_foreign` (`paid_by`),
  CONSTRAINT `bonus_agent_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bonus_agent_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bonus_agent_paid_by_foreign` FOREIGN KEY (`paid_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bonus_agent`
--

LOCK TABLES `bonus_agent` WRITE;
/*!40000 ALTER TABLE `bonus_agent` DISABLE KEYS */;
/*!40000 ALTER TABLE `bonus_agent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_layanan`
--

DROP TABLE IF EXISTS `booking_layanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_layanan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `layanan_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `harga_satuan` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_layanan_booking_id_foreign` (`booking_id`),
  KEY `booking_layanan_layanan_id_foreign` (`layanan_id`),
  CONSTRAINT `booking_layanan_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_layanan_layanan_id_foreign` FOREIGN KEY (`layanan_id`) REFERENCES `layanan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_layanan`
--

LOCK TABLES `booking_layanan` WRITE;
/*!40000 ALTER TABLE `booking_layanan` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_layanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `jadwal_id` bigint(20) unsigned NOT NULL,
  `agent_id` bigint(20) unsigned DEFAULT NULL,
  `kode_booking` varchar(30) NOT NULL,
  `status` enum('pending','waiting_payment','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `status_dokumen` enum('incomplete','review','valid','rejected') NOT NULL DEFAULT 'incomplete',
  `total_harga` decimal(15,2) NOT NULL,
  `total_dibayar` decimal(15,2) NOT NULL DEFAULT 0.00,
  `catatan_jamaah` text DEFAULT NULL,
  `catatan_admin` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_per_jadwal` (`user_id`,`jadwal_id`),
  UNIQUE KEY `bookings_kode_booking_unique` (`kode_booking`),
  KEY `bookings_jadwal_id_foreign` (`jadwal_id`),
  KEY `bookings_status_index` (`status`),
  KEY `bookings_status_dokumen_index` (`status_dokumen`),
  KEY `bookings_agent_id_foreign` (`agent_id`),
  CONSTRAINT `bookings_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_jadwal_id_foreign` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,NULL,'BKG-20260429-KAVP','confirmed','incomplete',29000000.00,15000000.00,NULL,NULL,'2026-04-29 11:47:49','2026-04-30 07:48:10',NULL),(2,5,1,NULL,'BKG-20260429-IESI','pending','incomplete',29000000.00,0.00,NULL,NULL,'2026-04-29 15:18:48','2026-04-29 15:18:48',NULL),(3,6,1,NULL,'BKG-20260430-Q1VP','pending','incomplete',29000000.00,0.00,NULL,NULL,'2026-04-30 03:18:29','2026-04-30 03:18:29',NULL),(4,1,2,NULL,'BKG-20260430-NFEX','confirmed','incomplete',37500000.00,37500000.00,NULL,NULL,'2026-04-30 05:35:23','2026-04-30 06:18:20',NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distribusi_perlengkapan`
--

DROP TABLE IF EXISTS `distribusi_perlengkapan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distribusi_perlengkapan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `perlengkapan_id` bigint(20) unsigned NOT NULL,
  `jumlah` int(10) unsigned NOT NULL DEFAULT 1,
  `status_penyerahan` enum('pending','diserahkan','dikirim') NOT NULL DEFAULT 'pending',
  `tgl_penyerahan` timestamp NULL DEFAULT NULL,
  `distributed_by` bigint(20) unsigned DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_distribusi_per_booking` (`booking_id`,`perlengkapan_id`),
  KEY `distribusi_perlengkapan_perlengkapan_id_foreign` (`perlengkapan_id`),
  KEY `distribusi_perlengkapan_distributed_by_foreign` (`distributed_by`),
  KEY `distribusi_perlengkapan_status_penyerahan_index` (`status_penyerahan`),
  CONSTRAINT `distribusi_perlengkapan_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `distribusi_perlengkapan_distributed_by_foreign` FOREIGN KEY (`distributed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `distribusi_perlengkapan_perlengkapan_id_foreign` FOREIGN KEY (`perlengkapan_id`) REFERENCES `master_perlengkapan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distribusi_perlengkapan`
--

LOCK TABLES `distribusi_perlengkapan` WRITE;
/*!40000 ALTER TABLE `distribusi_perlengkapan` DISABLE KEYS */;
INSERT INTO `distribusi_perlengkapan` VALUES (1,4,1,1,'diserahkan','2026-04-30 06:20:44',4,NULL,'2026-04-30 05:57:42','2026-04-30 06:20:44'),(2,4,2,1,'diserahkan','2026-04-30 07:55:56',4,NULL,'2026-04-30 05:57:42','2026-04-30 07:55:56'),(3,4,3,1,'diserahkan','2026-04-30 07:55:59',4,NULL,'2026-04-30 05:57:42','2026-04-30 07:55:59'),(4,4,4,1,'diserahkan','2026-04-30 07:55:59',4,NULL,'2026-04-30 05:57:42','2026-04-30 07:55:59'),(5,4,5,1,'diserahkan','2026-04-30 07:55:59',4,NULL,'2026-04-30 05:57:42','2026-04-30 07:55:59'),(6,1,1,1,'diserahkan','2026-04-30 06:20:47',4,NULL,'2026-04-30 06:18:16','2026-04-30 06:20:47'),(7,1,2,1,'diserahkan','2026-04-30 06:20:47',4,NULL,'2026-04-30 06:18:16','2026-04-30 06:20:47'),(8,1,3,1,'diserahkan','2026-04-30 06:20:47',4,NULL,'2026-04-30 06:18:16','2026-04-30 06:20:47'),(9,1,4,1,'diserahkan','2026-04-30 06:20:47',4,NULL,'2026-04-30 06:18:16','2026-04-30 06:20:47'),(10,1,5,1,'diserahkan','2026-04-30 06:20:47',4,NULL,'2026-04-30 06:18:16','2026-04-30 06:20:47');
/*!40000 ALTER TABLE `distribusi_perlengkapan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotels`
--

DROP TABLE IF EXISTS `hotels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hotels` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_hotel` varchar(150) NOT NULL,
  `kota` enum('makkah','madinah') NOT NULL,
  `rating` enum('3','4','5') NOT NULL DEFAULT '4',
  `alamat` text DEFAULT NULL,
  `jarak_ke_masjid` varchar(100) DEFAULT NULL,
  `foto_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotels`
--

LOCK TABLES `hotels` WRITE;
/*!40000 ALTER TABLE `hotels` DISABLE KEYS */;
INSERT INTO `hotels` VALUES (1,'Hilton Makkah Convention','makkah','5',NULL,'200m',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(2,'Pullman ZamZam Makkah','makkah','5',NULL,'100m',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(3,'Oberoi Madinah','madinah','5',NULL,'300m',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(4,'Shaza Madinah','madinah','4',NULL,'500m',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28');
/*!40000 ALTER TABLE `hotels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jadwal`
--

DROP TABLE IF EXISTS `jadwal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jadwal` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `paket_id` bigint(20) unsigned NOT NULL,
  `kode_jadwal` varchar(30) NOT NULL,
  `tanggal_berangkat` date NOT NULL,
  `tanggal_pulang` date NOT NULL,
  `kota_keberangkatan` varchar(100) NOT NULL DEFAULT 'Jakarta',
  `kuota_total` int(10) unsigned NOT NULL,
  `sisa_kuota` int(10) unsigned NOT NULL,
  `status` enum('upcoming','open','closed','departed','completed') NOT NULL DEFAULT 'open',
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jadwal_kode_jadwal_unique` (`kode_jadwal`),
  KEY `jadwal_paket_id_foreign` (`paket_id`),
  KEY `jadwal_tanggal_berangkat_status_index` (`tanggal_berangkat`,`status`),
  KEY `jadwal_status_index` (`status`),
  CONSTRAINT `jadwal_paket_id_foreign` FOREIGN KEY (`paket_id`) REFERENCES `paket_umroh` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwal`
--

LOCK TABLES `jadwal` WRITE;
/*!40000 ALTER TABLE `jadwal` DISABLE KEYS */;
INSERT INTO `jadwal` VALUES (1,1,'MIlad13','2026-10-11','2026-10-20','Jakarta',5,4,'open',NULL,'2026-04-29 11:46:55','2026-04-30 06:18:16',NULL),(2,2,'6353','2026-08-19','2026-08-30','Jakarta',40,39,'open',NULL,'2026-04-30 05:12:38','2026-04-30 05:57:42',NULL);
/*!40000 ALTER TABLE `jadwal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `karyawan`
--

DROP TABLE IF EXISTS `karyawan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `karyawan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `kode_karyawan` varchar(10) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `departemen` enum('operasional','keuangan','marketing','gudang') NOT NULL DEFAULT 'operasional',
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `gaji` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tanggal_masuk` date DEFAULT NULL,
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `karyawan_kode_karyawan_unique` (`kode_karyawan`),
  KEY `karyawan_user_id_foreign` (`user_id`),
  CONSTRAINT `karyawan_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `karyawan`
--

LOCK TABLES `karyawan` WRITE;
/*!40000 ALTER TABLE `karyawan` DISABLE KEYS */;
INSERT INTO `karyawan` VALUES (1,NULL,'K-00001','Siti Nurhaliza','CS Officer','operasional','081366778899',NULL,5000000.00,'2025-01-15','aktif','2026-04-29 09:26:28','2026-04-29 09:26:28',NULL);
/*!40000 ALTER TABLE `karyawan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `layanan`
--

DROP TABLE IF EXISTS `layanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `layanan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_layanan` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(15,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `layanan`
--

LOCK TABLES `layanan` WRITE;
/*!40000 ALTER TABLE `layanan` DISABLE KEYS */;
INSERT INTO `layanan` VALUES (1,'Upgrade Kursi (Business)','Upgrade ke business class',5000000.00,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(2,'Handling VIP Bandara','Fast track + lounge',1500000.00,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(3,'Ziarah Tambahan','City tour Thaif + ziarah',2000000.00,1,'2026-04-29 09:26:28','2026-04-29 09:26:28');
/*!40000 ALTER TABLE `layanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manasiks`
--

DROP TABLE IF EXISTS `manasiks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manasiks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `jadwal_id` bigint(20) unsigned NOT NULL,
  `judul` varchar(255) NOT NULL,
  `konten` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  `jadwal_detail` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manasiks_jadwal_id_foreign` (`jadwal_id`),
  CONSTRAINT `manasiks_jadwal_id_foreign` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manasiks`
--

LOCK TABLES `manasiks` WRITE;
/*!40000 ALTER TABLE `manasiks` DISABLE KEYS */;
INSERT INTO `manasiks` VALUES (1,1,'keberangkatan','matri',NULL,1,'19.00 kumul di bandara','2026-04-30 04:00:50','2026-04-30 04:00:50',NULL),(2,1,'sampai di mekkah','dasindasdas',NULL,2,'02.00','2026-04-30 04:04:22','2026-04-30 04:04:22',NULL);
/*!40000 ALTER TABLE `manasiks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maskapai`
--

DROP TABLE IF EXISTS `maskapai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maskapai` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode_maskapai` varchar(10) NOT NULL,
  `nama_maskapai` varchar(100) NOT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `maskapai_kode_maskapai_unique` (`kode_maskapai`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maskapai`
--

LOCK TABLES `maskapai` WRITE;
/*!40000 ALTER TABLE `maskapai` DISABLE KEYS */;
INSERT INTO `maskapai` VALUES (1,'GA','Garuda Indonesia',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(2,'SV','Saudi Airlines',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(3,'SQ','Singapore Airlines',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(4,'JT','Lion Air',NULL,1,'2026-04-29 12:07:29','2026-04-29 12:07:29'),(5,'ID','Batik Air',NULL,1,'2026-04-29 12:19:07','2026-04-29 12:19:07');
/*!40000 ALTER TABLE `maskapai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `master_perlengkapan`
--

DROP TABLE IF EXISTS `master_perlengkapan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `master_perlengkapan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_barang` varchar(150) NOT NULL,
  `kode_barang` varchar(30) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `satuan` varchar(30) NOT NULL DEFAULT 'pcs',
  `stok_gudang` int(10) unsigned NOT NULL DEFAULT 0,
  `stok_minimum` int(10) unsigned NOT NULL DEFAULT 10,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_perlengkapan_kode_barang_unique` (`kode_barang`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_perlengkapan`
--

LOCK TABLES `master_perlengkapan` WRITE;
/*!40000 ALTER TABLE `master_perlengkapan` DISABLE KEYS */;
INSERT INTO `master_perlengkapan` VALUES (1,'Koper Umroh','BRG-KOPER',NULL,'pcs',98,20,1,'2026-04-29 09:26:28','2026-04-30 06:20:47',NULL),(2,'Kain Ihram','BRG-IHRAM',NULL,'set',148,30,1,'2026-04-29 09:26:28','2026-04-30 07:55:56',NULL),(3,'Mukena','BRG-MUKENA',NULL,'pcs',78,15,1,'2026-04-29 09:26:28','2026-04-30 07:55:59',NULL),(4,'Buku Doa & Manasik','BRG-BUKUDOA',NULL,'pcs',198,40,1,'2026-04-29 09:26:28','2026-04-30 07:55:59',NULL),(5,'Seragam Jamaah','BRG-SERAGAM',NULL,'pcs',118,25,1,'2026-04-29 09:26:28','2026-04-30 07:55:59',NULL);
/*!40000 ALTER TABLE `master_perlengkapan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2026_04_29_000001_create_users_table',1),(4,'2026_04_29_000002_create_paket_umroh_table',1),(5,'2026_04_29_000003_create_jadwal_table',1),(6,'2026_04_29_000004_create_bookings_table',1),(7,'2026_04_29_000005_create_pembayaran_table',1),(8,'2026_04_29_000006_create_master_perlengkapan_table',1),(9,'2026_04_29_000007_create_distribusi_perlengkapan_table',1),(10,'2026_04_29_075347_create_personal_access_tokens_table',1),(11,'2026_04_29_100001_add_kode_jamaah_to_users',1),(12,'2026_04_29_100002_create_new_modules_tables',1),(13,'2026_04_30_100524_add_google_id_to_users_table',2),(14,'2026_04_30_104351_create_manasiks_table',3),(15,'2026_04_30_105706_create_pengajuan_perlengkapans_table',4),(16,'2026_04_30_105706_create_perlengkapan_logs_table',4),(17,'2026_05_04_135234_modify_role_enum_in_users_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mitra`
--

DROP TABLE IF EXISTS `mitra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mitra` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_mitra` varchar(150) NOT NULL,
  `jenis` enum('bus','katering','handling','guide','lainnya') NOT NULL,
  `kontak` varchar(50) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mitra`
--

LOCK TABLES `mitra` WRITE;
/*!40000 ALTER TABLE `mitra` DISABLE KEYS */;
INSERT INTO `mitra` VALUES (1,'Nusantara Handling','handling','+966 555 0001',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28'),(2,'Madinah Bus Service','bus','+966 555 0002',NULL,1,'2026-04-29 09:26:28','2026-04-29 09:26:28');
/*!40000 ALTER TABLE `mitra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paket_umroh`
--

DROP TABLE IF EXISTS `paket_umroh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paket_umroh` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_paket` varchar(200) NOT NULL,
  `kode_paket` varchar(30) NOT NULL,
  `tipe` enum('reguler','vip','vvip') NOT NULL DEFAULT 'reguler',
  `deskripsi` text DEFAULT NULL,
  `durasi_hari` int(11) NOT NULL DEFAULT 9,
  `maskapai` varchar(100) DEFAULT NULL,
  `hotel_madinah` varchar(150) DEFAULT NULL,
  `hotel_makkah` varchar(150) DEFAULT NULL,
  `rating_hotel` enum('3','4','5') NOT NULL DEFAULT '4',
  `harga` decimal(15,2) NOT NULL,
  `dp_minimum` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fasilitas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fasilitas`)),
  `gambar_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paket_umroh_kode_paket_unique` (`kode_paket`),
  KEY `paket_umroh_is_active_index` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paket_umroh`
--

LOCK TABLES `paket_umroh` WRITE;
/*!40000 ALTER TABLE `paket_umroh` DISABLE KEYS */;
INSERT INTO `paket_umroh` VALUES (1,'MIlad','Paket Gold','reguler',NULL,9,'Saudi Arabia','meredien','aziad','4',29000000.00,5000000.00,'[\"Fulll Al in\"]',NULL,1,'2026-04-29 11:43:18','2026-04-29 11:43:18',NULL),(2,'H apip','Agustus','reguler',NULL,12,'Saudia','Mirage','Azka','4',37500000.00,5000000.00,'[null]',NULL,1,'2026-04-30 05:11:24','2026-04-30 05:11:24',NULL);
/*!40000 ALTER TABLE `paket_umroh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pemasukan`
--

DROP TABLE IF EXISTS `pemasukan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pemasukan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `jadwal_id` bigint(20) unsigned DEFAULT NULL,
  `sumber` enum('pembayaran_jamaah','sponsor','lainnya') NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `tanggal` date NOT NULL,
  `bukti_path` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pemasukan_jadwal_id_foreign` (`jadwal_id`),
  KEY `pemasukan_created_by_foreign` (`created_by`),
  CONSTRAINT `pemasukan_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `pemasukan_jadwal_id_foreign` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pemasukan`
--

LOCK TABLES `pemasukan` WRITE;
/*!40000 ALTER TABLE `pemasukan` DISABLE KEYS */;
INSERT INTO `pemasukan` VALUES (1,NULL,'pembayaran_jamaah','Ahmad',2000000.00,'2026-02-12',NULL,3,'2026-04-30 03:12:49','2026-04-30 03:12:49');
/*!40000 ALTER TABLE `pemasukan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembayaran`
--

DROP TABLE IF EXISTS `pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pembayaran` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `jenis_pembayaran` enum('dp','cicilan','lunas') NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `bukti_transfer_path` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `status_pembayaran` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `alasan_reject` text DEFAULT NULL,
  `verified_by` bigint(20) unsigned DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pembayaran_booking_id_foreign` (`booking_id`),
  KEY `pembayaran_verified_by_foreign` (`verified_by`),
  KEY `pembayaran_status_pembayaran_index` (`status_pembayaran`),
  CONSTRAINT `pembayaran_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pembayaran_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembayaran`
--

LOCK TABLES `pembayaran` WRITE;
/*!40000 ALTER TABLE `pembayaran` DISABLE KEYS */;
INSERT INTO `pembayaran` VALUES (1,4,'dp',10000000.00,'pembayaran/4/alb54u0RZWNhJOkpn2VNR8kY3ZFbFPJ8Q0pAty7o.jpg',NULL,'verified',NULL,3,'2026-04-30 05:57:42','2026-04-30 05:56:42','2026-04-30 05:57:42',NULL),(2,1,'dp',5000000.00,'pembayaran/1/e8IX2z03E6amBiazm2pQgzEn15WoVu9477aNt5MJ.jpg',NULL,'verified',NULL,3,'2026-04-30 06:18:16','2026-04-30 06:12:21','2026-04-30 06:18:16',NULL),(3,4,'lunas',27500000.00,'pembayaran/4/CRdH1yZO7jrx0PnEY19OkV5DkQwKqucFTWHC014E.jpg',NULL,'verified',NULL,3,'2026-04-30 06:18:20','2026-04-30 06:17:21','2026-04-30 06:18:20',NULL),(4,1,'lunas',10000000.00,'pembayaran/1/gLDyl0x2hwlzFquXk9hGjF9uRHCjXPjWXnogxJwT.jpg',NULL,'verified',NULL,3,'2026-04-30 07:48:10','2026-04-30 07:46:37','2026-04-30 07:48:10',NULL);
/*!40000 ALTER TABLE `pembayaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengajuan_perlengkapans`
--

DROP TABLE IF EXISTS `pengajuan_perlengkapans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengajuan_perlengkapans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `jenis_barang` varchar(255) NOT NULL,
  `qty` int(11) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `total_harga` decimal(15,2) NOT NULL,
  `status` enum('pending','acc_manager','dicairkan','diambil') NOT NULL DEFAULT 'pending',
  `catatan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengajuan_perlengkapans`
--

LOCK TABLES `pengajuan_perlengkapans` WRITE;
/*!40000 ALTER TABLE `pengajuan_perlengkapans` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengajuan_perlengkapans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengeluaran`
--

DROP TABLE IF EXISTS `pengeluaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengeluaran` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `jadwal_id` bigint(20) unsigned DEFAULT NULL,
  `kategori` enum('operasional','akomodasi','transportasi','konsumsi','visa','handling','gaji','lainnya') NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `tanggal` date NOT NULL,
  `bukti_path` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pengeluaran_jadwal_id_foreign` (`jadwal_id`),
  KEY `pengeluaran_created_by_foreign` (`created_by`),
  CONSTRAINT `pengeluaran_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `pengeluaran_jadwal_id_foreign` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengeluaran`
--

LOCK TABLES `pengeluaran` WRITE;
/*!40000 ALTER TABLE `pengeluaran` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengeluaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perlengkapan_logs`
--

DROP TABLE IF EXISTS `perlengkapan_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `perlengkapan_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `perlengkapan_id` bigint(20) unsigned NOT NULL,
  `jenis_log` enum('masuk','keluar','rusak','hilang','pinjam') NOT NULL,
  `qty` int(11) NOT NULL,
  `catatan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `perlengkapan_logs_perlengkapan_id_foreign` (`perlengkapan_id`),
  CONSTRAINT `perlengkapan_logs_perlengkapan_id_foreign` FOREIGN KEY (`perlengkapan_id`) REFERENCES `master_perlengkapan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perlengkapan_logs`
--

LOCK TABLES `perlengkapan_logs` WRITE;
/*!40000 ALTER TABLE `perlengkapan_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `perlengkapan_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (80,'App\\Models\\User',2,'auth-token','f772064633cd9267d511d24f07044a9566fef6815d0c29c64283a2054efd79d6','[\"*\"]','2026-05-04 08:21:51',NULL,'2026-05-04 07:53:56','2026-05-04 08:21:51');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('srvzC1vODS80vEqrGoRr1hwttiejAj5O3XB6LGJM',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYlNvY0p1aDFJcFJMR2RHSTJJM0VLYURJQnVqOGNxQ3hhTG5Bc3FXUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1777466594);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode_jamaah` varchar(10) DEFAULT NULL,
  `role` enum('jamaah','admin_travel','admin_keuangan','admin_perlengkapan','manager','mitra','agent') DEFAULT 'jamaah',
  `nik` varchar(16) DEFAULT NULL,
  `no_paspor` varchar(20) DEFAULT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto_ktp_path` varchar(255) DEFAULT NULL,
  `foto_paspor_path` varchar(255) DEFAULT NULL,
  `foto_buku_nikah_path` varchar(255) DEFAULT NULL,
  `status_dokumen` enum('incomplete','review','valid','rejected') NOT NULL DEFAULT 'incomplete',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_nik_unique` (`nik`),
  UNIQUE KEY `users_no_paspor_unique` (`no_paspor`),
  UNIQUE KEY `users_kode_jamaah_unique` (`kode_jamaah`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'J-00001','jamaah','3201010101010001','1234','Rd moch Reikhan Ibnu','jamaah@example.com','$2y$12$mPZja6uKoXE8mU0vtunA3.gG18bniFiyZ.sgFEoxFYLRSQZVt5O9G',NULL,'081234567890','Garut',NULL,'L','KP Jaman Sari tr 3 rw 3','dokumen/1/QsCrxJlwEUiIK1PqeRy6NhuE8yuuskXa2oVtw9gW.jpg','dokumen/1/tiqWzfzQff5qAs0pghgfSRuPpiBNwxDWBcZ5Gree.jpg','dokumen/1/gwp4DajCzkpMGw7Cz0qnOFn7e0C3g2uPyA1jr0lS.jpg','review',NULL,'2026-04-29 09:26:27','2026-04-30 06:12:53',NULL),(2,NULL,'admin_travel',NULL,NULL,'Admin Travel','travel@admin.com','$2y$12$Ba8nbCvdYoee5ttlUUYJFeiTiNNO9uPGYXh7AEXvAIE.nup8WlDvq',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-04-29 09:26:27','2026-04-29 09:26:27',NULL),(3,NULL,'admin_keuangan',NULL,NULL,'Admin Keuangan','keuangan@admin.com','$2y$12$hhALo/4f8YhF5lSsHCRide5kiEcOqIxldyseLrPtH.W6ppCPqr.5W',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-04-29 09:26:27','2026-04-29 09:26:27',NULL),(4,NULL,'admin_perlengkapan',NULL,NULL,'Admin Perlengkapan','perlengkapan@admin.com','$2y$12$qSnaCMSxnkydQdQ6YlX..eH7yJy8tz6ywcj1MMnSQjyKlqoEZy.we',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-04-29 09:26:28','2026-04-29 09:26:28',NULL),(5,NULL,'jamaah',NULL,NULL,'Rd Moch Reikhan Ibnu Aziz','rehan@admin.com','$2y$12$KS4nPegZjN0xA069JwtJa.cnNExXmP/yDpM2uzIF/YQlfrjRuZ76G',NULL,'0922222',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-04-29 15:18:42','2026-04-29 15:18:42',NULL),(6,NULL,'jamaah',NULL,NULL,'Rd moch','hans@example.com','$2y$12$KgsP./K1Jp265MXVeCA9muICcSU0fjjQunshvo/wqRf2o1W7aANxe',NULL,'1234556',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-04-30 03:18:15','2026-04-30 03:18:15',NULL),(7,NULL,'manager',NULL,NULL,'Fahmi AM','manager@gmail.com','$2y$12$waqSb7m1CgsdsrVuhAKBDeyg35XsnceVmbsqHiFJe6xB5TRm43C8S',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-05-04 06:53:33','2026-05-04 06:53:33',NULL),(8,NULL,'mitra',NULL,NULL,'handling','handling@gmail.com','$2y$12$dZ9p5kSfPRtzPlsAcKrg1OtBMAkmvkH8lzVkZpOjakW47qpZg7G2W',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'incomplete',NULL,'2026-05-04 06:54:29','2026-05-04 06:54:29',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-05  6:44:03
