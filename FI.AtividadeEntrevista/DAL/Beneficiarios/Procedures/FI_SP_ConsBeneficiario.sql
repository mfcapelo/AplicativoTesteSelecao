CREATE PROCEDURE FI_SP_ConsBeneficiario
    @Id BIGINT
AS
BEGIN
    SELECT ID, CPF, NOME, IDCLIENTE
    FROM BENEFICIARIOS
    WHERE ID = @Id;
END;