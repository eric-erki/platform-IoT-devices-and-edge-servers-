begin;

create table if not exists metric_target_configs (
  id varchar(32) not null,
  created_at timestamp not null default current_timestamp,
  project_id varchar(32) not null,

  type varchar(100) not null,
  configs longtext not null,

  primary key (id),
  unique(type, project_id),
  foreign key metric_target_configs_project_id(project_id)
  references projects(id)
  on delete cascade
);

-- for each project, insert into metric_target_configs

commit;