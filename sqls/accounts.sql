-- Table: public.accounts

-- DROP TABLE IF EXISTS public.accounts;

CREATE TABLE IF NOT EXISTS public.accounts
(
    username character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default",
    fullname text COLLATE pg_catalog."default",
    dob date,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role text COLLATE pg_catalog."default",
    CONSTRAINT "accounts_pkey" PRIMARY KEY (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.accounts
    OWNER to postgres;