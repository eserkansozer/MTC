alter table mtc_admin.pupil
	add latestCheck_id int
go

alter table mtc_admin.pupil
	add constraint pupil_check_id_fk
		foreign key (latestCheck_id) references mtc_admin.[check]
go
