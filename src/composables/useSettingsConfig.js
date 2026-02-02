import { ref } from 'vue'

export function useSettingsConfig() {
  const accountTypeOptions = [
    { label: 'Conta Corrente', value: 'CHECKING' }, { label: 'Poupança', value: 'SAVINGS' },
    { label: 'Carteira/Dinheiro', value: 'WALLET' }, { label: 'Investimentos', value: 'INVESTMENT' }
  ]

  const brandOptions = [
    { label: 'Mastercard', value: 'MASTERCARD' }, { label: 'Visa', value: 'VISA' },
    { label: 'Elo', value: 'ELO' }, { label: 'Amex', value: 'AMEX' },
    { label: 'Hipercard', value: 'HIPERCARD' }, { label: 'Outros', value: 'OTHER' }
  ]

  const modules = ref([
    {
      id: 'financial',
      name: 'Financeiro',
      icon: 'account_balance',
      items: [
        { 
          id: 'accounts', label: 'Contas Bancárias', singularLabel: 'Conta', endpoint: '/finance/accounts/',
          columns: [
            { name: 'bank', label: 'Banco', field: 'name', align: 'left', sortable: true }, 
            { name: 'account_type', label: 'Tipo', field: 'account_type', align: 'left', sortable: true },
            { name: 'initial_balance', label: 'Saldo', field: 'initial_balance', format: val => `R$ ${val}`, align: 'left', sortable: true },
            { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' },
            { name: 'actions', label: 'Ações', align: 'right' }
          ],
          schema: [
            { name: 'name', label: 'Nome da Conta', type: 'text' },
            { name: 'account_type', label: 'Tipo de Conta', type: 'select', options: accountTypeOptions },
            { name: 'brand_logo_base64', label: 'Logo / Ícone', type: 'file-base64' },
            { name: 'initial_balance', label: 'Saldo Inicial', type: 'number', prefix: 'R$' },
            { name: 'color', label: 'Cor (Tag)', type: 'color' },
            { name: 'is_active', label: 'Ativa', type: 'toggle', default: true }
          ]
        },
        { 
          id: 'categories', label: 'Categorias', singularLabel: 'Categoria', endpoint: '/finance/categories/',
          columns: [
            { name: 'icon', label: '', field: 'icon', align: 'center', style: 'width: 40px' },
            { name: 'color', label: '', field: 'color', align: 'center', style: 'width: 40px' },
            { name: 'type', label: 'Tipo', field: 'type', align: 'center', sortable: true },
            { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
            { name: 'actions', label: 'Ações', align: 'right' }
          ],
          schema: [
            { name: 'name', label: 'Nome da Categoria', type: 'text' },
            { 
              name: 'type', 
              label: 'Tipo de Categoria', 
              type: 'select', 
              options: [
                { label: 'Despesa', value: 'EXPENSE' },
                { label: 'Receita', value: 'INCOME' }
              ],
              default: 'EXPENSE'
            },
            { name: 'icon', label: 'Ícone', type: 'icon-search' }, 
            { name: 'color', label: 'Cor da Etiqueta', type: 'color' }
          ]
        },
        { 
          id: 'subcategories', label: 'Subcategorias', singularLabel: 'Subcategoria', endpoint: '/finance/subcategories/',
          columns: [
            // Fields dinâmicos serão injetados no Controller
            { name: 'icon', label: '', align: 'center', style: 'width: 40px' },
            { name: 'color', label: '', align: 'center', style: 'width: 40px' },
            { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
            { name: 'category', label: 'Categoria Pai', align: 'left', sortable: true },
            { name: 'actions', label: 'Ações', align: 'right' }
          ],
          schema: [
            { name: 'name', label: 'Nome da Subcategoria', type: 'text' },
            { name: 'category', label: 'Pertence à Categoria', type: 'select', options: [] } // Options vazios inicial
          ]
        },
        { 
          id: 'cards', label: 'Cartões de Crédito', singularLabel: 'Cartão', endpoint: '/finance/cards/',
          columns: [
            { name: 'bank_logo', label: 'Banco', field: 'brand_logo_base64', align: 'center', style: 'width: 60px' },
            { name: 'name', label: 'Apelido', field: 'name', align: 'left', sortable: true },
            { name: 'brand_img', label: 'Bandeira', field: 'brand', align: 'center', style: 'width: 60px' },
            { name: 'limit', label: 'Limite', field: 'limit', format: val => `R$ ${val}`, align: 'left', sortable: true },
            { name: 'closing_day', label: 'Fechamento', field: 'closing_day', align: 'center', format: val => `Dia ${val}` },
            { name: 'due_day', label: 'Vencimento', field: 'due_day', align: 'center', format: val => `Dia ${val}` },
            { name: 'actions', label: 'Ações', align: 'right' }
          ],
          schema: [
            { name: 'name', label: 'Apelido do Cartão', type: 'text', hint: 'Ex: Nu Ultravioleta' },
            { name: 'brand_logo_base64', label: 'Logo do Banco (Imagem)', type: 'file-base64' },
            { name: 'brand', label: 'Bandeira (Visa/Master...)', type: 'select', options: brandOptions },
            { name: 'limit', label: 'Limite', type: 'number', prefix: 'R$' },
            { name: 'closing_day', label: 'Dia Fechamento', type: 'number' },
            { name: 'due_day', label: 'Dia Vencimento', type: 'number' }
          ]
        }
      ]
    },
    {
      id: 'system',
      name: 'Sistema',
      icon: 'admin_panel_settings',
      items: [
        {
          id: 'users', label: 'Usuários', singularLabel: 'Usuário', 
          endpoint: '/auth/users/', 
          columns: [
            { name: 'username', label: 'Login', field: 'username', align: 'left', sortable: true },
            { name: 'email', label: 'E-mail', field: 'email', align: 'left', sortable: true },
            { name: 'is_active', label: 'Ativo', field: 'is_active', align: 'center' },
            { name: 'is_staff', label: 'Admin', field: 'is_staff', align: 'center' },
            { name: 'actions', label: 'Ações', align: 'right' }
          ]
        }
      ]
    }
  ])

  return { modules, accountTypeOptions }
}