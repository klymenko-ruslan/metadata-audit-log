CREATE TABLE `interchange_audit_log_transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(128) NOT NULL,
  `part_id` int NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `interchange_audit_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` DATETIME default current_timestamp,
  `transaction_id` varchar(128) NOT NULL,
  `old_header` int,
  `new_header` int,
  PRIMARY KEY (`id`)
);