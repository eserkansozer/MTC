create schema mtc_admin
go

create type SceTableType as table
(
	school_id int,
	timezone nvarchar(200),
	countryCode char(2),
	isOpen bit
)
go

create type checkTableType as table
(
	pupil_id int,
	checkForm_id int,
	checkWindow_id int,
	isLiveCheck bit,
	pinExpiresAt datetimeoffset(3),
	school_id int
)
go

create table accessArrangements
(
	id int identity
		constraint PK_accessArrangements
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	displayOrder smallint not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint accessArrangements_code_uindex
			unique
)
go

create table attendanceCode
(
	id int identity
		constraint PK_attendanceCode
			primary key,
	createdAt datetimeoffset(3) constraint DF_attendanceCode_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_attendanceCode_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	reason nvarchar(50) not null,
	[order] tinyint not null,
	code char(5) not null
)
go

create unique index attendanceCode_code_uindex
	on attendanceCode (code)
go

create table auditLog
(
	id bigint identity
		primary key,
	rowData nvarchar(max) not null,
	tableName nvarchar(255) not null,
	operation nvarchar(20) not null,
	createdAt datetimeoffset default getutcdate() not null
)
go

create index auditLog_tableName_index
	on auditLog (tableName)
go

create table azureBlobFileType
(
	id int identity
		constraint PK_azureBlobFileType
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	code varchar(10) not null
		constraint IX_azureBlobFileType_uindex
			unique,
	description nvarchar(100) not null
)
go

create table azureBlobFile
(
	id int identity
		constraint PK_azureBlobFile
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	container varchar(1000) not null,
	fileName varchar(1000) not null,
	eTag varchar(100) not null,
	md5 binary(16) not null,
	azureBlobFileType_id int not null
		constraint FK_azureBlobFile_azureBlobFileType_id_azureBlobFileType_id
			references azureBlobFileType,
	urlSlug uniqueidentifier default newid() not null
		constraint IX_urlSlug_uindex
			unique
)
go

create table checkForm
(
	id int identity
		constraint PK_checkForm
			primary key,
	createdAt datetimeoffset(3) constraint DF_checkForm_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_checkForm_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	name nvarchar(60) not null,
	isDeleted bit constraint DF_checkForm_isDeleted_default default 0 not null,
	formData nvarchar(max) not null,
	isLiveCheckForm bit constraint isLiveCheckFormDefault default 1 not null,
	urlSlug uniqueidentifier constraint urlSlugDefault default newid() not null
)
go

create unique index checkForm_name_uindex
	on checkForm (name)
go

create table checkStatus
(
	id int identity
		constraint PK_checkStatus
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint checkStatus_code_uindex
			unique
)
go

create table checkWindow
(
	id int identity
		constraint PK_checkWindow
			primary key,
	createdAt datetimeoffset(3) constraint DF_checkWindow_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_checkWindow_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	name nvarchar(max) not null,
	adminStartDate datetimeoffset(3) not null,
	checkStartDate datetimeoffset(3) not null,
	checkEndDate datetimeoffset(3) not null,
	isDeleted bit default 0 not null,
	urlSlug uniqueidentifier default newid() not null,
	adminEndDate datetimeoffset not null,
	familiarisationCheckStartDate datetimeoffset not null,
	familiarisationCheckEndDate datetimeoffset not null,
	score decimal(8,2),
	complete bit constraint completeDefault default 0 not null
)
go

create table checkFormWindow
(
	id int identity
		primary key,
	checkForm_id int
		constraint checkFormWindow_checkForm_id_fk
			references checkForm,
	checkWindow_id int
		constraint checkFormWindow_checkWindow_id_fk
			references checkWindow,
	createdAt datetimeoffset default getutcdate()
)
go

create unique index checkFormWindow_checkForm_id_checkWindow_id_uindex
	on checkFormWindow (checkForm_id, checkWindow_id)
go

create unique index checkWindow_urlSlug_uindex
	on checkWindow (urlSlug)
go

create table integrationTest
(
	id int identity
		primary key,
	tDecimal decimal(5,2),
	tNumeric numeric(5,3),
	tFloat real,
	tNvarchar nvarchar(10),
	tNvarCharMax nvarchar(max),
	tDateTimeOffset datetimeoffset(3)
)
go

create table jobStatus
(
	id int identity
		constraint PK_jobStatus
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	jobStatusCode char(3) not null
		constraint jobStatus_code_uindex
			unique
)
go

create table jobType
(
	id int identity
		constraint PK_jobType
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	jobTypeCode char(3) not null
		constraint jobType_code_uindex
			unique
)
go

create table job
(
	id int identity
		constraint PK_job_id
			primary key,
	urlSlug uniqueidentifier default newid() not null,
	jobInput nvarchar(max) not null,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	jobStatus_id int not null
		constraint FK_job_jobStatus_id
			references jobStatus,
	jobType_id int not null
		constraint FK_job_jobType_id
			references jobType,
	jobOutput nvarchar(max),
	errorOutput nvarchar(max)
)
go

create table pin
(
	id int identity
		constraint PK_pin
			primary key,
	createdAt datetimeoffset(3) constraint DF_pin_created_at default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_pin_updated_at default getutcdate() not null,
	version timestamp not null,
	val int
		constraint IX_pin_val_unique
			unique
)
go

create table pupilColourContrasts
(
	id int identity
		constraint PK_colourContrasts
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	displayOrder smallint not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint colourContrasts_code_uindex
			unique
)
go

create table pupilFontSizes
(
	id int identity
		constraint PK_fontSizes
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	displayOrder smallint not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint fontSizes_code_uindex
			unique
)
go

create table pupilRestartCode
(
	id int identity
		constraint PK_pupilRestartCode
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint pupilRestartCode_code_uindex
			unique
)
go

create table pupilRestartReason
(
	id int identity
		constraint PK_pupilRestartReason
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	displayOrder smallint not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint pupilRestartReason_code_uindex
			unique
)
go

create table pupilStatus
(
	id int identity
		constraint PK_pupilStatus
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(150) not null,
	code nvarchar(12) not null
		constraint pupilStatus_code_uindex
			unique
)
go

create table pupilStatusCode
(
	id int identity
		constraint PK_pupilStatusCode
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint pupilStatusCode_code_uindex
			unique
)
go

create table questionReaderReasons
(
	id int identity
		constraint PK_questionReaderReasons
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	displayOrder smallint not null,
	description nvarchar(50) not null,
	code char(3) not null
		constraint questionReaderReasons_code_uindex
			unique
)
go

create table role
(
	id int identity
		constraint PK_role
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	title nvarchar(max) not null
)
go

create table school
(
	id int identity
		constraint PK_school
			primary key,
	createdAt datetimeoffset(3) constraint DF_school_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_school_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	leaCode int,
	estabCode nvarchar(max),
	name nvarchar(max) not null,
	pin char(8),
	pinExpiresAt datetimeoffset(3),
	urlSlug uniqueidentifier default newid() not null,
	urn int not null,
	dfeNumber int not null
)
go

create table [group]
(
	id int identity
		primary key,
	name nvarchar(50) not null,
	isDeleted bit default 0 not null,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	school_id int not null
		constraint group_school_id_fk
			references school
)
go

create table pupil
(
	id int identity
		constraint PK_pupil
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	school_id int not null
		constraint FK_pupil_school_id
			references school,
	foreName nvarchar(max) not null,
	middleNames nvarchar(max),
	lastName nvarchar(max) not null,
	gender char not null,
	dateOfBirth datetimeoffset(3) not null,
	pinExpiresAt datetimeoffset(3),
	upn char(13) not null,
	pin nvarchar(12),
	speechSynthesis bit default 0 not null,
	isTestAccount bit default 0 not null,
	urlSlug uniqueidentifier default newid() not null,
	job_id int
		constraint FK_pupil_job_id
			references job,
	jwtToken nvarchar(max),
	jwtSecret nvarchar(max),
	pupilStatus_id int constraint DF_pupil_pupilStatus_id default 1 not null
		constraint FK_pupil_pupilStatus_id_pupilStatus_id
			references pupilStatus,
	pupilAgeReason_id int
)
go

create table [check]
(
	id int identity
		constraint PK_check
			primary key,
	createdAt datetimeoffset(3) constraint DF_check_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_check_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	pupil_id int not null
		constraint FK_check_pupil_id
			references pupil,
	checkCode uniqueidentifier constraint DF_check_checkCode_default default newid() not null,
	checkWindow_id int not null
		constraint FK_check_checkWindow_id
			references checkWindow,
	checkForm_id int not null
		constraint FK_check_checkForm_id
			references checkForm,
	pupilLoginDate datetimeoffset(3),
	mark tinyint,
	maxMark tinyint,
	markedAt datetimeoffset(3),
	startedAt datetimeoffset,
	data nvarchar(max),
	receivedByServerAt datetimeoffset,
	checkStatus_id int constraint DF_check_checkStatus_id_default default 1 not null
		constraint FK_check_checkStatus_id_checkStatus_id
			references checkStatus,
	isLiveCheck bit not null
)
go

create table anomalyReportCache
(
	id int identity
		constraint PK_anomalyReportCache
			primary key,
	check_id int not null
		references [check],
	jsonData nvarchar(max) not null,
	version timestamp not null,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null
)
go

create table answer
(
	id int identity
		constraint PK_answers
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	check_id int not null
		constraint FK_answers_check_id_check_id
			references [check],
	questionNumber smallint not null,
	factor1 smallint not null,
	factor2 smallint not null,
	answer nvarchar(60) default '' not null,
	isCorrect bit not null
)
go

create unique index answer_check_id_questionNumber_uindex
	on answer (check_id, questionNumber)
go

create index check_receivedByServerAt_index
	on [check] (receivedByServerAt)
go

create unique index check_checkCode_index
	on [check] (checkCode)
go

create index check_liveFlag_pupilId_index
	on [check] (isLiveCheck, pupil_id) include (checkCode, checkStatus_id)
go

create table checkPin
(
	school_id int not null
		constraint FK_checkPin_school_id_school_id
			references school,
	pin_id int not null
		constraint FK_checkPin_pin_id_pin_id
			references pin,
	check_id int not null
		constraint IX_checkPin_check_id_unique
			unique
		constraint FK_checkPin_check_id_check_id
			references [check],
	pinExpiresAt datetimeoffset(3) not null,
	constraint PK_checkPin
		primary key (school_id, pin_id)
)
go

create table checkResult
(
	id bigint identity
		constraint PK__checkResult
			primary key,
	createdAt datetimeoffset constraint DF_checkResult_createdAt default getutcdate() not null,
	updatedAt datetimeoffset constraint DF_checkResult_updatedAt default getutcdate() not null,
	payload nvarchar(max) not null,
	check_id int not null
		constraint FK_checkResult_check_id_check_id
			references [check]
)
go

create table psychometricianReportCache
(
	id int identity
		constraint PK_psychometricianReportCache
			primary key,
	check_id int not null
		references [check],
	jsonData nvarchar(max) not null,
	version timestamp not null,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null
)
go

create unique index psychometricianReportCache_check_id_uindex
	on psychometricianReportCache (check_id)
go

create unique index pupil_upn_school_id_uindex
	on pupil (upn, school_id)
go

create unique index pupil_school_id_pin_uindex
	on pupil (school_id, pin)
	where [pin] IS NOT NULL
go

create index pupil_job_id_index
	on pupil (job_id)
go

create unique index pupil_urlSlug_index
	on pupil (urlSlug)
go

create index idx_azure_recommended_pupil_school
	on pupil (school_id) include (createdAt, dateOfBirth, foreName, gender, isTestAccount, job_id, jwtSecret, jwtToken, lastName, middleNames, pin, pinExpiresAt, pupilAgeReason_id, pupilStatus_id, speechSynthesis, updatedAt, upn, urlSlug, version)
go


    CREATE TRIGGER [mtc_admin].[accessArrangementsUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[accessArrangements]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [accessArrangements].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[adminLogonEventUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[adminLogonEvent]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [adminLogonEvent].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[anomalyReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[anomalyReportCache]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [anomalyReportCache].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[answerUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[answer]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [answer].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[attendanceCodeUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[attendanceCode]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [attendanceCode].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[azureBlobFileTypeUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[azureBlobFileType]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [azureBlobFileType].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[azureBlobFileUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[azureBlobFile]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [azureBlobFile].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[checkFormUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkForm]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkForm].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[checkResultUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkResult]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkResult].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[checkStatusUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkStatus]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkStatus].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[checkUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[check]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [check].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[checkWindowUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkWindow]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkWindow].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[groupUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[group]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [group].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[hdfUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[hdf]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [hdf].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[jobStatusUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[jobStatus]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [jobStatus].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[jobTypeUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[jobType]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [jobType].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[jobUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[job]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [job].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pinUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pin]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pin].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[psychometricianReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[psychometricianReportCache]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [psychometricianReportCache].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilAccessArrangementsUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilAccessArrangements]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilAccessArrangements].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilAttendanceUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilAttendance]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilAttendance].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilColourContrastsUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilColourContrasts]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilColourContrasts].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilFeedbackUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilFeedback]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilFeedback].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilFontSizesUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilFontSizes]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilFontSizes].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilGroupUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilGroup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilGroup].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilLogonEventUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilLogonEvent]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilLogonEvent].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilRestartCodeUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestartCode]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestartCode].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilRestartReasonUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestartReason]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestartReason].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilRestartUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestart]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestart].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilStatusCodeUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilStatusCode]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilStatusCode].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilStatusUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilStatus]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilStatus].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[pupilUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupil]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupil].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[questionReaderReasonsUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[questionReaderReasons]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [questionReaderReasons].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[roleUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[role]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [role].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[sceUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[sce]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [sce].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[schoolScoreUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[schoolScore]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [schoolScore].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[schoolUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[school]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [school].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[settingsLogUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[settingsLog]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [settingsLog].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[settingsUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[settings]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [settings].id = inserted.id
    END


go


    CREATE TRIGGER [mtc_admin].[userUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[user]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [user].id = inserted.id
    END


go

create table pupilAgeReason
(
	id int identity
		constraint PK_pupilAgeReason
			primary key,
	pupil_id int not null
		constraint pupilAgeReason_pupil_id_uindex
			unique
		constraint FK_pupilAgeReason_pupil_id
			references pupil,
	reason nvarchar(max) not null
)
go

alter table pupil
	add constraint FK_pupil_pupilAgeReason_id
		foreign key (pupilAgeReason_id) references pupilAgeReason
go

create table pupilGroup
(
	id int identity
		primary key,
	group_id int not null
		references [group],
	pupil_id int not null
		references pupil,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null
)
go

create table pupilLogonEvent
(
	id int identity
		primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	pupil_id int
		constraint FK_pupilLogonEvent_pupil_id
			references pupil,
	isAuthenticated bit not null,
	pupilPin nvarchar(50) not null,
	schoolPin nvarchar(50) not null,
	httpStatusCode smallint,
	httpErrorMessage nvarchar(max)
)
go

create table sce
(
	id int identity
		constraint PK_sce
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	school_id int not null
		constraint FK_sce_school_id
			references school,
	timezone nvarchar(200) not null,
	isOpen bit not null,
	countryCode char(2) not null
)
go

create unique index school_urlSlug_uindex
	on school (urlSlug)
go

create unique index school_pin_uindex
	on school (pin)
	where [pin] IS NOT NULL
go

create unique index school_dfeNumber_uindex
	on school (dfeNumber)
go

create unique index school_urn_uindex
	on school (urn)
go

create table schoolScore
(
	id int identity
		constraint PK_schoolScore
			primary key,
	school_id int not null
		constraint FK_schoolScore_school_id_school_id
			references school,
	checkWindow_id int not null
		constraint FK_schoolScore_checkWindow_id_checkWindow_id
			references checkWindow,
	score decimal(8,2),
	createdAt datetimeoffset(3) constraint DF_school_score_created_at default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_school_score_updated_at default getutcdate() not null,
	version timestamp not null
)
go

create table sessions
(
	sid varchar(255) not null
		constraint pk_sessions
			primary key,
	expires datetimeoffset not null,
	sess nvarchar(max)
)
go

create table settings
(
	id tinyint not null
		primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	loadingTimeLimit decimal(5,2) not null,
	questionTimeLimit decimal(5,2) not null,
	checkTimeLimit tinyint not null
)
go

create table [user]
(
	id int identity
		constraint PK_user
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	identifier nvarchar(64) not null
		constraint user_identifier_uindex
			unique,
	passwordHash nvarchar(max),
	school_id int
		constraint FK_user_school_id
			references school,
	role_id int not null
		constraint FK_user_role_id
			references role,
	displayName nvarchar(255)
)
go

create table adminLogonEvent
(
	id int identity
		constraint PK_adminLogonEvent
			primary key,
	createdAt datetimeoffset(3) constraint DF_adminLogonEvent_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_adminLogonEvent_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	user_id int
		constraint FK_adminLogonEvent_user_id
			references [user],
	sessionId nvarchar(max) not null,
	remoteIp nvarchar(max) not null,
	userAgent nvarchar(max) not null,
	loginMethod nvarchar(max) not null,
	isAuthenticated bit not null,
	body nvarchar(max),
	errorMsg nvarchar(max),
	authProviderSessionToken nvarchar(max)
)
go

create index adminLogonEvent_user_id_index
	on adminLogonEvent (user_id)
go

CREATE TRIGGER adminLogonEvent_user_id_check
ON [mtc_admin].[adminLogonEvent]
FOR INSERT, UPDATE
AS
IF UPDATE(isAuthenticated)
BEGIN
      IF EXISTS (SELECT user_id FROM inserted i WHERE i.user_id IS NULL AND i.isAuthenticated = 1)
      BEGIN
            THROW 50000, 'user_id is required when authenticated', 1;
      END
END
go

create table hdf
(
	id int identity
		constraint PK_hdf
			primary key,
	createdAt datetimeoffset(3) constraint DF_hdf_createdAt_default default getutcdate() not null,
	updatedAt datetimeoffset(3) constraint DF_hdf_updatedAt_default default getutcdate() not null,
	version timestamp not null,
	signedDate datetimeoffset(3) constraint DF_hdf_signedDate_default default getutcdate() not null,
	jobTitle nvarchar(max) not null,
	fullName nvarchar(max) not null,
	school_id int not null
		constraint FK_hdf_school_id
			references school,
	user_id int not null
		constraint FK_hdf_user_id
			references [user],
	checkWindow_id int not null
		constraint FK_hdf_checkWindow_id
			references checkWindow,
	confirmed bit not null,
	headTeacher bit not null
)
go

create table pupilAccessArrangements
(
	id int identity
		constraint PK_pupilAccessArrangements
			primary key,
	pupil_id int not null
		constraint FK_pupilAccessArrangements_pupil_id
			references pupil,
	questionReaderReasons_id int
		constraint FK_pupilAccessArrangements_questionReaderReasons_id
			references questionReaderReasons,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	recordedBy_user_id int not null
		constraint FK_pupilAccessArrangements_recordedBy_user_id
			references [user],
	inputAssistanceInformation nvarchar(1000),
	questionReaderOtherInformation nvarchar(1000),
	accessArrangements_id int not null
		constraint FK_pupilAccessArrangements_accessArrangements_id
			references accessArrangements,
	pupilFontSizes_id int
		constraint FK_pupilAccessArrangements_pupilFontSizes_id_pupilFontSizes_id
			references pupilFontSizes,
	pupilColourContrasts_Id int
		constraint FK_pupilAccessArrangements_pupilColourContrasts_id_pupilColourContrasts_id
			references pupilColourContrasts,
	nextButtonInformation nvarchar(1000)
)
go

create table pupilAttendance
(
	id int identity
		constraint PK_pupilAttendance
			primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	recordedBy_user_id int not null
		constraint FK_pupilAttendance_user_id
			references [user],
	attendanceCode_id int not null
		constraint FK_pupilAttendance_attendanceCode_id
			references attendanceCode,
	pupil_id int not null
		constraint FK_pupilAttendance_pupil_id
			references pupil,
	isDeleted bit default 0 not null
)
go

create table pupilRestart
(
	id int identity
		constraint PK_pupilRestart
			primary key,
	pupil_id int not null
		constraint FK_pupilRestart_pupil_id
			references pupil,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	recordedByUser_id int not null
		constraint FK_pupilRestart_recordedByUser_id
			references [user],
	didNotCompleteInformation nvarchar(100),
	furtherInformation nvarchar(1000),
	isDeleted bit default 0 not null,
	deletedByUser_id int
		constraint FK_pupilRestart_deletedByUser_id
			references [user],
	pupilRestartReason_id int not null
		constraint FK_pupilRestart_pupilRestartReason_id
			references pupilRestartReason,
	classDisruptionInformation nvarchar(100),
	check_id int
		constraint FK_pupilRestart_check_id_check_id
			references [check]
)
go

create table settingsLog
(
	id int identity
		primary key,
	createdAt datetimeoffset(3) default getutcdate() not null,
	updatedAt datetimeoffset(3) default getutcdate() not null,
	version timestamp not null,
	loadingTimeLimit decimal(5,2) not null,
	questionTimeLimit decimal(5,2) not null,
	user_id int
		constraint FK_settingsLog_user_id
			references [user],
	checkTimeLimit tinyint
)
go

CREATE TRIGGER user_school_id_null_check
ON [mtc_admin].[user]
FOR INSERT, UPDATE
AS
IF UPDATE(school_id)
BEGIN
      IF EXISTS (SELECT * FROM inserted i WHERE i.school_id IS NULL AND i.role_id = 3)
      BEGIN
            THROW 50000, 'Users in Teacher role must be assigned to a school', 1;
      END
END
go

CREATE VIEW [mtc_admin].[vewCheckDiagnostic] AS
select c.id           as check_id,
       c.createdAt,
       c.pupil_id,
       p.foreName,
       p.lastName,
       ps.code        as pupil_code,
       ps.description as pupil_descr,
       s.id           as school_id,
       s.dfeNumber,
       s.name         as school_name,
       s.pin          as school_pin,
       c.pupilLoginDate,
       c.startedAt,
       c.receivedByServerAt,
       c.isLiveCheck,
       c.mark,
       c.maxMark,
       c.markedAt,
       cs.code        as check_status,
       cs.description as check_desc,
       pin.val        as pupil_pin,
       cp.pinExpiresAt
from [mtc_admin].[check] c
join [mtc_admin].[checkStatus] cs on (c.checkStatus_id = cs.id)
join [mtc_admin].[pupil] p on (c.pupil_id = p.id)
join [mtc_admin].[pupilStatus] ps on (p.pupilStatus_id = ps.id)
join [mtc_admin].[checkPin] cp on (c.id = cp.check_id)
join [mtc_admin].[pin] pin on (cp.pin_id = pin.id)
join [mtc_admin].[school] s on (p.school_id = s.id);
go

CREATE VIEW [mtc_admin].vewCheckWindowWithStatus
AS SELECT cw.urlSlug, cw.name, cw.isDeleted, CAST(
    CASE
        WHEN GETUTCDATE() < cw.adminStartDate THEN 'Inactive'
        WHEN GETUTCDATE() >= cw.adminStartDate AND GETUTCDATE() <= cw.adminEndDate THEN 'Active'
        ELSE 'Past'
    END AS NVARCHAR(50)
   ) AS [status]
FROM [mtc_admin].checkWindow cw
go

CREATE VIEW [mtc_admin].[vewCheckWindowsWithFormCount] AS
SELECT cw.id, cw.name,
cw.adminStartDate, cw.checkStartDate, cw.checkEndDate,
cw.isDeleted, COUNT(mtc_admin.checkFormWindow.checkWindow_id) AS FormCount
FROM mtc_admin.checkWindow cw LEFT OUTER JOIN
 mtc_admin.checkFormWindow ON cw.id = mtc_admin.checkFormWindow.checkWindow_id
GROUP BY cw.id, cw.name, cw.adminStartDate,
cw.checkStartDate, cw.checkEndDate, cw.isDeleted
go

CREATE VIEW [mtc_admin].[vewCheckWindowsWithStatusAndFormCountByType] AS
  SELECT
    cw.urlSlug,
    cw.name,
    cw.createdAt,
    cw.isDeleted,
    cw.checkStartDate,
    cw.checkEndDate,
    cw.familiarisationCheckStartDate,
    cw.familiarisationCheckEndDate,
    CAST(
      CASE
          WHEN GETUTCDATE() < cw.adminStartDate THEN 'Inactive'
          WHEN GETUTCDATE() >= cw.adminStartDate AND GETUTCDATE() <= cw.adminEndDate THEN 'Active'
          ELSE 'Past'
      END AS NVARCHAR(50)
     ) AS [status],
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 0 THEN 1 ELSE 0 END
    ) AS FamiliarisationCheckFormCount,
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 1 THEN 1 ELSE 0 END
    ) AS LiveCheckFormCount
  FROM [mtc_admin].checkWindow cw
  LEFT JOIN [mtc_admin].checkFormWindow cfw
    ON cw.id = cfw.checkWindow_id
  LEFT JOIN [mtc_admin].checkForm cf
    ON cf.id = cfw.checkForm_id
  GROUP BY
    cw.urlSlug,
    cw.name,
    cw.createdAt,
    cw.isDeleted,
    cw.checkStartDate,
    cw.checkEndDate,
    cw.adminStartDate,
    cw.adminEndDate,
    cw.familiarisationCheckStartDate,
    cw.familiarisationCheckEndDate
go

CREATE VIEW [mtc_admin].vewCompletedCheckCount
AS
   SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
      FROM mtc_admin.[check] c
      WHERE c.data IS NOT NULL
   GROUP BY c.pupil_id
go

CREATE VIEW [mtc_admin].vewIncompleteCheckCount
AS
   SELECT c.pupil_id, COUNT(c.id) AS [IncompleteCheckCount]
      FROM mtc_admin.[check] c
      WHERE c.pupilLoginDate IS NOT NULL AND c.data IS NULL
   GROUP BY c.pupil_id
go

CREATE VIEW [mtc_admin].vewNotStartedCheckCount
AS
   SELECT c.pupil_id, COUNT(c.id) AS [NotStartedCheckCount]
      FROM mtc_admin.[check] c
      WHERE c.pupilLoginDate IS NULL AND c.data IS NULL
   GROUP BY c.pupil_id
go

CREATE VIEW [mtc_admin].vewPupilActivity AS
SELECT p.urlSlug, p.foreName, p.lastName, s.id AS [school_id],
  COUNT(r.id) AS [restartCount],
  ISNULL(chkComp.CompletedCheckCount, 0) AS [CompletedCheckCount],
  ISNULL(chkInComp.IncompleteCheckCount, 0) AS [IncompleteCheckCount],
  ISNULL(chkNoStart.NotStartedCheckCount, 0) AS [NotStartedCheckCount]
FROM mtc_admin.pupil p
  INNER JOIN mtc_admin.school s ON p.school_id = s.id
  LEFT OUTER JOIN mtc_admin.pupilRestart r ON p.id = r.pupil_id
  LEFT OUTER JOIN mtc_admin.vewCompletedCheckCount chkComp ON p.id = chkComp.pupil_id
  LEFT OUTER JOIN mtc_admin.vewIncompleteCheckCount chkInComp ON p.id = chkInComp.pupil_id
  LEFT OUTER JOIN mtc_admin.vewNotStartedCheckCount chkNoStart ON p.id = chkNoStart.pupil_id
GROUP BY p.urlSlug, p.foreName, p.lastName, s.id,
  chkComp.CompletedCheckCount, chkInComp.IncompleteCheckCount, chkNoStart.NotStartedCheckCount
go

CREATE VIEW [mtc_admin].[vewPupilLiveChecksTakenCount] AS

  SELECT
    p.id as pupil_id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    count(*) as totalCheckCount
  FROM
    [mtc_admin].[pupil] p
      LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
      INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
      INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
  WHERE
    -- don’t select pupils who are not attending
    pa.id IS NULL
    -- pupils must have already attempted 1 or more checks that are not expired
    AND       chkStatus.code IN ('STD', 'CMP', 'NTR')
    AND       chk.isLiveCheck = 1
  GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id;
go

CREATE VIEW [mtc_admin].[vewPupilRegister] AS
  SELECT
         p.id as pupilId,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.urlSlug,
         p.dateOfBirth,
         p.school_id,
         g.id as groupId,
         ISNULL(g.name, '-') as groupName,
         ps.code as pupilStatusCode,
         lastCheck.id as lastCheckId,
         cs.code as lastCheckStatusCode,
         lastPupilRestart.id as pupilRestartId,
         lastPupilRestart.check_id as pupilRestartCheckId

  FROM
       [mtc_admin].[pupil] p LEFT JOIN
       [mtc_admin].[pupilGroup] pg ON (p.id = pg.pupil_id) LEFT JOIN
       [mtc_admin].[group] g ON (pg.group_id = g.id) JOIN
       [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id) LEFT JOIN
       (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[check]
         WHERE isLiveCheck = 1
       ) lastCheck ON (lastCheck.pupil_id = p.id) LEFT JOIN
       [mtc_admin].[checkStatus] cs ON (lastCheck.checkStatus_id = cs.id) LEFT JOIN
       (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[pupilRestart]
         WHERE isDeleted = 0
       ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
  WHERE
        (lastCheck.rank = 1 or lastCheck.rank IS NULL)
  AND   (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL);

go

-- helper view for DBAs / developers

CREATE VIEW [mtc_admin].[vewPupilStatus] AS (
      SELECT
              p.id as pupil_id,
              p.foreName,
              p.lastName,
              p.middleNames,
              p.dateOfBirth,
              p.gender,
              ps.code
      FROM    [mtc_admin].[pupil] p
              LEFT JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
);
go

--
-- Find pupils eligible to generate a Familiarisation PIN
--

CREATE VIEW [mtc_admin].[vewPupilsEligibleForFamiliarisationPinGeneration] AS (
  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.school_id,
    g.group_id,
    p.urlSlug
  FROM
    [mtc_admin].[pupil] p
      LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
      LEFT JOIN [mtc_admin].[attendanceCode] ac ON (pa.attendanceCode_id = ac.id )
      LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
      INNER JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
  WHERE
    -- include all pupils except those who are marked as not taking check because they left school
    (ac.id IS NULL OR ac.code <> 'LEFTT')
    AND    ps.code IN ('UNALLOC',
                       'ALLOC',
                       'LOGGED_IN')


    EXCEPT

    -- Exclude pupils who already have an active familiarisation check
  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.school_id,
    g.group_id,
    p.urlSlug
  FROM
    [mtc_admin].[pupil] p
      LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
      LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
      LEFT JOIN [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
  WHERE  chk.isLiveCheck = 0
    AND    chkStatus.code IN ('NEW', 'STD', 'COL')
);
go

CREATE VIEW [mtc_admin].vewPupilsEligibleForLivePinGeneration AS
  SELECT
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         g.group_id,
         IIF(lastPupilRestart.id IS NOT NULL, CAST (1 as bit), CAST (0 as bit)) as isRestart,
         lastPupilRestart.id as pupilRestart_id
  FROM
       [mtc_admin].[pupil] p JOIN
       [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id) LEFT JOIN
       [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id) LEFT JOIN
       (
         SELECT *,
           ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[pupilRestart]
         WHERE isDeleted = 0
       ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
  WHERE
      ps.code = 'UNALLOC'
  AND (lastPupilRestart.rank = 1 OR lastPupilRestart.rank IS NULL)

;



go

CREATE VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pg.group_id,
    count(*) as totalCheckCount
  FROM
    [mtc_admin].[pupil] p
      LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
      INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
      INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
      LEFT JOIN [mtc_admin].[pupilGroup] pg ON p.id = pg.pupil_id
  WHERE
    -- don’t select pupils who are not attending
    pa.id IS NULL
    -- pupils must have already attempted 1 or more checks that are started, complete, not received
    AND   chkStatus.code IN ('STD', 'CMP', 'NTR')
    AND   chk.isLiveCheck = 1
    AND   p.id NOT IN (
      -- remove pupils with unconsumed restarts
      SELECT
        p2.id
      FROM
        [mtc_admin].[pupil] p2
          LEFT JOIN [mtc_admin].[pupilRestart] pr2 ON (p2.id = pr2.pupil_id and pr2.isDeleted = 0)
      WHERE
        (pr2.id IS NOT NULL AND pr2.check_id IS NULL)
    )
  GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pg.group_id
;
go


CREATE VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins] AS
  SELECT
         p.id,
         p.foreName,
         p.lastName,
         p.middleNames,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         pin.val as pin,
         cp.pinExpiresAt,
         g.group_id
  FROM [mtc_admin].[pupil] p
         INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
         INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
         INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
         INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
         INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
         LEFT JOIN [mtc_admin].[pupilAttendance] paa ON paa.pupil_id = p.id
  WHERE  cp.pinExpiresAt > GETUTCDATE()
    AND  chkStatus.code IN ('NEW', 'STD', 'COL')
    AND  chk.isLiveCheck = 0
    AND (paa.id IS NULL OR paa.isDeleted = 1);
go


CREATE VIEW [mtc_admin].[vewPupilsWithActiveLivePins] AS
  SELECT
         p.id,
         p.foreName,
         p.lastName,
         p.middleNames,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         pin.val as pin,
         cp.pinExpiresAt,
         g.group_id
  FROM [mtc_admin].[pupil] p
         INNER JOIN [mtc_admin].[school] s ON p.school_id = s.id
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON g.pupil_id = p.id
         INNER JOIN [mtc_admin].[check] chk ON chk.pupil_id = p.id
         INNER JOIN [mtc_admin].[checkStatus] chkStatus ON chk.checkStatus_id = chkStatus.id
         INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
         INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
         LEFT JOIN [mtc_admin].[pupilAttendance] paa ON paa.pupil_id = p.id
  WHERE  cp.pinExpiresAt > GETUTCDATE()
    AND  chkStatus.code IN ('NEW', 'COL')
    AND  chk.isLiveCheck = 1
    AND (paa.id IS NULL OR paa.isDeleted = 1);
go

CREATE VIEW [mtc_admin].[vewPupilsWithActivePins] AS
    -- include live checks that are either new or collected
  SELECT
         p.id,
         p.foreName,
         p.lastName,
         p.middleNames,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         pin.val as pin,
         cp.pinExpiresAt,
         g.group_id,
         chk.checkCode
  FROM [mtc_admin].[pupil] p
         INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
         INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
         INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
         INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
         INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
  WHERE  cp.pinExpiresAt > GETUTCDATE()
    AND  (chkStatus.code = 'NEW' OR chkStatus.code = 'COL')
    AND  chk.isLiveCheck = 1

  UNION
    -- include familiarisation checks that are either new, collected or started
  SELECT
         p.id,
         p.foreName,
         p.lastName,
         p.middleNames,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         pin.val as pin,
         cp.pinExpiresAt,
         g.group_id,
         chk.checkCode
  FROM [mtc_admin].[pupil] p
         INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
         INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
         INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
         INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
         INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
  WHERE  cp.pinExpiresAt > GETUTCDATE()
    AND  (chkStatus.code = 'NEW' OR chkStatus.code = 'COL' OR chkStatus.code = 'STD')
    AND  chk.isLiveCheck = 0
;
go


CREATE PROCEDURE [mtc_admin].[spCreateChecks]
    @TVP [mtc_admin].[CheckTableType] READONLY
AS

  -- Connection pooling is enabled - make sure we are not in an existing transaction
  IF @@TRANCOUNT <> 0  -- Rollback old transactions before starting another
    ROLLBACK TRANSACTION

  BEGIN TRY
  BEGIN TRANSACTION

  DECLARE checkArgsList CURSOR
  FOR SELECT pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id
      FROM @TVP
    FOR READ ONLY

  DECLARE @pupilId int
  DECLARE @checkFormId int
  DECLARE @checkWindowId int
  DECLARE @isLiveCheck bit
  DECLARE @pinExpiresAt datetimeoffset
  DECLARE @schoolId int
  DEClARE @checkId int
  DECLARE @output TABLE (id int);

  OPEN checkArgsList
  FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId
  WHILE (@@FETCH_STATUS = 0) BEGIN

    -- Create the check
    INSERT INTO [mtc_admin].[check]
        (pupil_id, checkForm_id, checkWindow_id, isLiveCheck)
    VALUES (@pupilId, @checkFormId, @checkWindowId, @isLiveCheck);

    -- Get the check.id we just inserted
    SET @checkId = SCOPE_IDENTITY();

    -- Assign a pin to the check
    INSERT INTO [mtc_admin].[checkPin] (school_id, check_id, pinExpiresAt, pin_id)
    VALUES (@schoolId, @checkId, @pinExpiresAt, (SELECT TOP 1 p.id FROM mtc_admin.pin p
                    LEFT OUTER JOIN (SELECT cp.pin_id, cp.school_id FROM mtc_admin.checkPin cp WHERE school_id = @schoolId)
                    AS vew ON p.id = vew.pin_id WHERE vew.pin_id IS NULL ORDER BY NEWID()))

    -- Store the check.id in the output table
    INSERT INTO @output (id) (SELECT @checkId);

    FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId
  END

  COMMIT TRANSACTION

  -- OUTPUT newly created check IDs to the caller
  SELECT * from @output;

  CLOSE checkArgsList
  DEALLOCATE checkArgsList

  END TRY
  BEGIN CATCH
      IF (@@TRANCOUNT > 0)
        BEGIN
          ROLLBACK TRANSACTION
          PRINT 'Error detected, all changes reversed'
        END
      DECLARE @ErrorMessage NVARCHAR(4000);
      DECLARE @ErrorSeverity INT;
      DECLARE @ErrorState INT;

      SELECT @ErrorMessage = ERROR_MESSAGE(),
             @ErrorSeverity = ERROR_SEVERITY(),
             @ErrorState = ERROR_STATE();

      -- Use RAISERROR inside the CATCH block to return
      -- error information about the original error that
      -- caused execution to jump to the CATCH block.
      RAISERROR (@ErrorMessage, -- Message text.
        @ErrorSeverity, -- Severity.
        @ErrorState -- State.
      );
  END CATCH
go

CREATE PROCEDURE mtc_admin.spGenAuditTriggers AS

  DECLARE @schema NVARCHAR(20) = 'mtc_admin'
  DECLARE @table NVARCHAR(255)
  DECLARE @sql NVARCHAR(MAX)
  DECLARE @triggerName NVARCHAR(MAX)
  DECLARE @dropSql NVARCHAR(MAX)

  DECLARE db_cursor CURSOR FOR
    SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE='BASE TABLE'
    AND TABLE_SCHEMA=@schema
    AND TABLE_NAME != 'auditLog'
    AND TABLE_NAME != 'sessions'
    AND TABLE_NAME != 'adminLogonEvent';

  OPEN db_cursor
  FETCH NEXT FROM db_cursor INTO @schema, @table

  WHILE @@FETCH_STATUS = 0
    BEGIN
      SELECT @triggerName = @schema + '.audit_' + @table
      SELECT @dropSql = 'DROP TRIGGER IF EXISTS ' + @triggerName
      EXEC sp_executeSql @dropSql
      SELECT @sql = 'CREATE TRIGGER ' + @triggerName + ' ON [' + @schema + '].[' + @table + '] FOR UPDATE, INSERT, DELETE
AS
  BEGIN
    DECLARE @json nvarchar(max)
    DECLARE @table nvarchar(255) = ''' + @table + '''
    DECLARE @operation varchar(50)='''';
    IF EXISTS (SELECT * FROM inserted) and  EXISTS (SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''UPDATE''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE IF EXISTS(SELECT * FROM inserted)
    BEGIN
      SELECT @operation = ''INSERT''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ElSE IF EXISTS(SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''DELETE''
      SELECT @json = (SELECT * FROM deleted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE
      RETURN

    INSERT INTO ' + @schema + '.auditLog (rowData, tableName, operation) VALUES (@json, ''' + @table + ''', @operation)
  END'
      -- PRINT @sql
      EXEC sp_executeSql @sql

      FETCH NEXT FROM db_cursor INTO @schema, @table
    END

  CLOSE db_cursor
  DEALLOCATE db_cursor
;
go

CREATE PROCEDURE mtc_admin.spRefreshScoreData @checkWindowId INTEGER = NULL
AS
    BEGIN

      IF (@checkWindowId IS NULL)
      BEGIN
        -- PICK CW ID WITHIN THE CURRENT CHECK PERIOD
        SET @checkWindowId = (
          SELECT id
          FROM [mtc_admin].checkWindow
          WHERE GETUTCDATE() BETWEEN checkStartDate AND adminEndDate
        )
      END
      IF (@checkWindowId IS NULL)
      BEGIN
        -- OTHERWISE PICK THE LAST CW ID THAT OCCURRED
        SET @checkWindowId = (
          SELECT TOP 1 id
          FROM [mtc_admin].checkWindow
          WHERE GETUTCDATE() > adminEndDate
          ORDER BY createdAt DESC
        )
      END
      IF (@checkWindowId IS NULL)
      BEGIN
        -- RAISE AN ERROR AND EXIT WHEN NO CW ID IS DETECTED
        RAISERROR ('NO CHECK WINDOW ID FOUND', 0, 1) WITH NOWAIT
        RETURN 1
      END

      -- CLEAR THE SCHOOL SCORE TABLE
      DELETE FROM [mtc_admin].schoolScore

      -- ADD DATA TO SCHOOL SCORE TABLE
      INSERT INTO mtc_admin.schoolScore (checkWindow_id, school_id, score)
        (
          SELECT
          ISNULL(latestPupilCheck.checkWindow_id, @checkWindowId) as checkWindowId,
          p.school_id,
          (CAST(SUM(ISNULL(latestPupilCheck.mark, 0)) AS DECIMAL(8, 2)) / NULLIF(COUNT(latestPupilCheck.id), 0)) as schoolScore
          FROM
            mtc_admin.pupil p INNER JOIN
            mtc_admin.pupilStatus ps ON (ps.id = p.pupilStatus_id)
            -- FETCH COMPLETED PUPIL CHECK WITHIN THE CHECK WINDOW PERIOD
            LEFT OUTER JOIN
              (SELECT
                  chk.id,
                  chk.pupil_id,
                  chk.mark,
                  chk.checkWindow_id,
                  ROW_NUMBER() OVER (PARTITION BY chk.pupil_id ORDER BY chk.id DESC) as rank
                FROM mtc_admin.[check] chk
                INNER JOIN mtc_admin.checkStatus cs ON (cs.id = chk.checkStatus_id)
                WHERE cs.code = 'CMP'
                AND isLiveCheck = 1
                AND checkWindow_id = @checkWindowId
              ) latestPupilCheck ON p.id = latestPupilCheck.pupil_id
          WHERE
            ps.code <> 'NOT_TAKING'
          GROUP BY
            p.school_id,
            ISNULL(latestPupilCheck.checkWindow_id, @checkWindowId)
        )


      -- UPDATE (NATIONAL) SCORE FIELD ON CHECK WINDOW TABLE
        UPDATE [mtc_admin].checkWindow
        SET score = (
          SELECT AVG(score)
          FROM [mtc_admin].schoolScore
          WHERE checkWindow_id = @checkWindowId
          AND score IS NOT NULL
        )
        WHERE id = @checkWindowId
    END
go


CREATE PROCEDURE [mtc_admin].[spUpsertSceSchools]
    @sceSchools [mtc_admin].[SceTableType] READONLY
AS
    IF @@TRANCOUNT <> 0
        ROLLBACK TRANSACTION

    BEGIN TRY
    BEGIN TRANSACTION

    MERGE INTO
        mtc_admin.sce AS Target
    USING
        @sceSchools AS Source
    ON Target.school_id = Source.school_id
    WHEN MATCHED THEN
        UPDATE SET Target.timezone = Source.timezone, Target.countryCode = Source.countryCode
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (school_id, timezone, countryCode, isOpen) VALUES (Source.school_id, Source.timezone, Source.countryCode, Source.isOpen)
    WHEN NOT MATCHED BY SOURCE THEN
        DELETE;

    COMMIT TRANSACTION

    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            BEGIN
                ROLLBACK TRANSACTION
                PRINT 'Error detected, all changes reversed'
            END
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT  @ErrorMessage = ERROR_MESSAGE(),
                @ErrorSeverity = ERROR_SEVERITY(),
                @ErrorState = ERROR_STATE();

        -- Use RAISERROR inside the CATCH block to return
        -- error information about the original error that
        -- caused execution to jump to the CATCH block.
        RAISERROR (@ErrorMessage, -- Message text.
            @ErrorSeverity, -- Severity.
            @ErrorState -- State.
        );
    END CATCH
go

