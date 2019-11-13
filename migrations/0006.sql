begin;

ALTER TABLE applications
ADD service_metric_configs longtext not null after scheduling_rule;

commit;