-- Create a new table "vulnerabilities" --
CREATE TABLE vulnerabilities (
    id integer NOT NULL,
    cve_id character varying(255) NOT NULL,
    published timestamp with time zone NOT NULL,
    status character varying(50) NOT NULL,
    description text,
    cvss_score real
);

ALTER TABLE vulnerabilities ADD CONSTRAINT unique_cve_id UNIQUE (cve_id);

-- Create a new procedure to add vulnerabilities with exception handling --
CREATE OR REPLACE FUNCTION add_vulnerability(
    p_cve_id TEXT, 
    p_published TIMESTAMP, 
    p_description TEXT, 
    p_status TEXT, 
    p_cvss_score FLOAT
) RETURNS VOID AS 
$$
BEGIN
    IF p_cve_id IS NULL OR p_published IS NULL OR p_description IS NULL OR p_status IS NULL OR p_cvss_score IS NULL THEN 
        RAISE EXCEPTION 'All fields should not be empty or null';
    END IF;

    INSERT INTO vulnerabilities (cve_id, published, description, status, cvss_score) 
    VALUES (p_cve_id, p_published, p_description, p_status, p_cvss_score);
EXCEPTION 
    WHEN unique_violation THEN 
        -- you can handle duplicates here if you want.
        RAISE EXCEPTION 'Duplicated cve_id %', p_cve_id;
END
$$
LANGUAGE plpgsql;