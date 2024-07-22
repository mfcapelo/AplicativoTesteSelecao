$(document).ready(function () {
    // Validação e formatação do CPF no evento blur
    $('#formCadastro #CPF').blur(function () {
        validarCPF($(this));
    });
    $('#beneficiariosForm #CPFBeneficiario').blur(function () {
        validarCPF($(this));
    });

    $("#beneficiarios_btn").click(function () {
        $("#beneficiariosModal").modal('show');
    });

    $("#incluir_btn").click(function () {
        var cpf = $("#beneficiariosForm #CPFBeneficiario").val().trim();
        var nome = $("#beneficiariosForm #NomeBeneficiario").val().trim();

        if (cpf && nome) {
            // Verificar se o cpf já está na lista 
            var cpfExiste = false;
            $("#beneficiariosTable tbody tr").each(function () {
                var cpfExistente = $(this).find("td:eq(0)").text().trim();
                if (cpfExistente === cpf) {
                    cpfExiste = true;
                    return false; // interrompe o loop
                }
            });

            if (cpfExiste) {
                ModalDialog("CPF já incluído.", "Insira um outro CPF.")
                    .then(() => {
                        $("#beneficiariosForm #CPFBeneficiario").focus();
                    });
                $("#beneficiariosForm #CPFBeneficiario").val('');
                $("#beneficiariosForm #NomeBeneficiario").val('');
                return false;
            }

            $("#beneficiariosTable tbody").append(`
            <tr>
                <td>${cpf}</td>
                <td>${nome}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-alterar">Alterar</button>
                    <button class="btn btn-sm btn-primary btn-excluir">Excluir</button>
                </td>
            </tr>
        `);
            $("#beneficiariosTable").removeClass('hidden');
            $("#beneficiariosForm #CPFBeneficiario").val('');
            $("#beneficiariosForm #NomeBeneficiario").val('');
        } else {
            ModalDialog("Por favor, preencha todos os campos.");
        }
    });

    $("#beneficiariosTable").on("click", ".btn-excluir", function () {
        $(this).closest("tr").remove();
        if ($("#beneficiariosTable tbody tr").length === 0) {
            $("#beneficiariosTable").addClass('d-hidden');
        }
    });

    $("#beneficiariosTable").on("click", ".btn-alterar", function () {
        var tr = $(this).closest("tr");
        var cpf = tr.find("td:eq(0)").text();
        var nome = tr.find("td:eq(1)").text();
        $("#beneficiariosForm #CPFBeneficiario").val(cpf);
        $("#beneficiariosForm #NomeBeneficiario").val(nome);
        tr.remove();
        if ($("#beneficiariosTable tbody tr").length === 0) {
            $("#beneficiariosTable").addClass('hidden');
        }
    });

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        // Validar e formatar antes de enviar
        const cpfInput = $(this).find("#CPF");
        if (!validarCPF(cpfInput)) {
            return;
        }

        // Captura dados dos beneficiários
        let beneficiarios = [];
        $("#beneficiariosTable tbody tr").each(function () {
            let cpf = $(this).find("td:eq(0)").text();
            let nome = $(this).find("td:eq(1)").text();
            beneficiarios.push({ CPF: cpf, Nome: nome });
        });

        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "NOME": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "CPF": $(this).find("#CPF").val(),
                "Beneficiarios": beneficiarios
            },
            error:
                function (r) {
                    if (r.status == 400)
                        ModalDialog("Ocorreu um erro", r.responseJSON);
                    else if (r.status == 500)
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (r) {
                    ModalDialog("Sucesso!", r)
                        .then(() => {
                            $("#formCadastro")[0].reset();
                            $("#beneficiariosTable tbody").empty();
                            $("#beneficiariosTable").addClass('hidden');
                            window.location.href = urlRetorno;
                        })
                        .catch(() => {
                            console.log("Modal não exibido.");
                        });
                }
        });
    })
    function validarCPF(cpfInput) {
        let cpf = cpfInput.val();
        cpf = formataCPF(cpf);
        cpfInput.val(cpf);

        if (!isValidCPF(cpf)) {  // Usa a função isValidCPF do arquivo FI.ValidacaoCPF.js
            ModalDialog("CPF inválido.", "Por favor, insira um CPF válido.")
                .then(() => {
                    cpfInput.focus();
                    cpfInput.addClass('is-invalid');
                });
            return false;
        } else {
            cpfInput.removeClass('is-invalid');
            return true;
        }
    }
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var textoModal = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(textoModal);
    $('#' + random).modal('show');
}
