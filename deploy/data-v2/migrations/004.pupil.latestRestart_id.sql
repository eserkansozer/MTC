alter table mtc_admin.pupil
	add latestRestart_id int
go

alter table mtc_admin.pupil
	add constraint pupil_pupilRestart_id_fk
		foreign key (latestRestart_id) references mtc_admin.pupilRestart
go
