using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;
using System.Data.SqlClient;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else
            {
                try
                {
                    model.Id = boCliente.Incluir(new Cliente()
                    {
                        CEP = model.CEP,
                        Cidade = model.Cidade,
                        Email = model.Email,
                        Estado = model.Estado,
                        Logradouro = model.Logradouro,
                        Nacionalidade = model.Nacionalidade,
                        Nome = model.Nome,
                        Sobrenome = model.Sobrenome,
                        Telefone = model.Telefone,
                        CPF = model.CPF,
                    });

                    if (model.Beneficiarios != null && model.Beneficiarios.Any())
                    {
                        foreach (var beneficiario in model.Beneficiarios)
                        {
                            boBeneficiario.Incluir(new Beneficiario
                            {
                                CPF = beneficiario.CPF,
                                Nome = beneficiario.Nome,
                                IdCliente = model.Id
                            });
                        }
                    }
                    return Json("Cadastro efetuado com sucesso");
                }
                catch (Exception ex)
                {
                    // Verifique se a mensagem da exceção contém a violação da chave única para CPF
                    if (ex.Message.Contains("Violation of UNIQUE KEY constraint 'UC_CPF'"))
                    {
                        Response.StatusCode = 400;
                        return Json("CPF já cadastrado.");
                    }

                    // Se a exceção não for a esperada, retorne uma mensagem genérica
                    Response.StatusCode = 500;
                    return Json("Ocorreu um erro interno no servidor.");
                }
            }
        }

        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }

            try
            {
                boCliente.Alterar(new Cliente()
                {
                    Id = model.Id,
                    CEP = model.CEP,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone,
                    CPF = model.CPF,
                });

                if(model.Beneficiarios != null)
                {
                    var idsBeneficiariosExistentes = boBeneficiario.Listar(model.Id).Select(b => b.Id).ToList();
                    var idsBeneficiariosRecebidos = model.Beneficiarios.Select(b => b.Id).ToList();
                    
                    // Excluir beneficiários que não estão mais associados
                    var idsParaExcluir = idsBeneficiariosExistentes.Except(idsBeneficiariosRecebidos).ToList();
                    foreach (var id in idsParaExcluir)
                    {
                        boBeneficiario.Excluir(id);
                    }
                    
                    // Atualizar e incluir beneficiários
                    foreach (var beneficiario in model.Beneficiarios)
                    {
                        if (beneficiario.Id == 0)
                        {
                            // Incluir novo beneficiário
                            boBeneficiario.Incluir(new Beneficiario
                            {
                                CPF = beneficiario.CPF,
                                Nome = beneficiario.Nome,
                                IdCliente = model.Id
                            });
                        }
                        else
                        {
                            // Atualizar beneficiário existente
                            boBeneficiario.Alterar(new Beneficiario
                            {
                                Id = beneficiario.Id,
                                CPF = beneficiario.CPF,
                                Nome = beneficiario.Nome,
                                IdCliente = model.Id
                            });
                        }
                    }

                }

            }
            catch (Exception ex)
            {
                // Verifique se a mensagem da exceção contém a violação da chave única para CPF
                if (ex.Message.Contains("Violation of UNIQUE KEY constraint 'UC_CPF'"))
                {
                    Response.StatusCode = 400;
                    return Json("CPF já cadastrado.");
                }

                // Se a exceção não for a esperada, retorne uma mensagem genérica
                Response.StatusCode = 500;
                return Json("Ocorreu um erro interno no servidor.");
            }

            return Json("Cadastro alterado com sucesso");
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente boCliente = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            Cliente cliente = boCliente.Consultar(id);
            Models.ClienteModel model = null;

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    CEP = cliente.CEP,
                    Cidade = cliente.Cidade,
                    Email = cliente.Email,
                    Estado = cliente.Estado,
                    Logradouro = cliente.Logradouro,
                    Nacionalidade = cliente.Nacionalidade,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    Telefone = cliente.Telefone,
                    CPF = cliente.CPF,

                    // Inclui a lista de beneficiários associados
                    Beneficiarios = boBeneficiario.Listar(cliente.Id).Select(b => new BeneficiarioModel
                    {
                        Id = b.Id,
                        CPF = b.CPF,
                        Nome = b.Nome,
                        IdCliente = b.IdCliente
                    }).ToList()
                };


            }

            return View(model);
        }

        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult IncluirBeneficiario(BeneficiarioModel model)
        {
            BoBeneficiario bo = new BoBeneficiario();

            if (ModelState.IsValid)
            {
                bo.Incluir(new Beneficiario
                {
                    CPF = model.CPF,
                    Nome = model.Nome,
                    IdCliente = model.IdCliente
                });

                return Json("Beneficiário incluído com sucesso");
            }
            else
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
        }

        [HttpPost]
        public JsonResult AlterarBeneficiario(BeneficiarioModel model)
        {
            BoBeneficiario bo = new BoBeneficiario();

            if (ModelState.IsValid)
            {
                bo.Alterar(new Beneficiario
                {
                    Id = model.Id,
                    CPF = model.CPF,
                    Nome = model.Nome,
                    IdCliente = model.IdCliente
                });

                return Json("Beneficiário alterado com sucesso");
            }
            else
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
        }

        [HttpPost]
        public JsonResult ExcluirBeneficiario(long id)
        {
            BoBeneficiario bo = new BoBeneficiario();
            bo.Excluir(id);
            return Json("Beneficiário excluído com sucesso");
        }

        [HttpGet]
        public JsonResult ListarBeneficiarios(long idCliente)
        {
            BoBeneficiario bo = new BoBeneficiario();
            List<Beneficiario> beneficiarios = bo.Listar(idCliente);
            return Json(beneficiarios, JsonRequestBehavior.AllowGet);
        }
    }
}

