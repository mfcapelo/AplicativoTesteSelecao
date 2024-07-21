
$(document).ready(function () {
    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);
        $('#formCadastro #CPF').val(obj.CPF);
    }

    // Validação e formatação do CPF no evento blur
    $('#formCadastro #CPF').blur(function () {
        const cpfInput = $(this);
        let cpf = cpfInput.val();
        cpf = formataCPF(cpf);
        cpfInput.val(cpf);

        if (!isValidCPF(cpf)) {  // Usa a função isValidCPF do arquivo FI.ValidacaoCPF.js
            ModalDialog("CPF inválido.", "Por favor, insira um CPF válido.")
                .then(() => {
                    cpfInput.focus();
                    cpfInput.addClass('is-invalid');
                });
        } else {
            cpfInput.removeClass('is-invalid');
        }
    });

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        // Validar e formatar antes de enviar
        const cpfInput = $(this).find("#CPF");
        let cpf = cpfInput.val();
        cpf = formataCPF(cpf);
        cpfInput.val(cpf);
        if (!isValidCPF(cpf)) {  // Usa a função isValidCPF do arquivo FI.ValidacaoCPF.js
            ModalDialog("CPF inválido.", "Por favor, insira um CPF válido.")
                .then(() => {
                    cpfInput.focus();
                    cpfInput.addClass('is-invalid');
                });
            return; // Garante que o código abaixo não seja executado até o modal ser fechado
        }

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
                "CPF": cpf
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
                $("#formCadastro")[0].reset();                                
                window.location.href = urlRetorno;
            }
        });
    })
    
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
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

    $('body').append(texto);
    $('#' + random).modal('show');

    // Retorna uma promessa que é resolvida quando o modal é fechado
    return new Promise((resolve) => {
        $('#' + modalId).on('hidden.bs.modal', function () {
            $(this).remove(); // Remove o modal do DOM
            resolve(); // Resolve a promessa
        });
    });
}
