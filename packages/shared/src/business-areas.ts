/**
 * Lista pré-definida de ramos de atividade para fornecedores, focada no
 * segmento de atuação da Aritech (automação industrial, engenharia elétrica
 * e integração de sistemas — docx §2/§15). Mantida como sugestão em um campo
 * de texto (não um enum fechado no banco): o usuário pode digitar um valor
 * fora da lista quando necessário (docx §22 — "cadastros rápidos sem quebrar
 * o fluxo principal").
 */
export const SUPPLIER_BUSINESS_AREAS = [
  "Automação Industrial",
  "Instrumentação e Controle de Processos",
  "Painéis Elétricos e Quadros de Comando",
  "CLPs e Sistemas Supervisórios (SCADA/IHM)",
  "Motores, Inversores de Frequência e Acionamentos",
  "Sensores e Componentes de Automação",
  "Robótica Industrial",
  "Componentes Pneumáticos e Hidráulicos",
  "Materiais e Componentes Elétricos",
  "Cabos, Conectores e Fiação",
  "Engenharia Elétrica",
  "Engenharia Mecânica",
  "Integração de Sistemas",
  "Manutenção Industrial",
  "Metalurgia, Usinagem e Caldeiraria",
  "Estruturas Metálicas",
  "Ar Comprimido e Compressores",
  "Refrigeração e Climatização Industrial",
  "Equipamentos de Segurança Industrial (EPI/EPC)",
  "Ferramentas e Equipamentos Industriais",
  "Tecnologia da Informação Industrial (TI/OT)",
  "Consultoria e Projetos de Engenharia",
  "Serviços Terceirizados / Mão de Obra Especializada",
  "Transporte e Logística Industrial",
  "Outro",
] as const;

export type SupplierBusinessArea = (typeof SUPPLIER_BUSINESS_AREAS)[number];
