CREATE PROCEDURE FI_SP_AltBeneficiario
    @ID BIGINT,
    @CPF VARCHAR(14),
    @Nome VARCHAR(50),
    @IdCliente BIGINT
AS
BEGIN
    UPDATE BENEFICIARIOS
    SET CPF = @CPF,
        Nome = @Nome,
        IDCLIENTE = @IdCliente
    WHERE ID = @ID;
END;