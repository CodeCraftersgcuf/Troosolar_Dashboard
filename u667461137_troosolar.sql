-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 26, 2025 at 12:31 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u667461137_troosolar`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `image`, `created_at`, `updated_at`) VALUES
(2, 'banners/HCK8YPTjMl9arFdyRALmq6qMUTZIw2YvJ5nxQF0L.png', '2025-09-16 17:25:38', '2025-09-16 17:25:38');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `title`, `icon`, `category_id`, `created_at`, `updated_at`) VALUES
(11, 'TV,', '/storage/brands/30ccd9d7-6d5c-409e-b1ce-9fbb07ac3769.png', 7, '2025-09-15 15:36:02', '2025-09-23 21:11:50'),
(12, 'Brand Name', NULL, 12, '2025-09-15 20:50:23', '2025-09-15 21:15:55');

-- --------------------------------------------------------

--
-- Table structure for table `bundles`
--

CREATE TABLE `bundles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `bundle_type` varchar(255) DEFAULT NULL,
  `total_price` double NOT NULL DEFAULT 0,
  `discount_price` double NOT NULL DEFAULT 0,
  `discount_end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `total_load` varchar(255) DEFAULT NULL,
  `inver_rating` varchar(255) DEFAULT NULL,
  `total_output` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bundles`
--

INSERT INTO `bundles` (`id`, `title`, `featured_image`, `bundle_type`, `total_price`, `discount_price`, `discount_end_date`, `created_at`, `updated_at`, `total_load`, `inver_rating`, `total_output`) VALUES
(6, 'Solar Mini', 'bundles/lH9McTlVCDBJbKS110uEUkY9D5KDYnBSumJgGLnF.png', 'inverter_package', 1200, 1000, '2025-08-01', '2025-09-12 09:31:51', '2025-09-23 17:26:25', '1000', '10', '2000'),
(13, 'Testing Web Bundle', 'bundles/HSmKuQ53j6RDoGhLULb93TBfrIcSPKeWkoAWbZZ3.png', 'inverter_package', 60000, 50000, '2025-09-16', '2025-09-15 20:27:52', '2025-09-23 17:26:37', '980', '19', '50000'),
(14, '10KVA Solar Bundle', 'bundles/NbYyNOP6KtezrD0Eo0aYeBo3U1KIaGAKHP71Vd7n.png', 'battery_package', 53000, 51500, '2222-12-22', '2025-09-23 14:56:17', '2025-09-24 09:53:50', NULL, NULL, NULL),
(15, '20KVA Solar Bundle', 'bundles/NbYyNOP6KtezrD0Eo0aYeBo3U1KIaGAKHP71Vd7n.png', 'battery_package', 63000, 61500, '2222-12-22', '2025-09-23 14:56:17', '2025-09-24 09:53:50', '21000', '10', '42000'),
(16, 'New Tesing', 'bundles/5jAeqPTsVFz74KAnhdEmoLLT8n017WixVV2z2CTC.png', 'inverter_package', 10, 10, '2000-02-02', '2025-09-24 12:01:00', '2025-09-24 12:01:00', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bundle_items`
--

CREATE TABLE `bundle_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `bundle_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bundle_items`
--

INSERT INTO `bundle_items` (`id`, `product_id`, `bundle_id`, `created_at`, `updated_at`) VALUES
(10, 55, 6, '2025-09-23 17:26:25', '2025-09-23 17:26:25'),
(11, 58, 13, '2025-09-23 17:26:37', '2025-09-23 17:26:37'),
(12, 61, 13, '2025-09-23 17:26:37', '2025-09-23 17:26:37'),
(15, 62, 14, '2025-09-24 09:53:50', '2025-09-24 09:53:50'),
(16, 63, 14, '2025-09-24 09:53:50', '2025-09-24 09:53:50'),
(17, 62, 15, '2025-09-24 09:53:50', '2025-09-24 09:53:50'),
(18, 63, 15, '2025-09-24 09:53:50', '2025-09-24 09:53:50'),
(19, 56, 16, '2025-09-24 12:01:00', '2025-09-24 12:01:00'),
(20, 58, 16, '2025-09-24 12:01:00', '2025-09-24 12:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `itemable_type` varchar(255) DEFAULT NULL,
  `itemable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `itemable_type`, `itemable_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(18, 6, 'App\\Models\\Product', 23, 4, 0.00, 0.00, '2025-09-10 17:01:49', '2025-09-10 17:38:24'),
(19, 6, 'App\\Models\\Product', 24, 1, 0.00, 0.00, '2025-09-10 17:43:36', '2025-09-10 17:43:36'),
(20, 6, 'App\\Models\\Bundles', 1, 1, 240000.00, 240000.00, '2025-09-10 18:01:59', '2025-09-10 18:01:59'),
(43, 4, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 16:38:38', '2025-09-12 18:56:24'),
(46, 4, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-12 20:21:23', '2025-09-12 20:21:23'),
(59, 2, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 21:36:32', '2025-09-13 21:36:32'),
(60, 2, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 21:36:34', '2025-09-13 21:36:34'),
(83, 1, 'App\\Models\\Product', 55, 1, 990.00, 990.00, '2025-09-16 23:44:01', '2025-09-16 23:44:01'),
(84, 1, 'App\\Models\\Bundles', 6, 1, 1000.00, 1000.00, '2025-09-16 23:47:20', '2025-09-16 23:47:20'),
(85, 1, 'App\\Models\\Product', 56, 3, 990.00, 2970.00, '2025-09-17 18:09:36', '2025-09-17 18:09:52'),
(86, 1, 'App\\Models\\Product', 57, 2, 1000.00, 2000.00, '2025-09-17 18:10:01', '2025-09-17 18:10:23'),
(131, 19, 'App\\Models\\Bundles', 6, 1, 1000.00, 1000.00, '2025-09-23 07:12:06', '2025-09-23 07:12:06'),
(132, 19, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-23 07:12:18', '2025-09-23 07:12:18'),
(137, 12, 'App\\Models\\Product', 58, 1, 30000.00, 30000.00, '2025-09-23 12:19:10', '2025-09-23 12:19:10'),
(138, 12, 'App\\Models\\Product', 61, 1, 10001.00, 10001.00, '2025-09-24 08:22:10', '2025-09-24 08:22:10'),
(139, 12, 'App\\Models\\Product', 56, 1, 32000.00, 32000.00, '2025-09-24 10:30:58', '2025-09-24 10:30:58'),
(140, 26, 'App\\Models\\Product', 62, 1, 121.00, 121.00, '2025-11-25 16:37:18', '2025-11-25 16:37:18');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `title`, `icon`, `created_at`, `updated_at`) VALUES
(6, 'Batteries', '/storage/icons/565f6a37-7cfa-4490-be37-bf454d9cafed.png', '2025-09-12 09:21:19', '2025-09-12 09:21:19'),
(7, 'Solar', '/storage/icons/16e8bead-e2c3-481a-995d-db788282b19f.png', '2025-09-12 09:23:29', '2025-09-12 09:23:29'),
(8, 'Test', '/storage/icons/6aa129ff-e9ad-427c-ae4d-63410ccf7f32.png', '2025-09-12 09:23:37', '2025-09-12 09:23:37'),
(9, 'Panel', '/storage/icons/ab3428a6-4887-429f-abd8-dc75887d01f8.png', '2025-09-12 09:23:50', '2025-09-12 09:23:50'),
(10, 'Watt', '/storage/icons/0925854a-927a-4ff5-a99c-1e00a1792d8d.png', '2025-09-12 09:24:10', '2025-09-12 09:24:10'),
(11, 'Grid', '/storage/icons/9041b39a-8d03-41de-bdf1-d4ddaf14cbc9.png', '2025-09-12 09:24:16', '2025-09-12 09:24:16'),
(12, 'Solar Battries', '/storage/icons/af2d1ed4-165f-4c9c-ba37-355c47386e1c.webp', '2025-09-15 20:49:38', '2025-09-24 09:15:51'),
(13, 'Inverters', '/storage/icons/295b49c6-c3cb-4e9b-815a-a4359322fef9.webp', '2025-09-21 15:24:55', '2025-09-21 15:24:55');

-- --------------------------------------------------------

--
-- Table structure for table `credit_data`
--

CREATE TABLE `credit_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tottal_income` double NOT NULL DEFAULT 0,
  `monthly_income` double NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_services`
--

CREATE TABLE `custom_services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `service_amount` double NOT NULL DEFAULT 0,
  `bundle_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `debt_statuses`
--

CREATE TABLE `debt_statuses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `debt_status` varchar(255) DEFAULT NULL,
  `total_owned` double NOT NULL DEFAULT 0,
  `account_statement` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_addresses`
--

CREATE TABLE `delivery_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_addresses`
--

INSERT INTO `delivery_addresses` (`id`, `user_id`, `phone_number`, `title`, `address`, `state`, `created_at`, `updated_at`) VALUES
(1, 4, '6739295442', 'Home', 'Pakistan, Faisalabad, Liaqat abad', 'Punjab', '2025-09-09 18:11:15', '2025-09-09 18:56:40'),
(2, 4, '03177792147', 'Office', 'Pakistan, Faisalabad, Liaqat abad', 'Punjab', '2025-09-09 18:11:37', '2025-09-09 18:11:37'),
(3, 4, '031777921474', 'Office', 'Pakistan, Faisalabad, Liaqat abad', 'Punjab', '2025-09-09 19:07:48', '2025-09-09 19:17:17'),
(4, 6, '8712612', 'testing', '8127bjhs', 'punjabb', '2025-09-10 17:11:28', '2025-09-10 17:11:28'),
(6, 1, 'asda', 'asd', 'asd', 'asda', '2025-09-13 07:58:02', '2025-09-13 07:58:02'),
(7, 2, '0987', 'hi', 'afghan', 'punjab', '2025-09-13 21:35:14', '2025-09-13 21:35:14'),
(8, 11, '12391', 'TESTING', 'PARTAB NAGARA', 'PUNJAB', '2025-09-13 23:50:15', '2025-09-13 23:50:15'),
(9, 1, '21312', 'asd', '12312', 'test', '2025-09-15 10:48:03', '2025-09-15 10:48:03'),
(10, 1, '09132', 'From the Web', 'This is my New Address', 'State', '2025-09-15 10:59:35', '2025-09-15 10:59:35'),
(11, 1, '038679344', 'From the mobile', 'This is my address from the mobile I\'m entering', 'This is my new state.', '2025-09-15 11:02:46', '2025-09-15 11:02:46'),
(12, 18, 'asd', 'asd', 'ad', 'asd', '2025-09-19 15:03:18', '2025-09-19 15:03:18'),
(13, 12, '09063939859', 'Home Address', 'Africa Re House, 1679 Karimu Kotun St,', 'Lagos', '2025-09-21 16:34:28', '2025-09-21 16:34:28'),
(14, 20, 'asd', 'das', 'asd', 'asd', '2025-09-21 18:24:38', '2025-09-21 18:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interest_percentages`
--

CREATE TABLE `interest_percentages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `interest_percentage` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `interest_percentages`
--

INSERT INTO `interest_percentages` (`id`, `interest_percentage`, `created_at`, `updated_at`) VALUES
(1, 12, NULL, NULL),
(2, 23, NULL, NULL),
(3, 23, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kycs`
--

CREATE TABLE `kycs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `file` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kycs`
--

INSERT INTO `kycs` (`id`, `user_id`, `type`, `file`, `status`, `reviewed_by`, `reviewed_at`, `review_notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'passport', 'kyc/KeFS325WwuBortsdVtS2tbn5B5HwtRpNvRnFc5tV.png', 'pending', NULL, NULL, NULL, '2025-09-15 13:15:09', '2025-09-15 13:15:09');

-- --------------------------------------------------------

--
-- Table structure for table `link_accounts`
--

CREATE TABLE `link_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `link_accounts`
--

INSERT INTO `link_accounts` (`id`, `account_number`, `account_name`, `bank_name`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '12345', 'saving', 'Allied Bank', NULL, 4, '2025-09-04 18:17:18', '2025-09-04 18:17:18'),
(2, '12345', 'Sohaib', 'Allied Bank', NULL, 4, '2025-09-04 18:17:59', '2025-09-04 18:17:59'),
(3, '12345', 'Sohaib', 'Allied Bank', NULL, 4, '2025-09-04 18:42:01', '2025-09-04 18:42:01'),
(4, '345234', 'Ahmad', 'Faysal Bank', NULL, 4, '2025-09-04 18:46:43', '2025-09-04 18:46:43'),
(5, '12345', 'qwerty', 'Bank Alfalah', NULL, 4, '2025-09-04 19:03:07', '2025-09-04 19:03:07'),
(6, '35870109785432', 'Sohaib', 'United Bank Limited (UBL)', NULL, 4, '2025-09-04 19:16:45', '2025-09-04 19:16:45'),
(7, '34829', 'asdfg', 'Habib Bank Limited (HBL)', NULL, 4, '2025-09-04 20:23:48', '2025-09-04 20:23:48'),
(8, '190', 'ghjk', 'Bank Alfalah', NULL, 4, '2025-09-05 04:58:18', '2025-09-05 04:58:18'),
(9, '35870109785432', 'asdfg', 'United Bank Limited (UBL)', NULL, 4, '2025-09-05 05:01:13', '2025-09-05 05:01:13'),
(10, '35870109785432', 'Sohaib', 'Meezan Bank', NULL, 4, '2025-09-09 20:05:45', '2025-09-09 20:05:45'),
(11, '23000', 'saving', 'Bank Alfalah', NULL, 4, '2025-09-09 20:09:56', '2025-09-09 20:09:56'),
(12, '345234', 'saving', 'MCB Bank', NULL, 4, '2025-09-10 20:44:32', '2025-09-10 20:44:32'),
(13, '1234567890', 'John Doe', 'MCB Bank', NULL, 6, '2025-09-10 17:44:28', '2025-09-10 17:44:28'),
(14, '1234567890', 'John Doe', 'United Bank Limited (UBL)', NULL, 6, '2025-09-10 17:55:34', '2025-09-10 17:55:34'),
(15, '35870109785432', 'ghjk', 'Meezan Bank', NULL, 4, '2025-09-10 19:36:07', '2025-09-10 19:36:07'),
(16, '35870109785432', 'ghjk', 'United Bank Limited (UBL)', NULL, 4, '2025-09-11 16:32:20', '2025-09-11 16:32:20'),
(17, '35870109785432', 'saving', 'Allied Bank', NULL, 4, '2025-09-11 16:40:25', '2025-09-11 16:40:25'),
(18, '35870109785432', 'wert', 'MCB Bank', NULL, 4, '2025-09-11 16:43:31', '2025-09-11 16:43:31'),
(19, '35870109785432', 'Sohaib', 'MCB Bank', NULL, 4, '2025-09-11 16:47:17', '2025-09-11 16:47:17'),
(20, '12345', 'Sohaib', 'Allied Bank', NULL, 4, '2025-09-11 16:55:40', '2025-09-11 16:55:40'),
(21, '345234', 'wer', 'Allied Bank', NULL, 4, '2025-09-11 16:57:49', '2025-09-11 16:57:49'),
(22, '35870109785432', 'asdfg', 'United Bank Limited (UBL)', NULL, 4, '2025-09-11 17:35:26', '2025-09-11 17:35:26'),
(23, '35870109785432', 'Sohaib', 'MCB Bank', NULL, 4, '2025-09-11 17:51:34', '2025-09-11 17:51:34'),
(24, '35870109785432', 'asdfg', 'United Bank Limited (UBL)', NULL, 4, '2025-09-11 17:56:47', '2025-09-11 17:56:47'),
(25, '2131`', 'fsdfsd', 'Meezan Bank', NULL, 1, '2025-09-11 19:52:40', '2025-09-11 19:52:40'),
(26, '10', 'asd', 'Habib Bank Limited (HBL)', NULL, 1, '2025-09-11 19:54:55', '2025-09-11 19:54:55'),
(27, 'asd', 'das', 'Meezan Bank', NULL, 1, '2025-09-11 20:32:32', '2025-09-11 20:32:32'),
(28, 'asd', 'asd', 'Allied Bank', NULL, 1, '2025-09-12 14:14:19', '2025-09-12 14:14:19'),
(29, 'iu``asd', 'sad', 'Meezan Bank', NULL, 1, '2025-09-12 18:37:28', '2025-09-12 18:37:28'),
(30, '1321', '2131', 'Habib Bank Limited (HBL)', NULL, 1, '2025-09-12 18:41:47', '2025-09-12 18:41:47'),
(31, '12123', '12321', 'Meezan Bank', NULL, 1, '2025-09-12 20:00:23', '2025-09-12 20:00:23'),
(32, 'asd', '123', 'Habib Bank Limited (HBL)', NULL, 1, '2025-09-12 20:02:29', '2025-09-12 20:02:29'),
(33, '13', '123', 'Habib Bank Limited (HBL)', NULL, 1, '2025-09-12 20:02:47', '2025-09-12 20:02:47'),
(34, '1235123123', 'Ali_123', 'United Bank Limited (UBL)', NULL, 1, '2025-09-12 20:13:05', '2025-09-12 20:13:05'),
(35, 'adsa', '1231', 'Habib Bank Limited (HBL)', NULL, 1, '2025-09-12 20:51:09', '2025-09-12 20:51:09'),
(36, 'asdas', 'asda', 'adsasasda', NULL, 1, '2025-09-13 11:47:08', '2025-09-13 11:47:08'),
(37, '12312', 'asd', 'asda', NULL, 1, '2025-09-13 12:30:15', '2025-09-13 12:30:15'),
(38, '12312', 'asdas', 'asda', NULL, 1, '2025-09-13 12:30:43', '2025-09-13 12:30:43'),
(39, '121', '21qw', '123asd', NULL, 1, '2025-09-13 13:12:25', '2025-09-13 13:12:25'),
(40, '12312', 'qwe', 'qe', NULL, 1, '2025-09-13 13:12:37', '2025-09-13 13:12:37'),
(41, '1111', 'Abc', 'Abc', NULL, 1, '2025-09-13 15:44:59', '2025-09-13 15:44:59'),
(42, '123', 'da', 'asda', NULL, 1, '2025-09-13 16:09:37', '2025-09-13 16:09:37'),
(43, '2342', '1231', '231', NULL, 1, '2025-09-13 16:56:12', '2025-09-13 16:56:12'),
(44, '1234567890', 'GTesting', 'Testing', NULL, 11, '2025-09-13 23:54:40', '2025-09-13 23:54:40'),
(45, '8254237013', 'Pejul', 'FCMB', NULL, 12, '2025-09-14 11:19:34', '2025-09-14 11:19:34'),
(46, '111111111', '1111111111', '111111', NULL, 18, '2025-09-19 12:51:49', '2025-09-19 12:51:49'),
(47, '1234567890', 'Hafiz Sameer', 'Testong', NULL, 11, '2025-09-21 22:30:53', '2025-09-21 22:30:53'),
(48, '1312', '1231', '1231', NULL, 20, '2025-09-21 23:49:30', '2025-09-21 23:49:30'),
(49, '1306028246', 'Pejul', 'FCMB', NULL, 12, '2025-09-23 09:55:51', '2025-09-23 09:55:51'),
(50, '6173324612', 'Abiona Modupe Oyebisi', 'Fidelity Bank', NULL, 24, '2025-10-02 13:16:48', '2025-10-02 13:16:48');

-- --------------------------------------------------------

--
-- Table structure for table `loan_applications`
--

CREATE TABLE `loan_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title_document` varchar(255) DEFAULT NULL,
  `upload_document` varchar(255) DEFAULT NULL,
  `beneficiary_name` varchar(255) DEFAULT NULL,
  `beneficiary_email` varchar(255) DEFAULT NULL,
  `beneficiary_relationship` varchar(255) DEFAULT NULL,
  `beneficiary_phone` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `mono_loan_calculation` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `loan_amount` double(10,2) DEFAULT NULL,
  `repayment_duration` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_applications`
--

INSERT INTO `loan_applications` (`id`, `title_document`, `upload_document`, `beneficiary_name`, `beneficiary_email`, `beneficiary_relationship`, `beneficiary_phone`, `status`, `mono_loan_calculation`, `user_id`, `created_at`, `updated_at`, `loan_amount`, `repayment_duration`) VALUES
(13, 'Passport', 'loan_applications/1758493918.jpeg', 'Hafiz Sameer', 'testing@gmail.com', 'Testing', '03219665580', 'approved', 9, 11, '2025-09-21 22:31:58', '2025-09-21 22:35:57', NULL, NULL),
(14, 'Passport', 'loan_applications/1758498742.png', 'asd', 'sdas@gmail.com', 'ADAsd', 'asd', 'approved', 10, 20, '2025-09-21 23:52:22', '2025-09-21 23:53:50', 123.00, NULL),
(15, 'National ID', 'loan_applications/1758621812.png', 'oche', 'cto@pejuldigitalagency.com', 'Brother', '09063939859', 'approved', 11, 12, '2025-09-23 10:03:32', '2025-09-23 10:50:11', 500000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loan_calculations`
--

CREATE TABLE `loan_calculations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `loan_amount` double(10,2) NOT NULL DEFAULT 0.00,
  `repayment_duration` int(11) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `repayment_date` date DEFAULT NULL,
  `product_amount` double(10,2) NOT NULL DEFAULT 0.00,
  `monthly_payment` double(10,2) NOT NULL DEFAULT 0.00,
  `interest_percentage` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_calculations`
--

INSERT INTO `loan_calculations` (`id`, `loan_amount`, `repayment_duration`, `status`, `user_id`, `created_at`, `updated_at`, `repayment_date`, `product_amount`, `monthly_payment`, `interest_percentage`) VALUES
(8, 50000.00, 6, 'approved', 11, '2025-09-21 22:31:14', '2025-09-21 22:35:57', '2025-10-21', 50000.00, 8333.33, 23),
(9, 123.00, 3, 'approved', 20, '2025-09-21 23:49:39', '2025-09-21 23:53:50', '2025-10-21', 12312.00, 41.00, 23),
(10, 500000.00, 3, 'approved', 12, '2025-09-23 09:57:26', '2025-09-23 10:50:11', '2025-10-23', 1000000.00, 166666.67, 23),
(11, 2500000.00, 12, 'pending', 24, '2025-10-02 13:21:33', '2025-10-02 13:24:05', '2025-11-02', 2500000.00, 208333.33, 23);

-- --------------------------------------------------------

--
-- Table structure for table `loan_distributes`
--

CREATE TABLE `loan_distributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `distribute_amount` double(10,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `loan_application_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_histories`
--

CREATE TABLE `loan_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `loan_application_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_installments`
--

CREATE TABLE `loan_installments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `mono_calculation_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `remaining_duration` int(11) NOT NULL DEFAULT 0,
  `payment_date` datetime DEFAULT NULL,
  `transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_installments`
--

INSERT INTO `loan_installments` (`id`, `status`, `user_id`, `mono_calculation_id`, `created_at`, `updated_at`, `amount`, `remaining_duration`, `payment_date`, `transaction_id`, `paid_at`) VALUES
(40, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 5, '2025-10-21 00:00:00', NULL, NULL),
(41, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 4, '2025-11-21 00:00:00', NULL, NULL),
(42, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 3, '2025-12-21 00:00:00', NULL, NULL),
(43, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 2, '2026-01-21 00:00:00', NULL, NULL),
(44, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 1, '2026-02-21 00:00:00', NULL, NULL),
(45, 'pending', 11, 9, '2025-09-21 22:31:58', '2025-09-21 22:31:58', 8333.33, 0, '2026-03-21 00:00:00', NULL, NULL),
(46, 'pending', 20, 10, '2025-09-21 23:52:22', '2025-09-21 23:52:22', 41.00, 2, '2025-10-21 00:00:00', NULL, NULL),
(47, 'pending', 20, 10, '2025-09-21 23:52:22', '2025-09-21 23:52:22', 41.00, 1, '2025-11-21 00:00:00', NULL, NULL),
(48, 'pending', 20, 10, '2025-09-21 23:52:22', '2025-09-21 23:52:22', 41.00, 0, '2025-12-21 00:00:00', NULL, NULL),
(49, 'pending', 12, 11, '2025-09-23 10:03:32', '2025-09-23 10:03:32', 166666.67, 2, '2025-10-23 00:00:00', NULL, NULL),
(50, 'pending', 12, 11, '2025-09-23 10:03:32', '2025-09-23 10:03:32', 166666.67, 1, '2025-11-23 00:00:00', NULL, NULL),
(51, 'pending', 12, 11, '2025-09-23 10:03:32', '2025-09-23 10:03:32', 166666.67, 0, '2025-12-23 00:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayments`
--

CREATE TABLE `loan_repayments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `amount` double(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `mono_calculation_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_statuses`
--

CREATE TABLE `loan_statuses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `send_status` varchar(255) NOT NULL DEFAULT 'pending',
  `send_date` date DEFAULT NULL,
  `approval_status` varchar(255) NOT NULL DEFAULT 'pending',
  `approval_date` date DEFAULT NULL,
  `disbursement_status` varchar(255) NOT NULL DEFAULT 'pending',
  `disbursement_date` date DEFAULT NULL,
  `loan_application_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_statuses`
--

INSERT INTO `loan_statuses` (`id`, `send_status`, `send_date`, `approval_status`, `approval_date`, `disbursement_status`, `disbursement_date`, `loan_application_id`, `created_at`, `updated_at`, `partner_id`) VALUES
(18, 'active', '2025-09-23', 'approved', '2025-09-21', 'disbursed', '2025-09-21', 13, '2025-09-21 22:31:58', '2025-09-23 10:01:22', 1),
(19, 'active', '2025-09-21', 'approved', '2025-09-21', 'disbursed', '2025-09-21', 14, '2025-09-21 23:52:22', '2025-09-21 23:53:50', 1),
(20, 'pending', NULL, 'approved', '2025-09-23', 'disbursed', '2025-09-23', 15, '2025-09-23 10:03:32', '2025-09-23 10:50:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2025_07_17_120151_create_wallets_table', 1),
(6, '2025_07_17_120257_create_categories_table', 1),
(7, '2025_07_17_120423_create_brands_table', 1),
(8, '2025_07_17_120822_create_products_table', 1),
(9, '2025_07_17_121211_create_product_details_table', 1),
(10, '2025_07_17_121453_create_product_images_table', 1),
(11, '2025_07_17_121608_create_product_reveiews_table', 1),
(12, '2025_07_17_132703_create_bundles_table', 1),
(13, '2025_07_17_132816_create_bundle_items_table', 1),
(14, '2025_07_17_182957_create_delivery_addresses_table', 1),
(15, '2025_07_18_072233_create_custom_services_table', 1),
(16, '2025_07_19_102848_create_terms_table', 1),
(17, '2025_07_19_103706_create_link_accounts_table', 1),
(18, '2025_07_19_104543_create_interest_percentages_table', 1),
(19, '2025_07_19_121945_create_loan_calculations_table', 1),
(20, '2025_07_19_122443_create_mono_loan_calculations_table', 1),
(21, '2025_07_19_122536_create_loan_applications_table', 1),
(22, '2025_07_19_122655_create_loan_histories_table', 1),
(23, '2025_07_19_123033_create_loan_installments_table', 1),
(24, '2025_07_19_123217_create_loan_repayments_table', 1),
(25, '2025_07_21_081330_update_loan_calculations_table', 1),
(26, '2025_07_21_103914_update_terms_table', 1),
(27, '2025_07_21_105509_update_loan_calculations_table', 1),
(28, '2025_07_21_113614_remove_interest_percentage_id_from_loan_calculations', 1),
(29, '2025_07_21_113925_update_loan_calculations_table', 1),
(30, '2025_07_21_132914_update_loan_application', 1),
(31, '2025_07_22_092207_add_loan_application_id_to_mono_loan_calculations_table', 1),
(32, '2025_07_22_175423_create_partners_table', 1),
(33, '2025_07_22_184849_create_orders_table', 1),
(34, '2025_07_22_184903_create_order_items_table', 1),
(35, '2025_07_22_184913_create_cart_items_table', 1),
(36, '2025_07_23_061920_create_notifications_table', 1),
(37, '2025_07_23_064216_create_tickets_table', 1),
(38, '2025_07_23_070421_create_ticket_messages_table', 1),
(39, '2025_07_23_075824_create_loan_statuses_table', 1),
(40, '2025_07_23_090907_add_installation_price_to_orders_table', 1),
(41, '2025_07_23_104821_update_mono_loan_calculaitions-table', 1),
(42, '2025_07_23_111932_create_credit_data_table', 1),
(43, '2025_07_23_113835_create_debt_statuses_table', 1),
(44, '2025_07_23_131650_create_jobs_table', 1),
(45, '2025_07_23_135427_create_transactions_table', 1),
(46, '2025_07_23_174607_create_loan_distributes_table', 1),
(47, '2025_07_23_181644_update_mono_loan_calculations_table', 1),
(48, '2025_07_23_192153_update_loan_installments_table', 1),
(49, '2025_07_24_092217_create_banners_table', 1),
(50, '2025_09_02_123337_update_bundles_table', 1),
(51, '2025_09_05_122546_add_product_and_bundle_to_orders_table', 2),
(52, '2025_09_09_093434_add_tx_fields_to_transactions', 2),
(53, '2025_09_10_212917_update_product_tabble', 2),
(54, '2025_09_13_101311_create_withdraw_requests_table', 3),
(55, '2025_09_13_101544_update_walllets_table', 3),
(56, '2025_09_13_114928_update_mono_table', 4),
(57, '2025_09_13_121920_update_loan_installments_id', 5),
(58, '2025_09_13_143051_update_loan_installments', 5),
(59, '2025_09_13_172651_create_kycs_table', 6),
(60, '2025_09_15_175526_updte_notifications_table', 7),
(61, '2025_09_18_100021_update_users_table', 8),
(62, '2025_09_18_100308_create_user_activities_table', 9),
(63, '2025_09_18_112130_update_loan_statuses_table', 10),
(64, '2025_09_21_220839_update_bundles_table', 11);

-- --------------------------------------------------------

--
-- Table structure for table `mono_loan_calculations`
--

CREATE TABLE `mono_loan_calculations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `loan_application_id` bigint(20) UNSIGNED DEFAULT NULL,
  `down_payment` double(10,2) NOT NULL DEFAULT 0.00,
  `loan_calculation_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `loan_limit` double NOT NULL DEFAULT 0,
  `credit_score` varchar(255) DEFAULT NULL,
  `transcations` varchar(255) DEFAULT NULL,
  `loan_amount` double NOT NULL DEFAULT 0,
  `repayment_duration` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) DEFAULT NULL,
  `interest_rate` varchar(255) DEFAULT NULL,
  `total_amount` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mono_loan_calculations`
--

INSERT INTO `mono_loan_calculations` (`id`, `loan_application_id`, `down_payment`, `loan_calculation_id`, `created_at`, `updated_at`, `loan_limit`, `credit_score`, `transcations`, `loan_amount`, `repayment_duration`, `status`, `interest_rate`, `total_amount`) VALUES
(9, NULL, 12500.00, 8, '2025-09-21 22:31:34', '2025-09-21 22:35:57', 0, NULL, NULL, 50000, 6, 'approved', '23', 1200000),
(10, NULL, 30.75, 9, '2025-09-21 23:50:52', '2025-09-21 23:53:50', 0, NULL, NULL, 123, 3, 'approved', '23', 2952),
(11, NULL, 125000.00, 10, '2025-09-23 10:02:00', '2025-09-23 10:50:11', 0, NULL, NULL, 500000, 6, 'approved', '23', 12000000);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(255) DEFAULT 'system',
  `user_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `message`, `created_at`, `updated_at`, `type`, `user_id`) VALUES
(1, 'hjk', '2025-09-16 17:15:49', '2025-09-16 17:15:49', 'system', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_address_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT 'pending',
  `order_status` varchar(255) DEFAULT 'processing',
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `installation_price` decimal(10,2) DEFAULT 0.00,
  `mono_calculation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `bundle_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `delivery_address_id`, `order_number`, `total_price`, `payment_method`, `payment_status`, `order_status`, `note`, `created_at`, `updated_at`, `installation_price`, `mono_calculation_id`, `product_id`, `bundle_id`) VALUES
(1, 1, NULL, 'HLDU8HAL1Y', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:45:52', '2025-09-11 21:45:52', 0.00, NULL, NULL, NULL),
(2, 1, NULL, 'EKPSP7SBFF', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:46:15', '2025-09-11 21:46:15', 0.00, NULL, NULL, NULL),
(3, 1, NULL, 'GWPEDYIFJZ', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:46:35', '2025-09-11 21:46:35', 0.00, NULL, NULL, NULL),
(4, 1, NULL, 'LNBUPANX6S', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:47:18', '2025-09-11 21:47:18', 0.00, NULL, NULL, NULL),
(5, 1, NULL, 'TRDPTIIPDG', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:49:54', '2025-09-11 21:49:54', 0.00, NULL, NULL, NULL),
(6, 1, NULL, 'L9BRYETAGE', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 21:51:19', '2025-09-11 21:51:19', 0.00, NULL, NULL, NULL),
(7, 1, 4, '1DHKV0XFQD', 960000.00, 'direct', 'paid', 'pending', NULL, '2025-09-11 22:04:28', '2025-09-11 22:04:28', 0.00, NULL, NULL, NULL),
(8, 1, 4, 'PTQA0GBX73', 960000.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 08:50:01', '2025-09-12 08:50:01', 0.00, NULL, NULL, NULL),
(9, 1, NULL, 'ZNRQHYZQQI', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 09:10:31', '2025-09-12 09:10:31', 0.00, NULL, NULL, NULL),
(10, 1, NULL, 'MCNKZPUZNU', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 09:16:00', '2025-09-12 09:16:00', 0.00, NULL, NULL, NULL),
(11, 1, NULL, 'M8TRN3CRF8', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 09:17:07', '2025-09-12 09:17:07', 0.00, NULL, NULL, NULL),
(12, 1, NULL, 'QCPWO5XBZF', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 09:38:59', '2025-09-12 09:38:59', 0.00, NULL, NULL, NULL),
(13, 1, NULL, 'VX4X3YQQVO', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 15:39:46', '2025-09-12 15:39:46', 0.00, NULL, NULL, NULL),
(14, 1, NULL, 'ZZ38Z2RYOJ', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 15:39:55', '2025-09-12 15:39:55', 0.00, NULL, NULL, NULL),
(15, 1, NULL, 'SWNM1MYX3S', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 15:46:33', '2025-09-12 15:46:33', 0.00, NULL, NULL, NULL),
(16, 1, NULL, 'HFCIXWFA7I', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 15:56:18', '2025-09-12 15:56:18', 0.00, NULL, NULL, NULL),
(17, 1, NULL, 'I4AU2NSE8M', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 16:00:38', '2025-09-12 16:00:38', 0.00, NULL, NULL, NULL),
(18, 1, NULL, '0AU1BHD17X', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 16:00:46', '2025-09-12 16:00:46', 0.00, NULL, NULL, NULL),
(19, 4, 3, 'VMAJEAGGMG', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 17:05:23', '2025-09-12 17:05:23', 0.00, NULL, NULL, NULL),
(20, 4, 2, 'OYEJCW3FF5', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 17:07:15', '2025-09-12 17:07:15', 0.00, NULL, NULL, NULL),
(21, 4, 2, 'STJVQABNA4', 2970.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 17:53:29', '2025-09-12 17:53:29', 0.00, NULL, NULL, NULL),
(22, 4, 2, 'LGRRPKVOHW', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:05:27', '2025-09-12 18:05:27', 0.00, NULL, NULL, NULL),
(23, 4, 2, 'DXVPRLRQ3M', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:06:14', '2025-09-12 18:06:14', 0.00, NULL, NULL, NULL),
(24, 4, 2, 'IHV1Y8KJL4', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:11:06', '2025-09-12 18:11:06', 0.00, NULL, NULL, NULL),
(25, 4, 2, 'LGM9MUNJFR', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:14:32', '2025-09-12 18:14:32', 0.00, NULL, NULL, NULL),
(26, 4, 2, 'VH66DJ6YFA', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:17:21', '2025-09-12 18:17:21', 0.00, NULL, NULL, NULL),
(27, 4, 2, 'REC6TLDOFJ', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:20:13', '2025-09-12 18:20:13', 0.00, NULL, NULL, NULL),
(28, 4, 2, 'TNMIEKLWI7', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:28:29', '2025-09-12 18:28:29', 0.00, NULL, NULL, NULL),
(29, 4, 2, 'JPTOK7WJTQ', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:31:26', '2025-09-12 18:31:26', 0.00, NULL, NULL, NULL),
(30, 4, 2, '6ILZ41X9DM', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:34:27', '2025-09-12 18:34:27', 0.00, NULL, NULL, NULL),
(31, 4, 2, 'YL7XVQSDSD', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:38:36', '2025-09-12 18:38:36', 0.00, NULL, NULL, NULL),
(32, 4, 2, 'AKG40YQC2H', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:43:48', '2025-09-12 18:43:48', 0.00, NULL, NULL, NULL),
(33, 4, 2, 'BY8IBF6YJW', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:44:15', '2025-09-12 18:44:15', 0.00, NULL, NULL, NULL),
(34, 4, 2, 'BJZVMYNAWR', 3960.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 18:47:08', '2025-09-12 18:47:08', 0.00, NULL, NULL, NULL),
(35, 4, 2, '2WDLFBFQYW', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 19:01:56', '2025-09-12 19:01:56', 0.00, NULL, NULL, NULL),
(36, 4, 2, 'DOZIDXDA1S', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 19:02:44', '2025-09-12 19:02:44', 0.00, NULL, NULL, NULL),
(37, 4, 3, 'MYEJGJBKZU', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 19:43:23', '2025-09-12 19:43:23', 0.00, NULL, NULL, NULL),
(38, 4, 3, 'YPLQBNTWKA', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 19:46:29', '2025-09-12 19:46:29', 0.00, NULL, NULL, NULL),
(39, 4, 3, 'IP3GM25E3S', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 19:48:18', '2025-09-12 19:48:18', 0.00, NULL, NULL, NULL),
(40, 4, 3, 'DDCLDA024I', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:05:00', '2025-09-12 20:05:00', 0.00, NULL, NULL, NULL),
(41, 1, NULL, 'D6P230UMZC', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:10:01', '2025-09-12 20:10:01', 0.00, NULL, NULL, NULL),
(42, 4, 3, 'F5XSLBIIUB', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:12:34', '2025-09-12 20:12:34', 0.00, NULL, NULL, NULL),
(43, 4, 3, 'Z8P3KJWN0D', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:17:00', '2025-09-12 20:17:00', 0.00, NULL, NULL, NULL),
(44, 4, 3, 'SEEEOJBCCQ', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:20:10', '2025-09-12 20:20:10', 0.00, NULL, NULL, NULL),
(45, 4, 3, 'TQLKNS3AR3', 6930.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 20:22:10', '2025-09-12 20:22:10', 0.00, NULL, NULL, NULL),
(46, 1, NULL, 'PNWGG8XTW8', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 21:00:37', '2025-09-12 21:00:37', 0.00, NULL, NULL, NULL),
(47, 1, NULL, 'KNVVBQ29LN', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 21:58:44', '2025-09-12 21:58:44', 0.00, NULL, NULL, NULL),
(48, 1, NULL, 'BTEXEXEEFL', 8910.00, 'direct', 'paid', 'pending', NULL, '2025-09-12 22:00:03', '2025-09-12 22:00:03', 0.00, NULL, NULL, NULL),
(49, 1, NULL, 'GCOKUEXUOY', 7920.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 07:52:36', '2025-09-13 07:52:36', 0.00, NULL, NULL, NULL),
(50, 1, NULL, 'NDAJUC8YMP', 7920.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 08:30:49', '2025-09-13 08:30:49', 0.00, NULL, NULL, NULL),
(51, 1, NULL, 'RBE8MC6KOG', 7920.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 08:32:07', '2025-09-13 08:32:07', 0.00, NULL, NULL, NULL),
(52, 1, 6, '82QY4TP8DT', 7920.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 09:59:19', '2025-09-13 09:59:19', 0.00, NULL, NULL, NULL),
(53, 1, 6, 'MK2WEUT2RC', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:45:22', '2025-09-13 20:45:22', 0.00, NULL, NULL, NULL),
(54, 1, 6, '6R4KW8AOWH', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:45:31', '2025-09-13 20:45:31', 0.00, NULL, NULL, NULL),
(55, 1, 6, 'P8J9GS8P4X', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:46:05', '2025-09-13 20:46:05', 0.00, NULL, NULL, NULL),
(56, 1, 6, 'YLBSCGUA7U', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:46:40', '2025-09-13 20:46:40', 0.00, NULL, NULL, NULL),
(57, 1, 6, 'JYTGKBNLJ4', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:46:55', '2025-09-13 20:46:55', 0.00, NULL, NULL, NULL),
(58, 1, 6, 'SIOUZEG2UH', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:48:26', '2025-09-13 20:48:26', 0.00, NULL, NULL, NULL),
(59, 1, 6, 'UODW32XDPD', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:52:40', '2025-09-13 20:52:40', 0.00, NULL, NULL, NULL),
(60, 1, 6, 'XWV7OINRVA', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 20:53:44', '2025-09-13 20:53:44', 0.00, NULL, NULL, NULL),
(61, 1, 6, 'KBANEOSOYR', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:03:28', '2025-09-13 21:03:28', 0.00, NULL, NULL, NULL),
(62, 1, 6, 'F37T9QNWZO', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:14:06', '2025-09-13 21:14:06', 0.00, NULL, NULL, NULL),
(63, 1, 6, 'OAX6KXIWV1', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:18:05', '2025-09-13 21:18:05', 0.00, NULL, NULL, NULL),
(64, 1, 6, 'DGPE0EU3L1', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:18:47', '2025-09-13 21:18:47', 0.00, NULL, NULL, NULL),
(65, 1, 6, 'MHSUSCMLZG', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:19:07', '2025-09-13 21:19:07', 0.00, NULL, NULL, NULL),
(66, 1, 6, 'ISXIPO0IZQ', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:20:22', '2025-09-13 21:20:22', 0.00, NULL, NULL, NULL),
(67, 1, 6, 'OXIYPSFJ1X', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:23:54', '2025-09-13 21:23:54', 0.00, NULL, NULL, NULL),
(68, 1, 6, 'FDII4V07MU', 0.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:25:00', '2025-09-13 21:25:00', 0.00, NULL, NULL, NULL),
(69, 2, 7, 'PWPMG4TCNN', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:35:20', '2025-09-13 21:35:20', 0.00, NULL, NULL, NULL),
(70, 1, 6, 'DVIASSPQKN', 4960.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 21:36:16', '2025-09-13 21:36:16', 0.00, NULL, NULL, 6),
(71, 11, 8, 'NDRYZNJMF0', 1000.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 23:51:14', '2025-09-13 23:51:14', 0.00, NULL, NULL, NULL),
(72, 11, 8, '1CWEIHPYKM', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-13 23:56:04', '2025-09-13 23:56:04', 0.00, NULL, NULL, NULL),
(73, 11, 8, '44R1LNLYIU', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 00:06:31', '2025-09-14 00:06:31', 0.00, NULL, NULL, NULL),
(74, 11, 8, 'DJZY9SOGHS', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 00:19:30', '2025-09-14 00:19:30', 0.00, NULL, NULL, NULL),
(75, 11, 8, 'K78LVLVNPQ', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 00:20:23', '2025-09-14 00:20:23', 0.00, NULL, NULL, NULL),
(76, 11, 8, 'MK7RSZX2A7', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 00:26:33', '2025-09-14 00:26:33', 0.00, NULL, NULL, NULL),
(77, 11, 8, 'CFZJF9KXSD', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 00:26:57', '2025-09-14 00:26:57', 0.00, NULL, NULL, NULL),
(78, 11, 8, 'AUQPBESLAH', 2970.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 08:17:27', '2025-09-14 08:17:27', 0.00, NULL, NULL, NULL),
(79, 1, 6, '1ZIJ72OCRW', 1980.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 13:37:00', '2025-09-14 13:37:00', 0.00, NULL, NULL, NULL),
(80, 1, 6, 'HJ2LUGTPKF', 5940.00, 'direct', 'paid', 'pending', NULL, '2025-09-14 14:21:08', '2025-09-14 14:21:08', 0.00, NULL, NULL, NULL),
(81, 1, 10, 'ADD2VNUGAP', 3980.00, 'direct', 'paid', 'pending', NULL, '2025-09-15 11:00:04', '2025-09-15 11:00:04', 0.00, NULL, NULL, 6),
(82, 1, 10, 'O28XHOHDH1', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-15 11:01:26', '2025-09-15 11:01:26', 0.00, NULL, NULL, NULL),
(83, 1, 11, 'QBMLGOE5CG', 990.00, 'direct', 'paid', 'pending', NULL, '2025-09-16 23:42:54', '2025-09-16 23:42:54', 0.00, NULL, 55, NULL),
(84, 18, 12, 'PVEBG7M6ZB', 990.00, 'direct', 'paid', 'shipped', NULL, '2025-09-19 15:03:22', '2025-09-19 15:46:30', 0.00, NULL, 55, NULL),
(85, 12, 13, 'XUPNQ98JZR', 998.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 16:47:38', '2025-09-21 16:47:38', 0.00, NULL, 58, NULL),
(86, 20, 14, 'R7RWQS0BXY', 2990.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 18:24:44', '2025-09-21 18:24:44', 0.00, NULL, 56, NULL),
(87, 20, 14, 'IITP1A4BWH', 2980.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 18:34:48', '2025-09-21 18:34:48', 0.00, NULL, 55, NULL),
(88, 20, 14, 'ARUQNVFJPY', 998.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 18:36:27', '2025-09-21 18:36:27', 0.00, NULL, 56, NULL),
(89, 11, 8, 'M5GN8PVS9W', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 21:59:37', '2025-09-21 21:59:37', 0.00, NULL, 55, NULL),
(90, 20, 14, '3QDXZAPGWB', 65290.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:02:03', '2025-09-21 22:02:03', 0.00, NULL, 55, NULL),
(91, 20, 14, 'GYDQGQ9WGW', 64000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:32:02', '2025-09-21 22:32:02', 0.00, NULL, 56, NULL),
(92, 20, 14, 'VECIINFMRP', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:32:52', '2025-09-21 22:32:52', 0.00, NULL, 55, NULL),
(93, 20, 14, 'VCXH0ZF2AJ', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:34:51', '2025-09-21 22:34:51', 0.00, NULL, 55, NULL),
(94, 20, 14, 'AVK5IKLGJA', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:35:26', '2025-09-21 22:35:26', 0.00, NULL, 55, NULL),
(95, 20, 14, 'ZZUKSVWKUJ', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:41:10', '2025-09-21 22:41:10', 0.00, NULL, 55, NULL),
(96, 20, 14, 'EHVVV7UYAC', 32000.00, 'direct', 'paid', 'pending', NULL, '2025-09-21 22:48:11', '2025-09-21 22:48:11', 0.00, NULL, 55, NULL),
(97, 12, 13, '4LMTHKB0JU', 147000.00, 'direct', 'paid', 'pending', NULL, '2025-09-23 11:49:08', '2025-09-23 11:49:08', 0.00, NULL, 56, 13);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `itemable_type` varchar(255) DEFAULT NULL,
  `itemable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `itemable_type`, `itemable_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 2, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-11 21:46:15', '2025-09-11 21:46:15'),
(2, 3, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-11 21:46:35', '2025-09-11 21:46:35'),
(3, 3, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-11 21:46:35', '2025-09-11 21:46:35'),
(4, 4, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-11 21:47:18', '2025-09-11 21:47:18'),
(5, 4, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-11 21:47:18', '2025-09-11 21:47:18'),
(6, 5, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-11 21:49:54', '2025-09-11 21:49:54'),
(7, 5, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-11 21:49:54', '2025-09-11 21:49:54'),
(8, 6, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-11 21:51:19', '2025-09-11 21:51:19'),
(9, 6, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-11 21:51:19', '2025-09-11 21:51:19'),
(10, 7, 'App\\Models\\Bundles', 1, 4, 240000.00, 960000.00, '2025-09-11 22:04:28', '2025-09-11 22:04:28'),
(11, 8, 'App\\Models\\Bundles', 1, 4, 240000.00, 960000.00, '2025-09-12 08:50:01', '2025-09-12 08:50:01'),
(12, 9, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-12 09:10:31', '2025-09-12 09:10:31'),
(13, 9, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-12 09:10:31', '2025-09-12 09:10:31'),
(14, 10, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-12 09:16:00', '2025-09-12 09:16:00'),
(15, 10, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-12 09:16:00', '2025-09-12 09:16:00'),
(16, 11, 'App\\Models\\Product', 39, 1, 990.00, 990.00, '2025-09-12 09:17:07', '2025-09-12 09:17:07'),
(17, 11, 'App\\Models\\Product', 40, 1, 990.00, 990.00, '2025-09-12 09:17:07', '2025-09-12 09:17:07'),
(18, 14, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 15:39:55', '2025-09-12 15:39:55'),
(19, 15, 'App\\Models\\Product', 53, 1, 990.00, 990.00, '2025-09-12 15:46:33', '2025-09-12 15:46:33'),
(20, 16, 'App\\Models\\Product', 53, 1, 990.00, 990.00, '2025-09-12 15:56:18', '2025-09-12 15:56:18'),
(21, 17, 'App\\Models\\Product', 53, 1, 990.00, 990.00, '2025-09-12 16:00:38', '2025-09-12 16:00:38'),
(22, 17, 'App\\Models\\Product', 54, 1, 990.00, 990.00, '2025-09-12 16:00:38', '2025-09-12 16:00:38'),
(23, 18, 'App\\Models\\Product', 53, 1, 990.00, 990.00, '2025-09-12 16:00:46', '2025-09-12 16:00:46'),
(24, 18, 'App\\Models\\Product', 54, 1, 990.00, 990.00, '2025-09-12 16:00:46', '2025-09-12 16:00:46'),
(25, 21, 'App\\Models\\Product', 49, 3, 990.00, 2970.00, '2025-09-12 17:53:29', '2025-09-12 17:53:29'),
(26, 22, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:05:27', '2025-09-12 18:05:27'),
(27, 23, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:06:14', '2025-09-12 18:06:14'),
(28, 24, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:11:06', '2025-09-12 18:11:06'),
(29, 25, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:14:32', '2025-09-12 18:14:32'),
(30, 26, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:17:21', '2025-09-12 18:17:21'),
(31, 27, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:20:13', '2025-09-12 18:20:13'),
(32, 28, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:28:29', '2025-09-12 18:28:29'),
(33, 29, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:31:26', '2025-09-12 18:31:26'),
(34, 30, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:34:27', '2025-09-12 18:34:27'),
(35, 31, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:38:36', '2025-09-12 18:38:36'),
(36, 32, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:43:48', '2025-09-12 18:43:48'),
(37, 33, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:44:15', '2025-09-12 18:44:15'),
(38, 34, 'App\\Models\\Product', 49, 4, 990.00, 3960.00, '2025-09-12 18:47:08', '2025-09-12 18:47:08'),
(39, 35, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 19:01:56', '2025-09-12 19:01:56'),
(40, 36, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 19:02:44', '2025-09-12 19:02:44'),
(41, 37, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 19:43:23', '2025-09-12 19:43:23'),
(42, 38, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 19:46:29', '2025-09-12 19:46:29'),
(43, 39, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 19:48:18', '2025-09-12 19:48:18'),
(44, 40, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 20:05:00', '2025-09-12 20:05:00'),
(45, 41, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-12 20:10:01', '2025-09-12 20:10:01'),
(46, 42, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 20:12:34', '2025-09-12 20:12:34'),
(47, 43, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 20:17:00', '2025-09-12 20:17:00'),
(48, 44, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 20:20:10', '2025-09-12 20:20:10'),
(49, 45, 'App\\Models\\Product', 49, 6, 990.00, 5940.00, '2025-09-12 20:22:10', '2025-09-12 20:22:10'),
(50, 45, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-12 20:22:10', '2025-09-12 20:22:10'),
(51, 46, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-12 21:00:37', '2025-09-12 21:00:37'),
(52, 47, 'App\\Models\\Product', 54, 4, 990.00, 3960.00, '2025-09-12 21:58:44', '2025-09-12 21:58:44'),
(53, 47, 'App\\Models\\Product', 51, 2, 990.00, 1980.00, '2025-09-12 21:58:44', '2025-09-12 21:58:44'),
(54, 48, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-12 22:00:03', '2025-09-12 22:00:03'),
(55, 48, 'App\\Models\\Product', 51, 3, 990.00, 2970.00, '2025-09-12 22:00:03', '2025-09-12 22:00:03'),
(56, 48, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-12 22:00:03', '2025-09-12 22:00:03'),
(57, 49, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-13 07:52:36', '2025-09-13 07:52:36'),
(58, 49, 'App\\Models\\Product', 51, 3, 990.00, 2970.00, '2025-09-13 07:52:36', '2025-09-13 07:52:36'),
(59, 50, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-13 08:30:49', '2025-09-13 08:30:49'),
(60, 50, 'App\\Models\\Product', 51, 3, 990.00, 2970.00, '2025-09-13 08:30:49', '2025-09-13 08:30:49'),
(61, 51, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-13 08:32:07', '2025-09-13 08:32:07'),
(62, 51, 'App\\Models\\Product', 51, 3, 990.00, 2970.00, '2025-09-13 08:32:07', '2025-09-13 08:32:07'),
(63, 52, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-13 09:59:19', '2025-09-13 09:59:19'),
(64, 52, 'App\\Models\\Product', 51, 3, 990.00, 2970.00, '2025-09-13 09:59:19', '2025-09-13 09:59:19'),
(65, 54, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 20:45:31', '2025-09-13 20:45:31'),
(66, 54, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 20:45:31', '2025-09-13 20:45:31'),
(67, 54, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 20:45:31', '2025-09-13 20:45:31'),
(68, 54, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 20:45:31', '2025-09-13 20:45:31'),
(69, 55, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 20:46:05', '2025-09-13 20:46:05'),
(70, 55, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 20:46:05', '2025-09-13 20:46:05'),
(71, 55, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 20:46:05', '2025-09-13 20:46:05'),
(72, 55, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 20:46:05', '2025-09-13 20:46:05'),
(73, 56, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 20:46:40', '2025-09-13 20:46:40'),
(74, 56, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 20:46:40', '2025-09-13 20:46:40'),
(75, 56, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 20:46:40', '2025-09-13 20:46:40'),
(76, 56, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 20:46:40', '2025-09-13 20:46:40'),
(77, 57, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 20:46:55', '2025-09-13 20:46:55'),
(78, 57, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 20:46:55', '2025-09-13 20:46:55'),
(79, 57, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 20:46:55', '2025-09-13 20:46:55'),
(80, 57, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 20:46:55', '2025-09-13 20:46:55'),
(81, 58, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 20:48:26', '2025-09-13 20:48:26'),
(82, 58, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 20:48:26', '2025-09-13 20:48:26'),
(83, 58, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-13 20:48:26', '2025-09-13 20:48:26'),
(84, 58, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 20:48:26', '2025-09-13 20:48:26'),
(85, 61, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:03:28', '2025-09-13 21:03:28'),
(86, 61, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:03:28', '2025-09-13 21:03:28'),
(87, 62, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:14:06', '2025-09-13 21:14:06'),
(88, 62, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:14:06', '2025-09-13 21:14:06'),
(89, 63, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:18:05', '2025-09-13 21:18:05'),
(90, 63, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:18:05', '2025-09-13 21:18:05'),
(91, 64, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:18:47', '2025-09-13 21:18:47'),
(92, 64, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:18:47', '2025-09-13 21:18:47'),
(93, 65, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:19:07', '2025-09-13 21:19:07'),
(94, 65, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:19:07', '2025-09-13 21:19:07'),
(95, 66, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:20:22', '2025-09-13 21:20:22'),
(96, 66, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:20:22', '2025-09-13 21:20:22'),
(97, 67, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:23:54', '2025-09-13 21:23:54'),
(98, 67, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:23:54', '2025-09-13 21:23:54'),
(99, 68, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:25:00', '2025-09-13 21:25:00'),
(100, 68, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:25:00', '2025-09-13 21:25:00'),
(101, 69, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 21:35:20', '2025-09-13 21:35:20'),
(102, 70, 'App\\Models\\Product', 54, 3, 990.00, 2970.00, '2025-09-13 21:36:16', '2025-09-13 21:36:16'),
(103, 70, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-13 21:36:16', '2025-09-13 21:36:16'),
(104, 70, 'App\\Models\\Bundles', 6, 1, 1000.00, 1000.00, '2025-09-13 21:36:16', '2025-09-13 21:36:16'),
(105, 71, 'App\\Models\\Bundles', 7, 1, 1000.00, 1000.00, '2025-09-13 23:51:14', '2025-09-13 23:51:14'),
(106, 72, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-13 23:56:04', '2025-09-13 23:56:04'),
(107, 73, 'App\\Models\\Product', 51, 2, 990.00, 1980.00, '2025-09-14 00:06:31', '2025-09-14 00:06:31'),
(108, 74, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-14 00:19:30', '2025-09-14 00:19:30'),
(109, 75, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-14 00:20:23', '2025-09-14 00:20:23'),
(110, 76, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-14 00:26:33', '2025-09-14 00:26:33'),
(111, 77, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-14 00:26:57', '2025-09-14 00:26:57'),
(112, 78, 'App\\Models\\Product', 49, 3, 990.00, 2970.00, '2025-09-14 08:17:27', '2025-09-14 08:17:27'),
(113, 79, 'App\\Models\\Product', 49, 2, 990.00, 1980.00, '2025-09-14 13:37:00', '2025-09-14 13:37:00'),
(114, 80, 'App\\Models\\Product', 50, 1, 990.00, 990.00, '2025-09-14 14:21:08', '2025-09-14 14:21:08'),
(115, 80, 'App\\Models\\Product', 54, 5, 990.00, 4950.00, '2025-09-14 14:21:08', '2025-09-14 14:21:08'),
(116, 81, 'App\\Models\\Bundles', 6, 1, 1000.00, 1000.00, '2025-09-15 11:00:04', '2025-09-15 11:00:04'),
(117, 81, 'App\\Models\\Bundles', 7, 1, 1000.00, 1000.00, '2025-09-15 11:00:04', '2025-09-15 11:00:04'),
(118, 81, 'App\\Models\\Product', 53, 1, 990.00, 990.00, '2025-09-15 11:00:04', '2025-09-15 11:00:04'),
(119, 81, 'App\\Models\\Product', 49, 1, 990.00, 990.00, '2025-09-15 11:00:04', '2025-09-15 11:00:04'),
(120, 82, 'App\\Models\\Product', 51, 1, 990.00, 990.00, '2025-09-15 11:01:26', '2025-09-15 11:01:26'),
(121, 83, 'App\\Models\\Product', 55, 1, 990.00, 990.00, '2025-09-16 23:42:54', '2025-09-16 23:42:54'),
(122, 84, 'App\\Models\\Product', 55, 1, 990.00, 990.00, '2025-09-19 15:03:22', '2025-09-19 15:03:22'),
(123, 85, 'App\\Models\\Product', 58, 1, 8.00, 8.00, '2025-09-21 16:47:38', '2025-09-21 16:47:38'),
(124, 85, 'App\\Models\\Product', 55, 1, 990.00, 990.00, '2025-09-21 16:47:38', '2025-09-21 16:47:38'),
(125, 86, 'App\\Models\\Product', 56, 1, 990.00, 990.00, '2025-09-21 18:24:44', '2025-09-21 18:24:44'),
(126, 86, 'App\\Models\\Product', 57, 2, 1000.00, 2000.00, '2025-09-21 18:24:44', '2025-09-21 18:24:44'),
(127, 87, 'App\\Models\\Product', 55, 1, 990.00, 990.00, '2025-09-21 18:34:48', '2025-09-21 18:34:48'),
(128, 87, 'App\\Models\\Product', 56, 1, 990.00, 990.00, '2025-09-21 18:34:48', '2025-09-21 18:34:48'),
(129, 87, 'App\\Models\\Product', 57, 1, 1000.00, 1000.00, '2025-09-21 18:34:48', '2025-09-21 18:34:48'),
(130, 88, 'App\\Models\\Product', 56, 1, 990.00, 990.00, '2025-09-21 18:36:27', '2025-09-21 18:36:27'),
(131, 88, 'App\\Models\\Product', 58, 1, 8.00, 8.00, '2025-09-21 18:36:27', '2025-09-21 18:36:27'),
(132, 89, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 21:59:37', '2025-09-21 21:59:37'),
(133, 90, 'App\\Models\\Product', 55, 1, 1290.00, 1290.00, '2025-09-21 22:02:03', '2025-09-21 22:02:03'),
(134, 90, 'App\\Models\\Product', 57, 1, 32000.00, 32000.00, '2025-09-21 22:02:03', '2025-09-21 22:02:03'),
(135, 90, 'App\\Models\\Product', 56, 1, 32000.00, 32000.00, '2025-09-21 22:02:03', '2025-09-21 22:02:03'),
(136, 91, 'App\\Models\\Product', 56, 1, 32000.00, 32000.00, '2025-09-21 22:32:02', '2025-09-21 22:32:02'),
(137, 91, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:32:02', '2025-09-21 22:32:02'),
(138, 92, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:32:52', '2025-09-21 22:32:52'),
(139, 93, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:34:51', '2025-09-21 22:34:51'),
(140, 94, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:35:26', '2025-09-21 22:35:26'),
(141, 95, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:41:10', '2025-09-21 22:41:10'),
(142, 96, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-21 22:48:11', '2025-09-21 22:48:11'),
(143, 97, 'App\\Models\\Bundles', 13, 1, 50000.00, 50000.00, '2025-09-23 11:49:08', '2025-09-23 11:49:08'),
(144, 97, 'App\\Models\\Product', 56, 1, 32000.00, 32000.00, '2025-09-23 11:49:08', '2025-09-23 11:49:08'),
(145, 97, 'App\\Models\\Product', 57, 1, 32000.00, 32000.00, '2025-09-23 11:49:08', '2025-09-23 11:49:08'),
(146, 97, 'App\\Models\\Product', 55, 1, 32000.00, 32000.00, '2025-09-23 11:49:08', '2025-09-23 11:49:08'),
(147, 97, 'App\\Models\\Bundles', 7, 1, 1000.00, 1000.00, '2025-09-23 11:49:08', '2025-09-23 11:49:08');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `no_of_loans` int(11) DEFAULT NULL,
  `amount` double(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `name`, `email`, `status`, `no_of_loans`, `amount`, `created_at`, `updated_at`) VALUES
(1, 'Checkoff Finance,', 'cto@pejuldigitalagency.com', 'Active', NULL, 0.00, '2025-09-15 14:31:13', '2025-09-24 10:12:34');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 2, 'API Token', '623b65598aa2a3e71a558ce7f61cc92f82e7d9430485354dba2cc95dd3815094', '[\"*\"]', NULL, NULL, '2025-09-03 21:07:38', '2025-09-03 21:07:38'),
(4, 'App\\Models\\User', 2, 'API Token', '2d36ada84c2d70cc94e76f3ef817b90ff75b242a3ad3343e00b44657a311eb76', '[\"*\"]', NULL, NULL, '2025-09-04 01:38:05', '2025-09-04 01:38:05'),
(6, 'App\\Models\\User', 2, 'API Token', '1ccf812dfd29f91bbbb9dfd1cc522c388cd0584e54df03fb46d7f63d308ec2cd', '[\"*\"]', '2025-09-15 11:05:04', NULL, '2025-09-07 18:06:00', '2025-09-15 11:05:04'),
(8, 'App\\Models\\User', 4, 'API Token', '140fe01ce16374cabdb40473ef54f39ce553e25b8d8f6caada343c00729e2548', '[\"*\"]', '2025-09-12 20:51:13', NULL, '2025-09-10 03:29:03', '2025-09-12 20:51:13'),
(12, 'App\\Models\\User', 9, 'API Token', '6286c65eb310d1839122bcc4d3ca17bf57dda7228909c02e0cbfa9a5ac9fac92', '[\"*\"]', '2025-09-10 19:11:04', NULL, '2025-09-10 19:09:35', '2025-09-10 19:11:04'),
(13, 'App\\Models\\User', 9, 'API Token', 'ee1529cab05f81d07fc81cc30cb34fc1cc7963f6176922769f6d8f511d2d94af', '[\"*\"]', '2025-09-10 19:11:14', NULL, '2025-09-10 19:11:13', '2025-09-10 19:11:14'),
(14, 'App\\Models\\User', 9, 'API Token', '7e793591291dc1f2cfaff1138cf02bc61c4920113b9f888def69a67d99418c70', '[\"*\"]', '2025-09-10 19:11:51', NULL, '2025-09-10 19:11:51', '2025-09-10 19:11:51'),
(15, 'App\\Models\\User', 9, 'API Token', '0f255c5de3247fce4a698f83d9aed0fab6a019468c7b276f7ef9b78090b88617', '[\"*\"]', '2025-09-10 20:42:08', NULL, '2025-09-10 19:12:37', '2025-09-10 20:42:08'),
(16, 'App\\Models\\User', 9, 'API Token', 'a7d05bb303f4777e976bcec989e35bdcb4bcb145c5d974c3ede9925ff130c461', '[\"*\"]', '2025-09-10 21:44:33', NULL, '2025-09-10 20:42:57', '2025-09-10 21:44:33'),
(82, 'App\\Models\\User', 18, 'API Token', 'bf182722e2a077748c4069bc6a6091f74695ab8b37360e52229ce8fc1eea6042', '[\"*\"]', '2025-09-19 15:04:53', NULL, '2025-09-19 12:50:37', '2025-09-19 15:04:53'),
(83, 'App\\Models\\User', 18, 'API Token', 'bc4f0f077ba25a46977c2562784af4ccea788c7e3ea0ddac65db8f377cacfe85', '[\"*\"]', '2025-09-19 15:46:46', NULL, '2025-09-19 12:52:36', '2025-09-19 15:46:46'),
(91, 'App\\Models\\User', 20, 'API Token', 'efe239bbb037fe78c694bf6dfc5d6e66c9cbebff65802394c2525c53422b60f9', '[\"*\"]', '2025-09-21 18:41:00', NULL, '2025-09-21 16:52:37', '2025-09-21 18:41:00'),
(94, 'App\\Models\\User', 20, 'API Token', 'fa0d2efada0ca51514f5172aaaa361bee223e02ef42c7444cbac2d310ede8986', '[\"*\"]', '2025-09-21 23:54:51', NULL, '2025-09-21 21:03:51', '2025-09-21 23:54:51'),
(97, 'App\\Models\\User', 11, 'API Token', '77b7ac68e97d7501b69785bec64f924828da58c03e4bb637ed6882467f6d8b4f', '[\"*\"]', '2025-11-22 17:51:21', NULL, '2025-09-21 22:30:29', '2025-11-22 17:51:21'),
(116, 'App\\Models\\User', 22, 'API Token', '12e98f17d619da78cc42d0ae86a85c01312c2ed5b869e2b8fab30eae313f237d', '[\"*\"]', '2025-11-22 18:13:34', NULL, '2025-09-24 10:32:18', '2025-11-22 18:13:34'),
(128, 'App\\Models\\User', 23, 'API Token', '926973fae4a4a1e67b6c754b935a05bdc7b69df1feda60ec6f49538af947062e', '[\"*\"]', '2025-10-29 10:06:31', NULL, '2025-10-01 19:15:47', '2025-10-29 10:06:31'),
(133, 'App\\Models\\User', 19, 'API Token', '859c724c76e8e460bf3785bd01222ce9945c2ffd3729c487673d4e486a532f04', '[\"*\"]', '2025-10-07 12:52:32', NULL, '2025-10-06 14:28:35', '2025-10-07 12:52:32'),
(138, 'App\\Models\\User', 24, 'API Token', 'e019db566fded4566f5a48958ace7e4894a375d9b4fc5ff6163e12044e3cda0e', '[\"*\"]', '2025-10-08 15:05:07', NULL, '2025-10-08 14:30:41', '2025-10-08 15:05:07'),
(139, 'App\\Models\\User', 26, 'API Token', '330f4b2a0d5aee351dc78345b09c5b56262f1429c2aa6730867823e23aa688de', '[\"*\"]', '2025-11-25 21:36:25', NULL, '2025-11-25 16:31:18', '2025-11-25 21:36:25'),
(140, 'App\\Models\\User', 27, 'API Token', '98422f77968e45d3d7be0e995e0e8d11b084fd16706d4b45cb07193edc0443e6', '[\"*\"]', '2025-11-25 21:37:11', NULL, '2025-11-25 21:36:30', '2025-11-25 21:37:11'),
(141, 'App\\Models\\User', 27, 'API Token', 'fe6d87d0582316bf34bd483390b007c90b343cd52210f648b3e47cf9587be968', '[\"*\"]', '2025-11-25 21:37:28', NULL, '2025-11-25 21:37:19', '2025-11-25 21:37:28'),
(142, 'App\\Models\\User', 27, 'API Token', '74ffa7956c78c4e59c35205fa4ca19b624268c48d7c3ec96af6c3fb09de1b11e', '[\"*\"]', '2025-11-25 21:52:32', NULL, '2025-11-25 21:37:35', '2025-11-25 21:52:32');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `price` double NOT NULL DEFAULT 0,
  `discount_price` double NOT NULL DEFAULT 0,
  `discount_end_date` date DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  `installation_price` double DEFAULT NULL,
  `top_deal` tinyint(1) NOT NULL DEFAULT 0,
  `installation_compulsory` tinyint(1) NOT NULL DEFAULT 0,
  `featured_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `old_quantity` varchar(255) NOT NULL DEFAULT '100'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `category_id`, `brand_id`, `price`, `discount_price`, `discount_end_date`, `stock`, `installation_price`, `top_deal`, `installation_compulsory`, `featured_image`, `created_at`, `updated_at`, `old_quantity`) VALUES
(55, 'TV', 11, 11, 32000, 32000, '2025-07-20', '19', NULL, 0, 0, '/storage/products/b9a8d833-e8c9-4ce4-adf5-e2b547c9cfcc.png', '2025-09-15 17:15:05', '2025-09-15 17:15:05', '100'),
(56, 'Solar New', 11, 11, 32000, 32000, '2025-07-20', '19', 0, 0, 0, '/storage/products/479902e7-6ffa-49a5-8495-45475e90e0e7.png', '2025-09-15 17:15:15', '2025-09-23 22:20:53', '100'),
(58, 'New Product', 7, 11, 30000, 30000, '2025-09-15', '48', 10000, 1, 1, '/storage/products/27fd275d-bf3f-4d87-aa8c-c2ab4b8f04df.png', '2025-09-15 17:55:04', '2025-09-15 17:55:04', '100'),
(61, 'New Name', 10, 11, 10001, 10001, '2022-02-02', '32', 12312, 1, 1, '/storage/products/8487131b-b85f-4dba-8ec6-8d5d5b02b547.jpg', '2025-09-15 18:37:31', '2025-09-15 18:37:31', '100'),
(62, '....', 10, 11, 99999, 121, '2002-02-22', '123', 12, 1, 1, '/storage/products/7d7b6632-760b-4ff7-b29a-078f395ad572.jpg', '2025-09-15 18:53:31', '2025-09-15 18:53:31', '100'),
(63, 'Testing', 9, 11, 10, 108, '2025-09-23', '28', 2, 1, 1, '/storage/products/e212b55b-057a-4a39-8d80-d241169cdac0.png', '2025-09-23 13:48:16', '2025-09-23 17:27:17', '100');

-- --------------------------------------------------------

--
-- Table structure for table `product_details`
--

CREATE TABLE `product_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_details`
--

INSERT INTO `product_details` (`id`, `detail`, `product_id`, `status`, `created_at`, `updated_at`) VALUES
(71, '123asdasd', 62, 'active', '2025-09-23 14:26:03', '2025-09-23 14:26:03'),
(72, '123', 62, 'active', '2025-09-23 14:26:03', '2025-09-23 14:26:03'),
(73, '123', 62, 'active', '2025-09-23 14:26:03', '2025-09-23 14:26:03'),
(74, '123', 62, 'active', '2025-09-23 14:26:03', '2025-09-23 14:26:03'),
(75, '`123`', 62, 'active', '2025-09-23 14:26:03', '2025-09-23 14:26:03'),
(80, 'asd', 61, 'active', '2025-09-23 14:48:28', '2025-09-23 14:48:28'),
(81, '123', 61, 'active', '2025-09-23 14:48:28', '2025-09-23 14:48:28'),
(82, 'asd', 63, 'active', '2025-09-23 17:27:17', '2025-09-23 17:27:17'),
(83, 'asdmmmmm', 63, 'active', '2025-09-23 17:27:17', '2025-09-23 17:27:17'),
(84, '42 inch Full HD Display', 56, 'active', '2025-09-23 22:20:53', '2025-09-23 22:20:53'),
(85, '2 Years Warranty', 56, 'active', '2025-09-23 22:20:53', '2025-09-23 22:20:53');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_reveiews`
--

CREATE TABLE `product_reveiews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `review` text NOT NULL,
  `rating` varchar(255) NOT NULL DEFAULT '5',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `terms`
--

CREATE TABLE `terms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `content` longtext DEFAULT NULL,
  `check` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `user_id`, `subject`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 'hiii', 'pending', '2025-09-09 22:13:18', '2025-09-09 22:13:18'),
(2, 4, 'hiii', 'pending', '2025-09-09 22:13:23', '2025-09-09 22:13:23'),
(3, 4, 'hiii', 'pending', '2025-09-09 22:13:25', '2025-09-09 22:13:25'),
(4, 4, 'gajskdol', 'pending', '2025-09-09 22:29:11', '2025-09-09 22:29:11'),
(5, 4, 'Eng', 'pending', '2025-09-09 22:30:46', '2025-09-09 22:30:46'),
(6, 4, 'Eng', 'pending', '2025-09-10 02:58:34', '2025-09-10 02:58:34'),
(7, 6, 'Testing', 'pending', '2025-09-10 17:39:57', '2025-09-10 17:39:57'),
(8, 6, 'Testing', 'pending', '2025-09-10 18:14:05', '2025-09-10 18:14:05'),
(9, 6, 'Testing', 'pending', '2025-09-10 18:14:28', '2025-09-10 18:14:28'),
(10, 9, 'asd', 'pending', '2025-09-10 21:02:45', '2025-09-10 21:02:45'),
(11, 9, 'asda', 'pending', '2025-09-10 21:16:16', '2025-09-10 21:16:16'),
(12, 9, 'dsa', 'answered', '2025-09-10 21:21:13', '2025-09-18 11:11:41'),
(13, 9, 'hjg', 'pending', '2025-09-10 21:23:50', '2025-09-10 21:23:50'),
(14, 1, 'ui', 'pending', '2025-09-11 09:53:48', '2025-09-11 09:53:48'),
(15, 1, 'io', 'pending', '2025-09-11 09:55:20', '2025-09-11 09:55:20'),
(16, 1, 'asd', 'pending', '2025-09-11 13:09:13', '2025-09-11 13:09:13'),
(17, 4, 'sohaib', 'answered', '2025-09-11 14:45:12', '2025-09-21 20:11:27'),
(18, 1, 'asdad', 'pending', '2025-09-12 19:46:34', '2025-09-12 19:46:34'),
(19, 1, 'sad', 'pending', '2025-09-12 19:49:38', '2025-09-12 19:49:38'),
(20, 1, 'asd', 'pending', '2025-09-12 19:53:14', '2025-09-12 19:53:14'),
(21, 1, 'New', 'answered', '2025-09-12 20:15:44', '2025-09-12 20:39:12'),
(22, 11, 'Testing', 'answered', '2025-09-13 23:57:42', '2025-09-16 17:07:52'),
(23, 1, 'asd', 'answered', '2025-09-16 23:55:20', '2025-09-17 00:18:05'),
(24, 12, 'Peter', 'answered', '2025-09-23 10:22:19', '2025-09-23 10:23:18'),
(25, 19, 'New', 'pending', '2025-09-24 12:29:28', '2025-09-24 12:29:28'),
(26, 19, 'Testing', 'pending', '2025-09-24 12:42:06', '2025-09-24 12:42:06');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `sender` enum('user','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_messages`
--

INSERT INTO `ticket_messages` (`id`, `ticket_id`, `user_id`, `message`, `sender`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'p', 'user', '2025-09-09 22:13:18', '2025-09-09 22:13:18'),
(2, 1, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-09 22:13:18', '2025-09-09 22:13:18'),
(3, 2, 4, 'p', 'user', '2025-09-09 22:13:23', '2025-09-09 22:13:23'),
(4, 2, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-09 22:13:23', '2025-09-09 22:13:23'),
(5, 3, 4, 'p', 'user', '2025-09-09 22:13:25', '2025-09-09 22:13:25'),
(6, 3, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-09 22:13:25', '2025-09-09 22:13:25'),
(7, 4, 4, 'hi how are you', 'user', '2025-09-09 22:29:11', '2025-09-09 22:29:11'),
(8, 4, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-09 22:29:11', '2025-09-09 22:29:11'),
(9, 5, 4, 'hi', 'user', '2025-09-09 22:30:46', '2025-09-09 22:30:46'),
(10, 5, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-09 22:30:46', '2025-09-09 22:30:46'),
(11, 6, 4, 'we are here', 'user', '2025-09-10 02:58:34', '2025-09-10 02:58:34'),
(12, 6, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 02:58:34', '2025-09-10 02:58:34'),
(13, 7, 6, 'jygdsiyf', 'user', '2025-09-10 17:39:57', '2025-09-10 17:39:57'),
(14, 7, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 17:39:57', '2025-09-10 17:39:57'),
(15, 8, 6, 'ytyt', 'user', '2025-09-10 18:14:05', '2025-09-10 18:14:05'),
(16, 8, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 18:14:05', '2025-09-10 18:14:05'),
(17, 9, 6, 'er', 'user', '2025-09-10 18:14:28', '2025-09-10 18:14:28'),
(18, 9, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 18:14:28', '2025-09-10 18:14:28'),
(19, 10, 9, 'sad', 'user', '2025-09-10 21:02:45', '2025-09-10 21:02:45'),
(20, 10, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 21:02:45', '2025-09-10 21:02:45'),
(21, 11, 9, 'asda', 'user', '2025-09-10 21:16:17', '2025-09-10 21:16:17'),
(22, 11, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 21:16:17', '2025-09-10 21:16:17'),
(23, 12, 9, 'sd', 'user', '2025-09-10 21:21:13', '2025-09-10 21:21:13'),
(24, 12, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 21:21:13', '2025-09-10 21:21:13'),
(25, 13, 9, 'mhj', 'user', '2025-09-10 21:23:50', '2025-09-10 21:23:50'),
(26, 13, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-10 21:23:50', '2025-09-10 21:23:50'),
(27, 14, 1, 'klj', 'user', '2025-09-11 09:53:48', '2025-09-11 09:53:48'),
(28, 14, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-11 09:53:48', '2025-09-11 09:53:48'),
(29, 15, 1, 'klj', 'user', '2025-09-11 09:55:20', '2025-09-11 09:55:20'),
(30, 15, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-11 09:55:20', '2025-09-11 09:55:20'),
(31, 16, 1, 'asd', 'user', '2025-09-11 13:09:13', '2025-09-11 13:09:13'),
(32, 16, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-11 13:09:13', '2025-09-11 13:09:13'),
(33, 17, 4, 'hi', 'user', '2025-09-11 14:45:12', '2025-09-11 14:45:12'),
(34, 17, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-11 14:45:12', '2025-09-11 14:45:12'),
(35, 18, 1, 'asd', 'user', '2025-09-12 19:46:34', '2025-09-12 19:46:34'),
(36, 18, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-12 19:46:34', '2025-09-12 19:46:34'),
(37, 19, 1, 'asd', 'user', '2025-09-12 19:49:38', '2025-09-12 19:49:38'),
(38, 19, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-12 19:49:38', '2025-09-12 19:49:38'),
(39, 20, 1, 'as', 'user', '2025-09-12 19:53:14', '2025-09-12 19:53:14'),
(40, 20, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-12 19:53:14', '2025-09-12 19:53:14'),
(41, 21, 1, 'I need some guide.', 'user', '2025-09-12 20:15:44', '2025-09-12 20:15:44'),
(42, 21, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-12 20:15:44', '2025-09-12 20:15:44'),
(43, 21, NULL, 'fgh', 'admin', '2025-09-12 20:39:12', '2025-09-12 20:39:12'),
(44, 22, 11, 'Hello', 'user', '2025-09-13 23:57:42', '2025-09-13 23:57:42'),
(45, 22, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-13 23:57:42', '2025-09-13 23:57:42'),
(46, 22, NULL, 'ml', 'admin', '2025-09-16 17:07:52', '2025-09-16 17:07:52'),
(47, 23, 1, 'asd', 'user', '2025-09-16 23:55:20', '2025-09-16 23:55:20'),
(48, 23, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-16 23:55:20', '2025-09-16 23:55:20'),
(49, 23, NULL, 'asd', 'admin', '2025-09-17 00:18:05', '2025-09-17 00:18:05'),
(50, 23, NULL, 'sss', 'admin', '2025-09-17 00:18:21', '2025-09-17 00:18:21'),
(51, 12, NULL, 'Nice,', 'admin', '2025-09-18 11:06:16', '2025-09-18 11:06:16'),
(52, 12, NULL, 'Nice,', 'admin', '2025-09-18 11:06:17', '2025-09-18 11:06:17'),
(53, 17, NULL, 'hi', 'admin', '2025-09-21 20:11:27', '2025-09-21 20:11:27'),
(54, 24, 12, 'Hi, this is test', 'user', '2025-09-23 10:22:19', '2025-09-23 10:22:19'),
(55, 24, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-23 10:22:19', '2025-09-23 10:22:19'),
(56, 24, NULL, 'Hello', 'admin', '2025-09-23 10:23:18', '2025-09-23 10:23:18'),
(57, 25, 19, 'New', 'user', '2025-09-24 12:29:28', '2025-09-24 12:29:28'),
(58, 25, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-24 12:29:28', '2025-09-24 12:29:28'),
(59, 26, 19, 'Testing.', 'user', '2025-09-24 12:42:06', '2025-09-24 12:42:06'),
(60, 26, NULL, 'Your message has been received. Our support team will get back to you shortly.', 'admin', '2025-09-24 12:42:06', '2025-09-24 12:42:06');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tx_id` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `method` varchar(255) DEFAULT NULL,
  `transacted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `tx_id`, `reference`, `title`, `amount`, `status`, `type`, `method`, `transacted_at`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '12312312saasd', NULL, 'Funding Wallet', 1000.00, 'Completed', 'incoming', 'Direct', '2025-09-11 21:38:39', 1, '2025-09-11 21:38:39', '2025-09-11 21:38:39'),
(2, NULL, NULL, 'Funding Wallet', 1000.00, 'Completed', 'incoming', 'Direct', '2025-09-11 21:42:42', 1, '2025-09-11 21:42:42', '2025-09-11 21:42:42'),
(3, '12312312saasd', NULL, 'Funding Wallet', 1000.00, 'Completed', 'incoming', 'Direct', '2025-09-11 21:42:47', 1, '2025-09-11 21:42:47', '2025-09-11 21:42:47'),
(4, '9637109', NULL, 'Funding Wallet', 7676.00, 'Completed', 'incoming', 'Direct', '2025-09-11 21:45:33', 1, '2025-09-11 21:45:33', '2025-09-11 21:45:33'),
(5, 'jshdkajdkd', NULL, 'Order Payment - Direct', 1000.00, 'Completed', 'outgoing', 'Direct', '2025-09-11 22:05:38', 1, '2025-09-11 22:05:38', '2025-09-11 22:05:38'),
(6, 'jshdkajdkd', NULL, 'Order Payment - Direct', 1000.00, 'Completed', 'outgoing', 'Direct', '2025-09-11 22:05:41', 1, '2025-09-11 22:05:41', '2025-09-11 22:05:41'),
(7, '9638375', NULL, 'Order Payment - Direct', 1980.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 09:16:59', 1, '2025-09-12 09:16:59', '2025-09-12 09:16:59'),
(8, '9639475', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 15:47:26', 1, '2025-09-12 15:47:26', '2025-09-12 15:47:26'),
(9, '9639773', NULL, 'Order Payment - Direct', 3960.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 18:21:55', 4, '2025-09-12 18:21:55', '2025-09-12 18:21:55'),
(10, NULL, NULL, 'Order #HLDU8HAL1Y', 0.00, 'paid', 'deposit', 'direct', '2025-09-11 21:45:52', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(11, NULL, NULL, 'Order #EKPSP7SBFF', 990.00, 'paid', 'deposit', 'direct', '2025-09-11 21:46:15', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(12, NULL, NULL, 'Order #GWPEDYIFJZ', 1980.00, 'paid', 'deposit', 'direct', '2025-09-11 21:46:35', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(13, NULL, NULL, 'Order #LNBUPANX6S', 1980.00, 'paid', 'deposit', 'direct', '2025-09-11 21:47:18', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(14, NULL, NULL, 'Order #TRDPTIIPDG', 1980.00, 'paid', 'deposit', 'direct', '2025-09-11 21:49:54', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(15, NULL, NULL, 'Order #L9BRYETAGE', 1980.00, 'paid', 'deposit', 'direct', '2025-09-11 21:51:19', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(16, NULL, NULL, 'Order #1DHKV0XFQD', 960000.00, 'paid', 'deposit', 'direct', '2025-09-11 22:04:28', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(17, NULL, NULL, 'Order #PTQA0GBX73', 960000.00, 'paid', 'deposit', 'direct', '2025-09-12 08:50:01', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(18, NULL, NULL, 'Order #ZNRQHYZQQI', 1980.00, 'paid', 'deposit', 'direct', '2025-09-12 09:10:31', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(19, NULL, NULL, 'Order #MCNKZPUZNU', 1980.00, 'paid', 'deposit', 'direct', '2025-09-12 09:16:00', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(20, NULL, NULL, 'Order #M8TRN3CRF8', 1980.00, 'paid', 'deposit', 'direct', '2025-09-12 09:17:07', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(21, NULL, NULL, 'Order #QCPWO5XBZF', 0.00, 'paid', 'deposit', 'direct', '2025-09-12 09:38:59', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(22, NULL, NULL, 'Order #VX4X3YQQVO', 0.00, 'paid', 'deposit', 'direct', '2025-09-12 15:39:46', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(23, NULL, NULL, 'Order #ZZ38Z2RYOJ', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 15:39:55', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(24, NULL, NULL, 'Order #SWNM1MYX3S', 990.00, 'paid', 'deposit', 'direct', '2025-09-12 15:46:33', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(25, NULL, NULL, 'Order #HFCIXWFA7I', 990.00, 'paid', 'deposit', 'direct', '2025-09-12 15:56:18', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(26, NULL, NULL, 'Order #I4AU2NSE8M', 0.00, 'paid', 'deposit', 'direct', '2025-09-12 16:00:38', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(27, NULL, NULL, 'Order #0AU1BHD17X', 1980.00, 'paid', 'deposit', 'direct', '2025-09-12 16:00:46', 1, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(28, NULL, NULL, 'Order #VMAJEAGGMG', 0.00, 'paid', 'deposit', 'direct', '2025-09-12 17:05:23', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(29, NULL, NULL, 'Order #OYEJCW3FF5', 0.00, 'paid', 'deposit', 'direct', '2025-09-12 17:07:15', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(30, NULL, NULL, 'Order #STJVQABNA4', 2970.00, 'paid', 'deposit', 'direct', '2025-09-12 17:53:29', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(31, NULL, NULL, 'Order #LGRRPKVOHW', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:05:27', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(32, NULL, NULL, 'Order #DXVPRLRQ3M', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:06:14', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(33, NULL, NULL, 'Order #IHV1Y8KJL4', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:11:06', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(34, NULL, NULL, 'Order #LGM9MUNJFR', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:14:32', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(35, NULL, NULL, 'Order #VH66DJ6YFA', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:17:21', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(36, NULL, NULL, 'Order #REC6TLDOFJ', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:20:13', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(37, NULL, NULL, 'Order #TNMIEKLWI7', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:28:29', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(38, NULL, NULL, 'Order #JPTOK7WJTQ', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:31:26', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(39, NULL, NULL, 'Order #6ILZ41X9DM', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:34:27', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(40, NULL, NULL, 'Order #YL7XVQSDSD', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:38:36', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(41, NULL, NULL, 'Order #AKG40YQC2H', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:43:48', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(42, NULL, NULL, 'Order #BY8IBF6YJW', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:44:15', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(43, NULL, NULL, 'Order #BJZVMYNAWR', 3960.00, 'paid', 'deposit', 'direct', '2025-09-12 18:47:08', 4, '2025-09-12 18:56:28', '2025-09-12 18:56:28'),
(44, '9639851', NULL, 'Order Payment - Direct', 5940.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 19:05:57', 4, '2025-09-12 19:05:57', '2025-09-12 19:05:57'),
(45, '9639907', NULL, 'Order Payment - Direct', 5940.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 19:45:57', 4, '2025-09-12 19:45:57', '2025-09-12 19:45:57'),
(46, '9639916', NULL, 'Order Payment - Direct', 5940.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 19:50:04', 4, '2025-09-12 19:50:04', '2025-09-12 19:50:04'),
(47, '9639941', NULL, 'Order Payment - Direct', 5940.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 20:07:34', 4, '2025-09-12 20:07:34', '2025-09-12 20:07:34'),
(48, '9639953', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 20:12:15', 1, '2025-09-12 20:12:15', '2025-09-12 20:12:15'),
(49, '9639959', NULL, 'Order Payment - Direct', 5940.00, 'Completed', 'outgoing', 'Direct', '2025-09-12 20:13:42', 4, '2025-09-12 20:13:42', '2025-09-12 20:13:42'),
(50, NULL, NULL, 'Order #2WDLFBFQYW', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 19:01:56', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(51, NULL, NULL, 'Order #DOZIDXDA1S', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 19:02:44', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(52, NULL, NULL, 'Order #MYEJGJBKZU', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 19:43:23', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(53, NULL, NULL, 'Order #YPLQBNTWKA', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 19:46:29', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(54, NULL, NULL, 'Order #IP3GM25E3S', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 19:48:18', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(55, NULL, NULL, 'Order #DDCLDA024I', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 20:05:00', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(56, NULL, NULL, 'Order #D6P230UMZC', 990.00, 'paid', 'deposit', 'direct', '2025-09-12 20:10:01', 1, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(57, NULL, NULL, 'Order #F5XSLBIIUB', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 20:12:34', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(58, NULL, NULL, 'Order #Z8P3KJWN0D', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 20:17:00', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(59, NULL, NULL, 'Order #SEEEOJBCCQ', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 20:20:10', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(60, NULL, NULL, 'Order #TQLKNS3AR3', 6930.00, 'paid', 'deposit', 'direct', '2025-09-12 20:22:10', 4, '2025-09-12 20:37:41', '2025-09-12 20:37:41'),
(61, '9641164', NULL, 'Order Payment - Direct', 7920.00, 'Completed', 'outgoing', 'Direct', '2025-09-13 08:35:48', 1, '2025-09-13 08:35:48', '2025-09-13 08:35:48'),
(63, '12', 'asd', 'testing', 205.17, 'success', 'debit', 'card', '2025-09-13 20:30:41', 1, '2025-09-13 20:30:41', '2025-09-13 20:30:41'),
(64, '9642763', NULL, 'Order Payment - Direct', 1000.00, 'Completed', 'outgoing', 'Direct', '2025-09-13 23:51:51', 11, '2025-09-13 23:51:51', '2025-09-13 23:51:51'),
(65, 'wallet_1757809170287', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-14 00:19:31', 11, '2025-09-14 00:19:31', '2025-09-14 00:19:31'),
(66, 'wallet_1757809223298', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-14 00:20:24', 11, '2025-09-14 00:20:24', '2025-09-14 00:20:24'),
(67, '9642814', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-14 00:27:21', 11, '2025-09-14 00:27:21', '2025-09-14 00:27:21'),
(68, NULL, NULL, 'Order #PNWGG8XTW8', 990.00, 'paid', 'deposit', 'direct', '2025-09-12 21:00:37', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(69, NULL, NULL, 'Order #KNVVBQ29LN', 5940.00, 'paid', 'deposit', 'direct', '2025-09-12 21:58:44', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(70, NULL, NULL, 'Order #BTEXEXEEFL', 8910.00, 'paid', 'deposit', 'direct', '2025-09-12 22:00:03', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(71, NULL, NULL, 'Order #GCOKUEXUOY', 7920.00, 'paid', 'deposit', 'direct', '2025-09-13 07:52:36', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(72, NULL, NULL, 'Order #NDAJUC8YMP', 7920.00, 'paid', 'deposit', 'direct', '2025-09-13 08:30:49', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(73, NULL, NULL, 'Order #RBE8MC6KOG', 7920.00, 'paid', 'deposit', 'direct', '2025-09-13 08:32:07', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(74, NULL, NULL, 'Order #82QY4TP8DT', 7920.00, 'paid', 'deposit', 'direct', '2025-09-13 09:59:19', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(75, NULL, NULL, 'Order #MK2WEUT2RC', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:45:22', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(76, NULL, NULL, 'Order #6R4KW8AOWH', 5940.00, 'paid', 'deposit', 'direct', '2025-09-13 20:45:31', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(77, NULL, NULL, 'Order #P8J9GS8P4X', 5940.00, 'paid', 'deposit', 'direct', '2025-09-13 20:46:05', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(78, NULL, NULL, 'Order #YLBSCGUA7U', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:46:40', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(79, NULL, NULL, 'Order #JYTGKBNLJ4', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:46:55', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(80, NULL, NULL, 'Order #SIOUZEG2UH', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:48:26', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(81, NULL, NULL, 'Order #UODW32XDPD', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:52:40', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(82, NULL, NULL, 'Order #XWV7OINRVA', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 20:53:44', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(83, NULL, NULL, 'Order #KBANEOSOYR', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:03:28', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(84, NULL, NULL, 'Order #F37T9QNWZO', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:14:06', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(85, NULL, NULL, 'Order #OAX6KXIWV1', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:18:05', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(86, NULL, NULL, 'Order #DGPE0EU3L1', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:18:47', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(87, NULL, NULL, 'Order #MHSUSCMLZG', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:19:07', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(88, NULL, NULL, 'Order #ISXIPO0IZQ', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:20:22', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(89, NULL, NULL, 'Order #OXIYPSFJ1X', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:23:54', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(90, NULL, NULL, 'Order #FDII4V07MU', 0.00, 'paid', 'deposit', 'direct', '2025-09-13 21:25:00', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(91, NULL, NULL, 'Order #DVIASSPQKN', 4960.00, 'paid', 'deposit', 'direct', '2025-09-13 21:36:16', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(92, NULL, NULL, 'Order #1ZIJ72OCRW', 1980.00, 'paid', 'deposit', 'direct', '2025-09-14 13:37:00', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(93, NULL, NULL, 'Order #HJ2LUGTPKF', 5940.00, 'paid', 'deposit', 'direct', '2025-09-14 14:21:08', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(94, NULL, NULL, 'Order #ADD2VNUGAP', 3980.00, 'paid', 'deposit', 'direct', '2025-09-15 11:00:04', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(95, NULL, NULL, 'Order #O28XHOHDH1', 990.00, 'paid', 'deposit', 'direct', '2025-09-15 11:01:26', 1, '2025-09-15 13:07:18', '2025-09-15 13:07:18'),
(96, NULL, NULL, 'Order #PWPMG4TCNN', 990.00, 'paid', 'deposit', 'direct', '2025-09-13 21:35:20', 2, '2025-09-16 12:52:46', '2025-09-16 12:52:46'),
(97, NULL, NULL, 'Order #QBMLGOE5CG', 990.00, 'paid', 'deposit', 'direct', '2025-09-16 23:42:54', 1, '2025-09-17 00:13:01', '2025-09-17 00:13:01'),
(98, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:33:42', 1, '2025-09-19 13:40:53', '2025-09-21 17:33:42'),
(99, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:33:42', 1, '2025-09-19 13:40:53', '2025-09-21 17:33:42'),
(100, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:33:42', 1, '2025-09-19 13:40:53', '2025-09-21 17:33:42'),
(101, '9659365', NULL, 'Order Payment - Direct', 990.00, 'Completed', 'outgoing', 'Direct', '2025-09-19 15:04:38', 18, '2025-09-19 15:04:38', '2025-09-19 15:04:38'),
(102, NULL, NULL, 'Order #XUPNQ98JZR', 998.00, 'paid', 'deposit', 'direct', '2025-09-21 16:47:38', 12, '2025-09-21 17:12:50', '2025-09-21 17:12:50'),
(103, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:33:55', 1, '2025-09-21 17:33:50', '2025-09-21 17:33:55'),
(104, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:33:55', 1, '2025-09-21 17:33:50', '2025-09-21 17:33:55'),
(105, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:33:55', 1, '2025-09-21 17:33:50', '2025-09-21 17:33:55'),
(106, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:37:17', 1, '2025-09-21 17:34:27', '2025-09-21 17:37:17'),
(107, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:37:17', 1, '2025-09-21 17:34:27', '2025-09-21 17:37:17'),
(108, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:37:17', 1, '2025-09-21 17:34:27', '2025-09-21 17:37:17'),
(109, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:37:55', 1, '2025-09-21 17:37:37', '2025-09-21 17:37:55'),
(110, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:37:55', 1, '2025-09-21 17:37:37', '2025-09-21 17:37:55'),
(111, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:37:55', 1, '2025-09-21 17:37:37', '2025-09-21 17:37:55'),
(112, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:38:15', 1, '2025-09-21 17:38:11', '2025-09-21 17:38:15'),
(113, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:38:15', 1, '2025-09-21 17:38:11', '2025-09-21 17:38:15'),
(114, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:38:15', 1, '2025-09-21 17:38:11', '2025-09-21 17:38:15'),
(115, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:39:50', 1, '2025-09-21 17:38:38', '2025-09-21 17:39:50'),
(116, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:39:50', 1, '2025-09-21 17:38:38', '2025-09-21 17:39:50'),
(117, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:39:50', 1, '2025-09-21 17:38:38', '2025-09-21 17:39:50'),
(118, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:40:33', 1, '2025-09-21 17:40:21', '2025-09-21 17:40:33'),
(119, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 17:40:33', 1, '2025-09-21 17:40:21', '2025-09-21 17:40:33'),
(120, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 17:40:33', 1, '2025-09-21 17:40:21', '2025-09-21 17:40:33'),
(121, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 19:43:46', 1, '2025-09-21 17:42:09', '2025-09-21 19:43:46'),
(122, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 19:43:46', 1, '2025-09-21 17:42:09', '2025-09-21 19:43:46'),
(123, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 19:43:46', 1, '2025-09-21 17:42:09', '2025-09-21 19:43:46'),
(124, '9663754', NULL, 'Order Payment - Direct', 2990.00, 'Completed', 'outgoing', 'Direct', '2025-09-21 18:25:35', 20, '2025-09-21 18:25:35', '2025-09-21 18:25:35'),
(125, '9663779', NULL, 'Order Payment - Direct', 998.00, 'Completed', 'outgoing', 'Direct', '2025-09-21 18:36:53', 20, '2025-09-21 18:36:53', '2025-09-21 18:36:53'),
(126, 'LD-1', 'Loan Application ID: 8', 'Loan Disbursement #1', 1230.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 21:36:05', 1, '2025-09-21 21:03:43', '2025-09-21 21:36:05'),
(127, 'LD-2', 'Loan Application ID: 8', 'Loan Disbursement #2', 8989.00, 'Pending', 'deposit', 'loan_disbursement', '2025-09-21 21:36:05', 1, '2025-09-21 21:03:43', '2025-09-21 21:36:05'),
(128, 'LD-3', 'Loan Application ID: 8', 'Loan Disbursement #3', 9.00, 'Rejected', 'deposit', 'loan_disbursement', '2025-09-21 21:36:05', 1, '2025-09-21 21:03:43', '2025-09-21 21:36:05'),
(129, '9664044', NULL, 'Order Payment - Direct', 32000.00, 'Completed', 'outgoing', 'Direct', '2025-09-21 22:33:55', 20, '2025-09-21 22:33:55', '2025-09-21 22:33:55'),
(130, NULL, NULL, 'Order #4LMTHKB0JU', 147000.00, 'paid', 'deposit', 'direct', '2025-09-23 11:49:08', 12, '2025-09-23 11:57:44', '2025-09-23 11:57:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `sur_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `refferal_code` varchar(255) DEFAULT NULL,
  `user_code` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `otp` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bvn` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `sur_name`, `email`, `email_verified_at`, `password`, `phone`, `profile_picture`, `refferal_code`, `user_code`, `role`, `is_verified`, `is_active`, `otp`, `remember_token`, `created_at`, `updated_at`, `bvn`) VALUES
(1, 'Bilal', '11', 'hoyaxa4776@besaies.com', NULL, '$2y$12$K9HaRjGIM8RRHYfzSGTlA.r7QCw5yeI9tSJ3.7iANodLCGm9CDiVC', '03206440155', '1758199956.png', 'reff222', 'bilal538', 'Admin', 0, 1, '79624', NULL, '2025-09-03 19:54:17', '2025-09-18 12:52:36', NULL),
(2, 'Sohaib', 'Ahmad', 'sohaibahmad3277@gmail.com', NULL, '$2y$12$90I/XR9qTnfhSMR90otKMuZIibaATDYRpUburVe6GDZ80Nv8SEx8u', '67392956', NULL, 'rf5444', 'sohaib493', 'Admin', 0, 1, '3626', NULL, '2025-09-03 20:51:54', '2025-09-03 20:51:54', NULL),
(3, 'Sohaib', 'Ahmad', 'mygamingland7@gmail.com', NULL, '$2y$12$JAop7nfYUvN134wpnt6a8u9ciEeiD8OOA2Je73MtBF3rsXn5vmWMS', '67392956', NULL, 'rf5545', 'sohaib439', 'Admin', 0, 1, '79143', NULL, '2025-09-04 00:05:42', '2025-09-04 00:05:42', NULL),
(4, 'Sohaib Ahmad', 'Ahmad', 'ahmad12@gmail.com', NULL, '$2y$12$52hHVElWo49Y.lXzOC8I2Oyk2hzgwsDrNNwrq2qg6L9g4LmwBc2xK', '67392956', '1757511835.png', 'rf5444', 'sohaib343', 'Admin', 0, 1, '29455', NULL, '2025-09-04 00:19:01', '2025-09-10 20:43:55', NULL),
(5, 'Ahmad', 'Imran', 'basonwear@gmail.com', NULL, '$2y$12$Hnba/WaIbFxb/pr4MUyx2eASJnYu3jUnOxUruTXfWNxMBMm7xT5le', '03177792147', '1757449673.png', 'rf54784', 'ahmad257', 'Admin', 0, 1, '40280', NULL, '2025-09-04 00:57:18', '2025-09-10 03:27:53', NULL),
(6, 'Hafiz Sameer', 'sameer', 'hmstejhhch11@gmail.com', NULL, '$2y$12$xyPnUerZUCnI5v8b4cqRy.YiL.xFI3BG/BkailxwfXz0EGBsJfWJ6', '01230123', NULL, 'kahgskdjh', 'hafiz sameer625', 'Admin', 0, 1, '75172', NULL, '2025-09-10 16:46:36', '2025-09-10 16:46:36', NULL),
(7, 'asdsa', 'asdas', 'asd@gmail.com', NULL, '$2y$12$u.SEBlRG3oibbQxZ8kIZuOTCVJDhjkhic2tk8Tme4iYKcbxBn/9Wy', '1231231', NULL, '11221122', 'asdsa390', 'Admin', 0, 1, '85014', NULL, '2025-09-10 19:01:57', '2025-09-10 19:01:57', NULL),
(9, 'asda', 'asda', 'negor39576@certve.com', NULL, '$2y$12$wmujsNvso0eoXfhu6N4LGu/i5UIZ8IC4SqmpD06r0THEQfxk0kuVa', '21312', NULL, '11221122', 'asda785', 'admin', 0, 1, '73829', NULL, '2025-09-10 19:08:14', '2025-09-10 19:08:14', NULL),
(10, 'bv', 'vbc', 'hmstech11@gmail.coasdasdm', NULL, '$2y$12$KJu6HCALO4hvS0konudHl.AaGKgQS83LA9Y25J7qGw/sWBhGRyZiK', '768678', NULL, NULL, 'bv384', 'admin', 0, 1, '19754', NULL, '2025-09-13 22:09:49', '2025-09-13 22:09:49', NULL),
(11, 'Hafiz', 'sameer', 'hmstech11@gmail.com', NULL, '$2y$12$xzNgrZcs.tZPxKeA7rhqp.fJQXDIiP7y./RPaVtsjOEciu.w4pg6O', '03419665580', NULL, NULL, 'hafiz352', 'user', 0, 1, '10893', NULL, '2025-09-13 23:48:55', '2025-09-21 21:52:12', NULL),
(12, 'peter', 'odoh', 'socialmediaoutreach3@gmail.com', NULL, '$2y$12$zQRa8/v5.KewwpNZMQ4dxep5aXyn0e4c/.XtlAdZPsngBwYZb5KYG', '09063939859', NULL, NULL, 'peter232', 'admin', 0, 1, '90659', NULL, '2025-09-14 11:13:21', '2025-09-14 11:37:44', NULL),
(13, 'asd', NULL, 'asdasd@asda.xc', NULL, '$2y$12$q7ufTeZREuPoUiKCovNJ2ORCDoxP7aWS8G3c66lyYQ7eInHrrz1hy', '11221122', NULL, NULL, 'asd734', 'user', 0, 1, NULL, NULL, '2025-09-16 13:14:10', '2025-09-16 13:14:10', NULL),
(14, 'asd', NULL, 'abubakarsajjad.202202655@gcuf.edu.pk', NULL, '$2y$12$ReuHiFEcuN5b.2Iaypx/y.p3aumq/MXieHMpdCP0n5N3QqS8G4d0C', '12312', NULL, NULL, 'asd832', 'user', 0, 1, NULL, NULL, '2025-09-16 13:14:48', '2025-09-16 13:14:48', NULL),
(15, 'asdas', NULL, 'asd@asdas.cpm', NULL, '$2y$12$nwuq6tJ0TIL7PxYtGjeLGeMh67p.Mx6Yh/WQP2k21SfO7rIxuMpFO', 'asd', NULL, NULL, 'asdas285', 'user', 0, 1, NULL, NULL, '2025-09-16 13:15:22', '2025-09-16 13:15:22', NULL),
(16, 'asd', NULL, 'asdasd@asdas.cpm', NULL, '$2y$12$FfC3OwOahqX6CcxU/4j8ie0gG4axEf28T3ocwCVlNz4IRtwn/lyM2', '23123', NULL, NULL, 'asd591', 'user', 0, 1, NULL, NULL, '2025-09-17 00:01:24', '2025-09-17 00:01:24', NULL),
(17, 'new', NULL, 'user@nextmail.com', NULL, '$2y$12$d1bc4/1KIPYxVzcwfoaKVOcbvaBj7mFb/vXiOTB9MaP9rm/uXHUTi', '111222', NULL, NULL, 'new896', 'user', 0, 1, NULL, NULL, '2025-09-18 10:24:05', '2025-09-18 10:24:05', '12121'),
(18, 'New User', 'Testing', 'noweri3550@dawhe.com', NULL, '$2y$12$UXMVi8pLX6gOaJbqJVWsXeqvuO3a/iEzPwev.FdNDuhkVbZOfMPxC', '11221122', '1758294183.jpeg', NULL, 'new user708', 'Admin', 0, 1, '20015', NULL, '2025-09-19 12:49:52', '2025-09-19 15:03:03', '11122212'),
(19, 'admin', 'admin', 'admin@gmail.com', NULL, '$2y$12$ZR./oUm.dq/cExiLXJ2ruuAUyBDBFQGRNmQfUMIowt/ILrkbisFhO', '03206440155', '1758647732.png', 'reff222', 'bilal107', 'admin', 0, 1, '77390', NULL, '2025-09-21 12:49:39', '2025-09-23 17:15:32', NULL),
(20, 'Name', 'surName', 'cavow30281@camjoint.com', NULL, '$2y$12$8UsaAGHWXbR2ZterB6JkWuYpOB9w4QraC.Kq0tHKkTF7zccGkGkQy', '11221122', '1758474782.png', NULL, 'name906', 'Admin', 0, 1, '57181', NULL, '2025-09-21 16:51:51', '2025-09-21 17:13:02', '11221122'),
(21, 'ab', NULL, 'abc@gmail.com', NULL, '$2y$12$7Jf.5WT0.7XvFPK.UZvzUONuQcnqjb5s1Mwr18PegMks2c0fg1BCi', '11221122', NULL, NULL, 'ab925', 'Admin', 0, 1, NULL, NULL, '2025-09-21 20:07:57', '2025-09-21 20:07:57', '112212'),
(22, 'peter', 'odoh', 'cto@pejuldigitalagency.com', NULL, '$2y$12$F9dHgK2FryTwrXpjKeVsJu9IErVrC6ZzZ//4yNkLRi5Zw.A8M9hvy', '09063939859', NULL, NULL, 'peter298', 'Admin', 0, 1, '67976', NULL, '2025-09-24 10:31:44', '2025-09-24 10:31:44', '2234855555'),
(23, 'Olamide', 'Olaleye', 'olamideolaleye@gmail.com', NULL, '$2y$12$QERPfN2PxwrFhN0PaxUXKe9OwpAJjiLQHxZ3nstoygpm/iJsycBx.', '08033733151', NULL, NULL, 'olamide994', 'Admin', 0, 1, '28106', NULL, '2025-10-01 19:14:47', '2025-10-01 19:14:47', '22151051337'),
(24, 'Dupe', 'Abiona', 'dupeabiona5@gmail.com', NULL, '$2y$12$ZoonQ4aFjfz5DHrJ4z3GkuZ6TGQlTYa3MHCxea6gE3VL7bUg2ULOG', '09077141837', NULL, NULL, 'dupe333', 'Admin', 0, 1, '18277', NULL, '2025-10-02 13:02:05', '2025-10-02 13:02:05', '22156094382'),
(25, 'Saheed', 'Oseni-Wahab', 'soseniwahab@gmail.com', NULL, '$2y$12$XYdo5H5J0rKsV5j0K9yVS.ViRAuZem/mvaMFfPHUOLHmzk9HFfEyu', '0806191159', NULL, NULL, 'saheed400', 'Admin', 0, 1, '50190', NULL, '2025-10-06 14:35:50', '2025-10-06 14:35:50', '22156094371'),
(26, 'Micah', 'Williams', 'riyevah817@izeao.com', NULL, '$2y$12$jh8BnyYtuumL5Ou8Ci/SA.NTOqNC2HvNJLWvhcs/ZS0QMIT9fhWX6', '+1 (152) 526-2296', NULL, NULL, 'micah581', 'Admin', 0, 1, '84369', NULL, '2025-11-25 16:30:48', '2025-11-25 16:30:48', '609'),
(27, 'Martena', 'Perry', 'abc11@gmail.com', NULL, '$2y$12$yNBassOJeJOAbJ7EXZIc6OvntMPoTI9.A0MuAb/kbL9fHDYUso27q', '+1 (782) 651-7509', NULL, NULL, 'martena746', 'Admin', 0, 1, '52815', NULL, '2025-11-25 21:36:16', '2025-11-25 21:36:16', '880');

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `activity` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`id`, `activity`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'User Logged In', 1, '2025-09-18 10:21:17', '2025-09-18 10:21:17'),
(2, 'User Logged In', 1, '2025-09-18 10:21:31', '2025-09-18 10:21:31'),
(3, 'User Logged In', 18, '2025-09-19 12:50:37', '2025-09-19 12:50:37'),
(4, 'User Logged In', 18, '2025-09-19 12:52:36', '2025-09-19 12:52:36'),
(5, 'User Logged In', 11, '2025-09-21 12:41:30', '2025-09-21 12:41:30'),
(6, 'User Logged In', 19, '2025-09-21 12:49:51', '2025-09-21 12:49:51'),
(7, 'User Logged In', 19, '2025-09-21 12:52:20', '2025-09-21 12:52:20'),
(8, 'User Logged In', 11, '2025-09-21 12:58:57', '2025-09-21 12:58:57'),
(9, 'User Logged In', 19, '2025-09-21 12:59:48', '2025-09-21 12:59:48'),
(10, 'User Logged In', 19, '2025-09-21 13:17:19', '2025-09-21 13:17:19'),
(11, 'User Logged In', 12, '2025-09-21 15:09:52', '2025-09-21 15:09:52'),
(12, 'User Logged In', 20, '2025-09-21 16:52:37', '2025-09-21 16:52:37'),
(13, 'User Logged In', 19, '2025-09-21 18:47:16', '2025-09-21 18:47:16'),
(14, 'User Logged In', 11, '2025-09-21 20:09:15', '2025-09-21 20:09:15'),
(15, 'User Logged In', 20, '2025-09-21 21:03:51', '2025-09-21 21:03:51'),
(16, 'User Logged In', 11, '2025-09-21 21:51:27', '2025-09-21 21:51:27'),
(17, 'User Logged In', 11, '2025-09-21 21:56:00', '2025-09-21 21:56:00'),
(18, 'User Logged In', 11, '2025-09-21 22:30:29', '2025-09-21 22:30:29'),
(19, 'User Logged In', 19, '2025-09-22 19:58:36', '2025-09-22 19:58:36'),
(20, 'User Logged In', 19, '2025-09-23 05:54:41', '2025-09-23 05:54:41'),
(21, 'User Logged In', 19, '2025-09-23 10:07:22', '2025-09-23 10:07:22'),
(22, 'User Logged In', 19, '2025-09-23 10:07:45', '2025-09-23 10:07:45'),
(23, 'User Logged In', 19, '2025-09-23 10:10:51', '2025-09-23 10:10:51'),
(24, 'User Logged In', 19, '2025-09-23 13:30:32', '2025-09-23 13:30:32'),
(25, 'User Logged In', 19, '2025-09-23 15:04:00', '2025-09-23 15:04:00'),
(26, 'User Logged In', 19, '2025-09-23 17:12:26', '2025-09-23 17:12:26'),
(27, 'User Logged In', 19, '2025-09-23 17:16:01', '2025-09-23 17:16:01'),
(28, 'User Logged In', 19, '2025-09-23 17:25:57', '2025-09-23 17:25:57'),
(29, 'User Logged In', 12, '2025-09-23 18:03:38', '2025-09-23 18:03:38'),
(30, 'User Logged In', 19, '2025-09-23 18:57:09', '2025-09-23 18:57:09'),
(31, 'User Logged In', 19, '2025-09-23 20:36:34', '2025-09-23 20:36:34'),
(32, 'User Logged In', 12, '2025-09-23 20:43:45', '2025-09-23 20:43:45'),
(33, 'User Logged In', 19, '2025-09-23 22:20:06', '2025-09-23 22:20:06'),
(34, 'User Logged In', 19, '2025-09-24 09:14:54', '2025-09-24 09:14:54'),
(35, 'User Logged In', 12, '2025-09-24 09:17:25', '2025-09-24 09:17:25'),
(36, 'User Logged In', 12, '2025-09-24 10:27:51', '2025-09-24 10:27:51'),
(37, 'User Logged In', 22, '2025-09-24 10:32:18', '2025-09-24 10:32:18'),
(38, 'User Logged In', 19, '2025-09-24 11:00:23', '2025-09-24 11:00:23'),
(39, 'User Logged In', 19, '2025-09-24 12:15:29', '2025-09-24 12:15:29'),
(40, 'User Logged In', 19, '2025-09-25 05:58:10', '2025-09-25 05:58:10'),
(41, 'User Logged In', 19, '2025-09-25 06:23:42', '2025-09-25 06:23:42'),
(42, 'User Logged In', 19, '2025-09-25 06:25:43', '2025-09-25 06:25:43'),
(43, 'User Logged In', 19, '2025-09-29 12:05:45', '2025-09-29 12:05:45'),
(44, 'User Logged In', 19, '2025-09-29 12:07:46', '2025-09-29 12:07:46'),
(45, 'User Logged In', 19, '2025-09-29 12:24:56', '2025-09-29 12:24:56'),
(46, 'User Logged In', 19, '2025-09-29 12:27:03', '2025-09-29 12:27:03'),
(47, 'User Logged In', 19, '2025-09-29 14:44:16', '2025-09-29 14:44:16'),
(48, 'User Logged In', 19, '2025-10-01 18:40:13', '2025-10-01 18:40:13'),
(49, 'User Logged In', 23, '2025-10-01 19:15:47', '2025-10-01 19:15:47'),
(50, 'User Logged In', 24, '2025-10-02 13:04:07', '2025-10-02 13:04:07'),
(51, 'User Logged In', 24, '2025-10-06 08:41:11', '2025-10-06 08:41:11'),
(52, 'User Logged In', 24, '2025-10-06 11:44:10', '2025-10-06 11:44:10'),
(53, 'User Logged In', 24, '2025-10-06 14:19:00', '2025-10-06 14:19:00'),
(54, 'User Logged In', 19, '2025-10-06 14:28:35', '2025-10-06 14:28:35'),
(55, 'User Logged In', 25, '2025-10-06 14:37:30', '2025-10-06 14:37:30'),
(56, 'User Logged In', 25, '2025-10-08 12:50:17', '2025-10-08 12:50:17'),
(57, 'User Logged In', 24, '2025-10-08 13:44:13', '2025-10-08 13:44:13'),
(58, 'User Logged In', 25, '2025-10-08 14:16:53', '2025-10-08 14:16:53'),
(59, 'User Logged In', 24, '2025-10-08 14:30:41', '2025-10-08 14:30:41'),
(60, 'User Logged In', 26, '2025-11-25 16:31:18', '2025-11-25 16:31:18'),
(61, 'User Logged In', 27, '2025-11-25 21:36:30', '2025-11-25 21:36:30'),
(62, 'User Logged In', 27, '2025-11-25 21:37:19', '2025-11-25 21:37:19'),
(63, 'User Logged In', 27, '2025-11-25 21:37:35', '2025-11-25 21:37:35');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `loan_balance` varchar(255) DEFAULT NULL,
  `shop_balance` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `referral_balance` double(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `status`, `loan_balance`, `shop_balance`, `user_id`, `created_at`, `updated_at`, `referral_balance`) VALUES
(1, 'active', '139897', '10676', 1, '2025-09-03 19:54:17', '2025-09-18 13:50:02', 130.00),
(2, 'active', NULL, NULL, 2, '2025-09-03 20:51:54', '2025-09-03 20:51:54', 0.00),
(3, 'active', NULL, NULL, 3, '2025-09-04 00:05:42', '2025-09-04 00:05:42', 0.00),
(4, 'active', NULL, NULL, 4, '2025-09-04 00:19:01', '2025-09-04 00:19:01', 0.00),
(5, 'active', NULL, NULL, 5, '2025-09-04 00:57:18', '2025-09-04 00:57:18', 0.00),
(6, 'active', NULL, NULL, 6, '2025-09-10 16:46:36', '2025-09-10 16:46:36', 0.00),
(7, 'active', NULL, NULL, 7, '2025-09-10 19:01:57', '2025-09-10 19:01:57', 0.00),
(9, 'active', NULL, NULL, 9, '2025-09-10 19:08:14', '2025-09-10 19:08:14', 0.00),
(10, 'active', NULL, NULL, 10, '2025-09-13 22:09:49', '2025-09-13 22:09:49', 0.00),
(11, 'active', '100000', NULL, 11, '2025-09-13 23:48:55', '2025-09-21 22:40:54', 0.00),
(12, 'active', '500000', NULL, 12, '2025-09-14 11:13:21', '2025-09-23 10:50:11', 0.00),
(13, 'active', NULL, NULL, 13, '2025-09-16 13:14:10', '2025-09-16 13:14:10', 0.00),
(14, 'active', NULL, NULL, 14, '2025-09-16 13:14:48', '2025-09-16 13:14:48', 0.00),
(15, 'active', NULL, NULL, 15, '2025-09-16 13:15:22', '2025-09-16 13:15:22', 0.00),
(16, 'active', NULL, NULL, 16, '2025-09-17 00:01:24', '2025-09-17 00:01:24', 0.00),
(17, 'active', NULL, NULL, 17, '2025-09-18 10:24:05', '2025-09-18 10:24:05', 0.00),
(18, 'active', '400', NULL, 18, '2025-09-19 12:49:52', '2025-09-19 14:02:23', 0.00),
(19, 'active', NULL, NULL, 19, '2025-09-21 12:49:39', '2025-09-21 12:49:39', 0.00),
(20, 'active', '123', NULL, 20, '2025-09-21 16:51:51', '2025-09-21 23:53:50', 0.00),
(21, 'active', NULL, NULL, 21, '2025-09-21 20:07:57', '2025-09-21 20:07:57', 0.00),
(22, 'active', NULL, NULL, 22, '2025-09-24 10:31:44', '2025-09-24 10:31:44', 0.00),
(23, 'active', NULL, NULL, 23, '2025-10-01 19:14:47', '2025-10-01 19:14:47', 0.00),
(24, 'active', NULL, NULL, 24, '2025-10-02 13:02:05', '2025-10-02 13:02:05', 0.00),
(25, 'active', NULL, NULL, 25, '2025-10-06 14:35:50', '2025-10-06 14:35:50', 0.00),
(26, 'active', NULL, NULL, 26, '2025-11-25 16:30:48', '2025-11-25 16:30:48', 0.00),
(27, 'active', NULL, NULL, 27, '2025-11-25 21:36:16', '2025-11-25 21:36:16', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_requests`
--

CREATE TABLE `withdraw_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `tx_id` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdraw_requests`
--

INSERT INTO `withdraw_requests` (`id`, `user_id`, `amount`, `bank_name`, `account_name`, `account_number`, `status`, `tx_id`, `reference`, `processed_at`, `transaction_id`, `created_at`, `updated_at`) VALUES
(1, 1, -100.00, 'abc', 'Ali', '1221', 'pending', NULL, NULL, NULL, NULL, '2025-09-13 11:26:06', '2025-09-13 11:26:06'),
(2, 1, 10.00, 'asdsa', 'asd', '12312', 'pending', NULL, NULL, NULL, NULL, '2025-09-13 11:34:45', '2025-09-13 11:34:45'),
(3, 1, -100.00, 'abc', 'Ali', '1221', 'pending', NULL, NULL, NULL, NULL, '2025-09-13 11:35:58', '2025-09-13 11:35:58'),
(4, 1, 60.00, 'asd', 'asd', 'sad', 'pending', NULL, NULL, NULL, NULL, '2025-09-13 15:02:23', '2025-09-13 15:02:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brands_category_id_foreign` (`category_id`);

--
-- Indexes for table `bundles`
--
ALTER TABLE `bundles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bundle_items`
--
ALTER TABLE `bundle_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bundle_items_product_id_foreign` (`product_id`),
  ADD KEY `bundle_items_bundle_id_foreign` (`bundle_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_user_id_foreign` (`user_id`),
  ADD KEY `cart_items_itemable_type_itemable_id_index` (`itemable_type`,`itemable_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_data`
--
ALTER TABLE `credit_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_services`
--
ALTER TABLE `custom_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_services_bundle_id_foreign` (`bundle_id`);

--
-- Indexes for table `debt_statuses`
--
ALTER TABLE `debt_statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_addresses_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `interest_percentages`
--
ALTER TABLE `interest_percentages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `kycs`
--
ALTER TABLE `kycs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kycs_user_id_foreign` (`user_id`),
  ADD KEY `kycs_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `link_accounts`
--
ALTER TABLE `link_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `link_accounts_user_id_foreign` (`user_id`);

--
-- Indexes for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_applications_mono_loan_calculation_foreign` (`mono_loan_calculation`),
  ADD KEY `loan_applications_user_id_foreign` (`user_id`);

--
-- Indexes for table `loan_calculations`
--
ALTER TABLE `loan_calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_calculations_user_id_foreign` (`user_id`);

--
-- Indexes for table `loan_distributes`
--
ALTER TABLE `loan_distributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_distributes_loan_application_id_foreign` (`loan_application_id`);

--
-- Indexes for table `loan_histories`
--
ALTER TABLE `loan_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_histories_user_id_foreign` (`user_id`),
  ADD KEY `loan_histories_loan_application_id_foreign` (`loan_application_id`);

--
-- Indexes for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_installments_user_id_foreign` (`user_id`),
  ADD KEY `loan_installments_mono_calculation_id_foreign` (`mono_calculation_id`),
  ADD KEY `loan_installments_transaction_id_foreign` (`transaction_id`);

--
-- Indexes for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_repayments_user_id_foreign` (`user_id`),
  ADD KEY `loan_repayments_mono_calculation_id_foreign` (`mono_calculation_id`);

--
-- Indexes for table `loan_statuses`
--
ALTER TABLE `loan_statuses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_statuses_loan_application_id_foreign` (`loan_application_id`),
  ADD KEY `loan_statuses_partner_id_foreign` (`partner_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mono_loan_calculations`
--
ALTER TABLE `mono_loan_calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mono_loan_calculations_loan_calculation_id_foreign` (`loan_calculation_id`),
  ADD KEY `mono_loan_calculations_loan_application_id_foreign` (`loan_application_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_user_id_foreign` (`user_id`),
  ADD KEY `orders_delivery_address_id_foreign` (`delivery_address_id`),
  ADD KEY `orders_mono_calculation_id_foreign` (`mono_calculation_id`),
  ADD KEY `orders_product_id_foreign` (`product_id`),
  ADD KEY `orders_bundle_id_foreign` (`bundle_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_itemable_type_itemable_id_index` (`itemable_type`,`itemable_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `partners_email_unique` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `product_details`
--
ALTER TABLE `product_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_details_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_reveiews`
--
ALTER TABLE `product_reveiews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_reveiews_product_id_foreign` (`product_id`),
  ADD KEY `product_reveiews_user_id_foreign` (`user_id`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tickets_user_id_foreign` (`user_id`);

--
-- Indexes for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_messages_ticket_id_foreign` (`ticket_id`),
  ADD KEY `ticket_messages_user_id_foreign` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_user_id_foreign` (`user_id`),
  ADD KEY `transactions_tx_id_index` (`tx_id`),
  ADD KEY `transactions_reference_index` (`reference`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_activities_user_id_foreign` (`user_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallets_user_id_foreign` (`user_id`);

--
-- Indexes for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `withdraw_requests_user_id_foreign` (`user_id`),
  ADD KEY `withdraw_requests_transaction_id_foreign` (`transaction_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `bundles`
--
ALTER TABLE `bundles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `bundle_items`
--
ALTER TABLE `bundle_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `credit_data`
--
ALTER TABLE `credit_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_services`
--
ALTER TABLE `custom_services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `debt_statuses`
--
ALTER TABLE `debt_statuses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interest_percentages`
--
ALTER TABLE `interest_percentages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kycs`
--
ALTER TABLE `kycs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `link_accounts`
--
ALTER TABLE `link_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `loan_applications`
--
ALTER TABLE `loan_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `loan_calculations`
--
ALTER TABLE `loan_calculations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `loan_distributes`
--
ALTER TABLE `loan_distributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `loan_histories`
--
ALTER TABLE `loan_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_installments`
--
ALTER TABLE `loan_installments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_statuses`
--
ALTER TABLE `loan_statuses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `mono_loan_calculations`
--
ALTER TABLE `mono_loan_calculations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `product_details`
--
ALTER TABLE `product_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `product_reveiews`
--
ALTER TABLE `product_reveiews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `user_activities`
--
ALTER TABLE `user_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `brands`
--
ALTER TABLE `brands`
  ADD CONSTRAINT `brands_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bundle_items`
--
ALTER TABLE `bundle_items`
  ADD CONSTRAINT `bundle_items_bundle_id_foreign` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bundle_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_services`
--
ALTER TABLE `custom_services`
  ADD CONSTRAINT `custom_services_bundle_id_foreign` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD CONSTRAINT `delivery_addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kycs`
--
ALTER TABLE `kycs`
  ADD CONSTRAINT `kycs_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `kycs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `link_accounts`
--
ALTER TABLE `link_accounts`
  ADD CONSTRAINT `link_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD CONSTRAINT `loan_applications_mono_loan_calculation_foreign` FOREIGN KEY (`mono_loan_calculation`) REFERENCES `mono_loan_calculations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_calculations`
--
ALTER TABLE `loan_calculations`
  ADD CONSTRAINT `loan_calculations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_distributes`
--
ALTER TABLE `loan_distributes`
  ADD CONSTRAINT `loan_distributes_loan_application_id_foreign` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_histories`
--
ALTER TABLE `loan_histories`
  ADD CONSTRAINT `loan_histories_loan_application_id_foreign` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD CONSTRAINT `loan_installments_mono_calculation_id_foreign` FOREIGN KEY (`mono_calculation_id`) REFERENCES `mono_loan_calculations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_installments_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_installments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD CONSTRAINT `loan_repayments_mono_calculation_id_foreign` FOREIGN KEY (`mono_calculation_id`) REFERENCES `mono_loan_calculations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_repayments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_statuses`
--
ALTER TABLE `loan_statuses`
  ADD CONSTRAINT `loan_statuses_loan_application_id_foreign` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_statuses_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mono_loan_calculations`
--
ALTER TABLE `mono_loan_calculations`
  ADD CONSTRAINT `mono_loan_calculations_loan_application_id_foreign` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mono_loan_calculations_loan_calculation_id_foreign` FOREIGN KEY (`loan_calculation_id`) REFERENCES `loan_calculations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_bundle_id_foreign` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_delivery_address_id_foreign` FOREIGN KEY (`delivery_address_id`) REFERENCES `delivery_addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_mono_calculation_id_foreign` FOREIGN KEY (`mono_calculation_id`) REFERENCES `mono_loan_calculations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_details`
--
ALTER TABLE `product_details`
  ADD CONSTRAINT `product_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reveiews`
--
ALTER TABLE `product_reveiews`
  ADD CONSTRAINT `product_reveiews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reveiews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD CONSTRAINT `ticket_messages_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD CONSTRAINT `user_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  ADD CONSTRAINT `withdraw_requests_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdraw_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
