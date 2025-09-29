/**
 * Sistema Promocional - Controle de Banner e Destaques de Depósito
 * 
 * Este sistema controla:
 * 1. Banner promocional (150%) - aparece sempre que usuário não fez depósito
 * 2. Destaques no modal de depósito (R$20 = 100%, R$50 = 150%)
 * 3. Flags de controle via localStorage
 * 
 * Flags utilizadas:
 * - promoConverted: true quando qualquer depósito foi aprovado (esconde banner)
 * - promo20Done: true quando depósito de R$20 foi aprovado (esconde destaque R$20)
 * - promo50Done: true quando depósito de R$50 foi aprovado (esconde destaque R$50)
 */

class PromoSystem {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkPromoBanner();
            this.updatePromoBadges();
        });
    }

    /**
     * Verificar se deve mostrar o banner promocional
     * Banner aparece sempre que promoConverted !== 'true'
     */
    checkPromoBanner() {
        const promoConverted = localStorage.getItem('promoConverted') === 'true';
        
        if (!promoConverted) {
            this.showPromoBanner();
        } else {
            this.hidePromoBanner();
        }
    }

    /**
     * Mostrar banner promocional
     */
    showPromoBanner() {
        if (typeof window.showPromoBanner === 'function') {
            window.showPromoBanner();
        }
    }

    /**
     * Esconder banner promocional
     */
    hidePromoBanner() {
        if (typeof window.hidePromoBanner === 'function') {
            window.hidePromoBanner();
        }
    }

    /**
     * Atualizar visibilidade dos badges promocionais no modal
     */
    updatePromoBadges() {
        const promo20Done = localStorage.getItem('promo20Done') === 'true';
        const promo50Done = localStorage.getItem('promo50Done') === 'true';
        
        const badge20 = document.getElementById('promoBadge20');
        const badge50 = document.getElementById('promoBadge50');
        const button20 = document.getElementById('quickAmount20');
        const button50 = document.getElementById('quickAmount50');
        
        // Controlar badge R$20 (100%)
        if (badge20 && button20) {
            if (promo20Done) {
                badge20.classList.add('hidden');
                button20.classList.remove('has-promo');
            } else {
                badge20.classList.remove('hidden');
                button20.classList.add('has-promo');
            }
        }
        
        // Controlar badge R$50 (150%)
        if (badge50 && button50) {
            if (promo50Done) {
                badge50.classList.add('hidden');
                button50.classList.remove('has-promo');
            } else {
                badge50.classList.remove('hidden');
                button50.classList.add('has-promo');
            }
        }
    }

    /**
     * Marcar depósito como aprovado
     * @param {number} amount - Valor do depósito aprovado
     */
    markDepositApproved(amount) {
        // Marcar conversão geral (esconde banner)
        localStorage.setItem('promoConverted', 'true');
        
        // Marcar promoções específicas como concluídas
        if (amount === 20) {
            localStorage.setItem('promo20Done', 'true');
        }
        if (amount === 50) {
            localStorage.setItem('promo50Done', 'true');
        }
        
        // Atualizar interface
        this.hidePromoBanner();
        this.updatePromoBadges();
        
        console.log(`Depósito de R$${amount} aprovado. Flags atualizadas.`);
    }

    /**
     * Verificar status das promoções
     * @returns {Object} Status atual das promoções
     */
    getPromoStatus() {
        return {
            promoConverted: localStorage.getItem('promoConverted') === 'true',
            promo20Done: localStorage.getItem('promo20Done') === 'true',
            promo50Done: localStorage.getItem('promo50Done') === 'true',
            shouldShowBanner: localStorage.getItem('promoConverted') !== 'true',
            shouldShow20Badge: localStorage.getItem('promo20Done') !== 'true',
            shouldShow50Badge: localStorage.getItem('promo50Done') !== 'true'
        };
    }

    /**
     * Resetar sistema promocional (para testes)
     */
    reset() {
        localStorage.removeItem('promoConverted');
        localStorage.removeItem('promo20Done');
        localStorage.removeItem('promo50Done');
        
        // Atualizar interface
        this.checkPromoBanner();
        this.updatePromoBadges();
        
        console.log('Sistema promocional resetado.');
    }

    /**
     * Simular depósito aprovado (para testes)
     * @param {number} amount - Valor do depósito para simular
     */
    simulateDepositApproved(amount) {
        console.log(`Simulando depósito aprovado de R$${amount}`);
        this.markDepositApproved(amount);
    }
}

// Inicializar sistema
const promoSystem = new PromoSystem();

// Expor sistema globalmente
window.promoSystem = promoSystem;

/**
 * Função global para marcar depósito como aprovado
 * Deve ser chamada quando o pagamento for confirmado
 * @param {number} amount - Valor do depósito aprovado
 */
window.markDepositApproved = function(amount) {
    promoSystem.markDepositApproved(amount);
};

/**
 * Função global para atualizar badges promocionais
 * Deve ser chamada ao abrir o modal de depósito
 */
window.updatePromoBadges = function() {
    promoSystem.updatePromoBadges();
};

/**
 * Função global para verificar status das promoções
 * @returns {Object} Status atual das promoções
 */
window.getPromoStatus = function() {
    return promoSystem.getPromoStatus();
};

/**
 * Função global para resetar sistema (para testes)
 */
window.resetPromoSystem = function() {
    promoSystem.reset();
};

// Compatibilidade com código existente
window.hidePromoFloatingIcon = function() {
    const promoBadge = document.getElementById('promoBadge');
    if (promoBadge) {
        promoBadge.style.display = 'none';
    }
};

// Log do status inicial para debug
console.log('Sistema Promocional Inicializado');
console.log('Status atual:', promoSystem.getPromoStatus());

// Instruções para uso no console (desenvolvimento)
console.log(`
=== SISTEMA PROMOCIONAL - COMANDOS DE TESTE ===

Para testar o sistema, use os seguintes comandos no console:

1. Ver status atual:
   getPromoStatus()

2. Simular depósito de R$20 aprovado:
   promoSystem.simulateDepositApproved(20)

3. Simular depósito de R$50 aprovado:
   promoSystem.simulateDepositApproved(50)

4. Simular depósito de R$100 aprovado:
   promoSystem.simulateDepositApproved(100)

5. Resetar sistema:
   resetPromoSystem()

6. Atualizar badges manualmente:
   updatePromoBadges()
`);

