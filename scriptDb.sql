-- Table: public.accountDb

-- DROP TABLE IF EXISTS public."accountDb";

CREATE TABLE IF NOT EXISTS public."accountDb"
(
    username character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default",
    fullname text COLLATE pg_catalog."default",
    dob date,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role text COLLATE pg_catalog."default",
    CONSTRAINT "accountDb_pkey" PRIMARY KEY (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."accountDb"
    OWNER to postgres;